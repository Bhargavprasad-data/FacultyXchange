import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Timetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    day: 'Monday',
    period: '',
    subject: '',
    section: '',
    room: ''
  });

  const fetchTimetable = async () => {
    try {
      if (user?._id) {
        const res = await api.get(`/timetable/${user._id}`);
        setTimetable(res.data);
      }
    } catch (error) {
      toast.error('Failed to load timetable');
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ day: 'Monday', period: '', subject: '', section: '', room: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (slot) => {
    setIsEditing(true);
    setEditingId(slot._id);
    setFormData({
      day: slot.day,
      period: slot.period,
      subject: slot.subject,
      section: slot.section,
      room: slot.room
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/timetable/my/${id}`);
        toast.success('Class removed successfully');
        fetchTimetable();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/timetable/my/${editingId}`, formData);
        toast.success('Class updated successfully');
      } else {
        await api.post('/timetable/my', formData);
        toast.success('Class added successfully');
      }
      setIsModalOpen(false);
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} class`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Group classes by day for a nicer display
  const classesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day).sort((a, b) => a.period - b.period);
    return acc;
  }, {});

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Timetable</h1>
          <p className="page-subtitle">Manage your weekly class schedule</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Class
        </button>
      </div>

      <div className="grid gap-6">
        {daysOfWeek.map(day => {
          const dayClasses = classesByDay[day];
          if (dayClasses.length === 0) return null;

          return (
            <div key={day} className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {day}
              </h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Period</th>
                      <th>Subject</th>
                      <th>Section</th>
                      <th>Room</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayClasses.map(slot => (
                      <tr key={slot._id}>
                        <td><span className="badge badge-info">{slot.period}</span></td>
                        <td style={{ fontWeight: 500 }}>{slot.subject}</td>
                        <td>{slot.section}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{slot.room}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEdit(slot)} title="Edit" style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', border: 'none', cursor: 'pointer' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(slot._id)} title="Delete" style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {timetable.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>Your timetable is empty. Add a class to get started!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-family-heading)' }}>
                {isEditing ? 'Edit Class' : 'Add Class'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Day</label>
                <select name="day" className="form-input" required value={formData.day} onChange={handleChange}>
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Period (e.g. 1)</label>
                <input type="number" name="period" className="form-input" min="1" max="10" required value={formData.period} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" name="subject" className="form-input" required value={formData.subject} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <input type="text" name="section" className="form-input" required value={formData.section} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <input type="text" name="room" className="form-input" required value={formData.room} onChange={handleChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isEditing ? 'Update' : 'Add'} Class
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Timetable;
