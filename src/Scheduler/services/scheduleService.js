import { addMinutes, timeToMinutes } from './timeUtils';

const mergeBlocks = (blocks) => {
  blocks.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const merged = [];
  for (let block of blocks) {
    if (!merged.length) merged.push(block);
    else {
      const last = merged[merged.length - 1];
      if (timeToMinutes(last.end) >= timeToMinutes(block.start) && last.task === block.task) {
        last.end = {
          hour: Math.max(last.end.hour, block.end.hour),
          minute: Math.max(last.end.minute, block.end.minute),
        };
      } else merged.push(block);
    }
  }
  return merged;
};

const minutesBetween = (start, end) => timeToMinutes(end) - timeToMinutes(start);

const addMorningRoutine = (blocks) => {
  blocks.push(
    { start: { hour: 7, minute: 30 }, end: { hour: 7, minute: 45 }, task: "Wake up & morning routine" },
    { start: { hour: 7, minute: 45 }, end: { hour: 8, minute: 0 }, task: "Breakfast" }
  );
  return { hour: 8, minute: 0 };
};

const addShoppingMealPrep = (blocks, day, lectures, lastEnd) => {
  if (day === "Wed" || day === "Sun") {
    blocks.push({ start: { hour: 8, minute: 0 }, end: { hour: 10, minute: 0 }, task: "Shopping & meal prep" });
    const newLastEnd = { hour: 10, minute: 0 };
    
    if (lectures.length && timeToMinutes(lectures[0].start) > timeToMinutes(newLastEnd)) {
      blocks.push({ start: newLastEnd, end: lectures[0].start, task: "Relax" });
      return lectures[0].start;
    }
    return newLastEnd;
  }
  return lastEnd;
};

const addLectures = (blocks, lectures) => {
  lectures.forEach((lec) => blocks.push({ start: lec.start, end: lec.end, task: "Lecture" }));
};

const addLunch = (blocks, lectures, current, uniDone, focusGoalLabel, uniWorkLabel) => {
  let lunchAdded = false;
  let currentTime = current;

  for (let lec of lectures) {
    let gapMinutes = timeToMinutes(lec.start) - timeToMinutes(currentTime);
    
    if (!lunchAdded) {
      const lunchTime = { hour: 12, minute: 30 };
      if (timeToMinutes(currentTime) <= 12 * 60 + 30 && 12 * 60 + 30 < timeToMinutes(lec.start)) {
        if (timeToMinutes(lunchTime) - timeToMinutes(currentTime) >= 15) {
          blocks.push({ start: currentTime, end: lunchTime, task: uniDone ? focusGoalLabel : uniWorkLabel });
        }
        blocks.push({ start: lunchTime, end: addMinutes(lunchTime, 30), task: "Lunch" });
        currentTime = addMinutes(lunchTime, 30);
        lunchAdded = true;
      }
    }
    
    if (gapMinutes >= 60) {
      blocks.push({ start: currentTime, end: lec.start, task: uniDone ? focusGoalLabel : uniWorkLabel });
    }
    currentTime = lec.end;
  }

  if (!lunchAdded) {
    const lunchTime = { hour: Math.max(currentTime.hour, 12), minute: 30 };
    blocks.push({ start: lunchTime, end: addMinutes(lunchTime, 30), task: "Lunch" });
    currentTime = addMinutes(lunchTime, 30);
  }

  return currentTime;
};

const addWorkDaySchedule = (blocks, current, focusGoalLabel) => {
  if (timeToMinutes(current) < 16 * 60 + 30) {
    blocks.push({ start: current, end: { hour: 16, minute: 30 }, task: focusGoalLabel });
  }
  
  blocks.push(
    { start: { hour: 16, minute: 30 }, end: { hour: 16, minute: 40 }, task: "Prepare for work + snack" },
    { start: { hour: 16, minute: 40 }, end: { hour: 21, minute: 20 }, task: "Work (incl. commute)" },
    { start: { hour: 21, minute: 20 }, end: { hour: 21, minute: 30 }, task: "Shower after work" },
    { start: { hour: 21, minute: 30 }, end: { hour: 22, minute: 0 }, task: "Dinner" },
    { start: { hour: 22, minute: 0 }, end: { hour: 22, minute: 5 }, task: "Make breakfast for tomorrow" },
    { start: { hour: 22, minute: 5 }, end: { hour: 22, minute: 15 }, task: "Bedtime routine" },
    { start: { hour: 22, minute: 15 }, end: { hour: 0, minute: 0 }, task: "Free time" }
  );
};

