import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TopNav = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header style={styles.header}>
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search classes, schedules, reports..." 
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.actions}>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }}
            style={styles.iconBtn}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span style={styles.badge}></span>}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={styles.dropdown}
              >
                <div style={styles.dropdownHeader}>
                  <h3 style={styles.dropdownTitle}>Notifications</h3>
                  {unreadCount > 0 && <span style={styles.unreadCountText}>{unreadCount} unread</span>}
                </div>
                <div style={styles.dropdownBody}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>No notifications yet!</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        style={{
                          ...styles.notifItem,
                          backgroundColor: notif.isRead ? 'transparent' : 'var(--accent-light)',
                        }}
                        onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                      >
                        <div style={styles.notifContent}>
                          <p style={{
                            ...styles.notifMessage,
                            color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                            fontWeight: notif.isRead ? 400 : 500
                          }}>
                            {notif.message}
                          </p>
                          <span style={styles.notifTime}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        {!notif.isRead && <div style={styles.notifDot}></div>}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          style={styles.profile}
          whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.05)' }}
        >
          <div style={styles.avatar}>
            <span style={{ fontWeight: 600 }}>{user?.name?.charAt(0)}</span>
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userRole}>{user?.department} • {user?.role}</p>
          </div>
          <ChevronDown size={16} color="var(--text-secondary)" style={{ marginLeft: '4px' }} />
        </motion.div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '72px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--background-color)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid transparent',
    transition: 'border-color 0.2s',
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    color: 'var(--text-secondary)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--background-color)',
    transition: 'color 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    backgroundColor: 'var(--danger-color)',
    borderRadius: '50%',
    border: '2px solid var(--surface-color)',
  },
  dropdown: {
    position: 'absolute',
    top: '120%',
    right: 0,
    width: '320px',
    backgroundColor: 'var(--surface-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--border-color)',
    zIndex: 100,
    overflow: 'hidden'
  },
  dropdownHeader: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-color)',
  },
  dropdownTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0
  },
  unreadCountText: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600
  },
  dropdownBody: {
    maxHeight: '350px',
    overflowY: 'auto'
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  notifItem: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  notifContent: {
    flex: 1
  },
  notifMessage: {
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: 1.4,
    marginBottom: '6px'
  },
  notifTime: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  notifDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent-color)',
    borderRadius: '50%',
    marginTop: '6px'
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    transition: 'background-color 0.2s',
  },
  avatar: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: 1.2,
    marginTop: '2px'
  }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @media (max-width: 768px) {
    header > div:last-child > div[style*="flex-direction: column"] {
      display: none !important;
    }
    header > div:last-child svg[class*="lucide-chevron-down"] {
        display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default TopNav;
