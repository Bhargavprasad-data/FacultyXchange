import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();
  // Lift sidebar hover state if we need it to affect main-content width, 
  // but using a simpler absolute/overlay sidebar or left-margin approach works best for modern dashboards
  // Setting a fixed left padding for main content ensures no layout shifts.
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar onHover={setIsSidebarHovered} />
      <main 
        className="main-content" 
        style={{ 
          marginLeft: 'var(--sidebar-collapsed)',
          transition: 'margin-left 0.3s ease',
          width: 'calc(100% - var(--sidebar-collapsed))'
        }}
      >
        <TopNav />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
