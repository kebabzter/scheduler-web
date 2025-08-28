import React from 'react';

const SettingsModal = ({
  isOpen,
  onClose,
  sleepStart,
  setSleepStart,
  sleepEnd,
  setSleepEnd,
  morningPref,
  setMorningPref,
  lunchPref,
  setLunchPref,
  dinnerPref,
  setDinnerPref,
  WEEKDAYS,
  workDays,
  toggleWorkDay,
  mealPrepDays,
  toggleMealPrepDay,
  cleaningDay,
  setCleaningDay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div onClick={onClose} className="modal-backdrop" />
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Settings</h3>
          <button onClick={onClose} className="btn">Close</button>
        </div>
        <div className="modal-content">
          <div>
            <h4 className="subsection-title">Sleep Time</h4>
            <div className="grid-2">
              <div>
                <label className="input-label">Sleep Start</label>
                <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className="input" />
              </div>
              <div>
                <label className="input-label">Sleep End</label>
                <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="subsection-title">Meals</h4>
            <div className="grid-1">
              <div>
                <label className="input-label">Breakfast (15m)</label>
                <input type="time" value={morningPref} onChange={(e) => setMorningPref(e.target.value)} className="input" />
                <div className="help-text">Morning routine runs 15m before</div>
              </div>
              <div>
                <label className="input-label">Lunch (30m, ±60m)</label>
                <input type="time" value={lunchPref} onChange={(e) => setLunchPref(e.target.value)} className="input" />
              </div>
              <div>
                <label className="input-label">Dinner (30m)</label>
                <input type="time" value={dinnerPref} onChange={(e) => setDinnerPref(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="subsection-title">Work Days</h4>
            <div className="days-grid">
              {WEEKDAYS.map((d) => (
                <label key={d} className={`day-chip ${workDays.includes(d) ? 'active' : ''}`}>
                  <input type="checkbox" checked={workDays.includes(d)} onChange={() => toggleWorkDay(d)} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="subsection-title">Meal Prep Days</h4>
            <div className="days-grid">
              {WEEKDAYS.map((d) => (
                <label key={d} className={`day-chip ${mealPrepDays.includes(d) ? 'active' : ''}`}>
                  <input type="checkbox" checked={mealPrepDays.includes(d)} onChange={() => toggleMealPrepDay(d)} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
            <div className="help-text">Earliest available 2-hour window will be reserved on enabled days.</div>
          </div>

          <div>
            <h4 className="subsection-title">Cleaning Day (Weekend)</h4>
            <div className="cleaning-options">
              {['', 'Sat', 'Sun'].map((opt) => (
                <label key={opt || 'none'} className="radio-row">
                  <input type="radio" name="cleaningDay" value={opt} checked={cleaningDay === opt} onChange={(e) => setCleaningDay(e.target.value)} />
                  <span>{opt === '' ? 'None' : opt}</span>
                </label>
              ))}
            </div>
            <div className="help-text">1 hour for Cleaning will be reserved after the lunch break when possible.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 