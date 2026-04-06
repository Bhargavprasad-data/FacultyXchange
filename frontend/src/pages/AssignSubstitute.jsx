import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AssignSubstitute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    date: '',
    subject: '',
    year: '',
    semester: '',
    section: '',
    period: '',
    classroom: '',
    substituteFacultyId: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [facsRes, timeRes] = await Promise.all([
          api.get('/faculty'),
          api.get(`/timetable/${user._id}`)
        ]);
        
        // Filter out the current user, allow ANY department
        const eligible = facsRes.data.filter(f => f._id !== user._id);
        setFaculties(eligible);
        setMyTimetable(timeRes.data);
      } catch (error) {
        toast.error('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, [user]);

  // Update available slots when date changes
  useEffect(() => {
    if (formData.date) {
      const dateObj = new Date(formData.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getDay()];
      
      const slotsForDay = myTimetable.filter(slot => slot.day === dayName).sort((a,b) => a.period - b.period);
      setAvailableSlots(slotsForDay);
      
      // Reset dependent fields if date changes
      setFormData(prev => ({
        ...prev,
        period: '',
        subject: '',
        section: '',
        classroom: ''
      }));
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, myTimetable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'period') {
      // Auto-fill other fields based on selected period slot
      const selectedSlot = availableSlots.find(s => s.period.toString() === value);
      if (selectedSlot) {
        setFormData({
          ...formData,
          period: value,
          subject: selectedSlot.subject,
          section: selectedSlot.section,
          classroom: selectedSlot.room
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/substitute', formData);
      toast.success('Substitute assigned successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign substitute');
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
        <h1 className="page-title">Assign Substitute Class</h1>
        <p className="page-subtitle">Request another faculty to cover your class</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date of Absence</label>
              <input type="date" id="date" name="date" className="form-input" required onChange={handleChange} value={formData.date} />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="period">Period Number</label>
              <select id="period" name="period" className="form-input" required onChange={handleChange} value={formData.period} disabled={!formData.date}>
                <option value="" disabled>
                  {!formData.date ? 'Select Date First' : availableSlots.length === 0 ? 'No Classes Scheduled' : 'Select Period'}
                </option>
                {availableSlots.map(slot => (
                  <option key={slot._id} value={slot.period}>Period {slot.period} - {slot.subject}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject Name</label>
              <select id="subject" name="subject" className="form-input" required onChange={handleChange} value={formData.subject} disabled={!formData.period}>
                <option value="" disabled>Select Subject</option>
                {Array.from(new Set(availableSlots.map(s => s.subject))).map(subj => (
                   <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="classroom">Classroom</label>
              <select id="classroom" name="classroom" className="form-input" required onChange={handleChange} value={formData.classroom} disabled={!formData.period}>
                <option value="" disabled>Select Room</option>
                {Array.from(new Set(availableSlots.map(s => s.room))).map(rm => (
                   <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="year">Year</label>
              <select id="year" name="year" className="form-input" required onChange={handleChange} value={formData.year}>
                <option value="" disabled>Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="semester">Semester</label>
              <select id="semester" name="semester" className="form-input" required onChange={handleChange} value={formData.semester}>
                <option value="" disabled>Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="3">3rd Semester</option>
                <option value="4">4th Semester</option>
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
                <option value="7">7th Semester</option>
                <option value="8">8th Semester</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="section">Section</label>
              <select id="section" name="section" className="form-input" required onChange={handleChange} value={formData.section} disabled={!formData.period}>
                <option value="" disabled>Select Section</option>
                {Array.from(new Set(availableSlots.map(s => s.section))).map(sec => (
                   <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="substituteFacultyId">Substitute Faculty</label>
              <select id="substituteFacultyId" name="substituteFacultyId" className="form-input" required onChange={handleChange} value={formData.substituteFacultyId} disabled={faculties.length === 0}>
                {faculties.length === 0 ? (
                  <option value="" disabled>No other faculty available in the system</option>
                ) : (
                  <option value="" disabled>Select Faculty</option>
                )}
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>{f.name} ({f.facultyId} - {f.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary">
              Assign Class
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AssignSubstitute;
