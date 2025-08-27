import React, { useState } from "react";
import { generateSchedule } from "./services/scheduleService";
import LectureManager from "./components/LectureManager";
import ScheduleDisplay from "./components/ScheduleDisplay";
import UniWorkToggle from "./components/UniWorkToggle";

const Scheduler = () => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const day = weekdays[currentDate.getDay()];

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

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const changeDay = (deltaDays) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + deltaDays);
    setCurrentDate(next);
    // Regenerate if a schedule is already displayed
    if (schedule && schedule.length) {
      const nextDay = weekdays[next.getDay()];
      const newSchedule = generateSchedule(nextDay, lectures, uniDone);
      setSchedule(newSchedule);
    }
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
        marginBottom: '8px',
        color: "#e5e9f0",
        fontSize: '22px',
        textAlign: 'center'
      }}>Daily Scheduler</h2>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <button 
          onClick={() => changeDay(-1)}
          style={{
            padding: '6px 10px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.background = '#111827'}
          onMouseLeave={(e) => e.target.style.background = '#0f172a'}
        >
          {'<<'}
        </button>

        <div style={{
          minWidth: '120px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 700,
          color: '#e2e8f0'
        }}>{day}</div>

        <button 
          onClick={() => changeDay(1)}
          style={{
            padding: '6px 10px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.background = '#111827'}
          onMouseLeave={(e) => e.target.style.background = '#0f172a'}
        >
          {'>>'}
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '12px',
        color: '#94a3b8',
        fontSize: '12px'
      }}>
        {formatDate(currentDate)}
      </div>
      
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

