import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Compensate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Timetable of the person who originally helped ME, so I can return the favor
  const [targetTimetable, setTargetTimetable] = useState([]);
  const [availableTargetSlots, setAvailableTargetSlots] = useState([]);
  const [selectedTimetableSlot, setSelectedTimetableSlot] = useState(null);
  const [compensationDate, setCompensationDate] = useState('');

  useEffect(() => {
    if (compensationDate && targetTimetable.length > 0) {
      const dateObj = new Date(compensationDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getDay()];
      
      const slotsForDay = targetTimetable.filter(slot => slot.day === dayName).sort((a,b) => a.period - b.period);
      setAvailableTargetSlots(slotsForDay);
      // Reset selected slot if date changes
      setSelectedTimetableSlot(null);
    } else {
      setAvailableTargetSlots([]);
      setSelectedTimetableSlot(null);
    }
  }, [compensationDate, targetTimetable]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await api.get('/substitute');
        // Filter to requests where I am the original faculty (I owe them a class)
        const owing = data.filter(d => 
          d.originalFaculty._id === user._id && 
          d.compensationStatus === 'Pending'
        );
        setPendingRequests(owing);
      } catch (error) {
        toast.error('Failed to load pending requests');
      }
    };
    fetchPending();
  }, [user]);

  const handleSelectRequest = async (e) => {
    const requestId = e.target.value;
    const req = pendingRequests.find(r => r._id === requestId);
    setSelectedRequest(req);
    setSelectedTimetableSlot(null);
    setCompensationDate(''); // Reset date when picking a new obligation

    // Fetch the target faculty's timetable (the person who subbed for me, so I can pick their class to teach)
    try {
      if (req) {
        const { data } = await api.get(`/timetable/${req.substituteFaculty._id}`);
        setTargetTimetable(data);
      }
    } catch (error) {
      toast.error("Could not fetch target's timetable");
    }
  };

  const handleSelectTimetable = (e) => {
    const slotId = e.target.value;
    const slot = availableTargetSlots.find(t => t._id === slotId);
    setSelectedTimetableSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedTimetableSlot || !compensationDate) {
      return toast.error("Please fill all fields");
    }

    try {
      await api.post('/compensation', {
        substituteClassId: selectedRequest._id,
        classDate: compensationDate,
        period: selectedTimetableSlot.period,
        subject: selectedTimetableSlot.subject,
        section: selectedTimetableSlot.section,
        room: selectedTimetableSlot.room
      });
      toast.success('Compensation class scheduled successfully!');
      setTimeout(() => navigate('/history'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule compensation');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '900px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header">
        <h1 className="page-title">Compensate a Class</h1>
        <p className="page-subtitle">Return the favor by taking a scheduled class for a faculty who subbed for you</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label className="form-label">Select Pending Obligation</label>
            <select className="form-input" required onChange={handleSelectRequest} defaultValue="" style={{ fontSize: '1rem' }}>
              <option value="" disabled>Select the class you need to compensate for...</option>
              {pendingRequests.map(req => (
                <option key={req._id} value={req._id}>
                  Owe: {req.substituteFaculty.name} (Subbed your {req.subject} class on {new Date(req.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedRequest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '2rem 0' }}></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                Select <span style={{ color: 'var(--primary-color)' }}>{selectedRequest.substituteFaculty.name}'s</span> Class to Teach
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="compensationDate">Date You Will Teach</label>
                  <input 
                    type="date" 
                    id="compensationDate" 
                    className="form-input" 
                    required 
                    onChange={(e) => setCompensationDate(e.target.value)} 
                    // Should be after the original substitute date ideally
                    min={new Date(selectedRequest.date).toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Their Scheduled Class Slot</label>
                  <select 
                    className="form-input" 
                    required 
                    onChange={handleSelectTimetable} 
                    value={selectedTimetableSlot ? selectedTimetableSlot._id : ""}
                    disabled={!compensationDate || availableTargetSlots.length === 0}
                  >
                    <option value="" disabled>
                      {!compensationDate ? 'Select Date First' : availableTargetSlots.length === 0 ? 'No Schedule on this Day' : 'Select a scheduled slot'}
                    </option>
                    {availableTargetSlots.map(slot => (
                      <option key={slot._id} value={slot._id}>
                        {slot.day} - Per {slot.period} - {slot.subject} ({slot.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTimetableSlot && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    backgroundColor: 'var(--accent-light)', 
                    padding: '1.25rem', 
                    borderRadius: 'var(--radius-md)', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.95rem',
                    borderLeft: '4px solid var(--accent-color)'
                  }}
                >
                  <strong style={{ color: 'var(--accent-hover)' }}>Summary:</strong> You will teach <span style={{fontWeight:600}}>{selectedTimetableSlot.subject}</span> to Section <span style={{fontWeight:600}}>{selectedTimetableSlot.section}</span> in Room <span style={{fontWeight:600}}>{selectedTimetableSlot.room}</span> on <span style={{fontWeight:600}}>{compensationDate}</span> (Period {selectedTimetableSlot.period}).
                </motion.div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  Submit Compensation
                </button>
              </div>
            </motion.div>
          )}

          {pendingRequests.length === 0 && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--success-light)', color: '#047857', borderRadius: 'var(--radius-md)', border: '1px dashed #34d399' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>All caught up!</p>
              <p style={{ marginTop: '0.5rem' }}>You have no pending classes to compensate.</p>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default Compensate;
