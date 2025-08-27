import React from 'react';

const SettingsButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      title="Settings"
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        border: '1px solid #334155',
        background: '#0f172a',
        color: '#cbd5e1',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.target.style.background = '#111827'}
      onMouseLeave={(e) => e.target.style.background = '#0f172a'}
    >
      ⚙️
    </button>
  );
};

export default SettingsButton; 