import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/SkeletonLoader';

const AssignSubstitute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    let isMounted = true;
    let pollTimer;

    const fetchInitialData = async () => {
      try {
        const [facsRes, timeRes] = await Promise.all([
          api.get('/faculty'),
          api.get(`/timetable/${user._id}`)
        ]);
        
        if (!isMounted) return;
        // Filter out the current user, allow ANY department
        const eligible = facsRes.data.filter(f => f._id !== user._id);
        setFaculties(eligible);
        setMyTimetable(timeRes.data);
        setLoading(false);

        clearTimeout(pollTimer);
        pollTimer = setTimeout(fetchInitialData, 10000);
      } catch (error) {
        if (!isMounted) return;
        setLoading(true);
        
        clearTimeout(pollTimer);
        pollTimer = setTimeout(fetchInitialData, 3000);
      }
    };
    
    fetchInitialData();

    return () => {
      isMounted = false;
      clearTimeout(pollTimer);
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newFormData = { ...formData, [name]: value };

    // Auto-fill logic if both date and period are selected
    if (name === 'date' || name === 'period') {
      const selectedDate = name === 'date' ? value : formData.date;
      const selectedPeriod = name === 'period' ? value : formData.period;

      if (selectedDate && selectedPeriod) {
        const dateObj = new Date(selectedDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dateObj.getDay()];
        
        const selectedSlot = myTimetable.find(s => s.day === dayName && s.period.toString() === selectedPeriod.toString());
        if (selectedSlot) {
          newFormData.subject = selectedSlot.subject;
          newFormData.section = selectedSlot.section;
          newFormData.classroom = selectedSlot.room;
        }
      }
    }
    
    setFormData(newFormData);
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
              <select id="period" name="period" className="form-input" required onChange={handleChange} value={formData.period}>
                <option value="" disabled>Select Period</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>Period {num}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject Name</label>
              <input type="text" id="subject" name="subject" className="form-input" required onChange={handleChange} value={formData.subject} placeholder="Enter Subject Name" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="classroom">Classroom</label>
              <input type="text" id="classroom" name="classroom" className="form-input" required onChange={handleChange} value={formData.classroom} placeholder="Enter Classroom" />
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
              <input type="text" id="section" name="section" className="form-input" required onChange={handleChange} value={formData.section} placeholder="Enter Section" />
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
