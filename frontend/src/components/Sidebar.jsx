import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  CalendarMinus2, 
  CalendarCheck2, 
  History, 
  Shield,
  LogOut,
  ChevronRight,
  CalendarDays,
  List
} from 'lucide-react';

const textVariants = {
  collapsed: { opacity: 0, x: -10, display: 'none' },
  expanded: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1 } }
};

const NavItem = ({ to, icon, label, isHovered }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    style={{ textDecoration: 'none' }}
  >
    <div className="nav-icon-container">
      {icon}
    </div>
    <AnimatePresence>
      {isHovered && (
        <motion.span 
          className="nav-label"
          variants={textVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
    {isHovered && <ChevronRight size={14} className="nav-chevron" />}
  </NavLink>
);

const Sidebar = ({ onHover }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if(onHover) onHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if(onHover) onHover(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarVariants = {
    collapsed: { width: 'var(--sidebar-collapsed)' },
    expanded: { width: 'var(--sidebar-expanded)' }
  };

  return (
    <>
      <motion.aside 
        className="sidebar"
        variants={sidebarVariants}
        initial="collapsed"
        animate={isHovered ? "expanded" : "collapsed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="logo-container">
          <div className="logo-icon">FX</div>
          <AnimatePresence>
            {isHovered && (
              <motion.h2 
                className="logo-text"
                variants={textVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                FacultyXchange
              </motion.h2>
            )}
          </AnimatePresence>
        </div>

        <div className="nav-container">
          <AnimatePresence>
            {isHovered && (
              <motion.p 
                className="nav-section"
                variants={textVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                MAIN MENU
              </motion.p>
            )}
          </AnimatePresence>
          
          <nav className="nav">
            {user?.role === 'Faculty' && (
              <>
                <NavItem to="/" icon={<Home size={22} />} label="Dashboard" isHovered={isHovered} />
                <NavItem to="/timetable" icon={<CalendarDays size={22} />} label="My Timetable" isHovered={isHovered} />
                <NavItem to="/assign-substitute" icon={<CalendarMinus2 size={22} />} label="Assign Class" isHovered={isHovered} />
                <NavItem to="/compensate" icon={<CalendarCheck2 size={22} />} label="Compensation Schedule" isHovered={isHovered} />
                <NavItem to="/history" icon={<History size={22} />} label="Class History & Balance" isHovered={isHovered} />
              </>
            )}

            {user?.role === 'Admin' && (
              <>
                <NavItem to="/admin" icon={<Shield size={22} />} label="Admin Panel" isHovered={isHovered} />
                <NavItem to="/admin/timetables" icon={<List size={22} />} label="All Timetables" isHovered={isHovered} />
              </>
            )}
          </nav>
        </div>

        <div className="bottom-nav">
          <button className="logout-btn" onClick={handleLogout}>
            <div className="nav-icon-container">
              <LogOut size={22} />
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  variants={textVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ fontWeight: 500, marginLeft: '12px' }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <style>{`
        .sidebar {
          background: var(--sidebar-bg);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          color: var(--sidebar-text);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .logo-container {
          height: 72px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          white-space: nowrap;
        }

        .logo-icon {
          min-width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent-color) 0%, var(--primary-color) 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          margin-right: 16px;
          box-shadow: var(--shadow-glow);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }

        .nav-container {
          padding: 24px 16px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Hide scrollbar for cleaner look */
        .nav-container::-webkit-scrollbar {
          width: 4px;
        }
        .nav-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .nav-section {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 16px;
          padding-left: 20px;
          letter-spacing: 1.5px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          height: 48px;
          border-radius: 12px;
          color: var(--sidebar-text);
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
        }

        .nav-icon-container {
          min-width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          margin-left: -5px;
        }

        .nav-label {
          margin-left: 12px;
          flex: 1;
          font-size: 0.95rem;
        }

        .nav-chevron {
          opacity: 0;
          margin-right: 16px;
          transition: opacity 0.2s ease;
        }

        .nav-item:hover {
          background-color: var(--sidebar-hover);
          color: white;
        }

        .nav-item:hover .nav-icon-container {
          transform: scale(1.1);
          color: var(--accent-light);
        }
        
        .nav-item:hover .nav-chevron {
          opacity: 0.5;
        }

        .nav-item.active {
          background-color: var(--sidebar-active);
          color: white;
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 10px;
          bottom: 10px;
          width: 4px;
          background-color: var(--accent-color);
          border-radius: 0 4px 4px 0;
        }

        .nav-item.active .nav-icon-container {
          color: var(--accent-color);
        }

        .bottom-nav {
          padding: 24px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          width: 100%;
          height: 48px;
          border-radius: 12px;
          color: #fca5a5;
          transition: all 0.2s ease;
          white-space: nowrap;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        
        .logout-btn:hover .nav-icon-container {
          transform: scale(1.1);
          margin-left: -5px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;

