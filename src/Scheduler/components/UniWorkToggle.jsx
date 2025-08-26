import React from 'react';

const UniWorkToggle = ({ uniDone, onUniDoneChange }) => {
  return (
    <div style={{ 
      marginTop: 12,
      padding: '10px 12px',
      background: '#2a2a2a',
      borderRadius: '6px',
      border: '1px solid #444'
    }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <input 
          type="checkbox" 
          checked={uniDone} 
          onChange={(e) => onUniDoneChange(e.target.checked)}
          style={{
            width: '18px',
            height: '18px',
            cursor: 'pointer'
          }}
        /> 
        <span>Uni work done</span>
      </label>
    </div>
  );
};

export default UniWorkToggle; 