const addNonWorkDaySchedule = (blocks, current, uniDone, focusGoalLabel, uniWorkLabel) => {
  blocks.push(
    { start: current, end: { hour: 20, minute: 0 }, task: uniDone ? focusGoalLabel : uniWorkLabel },
    { start: { hour: 20, minute: 0 }, end: { hour: 20, minute: 10 }, task: "Shower" },
    { start: { hour: 20, minute: 10 }, end: { hour: 21, minute: 0 }, task: "Relax" },
    { start: { hour: 21, minute: 0 }, end: { hour: 21, minute: 30 }, task: "Dinner" },
    { start: { hour: 21, minute: 30 }, end: { hour: 21, minute: 35 }, task: "Make breakfast for tomorrow" },
    { start: { hour: 21, minute: 35 }, end: { hour: 21, minute: 45 }, task: "Bedtime routine" },
    { start: { hour: 21, minute: 45 }, end: { hour: 0, minute: 0 }, task: "Free time" }
  );
};

const insertCleaningSunday = (blocks, focusGoalLabel, uniWorkLabel) => {
  const cutoff = { hour: 20, minute: 0 };
  const isBeforeCutoff = (t) => timeToMinutes(t) < timeToMinutes(cutoff);
  const canUseTask = (task) => task === "Relax" || task === focusGoalLabel || task === uniWorkLabel;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!canUseTask(b.task)) continue;
    if (!isBeforeCutoff(b.start)) continue;

    const blockEndBeforeCutoff = timeToMinutes(b.end) <= timeToMinutes(cutoff) ? b.end : cutoff;
    const available = minutesBetween(b.start, blockEndBeforeCutoff);
    if (available >= 60) {
      const cleaningStart = b.start;
      const cleaningEnd = addMinutes(cleaningStart, 60);

      const newBlocks = [];
      newBlocks.push({ start: cleaningStart, end: cleaningEnd, task: "Cleaning" });
      if (timeToMinutes(cleaningEnd) < timeToMinutes(b.end)) {
        newBlocks.push({ start: cleaningEnd, end: b.end, task: b.task });
      }

      blocks.splice(i, 1, ...newBlocks);
      return;
    }
  }
};

export const generateSchedule = (
  day, 
  lectures, 
  uniDone, 
  workDays = ["Mon", "Tue", "Thu", "Fri"],
  focusGoalLabel = "Math study",
  uniWorkLabel = "Uni work"
) => {
  const WORK_DAYS = workDays;
  let blocks = [];

  // Morning routine
  let lastEnd = addMorningRoutine(blocks);

  // Shopping/meal prep days
  lastEnd = addShoppingMealPrep(blocks, day, lectures, lastEnd);

  // Lectures
  addLectures(blocks, lectures);

  // Lunch and gaps
  let current = addLunch(blocks, lectures, lastEnd, uniDone, focusGoalLabel, uniWorkLabel);

  // Fill remaining day
  if (WORK_DAYS.includes(day)) {
    addWorkDaySchedule(blocks, current, focusGoalLabel);
  } else {
    addNonWorkDaySchedule(blocks, current, uniDone, focusGoalLabel, uniWorkLabel);
  }

  // Sunday cleaning: insert earliest 60-min window before 20:00
  if (day === "Sun") {
    insertCleaningSunday(blocks, focusGoalLabel, uniWorkLabel);
  }

  return mergeBlocks(blocks);
}; 