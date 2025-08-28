import { TOTAL_INTERVALS, timeToIntervalIndex, intervalIndexToTime, isTimeAvailable } from './timeUtils';

// Default available hours (you can customize this)
const DEFAULT_AVAILABLE_HOURS = Array.from({length: 24}, (_, i) => i); // All 24 hours available

export class IntervalManager {
  constructor(availableHours = DEFAULT_AVAILABLE_HOURS) {
    this.availableHours = availableHours;
    this.intervals = this.createIntervals();
  }

  // Create array of 288 intervals, marking which ones are available
  createIntervals() {
    const intervals = [];
    for (let i = 0; i < TOTAL_INTERVALS; i++) {
      const time = intervalIndexToTime(i);
      intervals.push({
        index: i,
        time: time,
        available: isTimeAvailable(time.hour, this.availableHours),
        occupied: false,
        task: null
      });
    }
    return intervals;
  }

  // Set which hours are available/unavailable
  setAvailableHours(hours) {
    this.availableHours = hours;
    this.intervals = this.createIntervals();
  }

  // Get all available intervals
  getAvailableIntervals() {
    return this.intervals.filter(interval => interval.available);
  }

  // Get available intervals within a time range
  getAvailableIntervalsInRange(startTime, endTime) {
    const startIndex = timeToIntervalIndex(startTime.hour, startTime.minute);
    const endIndex = timeToIntervalIndex(endTime.hour, endTime.minute);
    
    return this.intervals
      .filter(interval => 
        interval.index >= startIndex && 
        interval.index < endIndex && 
        interval.available
      );
  }

  // Check if a time range is fully free (available and not occupied)
  isRangeFree(startTime, endTime) {
    const startIndex = timeToIntervalIndex(startTime.hour, startTime.minute);
    const endIndex = timeToIntervalIndex(endTime.hour, endTime.minute);
    for (let i = startIndex; i < endIndex; i++) {
      const it = this.intervals[i];
      if (!it || !it.available || it.occupied) return false;
    }
    return true;
  }

  // Check if a time range is available
  isTimeRangeAvailable(startTime, endTime) {
    const intervals = this.getAvailableIntervalsInRange(startTime, endTime);
    const requiredIntervals = this.calculateRequiredIntervals(startTime, endTime);
    return intervals.length >= requiredIntervals;
  }

  // Calculate how many 5-minute intervals are needed for a time range
  calculateRequiredIntervals(startTime, endTime) {
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;
    const durationMinutes = endMinutes - startMinutes;
    return Math.ceil(durationMinutes / 5);
  }

  // Reserve intervals for a task (set force=true to ignore availability)
  reserveIntervals(startTime, endTime, task, { force = false } = {}) {
    const startIndex = timeToIntervalIndex(startTime.hour, startTime.minute);
    const endIndex = timeToIntervalIndex(endTime.hour, endTime.minute);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (i < TOTAL_INTERVALS) {
        if (force || this.intervals[i].available) {
          this.intervals[i].occupied = true;
          this.intervals[i].task = task;
        }
      }
    }
  }

  // Get current schedule as time blocks
  getScheduleBlocks() {
    const blocks = [];
    let currentBlock = null;
    
    for (let i = 0; i < TOTAL_INTERVALS; i++) {
      const interval = this.intervals[i];
      
      if (interval.occupied && interval.task) {
        if (!currentBlock || currentBlock.task !== interval.task) {
          // Start new block
          if (currentBlock) {
            // Set block end to the end of this interval (add 5 minutes)
            const prevEnd = (interval.index - 1) * 5 + 5;
            const endHour = Math.floor(prevEnd / 60);
            const endMinute = prevEnd % 60;
            currentBlock.end = { hour: endHour, minute: endMinute };
            blocks.push(currentBlock);
          }
          currentBlock = {
            start: interval.time,
            end: interval.time,
            task: interval.task
          };
        }
      } else if (currentBlock) {
        // Close block at the end of previous occupied interval
        const prevEnd = (i - 1) * 5 + 5;
        const endHour = Math.floor(prevEnd / 60);
        const endMinute = prevEnd % 60;
        currentBlock.end = { hour: endHour, minute: endMinute };
        blocks.push(currentBlock);
        currentBlock = null;
      }
    }
    
    // Add the last block if still open
    if (currentBlock) {
      const endHour = 24;
      const endMinute = 0;
      currentBlock.end = { hour: endHour, minute: endMinute };
      blocks.push(currentBlock);
    }
    
    return blocks;
  }

  // Clear all reservations
  clearSchedule() {
    this.intervals.forEach(interval => {
      interval.occupied = false;
      interval.task = null;
    });
  }
} 