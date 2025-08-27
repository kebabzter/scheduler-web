import React, { useState, useEffect } from 'react';

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SettingsModal = ({ isOpen, onClose, workDays, onSaveWorkDays, focusGoalLabel = "Math study", uniWorkLabel = "Uni work", onSaveGoals }) => {
  const [selected, setSelected] = useState(workDays);
  const [focusLabel, setFocusLabel] = useState(focusGoalLabel);
  const [uniLabel, setUniLabel] = useState(uniWorkLabel);

  useEffect(() => {
    setSelected(workDays);
  }, [workDays, isOpen]);

  useEffect(() => {
    setFocusLabel(focusGoalLabel);
    setUniLabel(uniWorkLabel);
  }, [focusGoalLabel, uniWorkLabel, isOpen]);

  const toggleDay = (day) => {
    setSelected((prev) => (
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    ));
  };

  const handleSave = () => {
    onSaveWorkDays(selected.sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)));
    if (onSaveGoals) onSaveGoals(focusLabel.trim() || "Math study", uniLabel.trim() || "Uni work");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '420px',
        padding: '16px',
        color: '#e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Settings</h3>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '18px'
          }}>✕</button>
        </div>

        <div style={{ marginTop: '12px', borderTop: '1px solid #1f2937' }} />

        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px' }}>Working days</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
            {WEEKDAYS.map((d) => (
              <label key={d} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: selected.includes(d) ? '#0b253f' : '#0b1220'
              }}>
                <input 
                  type="checkbox" 
                  checked={selected.includes(d)} 
                  onChange={() => toggleDay(d)}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '6px' }}>Goals</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Focus goal (when Uni work is done)</span>
              <input 
                type="text" 
                value={focusLabel}
                onChange={(e) => setFocusLabel(e.target.value)}
                placeholder="e.g. Math study"
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0b1220',
                  color: '#e5e7eb',
                  fontSize: '14px'
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>University work label</span>
              <input 
                type="text" 
                value={uniLabel}
                onChange={(e) => setUniLabel(e.target.value)}
                placeholder="e.g. Uni work"
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0b1220',
                  color: '#e5e7eb',
                  fontSize: '14px'
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button onClick={onClose} style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #334155',
            background: '#0b1323',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#4a9eff',
            color: '#000',
            cursor: 'pointer',
            fontWeight: 700
          }}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 