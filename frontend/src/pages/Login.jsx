import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(facultyId, password);
      // Navigation is handled by the useEffect above
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--background-color)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Toaster position="top-center" />

      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, var(--primary-color) 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', filter: 'blur(60px)' }} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}
        >
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, var(--accent-color) 0%, #06b6d4 100%)',
            color: 'white',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '32px',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)'
          }}>
            FX
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            FacultyXchange
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: '0.85',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Streamlined substitution, timetables, & compensation tracking for modern engineering colleges.
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--background-color)',
        position: 'relative'
      }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '3rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.6)'
          }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Please sign in to your faculty account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="facultyId" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Faculty ID or Admin Username</label>
              <input
                className="form-input"
                id="facultyId"
                type="text"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                required
                placeholder="e.g. cse001 or admin123"
                style={{ padding: '0.875rem 1rem', fontSize: '1rem', backgroundColor: '#f8fafc' }}
                autoComplete="username"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <label className="form-label" htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ padding: '0.875rem 1rem', paddingRight: '2.5rem', fontSize: '1rem', backgroundColor: '#f8fafc', width: '100%' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.8 : 1
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* <div style={{
            marginTop: '2.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--blue-50)',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: 'var(--blue-800)',
            border: '1px solid var(--blue-100)',
            lineHeight: '1.6'
          }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--blue-900)' }}>Demo Credentials:</strong>
            <p><strong>Admin:</strong> admin123 / password123</p>
            <p><strong>Faculty 1:</strong> cse001 / password123</p>
            <p><strong>Faculty 2:</strong> cse002 / password123</p>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

