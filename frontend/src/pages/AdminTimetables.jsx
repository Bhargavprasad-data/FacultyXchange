import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminTimetables = () => {
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTimetables = async () => {
    try {
      const { data } = await api.get('/timetable/all');
      setAllTimetables(data);
    } catch (error) {
      toast.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTimetables();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Group fetched allTimetables by faculty
  const groupedTimetables = allTimetables.reduce((acc, slot) => {
    const facId = slot.facultyId?._id || 'unknown';
    if (!acc[facId]) {
      acc[facId] = {
        faculty: slot.facultyId,
        slots: []
      };
    }
    acc[facId].slots.push(slot);
    return acc;
  }, {});

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>Loading timetables...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Faculty Timetables</h1>
        <p className="page-subtitle">View class schedules for all faculty members system-wide.</p>
      </div>

      <div>
        {Object.values(groupedTimetables).map(({ faculty, slots }) => {
          if (!faculty) return null;

          // Group by day inner
          const slotsByDay = daysOfWeek.reduce((acc, day) => {
            acc[day] = slots.filter(s => s.day === day).sort((a, b) => a.period - b.period);
            return acc;
          }, {});

          return (
            <div key={faculty._id} className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{faculty.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {faculty.department} | {faculty.email} | ID: {faculty.facultyId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {daysOfWeek.map(day => {
                  const daySlots = slotsByDay[day];
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={day} style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <h5 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary-color)' }}>{day}</h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {daySlots.map(slot => (
                          <li key={slot._id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                            <span className="badge badge-info" style={{ width: '40px', justifyContent: 'center' }}>P{slot.period}</span>
                            <span style={{ fontWeight: 500 }}>{slot.subject}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>({slot.section}) - {slot.room}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allTimetables.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No timetables found in the system. Add faculties and timetable slots from the Admin Manage panel.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminTimetables;
