import React from 'react';

const LectureManager = ({
  lectureStart,
  lectureEnd,
  setLectureStart,
  setLectureEnd,
  lectures,
  addLecture,
  removeLecture,
  uniWorkCompleted,
  setUniWorkCompleted,
}) => {
  return (
    <div className="section">
      <h3 className="section-title">Lectures</h3>
      <div className="lecture-form">
        <div className="input-group">
          <label className="input-label">Start</label>
          <input type="time" value={lectureStart} onChange={(e) => setLectureStart(e.target.value)} className="input" />
        </div>
        <div className="input-group">
          <label className="input-label">End</label>
          <input type="time" value={lectureEnd} onChange={(e) => setLectureEnd(e.target.value)} className="input" />
        </div>
        <button onClick={addLecture} className="btn btn-primary">Add Lecture</button>
      </div>
      <div className="lecture-list">
        {lectures.length === 0 ? (
          <div className="muted">No lectures added.</div>
        ) : (
          lectures.map((lec, idx) => (
            <div key={idx} className="lecture-item">
              <div>
                {lec.start} - {lec.end}  Lecture
              </div>
              <button onClick={() => removeLecture(idx)} className="btn btn-danger btn-sm">Remove</button>
            </div>
          ))
        )}
      </div>
      <div className="goals">
        <h4 className="subsection-title">Goals</h4>
        <label className="checkbox-row">
          <input type="checkbox" checked={uniWorkCompleted} onChange={(e) => setUniWorkCompleted(e.target.checked)} />
          <span>Uni work completed (week)</span>
        </label>
      </div>
    </div>
  );
};

export default LectureManager; 