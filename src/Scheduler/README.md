# Scheduler Component

This directory contains a refactored, modular scheduler application that generates daily schedules based on lectures and university work status.

## Structure

```
src/Scheduler/
├── components/           # UI components
│   ├── LectureManager.jsx    # Handles lecture input and management
│   ├── ScheduleDisplay.jsx   # Displays the generated schedule
│   └── UniWorkToggle.jsx     # Toggle for university work status
├── services/            # Business logic services
│   ├── timeUtils.js          # Time utility functions
│   └── scheduleService.js    # Schedule generation logic
├── constants/           # Application constants
│   └── colors.js             # Color palette for tasks
├── Scheduler.jsx        # Main component (orchestrates everything)
├── index.js             # Clean export
└── README.md            # This file
```

## Components

### LectureManager
- Handles adding and removing lectures
- Manages lecture time inputs
- Communicates changes to parent via callback

### ScheduleDisplay
- Renders the generated schedule
- Applies color coding to different task types
- Shows helpful message when no schedule exists

### UniWorkToggle
- Simple checkbox for university work status
- Affects schedule generation logic

## Services

### timeUtils
- `addMinutes(time, mins)` - Add minutes to a time object
- `timeToString(time)` - Convert time object to string
- `timeToMinutes(time)` - Convert time to total minutes
- `parseTimeString(timeString)` - Parse time string to time object

### scheduleService
- `generateSchedule(day, lectures, uniDone)` - Main schedule generation function
- Breaks down schedule creation into logical functions
- Handles work vs non-work day logic
- Manages meal times and gaps between activities

## Usage

```jsx
import Scheduler from './Scheduler';

function App() {
  return (
    <div>
      <Scheduler />
    </div>
  );
}
```

## Benefits of Refactoring

1. **Separation of Concerns**: UI logic separated from business logic
2. **Reusability**: Components can be reused in other parts of the app
3. **Testability**: Services and components can be tested independently
4. **Maintainability**: Easier to modify specific functionality
5. **Readability**: Each file has a single, clear responsibility
6. **Scalability**: Easy to add new features or modify existing ones 