import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, Calendar, Clock, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState({ classesTaken: 0, classesToTake: 0, classesToReceive: 0 });
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin') {
      navigate('/admin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        if (user.role === 'Faculty') {
          const { data } = await api.get('/balance');
          setBalance(data);
          
          const timeRes = await api.get(`/timetable/${user._id}`);
          setTimetable(timeRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) return <div className="animate-fade-in text-center p-8 text-[var(--text-secondary)]">Loading dashboard...</div>;

  // Render return nothing if Admin, just in case redirect is pending
  if (user?.role === 'Admin') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, <span style={{fontWeight: 600, color: 'var(--primary-color)'}}>{user.name}</span> ({user.department})</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <BalanceCard 
          title="Total Classes Taken" 
          value={balance.classesTaken} 
          desc="Classes you taught for others"
          icon={<BookOpen size={24} />}
          color="var(--primary-color)"
          bg="var(--primary-light)"
        />
        <BalanceCard 
          title="Classes to Take" 
          value={balance.classesToTake} 
          desc="Compensation pending for you"
          icon={<Clock size={24} />}
          color="#b45309"
          bg="var(--warning-light)"
        />
        <BalanceCard 
          title="Classes to Receive" 
          value={balance.classesToReceive} 
          desc="Others waiting to compensate you"
          icon={<ArrowRightLeft size={24} />}
          color="#047857"
          bg="var(--success-light)"
        />
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', fontFamily: 'var(--font-family-heading)' }}>My Scheduled Classes</h3>
        {timetable.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No classes scheduled in your timetable.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>The Admin can add slots for you in the Admin Panel.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Period</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map(cls => (
                  <tr key={cls._id}>
                    <td>
                      <span className="badge badge-info">{cls.day}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{cls.period}</td>
                    <td style={{ fontWeight: 600 }}>{cls.subject}</td>
                    <td>{cls.section}</td>
                    <td>{cls.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const BalanceCard = ({ title, value, desc, icon, color, bg }) => (
  <motion.div 
    className="card" 
    style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', borderTop: `4px solid ${color}` }}
    whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
  >
    <div style={{ padding: '14px', backgroundColor: bg, color: color, borderRadius: 'var(--radius-lg)' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-family-heading)' }}>{value}</div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{desc}</p>
    </div>
  </motion.div>
);

export default Dashboard;
