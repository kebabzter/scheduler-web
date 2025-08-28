import React from 'react';

const ScheduleDisplay = ({ selectedDay, blocks, formatHHMM, getTaskColor }) => {
  return (
    <div>
      <h3 className="section-title">Schedule</h3>
      <div className="terminal-box">
        <div className="terminal-prompt">[user@scheduler ~]$ cat {selectedDay.toLowerCase()}.txt</div>
        {(!blocks || blocks.length === 0) ? (
          <div className="terminal-empty">No schedule yet. Click "Generate Schedule".</div>
        ) : (
          blocks.map((b, i) => (
            <div key={i} style={{ color: getTaskColor(b.task) }}>&gt; {formatHHMM(b.start)} - {formatHHMM(b.end)}  {b.task}</div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleDisplay; 