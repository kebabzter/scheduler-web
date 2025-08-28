import React, { useState, useEffect } from "react";
import { IntervalManager } from "./services/intervalManager";
import { addMinutes } from "./services/timeUtils";

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
    <div style={{ 
      fontFamily: "monospace", 
      background: "#0b1220", 
      color: "#e6edf3", 
      padding: '12px',
      borderRadius: 6,
      textAlign: 'left',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Top bar: Settings + Day nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <button onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          title="Settings"
          style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', cursor: 'pointer', minWidth: 44, minHeight: 40, lineHeight: 1 }}>
          <span style={{ fontSize: '20px' }}>*</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => changeDay(-1)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', cursor: 'pointer' }}>{"<<"}</button>
            <div style={{ minWidth: 80, textAlign: 'center', fontWeight: 700 }}>{WEEKDAYS[currentDate.getDay()]}</div>
            <button onClick={() => changeDay(1)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', cursor: 'pointer' }}>{">>"}</button>
          </div>
          <div style={{ fontSize: '11px', color: '#93a7c1', marginTop: '4px' }}>{formatDate(currentDate)}</div>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Lectures (kept visible) */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: "#e6edf3", fontSize: '18px', marginBottom: '10px' }}>
          Lectures
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Start</label>
            <input type="time" value={lectureStart} onChange={(e) => setLectureStart(e.target.value)}
              style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3' }} />
          </div>
          <div style={{ minWidth: 130 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>End</label>
            <input type="time" value={lectureEnd} onChange={(e) => setLectureEnd(e.target.value)}
              style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3' }} />
          </div>
          <button onClick={addLecture}
            style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: 'none', background: '#38bdf8', color: '#051524', cursor: 'pointer' }}>
            Add Lecture
          </button>
        </div>
        <div style={{ marginTop: '10px' }}>
          {lectures.length === 0 ? (
            <div style={{ color: '#93a7c1', fontStyle: 'italic' }}>No lectures added.</div>
          ) : (
            lectures.map((lec, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', border: '1px solid #1f2a44', borderRadius: '6px', background: '#0e1a2a', marginBottom: '6px' }}>
                <div>
                  {lec.start} - {lec.end}  Lecture
                </div>
                <button onClick={() => removeLecture(idx)}
                  style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #1f2a44', background: '#f87171', color: '#051524', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Goals</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={uniWorkCompleted} onChange={(e) => setUniWorkCompleted(e.target.checked)} />
                  <span>Uni work completed (week)</span>
                </label>
              </div>
      </div>

      <button 
        onClick={generateSchedule}
        style={{
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '6px',
          border: 'none',
          background: '#38bdf8',
          color: '#051524',
          cursor: 'pointer',
          marginBottom: '16px',
          width: '100%'
        }}
      >
        Generate Schedule
      </button>

      <div>
        <h3 style={{ color: "#e6edf3", fontSize: '18px', marginBottom: '10px' }}>
          Schedule
        </h3>
        <div style={{ 
          background: '#0a1626',
          border: '1px solid #1f2a44',
          borderRadius: '6px',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ color: '#7dd3fc', marginBottom: '8px', fontSize: '12px' }}>
            [user@scheduler ~]$ cat {selectedDay.toLowerCase()}.txt
          </div>
          {computedBlocks.length === 0 ? (
            <div style={{ color: '#93a7c1', fontStyle: 'italic' }}>
              No schedule yet. Click "Generate Schedule".
            </div>
          ) : (
            computedBlocks.map((b, i) => (
              <div key={i} style={{ color: getTaskColor(b.task) }}>&gt; {formatHHMM(b.start)} - {formatHHMM(b.end)}  {b.task}</div>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={() => setSettingsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(7, 12, 24, 0.6)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', background: '#0e1a2a', border: '1px solid #1f2a44', borderRadius: '10px', padding: '12px', zIndex: 60, boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#e6edf3' }}>Settings</h3>
              <button onClick={() => setSettingsOpen(false)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Sleep Time</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Sleep Start</label>
                    <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)}
                      style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Sleep End</label>
                    <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)}
                      style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Meals</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Breakfast (15m)</label>
                    <input type="time" value={morningPref} onChange={(e) => setMorningPref(e.target.value)}
                      style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3', boxSizing: 'border-box' }} />
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#93a7c1' }}>Morning routine runs 15m before</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Lunch (30m, ±60m)</label>
                    <input type="time" value={lunchPref} onChange={(e) => setLunchPref(e.target.value)}
                      style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Dinner (30m)</label>
                    <input type="time" value={dinnerPref} onChange={(e) => setDinnerPref(e.target.value)}
                      style={{ padding: '10px 12px', width: '100%', fontSize: '14px', borderRadius: '6px', border: '1px solid #1f2a44', background: '#0f2036', color: '#e6edf3' }} />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Work Days</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: '8px' }}>
                  {WEEKDAYS.map((d) => (
                    <label key={d} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px',
                      border: '1px solid #1f2a44', borderRadius: '6px', background: workDays.includes(d) ? '#0f2a44' : '#0b162a'
                    }}>
                      <input type="checkbox" checked={workDays.includes(d)} onChange={() => toggleWorkDay(d)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Meal Prep Days</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: '8px' }}>
                  {WEEKDAYS.map((d) => (
                    <label key={d} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px',
                      border: '1px solid #1f2a44', borderRadius: '6px', background: mealPrepDays.includes(d) ? '#0f2a44' : '#0b162a'
                    }}>
                      <input type="checkbox" checked={mealPrepDays.includes(d)} onChange={() => toggleMealPrepDay(d)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#93a7c1', marginTop: '6px' }}>
                  Earliest available 2-hour window will be reserved on enabled days.
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6edf3' }}>Cleaning Day (Weekend)</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {['', 'Sat', 'Sun'].map((opt) => (
                    <label key={opt || 'none'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="radio" name="cleaningDay" value={opt} checked={cleaningDay === opt} onChange={(e) => setCleaningDay(e.target.value)} />
                      <span>{opt === '' ? 'None' : opt}</span>
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#93a7c1', marginTop: '6px' }}>
                  1 hour for Cleaning will be reserved after the lunch break when possible.
                </div>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;

