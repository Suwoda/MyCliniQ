'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import { db } from '../utils/db';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ShieldAlert, 
  ChevronRight, 
  Play,
  Lock
} from 'lucide-react';
import styles from '../styles/home.module.css';

export default function HomePage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState('assistant');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Unified Login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please enter Username and Password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Try to authenticate via local storage (Demo Mode) first
      const usersList = await db.getUsers();
      const matchedUser = usersList.find(
        u => u.username.toLowerCase() === username.toLowerCase() && 
             u.password === password && 
             u.role === activeRole
      );

      if (matchedUser) {
        setSuccessMessage('Login successful! Redirecting to Dashboard...');
        sessionStorage.setItem('isDemo', 'true');
        sessionStorage.setItem('userRole', matchedUser.role);
        sessionStorage.setItem('userName', matchedUser.full_name);
        sessionStorage.setItem('isChief', matchedUser.is_chief ? 'true' : 'false');
        
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 1200);
        return;
      }

      // 2. Fallback to Supabase authentication if not found in mock users
      const email = username.includes('@') ? username : `${username}@mycliniq.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error('Invalid Username, Password, or Role matching.');
      }

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile could not be found. Please contact the Admin.');
      }

      // Check if user is trying to log in with matching role
      if (profile.role !== activeRole) {
        setErrorMessage(`This account is not valid for ${activeRole.toUpperCase()}.`);
        setLoading(false);
        return;
      }

      setSuccessMessage('Login successful! Redirecting to Dashboard...');
      sessionStorage.setItem('isDemo', 'false');
      sessionStorage.setItem('userRole', profile.role);
      sessionStorage.setItem('userName', profile.full_name);
      sessionStorage.setItem('isChief', profile.is_chief ? 'true' : 'false');

      setTimeout(() => {
        router.push(`/dashboard`);
      }, 1200);

    } catch (error) {
      setErrorMessage(error.message || 'Failed to log in. Please try again.');
      setLoading(false);
    }
  };

  // Helper icons for tabs
  const getRoleIcon = (role, size = 20) => {
    switch (role) {
      case 'assistant': return <Users size={size} />;
      case 'doctor': return <Stethoscope size={size} />;
      case 'pharmacist': return <Pill size={size} />;
      case 'mlt': return <FlaskConical size={size} />;
      case 'manager': return <ShieldAlert size={size} />;
      default: return <Users size={size} />;
    }
  };

  const getRoleNameEnglish = (role) => {
    switch (role) {
      case 'assistant': return 'Assistant';
      case 'doctor': return 'Doctor';
      case 'pharmacist': return 'Pharmacist';
      case 'mlt': return 'MLT Lab';
      case 'manager': return 'Manager';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>

      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.logoGlow}>MyCliniQ</h1>
          <p className={styles.subtitle}>Smart Clinical Management & Patient Care</p>
        </header>

        <div className={styles.grid}>
          {/* Centered Login box */}
          <div className={styles.loginCard} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Staff Login</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                First select your system role
              </p>
            </div>

            {/* Role Switcher tabs */}
            <div className={styles.roleSelector}>
              {['assistant', 'doctor', 'pharmacist', 'mlt', 'manager'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    setErrorMessage('');
                  }}
                  className={`${styles.roleTab} ${activeRole === role ? styles.roleTabActive : ''}`}
                >
                  {getRoleIcon(role, 18)}
                  <span>{getRoleNameEnglish(role)}</span>
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className={`${styles.alert} ${styles.alertDanger}`}>
                <ShieldAlert size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className={`${styles.alert} ${styles.alertSuccess}`}>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Username</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Enter username (e.g. admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
              >
                {loading ? 'Logging in...' : 'Login'}
                <ChevronRight size={18} />
              </button>
            </form>

            <p className={styles.footerText}>
              Credentials: (admin/admin, doctor/doctor, assistant/assistant)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
