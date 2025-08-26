import React, { useState } from "react";
import { generateSchedule } from "./services/scheduleService";
import LectureManager from "./components/LectureManager";
import ScheduleDisplay from "./components/ScheduleDisplay";
import UniWorkToggle from "./components/UniWorkToggle";

const Scheduler = () => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = weekdays[new Date().getDay()];

  const [day] = useState(today); // auto-set current day
  const [lectures, setLectures] = useState([]);
  const [uniDone, setUniDone] = useState(false);
  const [schedule, setSchedule] = useState([]);

  const handleLecturesChange = (newLectures) => {
    setLectures(newLectures);
  };

  const handleUniDoneChange = (newUniDone) => {
    setUniDone(newUniDone);
  };

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(day, lectures, uniDone);
    setSchedule(newSchedule);
  };

  return (
    <div style={{ 
      fontFamily: "monospace", 
      background: "#1e1e1e", 
      color: "#e5e5e5", 
      padding: '16px',
      borderRadius: 6,
      textAlign: 'left',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        marginTop: 0, 
        marginBottom: '16px',
        color: "#e5e9f0",
        fontSize: '22px',
        textAlign: 'center'
      }}>Daily Scheduler</h2>
      
      <LectureManager 
        lectures={lectures} 
        onLecturesChange={handleLecturesChange} 
      />

      <UniWorkToggle 
        uniDone={uniDone} 
        onUniDoneChange={handleUniDoneChange} 
      />

      <button 
        style={{ 
          marginTop: 12,
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '6px',
          border: 'none',
          background: '#4a9eff',
          color: '#000',
          cursor: 'pointer',
          minHeight: '40px',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
        onClick={handleGenerateSchedule}
        onMouseEnter={(e) => e.target.style.background = '#3b82f6'}
        onMouseLeave={(e) => e.target.style.background = '#4a9eff'}
      >
        Generate Schedule
      </button>

      <ScheduleDisplay schedule={schedule} />
    </div>
  );
};

export default Scheduler;

