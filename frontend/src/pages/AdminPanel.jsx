import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Clock, Edit2, Trash2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminPanel = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [allTimetables, setAllTimetables] = useState([]);
  const [activeTab, setActiveTab] = useState('faculty');
  const [timetableForm, setTimetableForm] = useState({
    facultyId: '', day: 'Monday', period: '', subject: '', section: '', room: ''
  });

  const [formData, setFormData] = useState({
    name: '', facultyId: '', department: '', email: '', password: '', role: 'Faculty'
  });
  const [editFormData, setEditFormData] = useState({
    name: '', facultyId: '', department: '', email: '', password: '', role: 'Faculty'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [facRes, subRes, timeRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/substitute/all'),
        api.get('/timetable/all')
      ]);
      setFaculties(facRes.data);
      setSubstitutes(subRes.data);
      setAllTimetables(timeRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = e => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty', formData);
      toast.success('Faculty added successfully');
      setFormData({ name: '', facultyId: '', department: '', email: '', password: '', role: 'Faculty' });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add faculty');
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...editFormData };
      if (!updateData.password) delete updateData.password;
      
      await api.put(`/faculty/${editingId}`, updateData);
      toast.success('Faculty updated successfully');
      handleCancelEdit();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update faculty');
    }
  };

  const handleEdit = (faculty) => {
    setIsEditing(true);
    setEditingId(faculty._id);
    setEditFormData({
      name: faculty.name,
      facultyId: faculty.facultyId,
      department: faculty.department,
      email: faculty.email,
      password: '',
      role: faculty.role,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditFormData({ name: '', facultyId: '', department: '', email: '', password: '', role: 'Faculty' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty user?')) {
      try {
        await api.delete(`/faculty/${id}`);
        toast.success('Faculty deleted successfully');
        fetchAdminData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete faculty');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of json) {
          try {
            await api.post('/faculty', {
              name: row.Name || row.name || row['Faculty Name'],
              facultyId: row.FacultyID || row.facultyId || row['Faculty ID'],
              department: row.Department || row.department || row.Dept || row.dept,
              email: row.Email || row.email,
              password: row.Password || row.password || 'password123',
              role: row.Role || row.role || 'Faculty'
            });
            successCount++;
          } catch (err) {
            errorCount++;
            console.error('Failed to import row', row, err);
          }
        }

        if (successCount > 0) toast.success(`Successfully imported ${successCount} faculties`);
        if (errorCount > 0) toast.error(`Failed to import ${errorCount} records. They might already exist.`);
        
        fetchAdminData();
        e.target.value = null; // Reset file input
      } catch (err) {
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTimetableFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of json) {
          try {
            const facIdQuery = row.FacultyID || row.facultyId || row['Faculty ID'] || row.Faculty;
            // Find faculty object ID from loaded faculties
            const faculty = faculties.find(f => f.facultyId === facIdQuery);
            
            if (!faculty) {
              console.error(`Faculty ID ${facIdQuery} not found. Skipping...`);
              errorCount++;
              continue;
            }

            await api.post('/timetable', {
              facultyId: faculty._id,
              day: row.Day || row.day || 'Monday',
              period: row.Period || row.period || row['Period Number'],
              subject: row.Subject || row.subject,
              section: row.Section || row.section,
              room: row.Room || row.room || row.Classroom
            });
            successCount++;
          } catch (err) {
            errorCount++;
            console.error('Failed to import timetable row', row, err);
          }
        }

        if (successCount > 0) toast.success(`Successfully imported ${successCount} timetable slots`);
        if (errorCount > 0) toast.error(`Failed to import ${errorCount} slots. Check faculty IDs.`);
        
        e.target.value = null; // Reset
      } catch (err) {
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTimetableChange = e => setTimetableForm({ ...timetableForm, [e.target.name]: e.target.value });

  const handleAddTimetable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetable', timetableForm);
      toast.success('Timetable slot added successfully');
      setTimetableForm({ ...timetableForm, period: '', subject: '', section: '', room: '' });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add timetable slot');
    }
  };

  if (user?.role !== 'Admin') {
    return <div style={{ padding: '2rem' }}>Access Denied. Admins only.</div>;
  }

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      <Toaster position="top-center" />
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage faculty, view system-wide substitute reports and analytics</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <motion.div whileHover={{ y: -5 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Faculties</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>{faculties.length}</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #047857' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--success-light)', color: '#047857', borderRadius: 'var(--radius-md)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Substitutes Recorded</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>{substitutes.length}</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #b45309' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--warning-light)', color: '#b45309', borderRadius: 'var(--radius-md)' }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Compensations</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>
              {substitutes.filter(s => s.compensationStatus === 'Pending').length}
            </div>
          </div>
        </motion.div>
      </div>
      <br></br>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('faculty')} className={`btn ${activeTab === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}>Manage Faculty</button>
        <button onClick={() => setActiveTab('timetable')} className={`btn ${activeTab === 'timetable' ? 'btn-primary' : 'btn-secondary'}`}>Manage Timetables</button>
        <button onClick={() => setActiveTab('reports')} className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}>System Reports</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'faculty' && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-family-heading)' }}>
                    Add New User
                  </h3>
                  
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={handleFileUpload}
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                      title="Bulk Import via Excel"
                    />
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={14} /> Bulk Import (.xlsx)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddFaculty}>
                  <div className="form-group"><label className="form-label">Name</label><input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Faculty ID</label><input type="text" name="facultyId" className="form-input" required value={formData.facultyId} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Department</label><input type="text" name="department" className="form-input" required value={formData.department} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} /></div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-input" required value={formData.password} onChange={handleChange} />
                  </div>
                  <div className="form-group"><label className="form-label">Role</label>
                    <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
                      <option value="Faculty">Faculty</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Create User
                    </button>
                  </div>
                </form>
                
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                  <strong>Excel Format Required:</strong><br />
                  Use columns: <code>Name</code>, <code>Faculty ID</code>, <code>Department</code>, <code>Email</code>, <code>Password</code> (optional), <code>Role</code> (optional).
                </div>
              </div>

              {isEditing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-family-heading)' }}>Edit User</h3>
                      <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
                    </div>
                    <form onSubmit={handleUpdateFaculty}>
                      <div className="form-group"><label className="form-label">Name</label><input type="text" name="name" className="form-input" required value={editFormData.name} onChange={handleEditChange} /></div>
                      <div className="form-group"><label className="form-label">Faculty ID</label><input type="text" name="facultyId" className="form-input" required value={editFormData.facultyId} onChange={handleEditChange} disabled /></div>
                      <div className="form-group"><label className="form-label">Department</label><input type="text" name="department" className="form-input" required value={editFormData.department} onChange={handleEditChange} /></div>
                      <div className="form-group"><label className="form-label">Email</label><input type="email" name="email" className="form-input" required value={editFormData.email} onChange={handleEditChange} /></div>
                      <div className="form-group">
                        <label className="form-label">
                          Password <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>(Leave blank to keep unchanged)</span>
                        </label>
                        <input type="password" name="password" className="form-input" value={editFormData.password} onChange={handleEditChange} />
                      </div>
                      <div className="form-group"><label className="form-label">Role</label>
                        <select name="role" className="form-input" value={editFormData.role} onChange={handleEditChange} disabled={editFormData.facultyId === user.facultyId}>
                          <option value="Faculty">Faculty</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                          Update User
                        </button>
                        <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{ flex: 1 }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', fontFamily: 'var(--font-family-heading)' }}>Directory</h3>
                <div className="table-container">
                  <table className="table">
                    <thead><tr><th>Name & Email</th><th>ID</th><th>Dept</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody>
                      {faculties.map(f => (
                        <tr key={f._id} style={{ backgroundColor: editingId === f._id ? 'var(--primary-light)' : 'transparent' }}>
                          <td style={{ fontWeight: 500 }}>
                            {f.name}
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 400 }}>{f.email}</div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{f.facultyId}</td>
                          <td>{f.department}</td>
                          <td>
                            <span className={`badge ${f.role === 'Admin' ? 'badge-info' : 'badge-completed'}`}>
                              {f.role}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleEdit(f)} title="Edit" style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(f._id)} 
                                title="Delete" 
                                disabled={f.facultyId === user.facultyId} // Admin shouldn't delete themselves here easily
                                style={{ padding: '6px', borderRadius: '4px', backgroundColor: f.facultyId === user.facultyId ? '#f1f5f9' : 'var(--danger-light)', color: f.facultyId === user.facultyId ? '#94a3b8' : 'var(--danger-color)', cursor: f.facultyId === user.facultyId ? 'not-allowed' : 'pointer' }}
                              >
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
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-family-heading)' }}>Add Timetable Slot</h3>
                
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleTimetableFileUpload}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                    title="Bulk Import Timetables"
                  />
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={14} /> Bulk Import (.xlsx)
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddTimetable}>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="form-group">
                    <label className="form-label">Faculty</label>
                    <select name="facultyId" className="form-input" required value={timetableForm.facultyId} onChange={handleTimetableChange}>
                      <option value="" disabled>Select Faculty</option>
                      {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Day</label>
                    <select name="day" className="form-input" required value={timetableForm.day} onChange={handleTimetableChange}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period Number (e.g. 1 to 8)</label>
                    <input type="number" name="period" min="1" max="10" className="form-input" required value={timetableForm.period} onChange={handleTimetableChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input type="text" name="subject" className="form-input" required value={timetableForm.subject} onChange={handleTimetableChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input type="text" name="section" className="form-input" required value={timetableForm.section} onChange={handleTimetableChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room / Classroom</label>
                    <input type="text" name="room" className="form-input" required value={timetableForm.room} onChange={handleTimetableChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Timetable Slot</button>
              </form>

              <div style={{ marginTop: '2.rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                <strong>Excel Format Required:</strong><br />
                Use columns: <code>Faculty ID</code>, <code>Day</code>, <code>Period</code>, <code>Subject</code>, <code>Section</code>, <code>Room</code>.
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', fontFamily: 'var(--font-family-heading)' }}>System Wide Substitutions</h3>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Date</th><th>Subject</th><th>Dept</th><th>Original</th><th>Substitute</th><th>Status</th></tr></thead>
                  <tbody>
                    {substitutes.map(sub => (
                      <tr key={sub._id}>
                        <td style={{ fontWeight: 500 }}>{new Date(sub.date).toLocaleDateString()}</td>
                        <td><span style={{ fontWeight: 600 }}>{sub.subject}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Per {sub.period}</span></td>
                        <td>{sub.department}</td>
                        <td style={{ color: 'var(--danger-color)', fontWeight: 500 }}>{sub.originalFaculty?.name}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 500 }}>{sub.substituteFaculty?.name}</td>
                        <td>
                          <span className={`badge ${sub.compensationStatus === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                            {sub.compensationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPanel;
