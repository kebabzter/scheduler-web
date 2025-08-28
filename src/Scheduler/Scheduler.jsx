import React, { useState, useEffect } from "react";
import { IntervalManager } from "./services/intervalManager";
import { addMinutes } from "./services/timeUtils";
import LectureManager from "./components/LectureManager";
import ScheduleDisplay from "./components/ScheduleDisplay";
import SettingsModal from "./components/SettingsModal";
import "./Scheduler.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Scheduler = () => {
  const [intervalManager] = useState(() => new IntervalManager());
  const [sleepStart, setSleepStart] = useState(() => localStorage.getItem("sleepStart") || "22:00");
  const [sleepEnd, setSleepEnd] = useState(() => localStorage.getItem("sleepEnd") || "07:00");

  // User preferences for static items
  const [morningPref, setMorningPref] = useState(() => localStorage.getItem("morningPref") || "07:30"); // breakfast start
  const [lunchPref, setLunchPref] = useState(() => localStorage.getItem("lunchPref") || "12:30");
  const [dinnerPref, setDinnerPref] = useState(() => localStorage.getItem("dinnerPref") || "21:30");

  // Work days selection (persisted)
  const [workDays, setWorkDays] = useState(() => {
    const saved = localStorage.getItem("workDays");
    return saved ? JSON.parse(saved) : ["Mon", "Tue", "Thu", "Fri"];
  });

  // Meal prep days selection (persisted)
  const [mealPrepDays, setMealPrepDays] = useState(() => {
    const saved = localStorage.getItem("mealPrepDays");
    return saved ? JSON.parse(saved) : ["Wed", "Sun"];
  });

  // Cleaning day (weekend only) persisted
  const [cleaningDay, setCleaningDay] = useState(() => localStorage.getItem("cleaningDay") || ""); // "Sat" | "Sun" | ""

  // Selected day for schedule (persisted)
  const [selectedDay, setSelectedDay] = useState(() => localStorage.getItem("selectedDay") || WEEKDAYS[new Date().getDay()]);

  // Current date (for navigation)
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem("currentDateISO");
    return saved ? new Date(saved) : new Date();
  });

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Lectures (custom fixed blocks)
  const [lectures, setLectures] = useState(() => {
    const saved = localStorage.getItem("lectures");
    return saved ? JSON.parse(saved) : [];
  });
  const [lectureStart, setLectureStart] = useState("");
  const [lectureEnd, setLectureEnd] = useState("");

  // Goals state: whether Uni work has been completed for the week
  const [uniWorkCompleted, setUniWorkCompleted] = useState(() => localStorage.getItem("uniWorkCompleted") === "true");

  // Computed schedule blocks
  const [computedBlocks, setComputedBlocks] = useState([]);

  // Helpers
  const parseHHMM = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return { hour: h, minute: m };
  };
  const formatHHMM = (time) => `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Colors (bright, lighter, saturated, non-neon for dark background)
  const getTaskColor = (task) => {
    if (!task) return "#e5e5e5";
    const t = task.toLowerCase();
    // Meals
    if (t.includes("breakfast") || t.includes("lunch") || t.includes("dinner")) return "#fdba74"; // orange-300
    // Routines
    if (t.includes("morning routine") || t.includes("before bed routine")) return "#5eead4"; // teal-300
    // Work block (any part of it)
    if (t.includes("work") || t.includes("prepare for work") || t.includes("walk to work") || t.includes("walk home") || t.includes("shower")) return "#f87171"; // red-400
    // Lectures
    if (t.includes("lecture")) return "#60a5fa"; // blue-400
    // Cleaning / Meal prep
    if (t.includes("cleaning")) return "#86efac"; // green-300
    if (t.includes("shopping") || t.includes("meal prep")) return "#6ee7b7"; // emerald-300
    // Goals
    if (t.includes("uni work")) return "#a78bfa"; // violet-400
    if (t.includes("math study")) return "#818cf8"; // indigo-400
    if (t.includes("hobby")) return "#f472b6"; // pink-400
    if (t.includes("break")) return "#cbd5e1"; // slate-300
    return "#e5e5e5";
  };

  // Calculate available hours based on sleep time
  const getAvailableHours = () => {
    const startHour = parseInt(sleepStart.split(":")[0]);
    const endHour = parseInt(sleepEnd.split(":")[0]);
    
    const availableHours = [];
    
    if (startHour < endHour) {
      for (let hour = 0; hour < 24; hour++) {
        if (hour < startHour || hour >= endHour) {
          availableHours.push(hour);
        }
      }
    } else {
      for (let hour = 0; hour < 24; hour++) {
        if (hour >= endHour && hour < startHour) {
          availableHours.push(hour);
        }
      }
    }
    
    return availableHours;
  };

  const updateAvailableHours = () => {
    const availableHours = getAvailableHours();
    intervalManager.setAvailableHours(availableHours);
  };

  // Persist data
  useEffect(() => { localStorage.setItem("sleepStart", sleepStart); localStorage.setItem("sleepEnd", sleepEnd); updateAvailableHours(); }, [sleepStart, sleepEnd]);
  useEffect(() => { localStorage.setItem("morningPref", morningPref); }, [morningPref]);
  useEffect(() => { localStorage.setItem("lunchPref", lunchPref); }, [lunchPref]);
  useEffect(() => { localStorage.setItem("dinnerPref", dinnerPref); }, [dinnerPref]);
  useEffect(() => { localStorage.setItem("workDays", JSON.stringify(workDays)); }, [workDays]);
  useEffect(() => { localStorage.setItem("mealPrepDays", JSON.stringify(mealPrepDays)); }, [mealPrepDays]);
  useEffect(() => { localStorage.setItem("cleaningDay", cleaningDay); }, [cleaningDay]);
  useEffect(() => { localStorage.setItem("selectedDay", selectedDay); }, [selectedDay]);
  useEffect(() => { localStorage.setItem("lectures", JSON.stringify(lectures)); }, [lectures]);
  useEffect(() => { localStorage.setItem("uniWorkCompleted", String(uniWorkCompleted)); }, [uniWorkCompleted]);
  useEffect(() => { localStorage.setItem("currentDateISO", currentDate.toISOString()); }, [currentDate]);

  // Keep selectedDay in sync with currentDate
  useEffect(() => {
    const wd = WEEKDAYS[currentDate.getDay()];
    if (wd !== selectedDay) setSelectedDay(wd);
  }, [currentDate]);

  // Initialize availability on first render
  useEffect(() => { updateAvailableHours(); }, []);

  const reserveRange = (start, minutes, task, force = false) => {
    const end = addMinutes(start, minutes);
    intervalManager.reserveIntervals(start, end, task, { force });
    return end;
  };

  const findFirstFreeWindow = (durationMinutes) => {
    for (let minutes = 0; minutes <= (24 * 60 - durationMinutes); minutes += 5) {
      const start = { hour: Math.floor(minutes / 60), minute: minutes % 60 };
      const end = addMinutes(start, durationMinutes);
      if (intervalManager.isRangeFree(start, end)) {
        return { start, end };
      }
    }
    return null;
  };

  const findFirstFreeWindowFrom = (fromTime, durationMinutes) => {
    const fromTotal = fromTime.hour * 60 + fromTime.minute;
    for (let minutes = fromTotal; minutes <= (24 * 60 - durationMinutes); minutes += 5) {
      const start = { hour: Math.floor(minutes / 60), minute: minutes % 60 };
      const end = addMinutes(start, durationMinutes);
      if (intervalManager.isRangeFree(start, end)) {
        return { start, end };
      }
    }
    return null;
  };

  const addLecture = () => {
    if (!lectureStart || !lectureEnd) return;
    const s = parseHHMM(lectureStart);
    const e = parseHHMM(lectureEnd);
    const startMinutes = s.hour * 60 + s.minute;
    const endMinutes = e.hour * 60 + e.minute;
    if (endMinutes <= startMinutes) return; // invalid
    setLectures((prev) => [...prev, { start: lectureStart, end: lectureEnd }]);
    setLectureStart("");
    setLectureEnd("");
  };

  const removeLecture = (idx) => {
    setLectures((prev) => prev.filter((_, i) => i !== idx));
  };

  const fillGoalsUntil = (cutoffTime) => {
    const cutoffTotal = cutoffTime.hour * 60 + cutoffTime.minute;
    const intervals = intervalManager.intervals || [];
    let mathAccumulated = 0; // minutes of Math study placed today

    let i = 0;
    while (i < intervals.length) {
      const it = intervals[i];
      if (it.available && !it.occupied) {
        const startIndex = i;
        while (i < intervals.length && intervals[i].available && !intervals[i].occupied) {
          i++;
        }
        const endIndex = i; // exclusive
        // Work within this free segment up to cutoff
        let segmentStartTotal = intervals[startIndex].time.hour * 60 + intervals[startIndex].time.minute;
        const segmentEndTotal = Math.min(
          (endIndex < intervals.length)
            ? (intervals[endIndex - 1].time.hour * 60 + intervals[endIndex - 1].time.minute + 5)
            : 24 * 60,
          cutoffTotal
        );

        while (segmentStartTotal < segmentEndTotal) {
          if (!uniWorkCompleted) {
            // Primary goal: Uni work (1h chunks + 15m breaks)
            if (segmentStartTotal + 60 > segmentEndTotal) break;
            const goalStart = { hour: Math.floor(segmentStartTotal / 60), minute: segmentStartTotal % 60 };
            const goalEnd = addMinutes(goalStart, 60);
            if (!intervalManager.isRangeFree(goalStart, goalEnd)) break;
            reserveRange(goalStart, 60, "Uni work");
            segmentStartTotal += 60;
            // Break 15m if fits
            if (segmentStartTotal + 15 <= segmentEndTotal) {
              const breakStart = { hour: Math.floor(segmentStartTotal / 60), minute: segmentStartTotal % 60 };
              const breakEnd = addMinutes(breakStart, 15);
              if (!intervalManager.isRangeFree(breakStart, breakEnd)) break;
              reserveRange(breakStart, 15, "Break");
              segmentStartTotal += 15;
            } else break;
          } else {
            // Secondary goal: Math study up to 5h (with breaks), then Hobby for the rest (no breaks)
            const remainingMath = Math.max(0, 300 - mathAccumulated);
            if (remainingMath >= 60) {
              if (segmentStartTotal + 60 > segmentEndTotal) break;
              const goalStart = { hour: Math.floor(segmentStartTotal / 60), minute: segmentStartTotal % 60 };
              const goalEnd = addMinutes(goalStart, 60);
              if (!intervalManager.isRangeFree(goalStart, goalEnd)) break;
              reserveRange(goalStart, 60, "Math study");
              mathAccumulated += 60;
              segmentStartTotal += 60;
              // Break after math block if it fits
              if (segmentStartTotal + 15 <= segmentEndTotal) {
                const breakStart = { hour: Math.floor(segmentStartTotal / 60), minute: segmentStartTotal % 60 };
                const breakEnd = addMinutes(breakStart, 15);
                if (!intervalManager.isRangeFree(breakStart, breakEnd)) break;
                reserveRange(breakStart, 15, "Break");
                segmentStartTotal += 15;
              } else break;
            } else {
              // Beyond 5h → fill remaining segment time as Hobby (no breaks)
              const remaining = segmentEndTotal - segmentStartTotal;
              if (remaining < 5) break;
              const hobbyStart = { hour: Math.floor(segmentStartTotal / 60), minute: segmentStartTotal % 60 };
              reserveRange(hobbyStart, remaining, "Hobby");
              segmentStartTotal = segmentEndTotal; // consume the segment
            }
          }
        }
      } else {
        i++;
      }
    }
  };

  const changeDay = (delta) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setCurrentDate(next);
  };

  const generateSchedule = () => {
    updateAvailableHours();
    intervalManager.clearSchedule();

    // Morning routine + breakfast
    const breakfastStart = parseHHMM(morningPref);
    const routineStart = addMinutes(breakfastStart, -15);
    reserveRange(routineStart, 15, "Morning routine");
    reserveRange(breakfastStart, 15, "Breakfast");

    // Lectures (fixed blocks)
    lectures.forEach((lec) => {
      const s = parseHHMM(lec.start);
      const e = parseHHMM(lec.end);
      const duration = (e.hour * 60 + e.minute) - (s.hour * 60 + s.minute);
      if (duration > 0) {
        reserveRange(s, duration, "Lecture", true);
      }
    });

    // Lunch + optional post-lunch break
    const lunchStart = parseHHMM(lunchPref);
    const lunchEnd = reserveRange(lunchStart, 30, "Lunch");
    const desiredBreakEnd = addMinutes(lunchEnd, 30);
    const availableAfter = intervalManager.getAvailableIntervalsInRange(lunchEnd, desiredBreakEnd).length * 5;
    let postLunchBreakMinutes = 0;
    if (availableAfter > 0) {
      postLunchBreakMinutes = Math.min(30, availableAfter);
      reserveRange(lunchEnd, postLunchBreakMinutes, "Post-lunch break");
    }

    // Cleaning (weekend day only) - 1 hour after lunch break
    if ((cleaningDay === "Sat" || cleaningDay === "Sun") && cleaningDay === selectedDay) {
      const cleaningStartAnchor = postLunchBreakMinutes > 0 ? addMinutes(lunchEnd, postLunchBreakMinutes) : lunchEnd;
      const cleaningWindow = findFirstFreeWindowFrom(cleaningStartAnchor, 60);
      if (cleaningWindow) {
        reserveRange(cleaningWindow.start, 60, "Cleaning");
      }
    }

    // Dinner + 10-minute before-bed routine immediately after
    const dinnerStart = parseHHMM(dinnerPref);
    const dinnerEnd = reserveRange(dinnerStart, 30, "Dinner");
    reserveRange(dinnerEnd, 10, "Before bed routine");

    // Workday block if selected day is a workday
    if (workDays.includes(selectedDay)) {
      const workStart = { hour: 17, minute: 0 };
      reserveRange(addMinutes(workStart, -30), 10, "Prepare for work", true);
      reserveRange(addMinutes(workStart, -20), 20, "Walk to work", true);
      const workEnd = reserveRange(workStart, 4 * 60, "Work", true);
      const afterWalkEnd = reserveRange(workEnd, 20, "Walk home", true);
      reserveRange(afterWalkEnd, 10, "Shower", true);
    }

    // Meal prep block (2h) if selected day is a meal prep day
    if (mealPrepDays.includes(selectedDay)) {
      const window = findFirstFreeWindow(120);
      if (window) {
        reserveRange(window.start, 120, "Shopping & meal prep");
      }
    }

    // Fill remaining free time with goals only before dinner end
    fillGoalsUntil(dinnerEnd);

    const blocks = intervalManager.getScheduleBlocks();
    setComputedBlocks(blocks);
  };

  const toggleWorkDay = (day) => {
    setWorkDays((prev) => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a,b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)));
  };

  const toggleMealPrepDay = (day) => {
    setMealPrepDays((prev) => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a,b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)));
  };

  return (
    <div className="scheduler-container">
      {/* Top bar: Settings + Day nav */}
      <div className="top-bar">
        <button onClick={() => setSettingsOpen(true)} aria-label="Open settings" title="Settings" className="btn" style={{ minWidth: 44, minHeight: 40, lineHeight: 1 }}>
          <span style={{ fontSize: '20px' }}>*</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div className="nav-day">
            <button onClick={() => changeDay(-1)} className="nav-day-btn">{"<<"}</button>
            <div className="day-name">{WEEKDAYS[currentDate.getDay()]}</div>
            <button onClick={() => changeDay(1)} className="nav-day-btn">{">>"}</button>
          </div>
          <div className="date-subtle">{formatDate(currentDate)}</div>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Lectures and Goals */}
      <LectureManager
        lectureStart={lectureStart}
        lectureEnd={lectureEnd}
        setLectureStart={setLectureStart}
        setLectureEnd={setLectureEnd}
        lectures={lectures}
        addLecture={addLecture}
        removeLecture={removeLecture}
        uniWorkCompleted={uniWorkCompleted}
        setUniWorkCompleted={setUniWorkCompleted}
      />

      <button onClick={generateSchedule} className="generate-btn">Generate Schedule</button>

      <ScheduleDisplay
        selectedDay={selectedDay}
        blocks={computedBlocks}
        formatHHMM={formatHHMM}
        getTaskColor={getTaskColor}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sleepStart={sleepStart}
        setSleepStart={setSleepStart}
        sleepEnd={sleepEnd}
        setSleepEnd={setSleepEnd}
        morningPref={morningPref}
        setMorningPref={setMorningPref}
        lunchPref={lunchPref}
        setLunchPref={setLunchPref}
        dinnerPref={dinnerPref}
        setDinnerPref={setDinnerPref}
        WEEKDAYS={WEEKDAYS}
        workDays={workDays}
        toggleWorkDay={toggleWorkDay}
        mealPrepDays={mealPrepDays}
        toggleMealPrepDay={toggleMealPrepDay}
        cleaningDay={cleaningDay}
        setCleaningDay={setCleaningDay}
      />
    </div>
  );
};

export default Scheduler;

