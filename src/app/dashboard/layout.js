'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ShieldAlert, 
  LogOut,
  CalendarDays,
  Menu
} from 'lucide-react';
import styles from '../../styles/dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '', role: '' });
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // Client-side session checks
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');

    if (!name || !role) {
      router.push('/');
    } else {
      setUser({ name, role });
      setLoading(false);
    }

    // Set local date string
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setTodayDate(new Date().toLocaleDateString('si-LK', options));
  }, [router]);

  const handleLogout = async () => {
    const isDemo = sessionStorage.getItem('isDemo') === 'true';
    if (!isDemo) {
      await supabase.auth.signOut();
    }
    sessionStorage.clear();
    router.push('/');
  };

  const getRoleIcon = (role, size = 18) => {
    switch (role) {
      case 'assistant': return <Users size={size} />;
      case 'doctor': return <Stethoscope size={size} />;
      case 'pharmacist': return <Pill size={size} />;
      case 'mlt': return <FlaskConical size={size} />;
      case 'manager': return <ShieldAlert size={size} />;
      default: return <Users size={size} />;
    }
  };

  const getRoleNameSinhala = (role) => {
    switch (role) {
      case 'assistant': return 'සහායක (OPD)';
      case 'doctor': return 'වෛද්‍යවරයා';
      case 'pharmacist': return 'ෆාමසිස්ට්';
      case 'mlt': return 'MLT ලැබ්';
      case 'manager': return 'මැනේජර් (Admin)';
      default: return 'කාර්ය මණ්ඩලය';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090d16',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #10b981',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>පද්ධතිය සූදානම් වෙමින් පවතී...</p>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { to { transform: rotate(360deg); } }
          `}} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brand}>
            <span className={styles.avatar}>{user.role.substring(0, 2).toUpperCase()}</span>
            <div>
              <span className={styles.brandText}>MyCliniQ</span>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>HMS v1.0</div>
            </div>
          </div>

          <nav className={styles.navSection}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', padding: '0.5rem 1rem', textTransform: 'uppercase' }}>
              සේවා මොඩියුල
            </div>
            
            <a href="/dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}>
              {getRoleIcon(user.role)}
              <span>{getRoleNameSinhala(user.role)}</span>
            </a>
            
            {/* Show additional info for reference */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#64748b',
              lineHeight: '1.4'
            }}>
              <strong>අත්හදා බැලීමේ ක්‍රමය:</strong><br />
              ලොග්අවුට් වී වෙනත් රෝල් එකක් තෝරාගෙන එම මොඩියුලය ක්‍රියාකරන අයුරු බලන්න. දත්ත sessionStorage මගින් එකිනෙකට සම්බන්ධ කර ඇත.
            </div>
          </nav>
        </div>

        {/* User profile & Logout footer */}
        <div className={styles.userSection}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user.name.charAt(0)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{getRoleNameSinhala(user.role)}</span>
            </div>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>පද්ධතියෙන් ඉවත් වන්න</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu size={20} className={styles.noPrint} style={{ cursor: 'pointer', display: 'none' }} /> {/* Mobile toggle placeholder */}
            <h2 className={styles.headerTitle}>{getRoleNameSinhala(user.role)} Dashboard</h2>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.dateDisplay}>
              <CalendarDays size={14} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
              {todayDate}
            </span>
          </div>
        </header>

        {/* Content wrapper */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
