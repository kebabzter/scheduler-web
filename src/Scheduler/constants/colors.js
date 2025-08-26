export const TASK_COLORS = {
  LECTURE: "#4a9eff", // saturated blue
  MATH_UNI: "#4ade80", // saturated green
  MEALS: "#fbbf24", // saturated yellow
  WORK: "#f87171", // saturated red
  RELAX: "#a78bfa", // saturated purple
  DEFAULT: "#f8fafc" // bright white
};

export const getTaskColor = (task) => {
  if (task.includes("Lecture")) return TASK_COLORS.LECTURE;
  if (task.includes("Math") || task.includes("Uni")) return TASK_COLORS.MATH_UNI;
  if (task.includes("Lunch") || task.includes("Dinner") || task.includes("Breakfast") || task.includes("Snack")) return TASK_COLORS.MEALS;
  if (task.includes("Work") || task.includes("Prepare for work")) return TASK_COLORS.WORK;
  if (task.includes("Relax") || task.includes("Wait")) return TASK_COLORS.RELAX;
  return TASK_COLORS.DEFAULT;
}; 