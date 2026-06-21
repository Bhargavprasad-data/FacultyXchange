import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/SkeletonLoader';

const Compensate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    let isMounted = true;
    let pollTimer;

    const fetchPending = async () => {
      try {
        const { data } = await api.get('/substitute');
        if (!isMounted) return;
        
        // Filter to requests where I am the SUBSTITUTE faculty (they owe me a class)
        const owingMe = data.filter(d => 
          d.substituteFaculty._id == user?._id && 
          d.status === 'Approved' &&
          d.compensationStatus === 'Pending'
        );
        setPendingRequests(owingMe);
        setLoading(false);

        clearTimeout(pollTimer);
        pollTimer = setTimeout(fetchPending, 10000);
      } catch (error) {
        if (!isMounted) return;
        setLoading(true);
        
        clearTimeout(pollTimer);
        pollTimer = setTimeout(fetchPending, 3000);
      }
    };
    
    fetchPending();

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
    };
  }, [user]);

  const handleSelectRequest = async (e) => {
    const requestId = e.target.value;
    const req = pendingRequests.find(r => r._id === requestId);
    setSelectedRequest(req);
    setSelectedTimetableSlot(null);
    setCompensationDate(''); // Reset date when picking a new obligation

    // Fetch MY timetable so I can assign one of my classes to them
    try {
      if (req) {
        const { data } = await api.get(`/timetable/${user?._id}`);
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

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
        <SkeletonLoader type="form" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '900px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Compensate a Class</h1>
          <p className="page-subtitle">Assign one of your classes to a faculty member who owes you a compensation</p>
        </div>
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: '600', border: '1px solid #fde68a', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          Classes Owed to You: <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem' }}>{pendingRequests.length}</span>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label className="form-label" style={{ marginBottom: '1rem', display: 'block', fontSize: '1.1rem' }}>Select a Faculty Who Owes You</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {pendingRequests.map(req => (
                <div 
                  key={req._id}
                  onClick={() => handleSelectRequest({ target: { value: req._id } })}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedRequest?._id === req._id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    backgroundColor: selectedRequest?._id === req._id ? 'var(--primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedRequest?._id === req._id ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {req.originalFaculty.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Owes you for: {req.subject} on {new Date(req.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRequest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '2rem 0' }}></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                Select Your Class to Assign to <span style={{ color: 'var(--primary-color)' }}>{selectedRequest.originalFaculty.name}</span>
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="compensationDate">Date They Will Teach</label>
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
                  <label className="form-label">Your Scheduled Class Slot</label>
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
                  <strong style={{ color: 'var(--accent-hover)' }}>Summary:</strong> You are assigning your <span style={{fontWeight:600}}>{selectedTimetableSlot.subject}</span> class (Section <span style={{fontWeight:600}}>{selectedTimetableSlot.section}</span> in Room <span style={{fontWeight:600}}>{selectedTimetableSlot.room}</span>) on <span style={{fontWeight:600}}>{compensationDate}</span> to <span style={{fontWeight:600}}>{selectedRequest.originalFaculty.name}</span>.
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
              <p style={{ marginTop: '0.5rem' }}>No faculty currently owes you a compensation class.</p>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default Compensate;
