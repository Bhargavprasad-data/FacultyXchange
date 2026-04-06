import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssignSubstitute from './pages/AssignSubstitute';
import Compensate from './pages/Compensate';
import History from './pages/History';
import AdminPanel from './pages/AdminPanel';
import AdminTimetables from './pages/AdminTimetables';
import Timetable from './pages/Timetable';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="assign-substitute" element={<AssignSubstitute />} />
            <Route path="compensate" element={<Compensate />} />
            <Route path="history" element={<History />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/timetables" element={<AdminTimetables />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
