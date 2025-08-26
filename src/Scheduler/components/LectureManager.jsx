import React, { useState } from 'react';
import { parseTimeString } from '../services/timeUtils';

const LectureManager = ({ lectures, onLecturesChange }) => {
  const [newLecture, setNewLecture] = useState({ start: "", end: "" });

  const addLecture = () => {
    if (!newLecture.start || !newLecture.end) return;
    
    const start = parseTimeString(newLecture.start);
    const end = parseTimeString(newLecture.end);
    
    const updatedLectures = [...lectures, { start, end }];
    onLecturesChange(updatedLectures);
    setNewLecture({ start: "", end: "" });
  };

  const removeLecture = (index) => {
    const updatedLectures = lectures.filter((_, i) => i !== index);
    onLecturesChange(updatedLectures);
  };

  return (
    <div>
      <div style={{ 
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <input 
            type="time" 
            value={newLecture.start} 
            onChange={(e) => setNewLecture({ ...newLecture, start: e.target.value })} 
            style={{ 
              padding: '8px 10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: '#2a2a2a',
              color: '#e5e5e5',
              minHeight: '36px'
            }} 
          />
          <input 
            type="time" 
            value={newLecture.end} 
            onChange={(e) => setNewLecture({ ...newLecture, end: e.target.value })} 
            style={{ 
              padding: '8px 10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: '#2a2a2a',
              color: '#e5e5e5',
              minHeight: '36px'
            }} 
          />
        </div>
        <button 
          onClick={addLecture}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            background: '#4a9eff',
            color: '#000',
            cursor: 'pointer',
            minHeight: '36px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.background = '#4a9eff'}
        >
          Add Lecture
        </button>
      </div>

      <div style={{ marginTop: '12px' }}>
        {lectures.map((lec, i) => (
          <div key={i} style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: '8px 10px',
            marginBottom: '6px',
            background: '#2a2a2a',
            borderRadius: '4px',
            border: '1px solid #444'
          }}>
            <span style={{ fontSize: '14px' }}>
              {lec.start.hour.toString().padStart(2, "0")}:{lec.start.minute.toString().padStart(2, "0")} - {lec.end.hour.toString().padStart(2, "0")}:{lec.end.minute.toString().padStart(2, "0")}
            </span>
            <button 
              onClick={() => removeLecture(i)} 
              style={{ 
                color: "#ff4c4c", 
                background: "none", 
                border: "none", 
                cursor: "pointer",
                fontSize: '16px',
                padding: '6px 8px',
                borderRadius: '3px',
                minWidth: '32px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.background = '#1f1f1f'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureManager; 