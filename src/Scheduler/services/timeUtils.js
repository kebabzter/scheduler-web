export const addMinutes = (time, mins) => {
  let total = time.hour * 60 + time.minute + mins;
  let hour = Math.floor(total / 60) % 24;
  let minute = total % 60;
  return { hour, minute };
};

export const timeToString = (time) =>
  `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;

export const timeToMinutes = (time) => time.hour * 60 + time.minute;

export const minutesToTime = (minutes) => ({
  hour: Math.floor(minutes / 60) % 24,
  minute: minutes % 60
});

export const parseTimeString = (timeString) => {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute };
}; 