import React from 'react';
import { timeToString } from '../services/timeUtils';
import { getTaskColor } from '../constants/colors';

const ScheduleDisplay = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div style={{ 
        marginTop: 20, 
        fontStyle: 'italic', 
        color: '#888',
        textAlign: 'left'
      }}>
        No schedule generated yet. Add lectures and click "Generate Schedule" to create one.
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: 12,
      textAlign: 'left'
    }}>
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #444',
        borderRadius: '6px',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.3',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative'
      }}>
        {/* Linux terminal prompt */}
        <div style={{
          color: '#7dd3fc',
          marginBottom: '6px',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          [user@daily-scheduler ~]$ cat schedule.txt
        </div>
        
        {/* Schedule content */}
        {schedule.map((block, i) => (
          <div key={i} style={{ 
            color: getTaskColor(block.task),
            marginBottom: '2px',
            padding: '1px 0'
          }}>
            &gt; {timeToString(block.start)} - {timeToString(block.end)} : {block.task}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDisplay; 