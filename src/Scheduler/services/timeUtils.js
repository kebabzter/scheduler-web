// 5-minute interval time system

// Convert time to interval index (0-287, where 0 = 00:00, 1 = 00:05, etc.)
export const timeToIntervalIndex = (hour, minute) => {
  return Math.floor((hour * 60 + minute) / 5);
};

// Convert interval index back to time
export const intervalIndexToTime = (index) => {
  const totalMinutes = index * 5;
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60
  };
};

// Convert time object to interval index
export const timeObjectToIntervalIndex = (time) => {
  return timeToIntervalIndex(time.hour, time.minute);
};

// Convert interval index to time object
export const intervalIndexToTimeObject = (index) => {
  return intervalIndexToTime(index);
};

// Get total number of intervals in a day
export const TOTAL_INTERVALS = 288; // 24 hours * 12 intervals per hour

// Check if a time is within available hours
export const isTimeAvailable = (hour, availableHours) => {
  return availableHours.includes(hour);
};

// Convert time to string format (HH:MM)
export const timeToString = (time) => {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
};

// Add minutes to a time object
export const addMinutes = (time, minutes) => {
  let total = time.hour * 60 + time.minute + minutes;
  let hour = Math.floor(total / 60) % 24;
  let minute = total % 60;
  return { hour, minute };
}; 