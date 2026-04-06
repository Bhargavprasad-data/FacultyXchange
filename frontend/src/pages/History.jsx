import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const [substitutes, setSubstitutes] = useState([]);
  const [compensations, setCompensations] = useState([]);
  const [activeTab, setActiveTab] = useState('substitutes');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const subRes = await api.get('/substitute');
        const compRes = await api.get('/compensation');
        setSubstitutes(subRes.data);
        setCompensations(compRes.data);
      } catch (error) {
        toast.error('Failed to load history');
      }
    };
    fetchHistory();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header">
        <h1 className="page-title">Exchange History & Balance</h1>
        <p className="page-subtitle">View all your historical assignments and compensation records</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('substitutes')} 
          className={`btn ${activeTab === 'substitutes' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Substitute Classes
        </button>
        <button 
          onClick={() => setActiveTab('compensations')} 
          className={`btn ${activeTab === 'compensations' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Compensation Records
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="card">
            {activeTab === 'substitutes' && (
              <div className="table-container">
                {substitutes.length === 0 ? <p style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No substitute history found.</p> : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Original Faculty</th>
                        <th>Substitute Faculty</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {substitutes.map(sub => (
                        <tr key={sub._id}>
                          <td style={{ fontWeight: 500 }}>{new Date(sub.date).toLocaleDateString()}</td>
                          <td><span style={{ fontWeight: 600 }}>{sub.subject}</span> <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Per {sub.period}</span></td>
                          <td>{sub.originalFaculty.name}</td>
                          <td>{sub.substituteFaculty.name}</td>
                          <td>
                            <span className={`badge ${sub.compensationStatus === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                              {sub.compensationStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'compensations' && (
              <div className="table-container">
                {compensations.length === 0 ? <p style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No compensation history found.</p> : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date Taken</th>
                        <th>Subject</th>
                        <th>Compensated By</th>
                        <th>Compensated For</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compensations.map(comp => (
                        <tr key={comp._id}>
                          <td style={{ fontWeight: 500 }}>{new Date(comp.classDate).toLocaleDateString()}</td>
                          <td><span style={{ fontWeight: 600 }}>{comp.subject}</span> <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Per {comp.period}</span></td>
                          <td>{comp.originalFaculty.name}</td>
                          <td>{comp.substituteFaculty.name}</td>
                          <td>
                            <span className="badge badge-completed">
                              {comp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default History;
