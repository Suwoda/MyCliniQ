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
  Menu,
  Clock,
  UserPlus,
  HeartPulse,
  Plus,
  Package,
  ClipboardList,
  FileText,
  Activity,
  TrendingUp,
  DollarSign,
  Settings
} from 'lucide-react';
import styles from '../../styles/dashboard.module.css';

const SUB_TABS = {
  assistant: [
    { id: 'queue', label: 'Daily Queue', icon: <Clock size={15} /> },
    { id: 'register', label: 'Register Patient', icon: <UserPlus size={15} /> },
    { id: 'directory', label: 'Patient Directory', icon: <Users size={15} /> },
    { id: 'walkin', label: 'OPD Check-in', icon: <HeartPulse size={15} /> },
    { id: 'booking', label: 'Appointments', icon: <CalendarDays size={15} /> },
  ],
  doctor: [
    { id: 'consultation', label: 'Consultation Room', icon: <Stethoscope size={15} /> },
    { id: 'queue', label: 'Daily Queue', icon: <Clock size={15} /> },
    { id: 'register', label: 'Register Patient', icon: <UserPlus size={15} /> },
    { id: 'directory', label: 'Patient Directory', icon: <Users size={15} /> },
    { id: 'walkin', label: 'OPD Check-in', icon: <HeartPulse size={15} /> },
    { id: 'booking', label: 'Appointments', icon: <CalendarDays size={15} /> },
  ],
  pharmacist: [
    { id: 'prescriptions', label: 'Dispense Prescriptions', icon: <Pill size={15} /> },
    { id: 'cash_register', label: 'Cash Register', icon: <DollarSign size={15} /> },
    { id: 'catalog', label: 'Drug Inventory', icon: <Package size={15} /> },
    { id: 'add_stock', label: 'Stock In (Add Batch)', icon: <Plus size={15} /> },
    { id: 'register_drug', label: 'Register New Drug', icon: <FileText size={15} /> },
    { id: 'suppliers', label: 'Supplier Bills & Payments', icon: <ClipboardList size={15} /> },
    { id: 'transfers', label: 'Stock Transfers', icon: <TrendingUp size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ],
  mlt: [
    { id: 'pending', label: 'Pending Requests', icon: <Clock size={15} /> },
    { id: 'completed', label: 'Completed Reports', icon: <FileText size={15} /> },
    { id: 'lab_billing', label: 'Lab Cashier', icon: <DollarSign size={15} /> },
  ],
  manager: [
    { id: 'overview', label: 'System Overview', icon: <Activity size={15} /> },
    { id: 'finance_audit', label: 'Financial Audits', icon: <TrendingUp size={15} /> },
    { id: 'staff', label: 'User Management', icon: <Users size={15} /> },
    { id: 'drugs', label: 'Drug Pricing Control', icon: <Pill size={15} /> },
    { id: 'lab_setup', label: 'Lab Test Settings', icon: <FlaskConical size={15} /> }
  ]
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '', role: '' });
  const [isChief, setIsChief] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const [currentTab, setCurrentTab] = useState('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('activeDashboardTab');
      if (saved) setCurrentTab(saved || 'overview');
    }

    const handleTabChange = (e) => {
      setCurrentTab(e.detail);
    };
    window.addEventListener('dashboard-tab-changed', handleTabChange);
    return () => window.removeEventListener('dashboard-tab-changed', handleTabChange);
  }, []);

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    sessionStorage.setItem('activeDashboardTab', tabId);
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: tabId }));
  };

  useEffect(() => {
    // Client-side session checks
    const name = sessionStorage.getItem('userName');
    const role = sessionStorage.getItem('userRole');
    const chief = sessionStorage.getItem('isChief') === 'true';

    if (!name || !role) {
      router.push('/');
    } else {
      setUser({ name, role });
      setIsChief(chief);
      setLoading(false);
    }

    // Set local date string
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setTodayDate(new Date().toLocaleDateString('en-US', options));
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

  const getRoleNameEnglish = (role) => {
    switch (role) {
      case 'assistant': return 'Assistant (OPD)';
      case 'doctor': return 'Doctor';
      case 'pharmacist': return 'Pharmacist';
      case 'mlt': return 'MLT Lab';
      case 'manager': return 'Manager (Admin)';
      default: return 'Staff';
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
          <p>System is loading...</p>
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
              Service Modules
            </div>
            
            <a 
              href="/dashboard" 
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('overview');
              }}
              className={`${styles.navLink} ${currentTab === 'overview' ? styles.navLinkActive : ''}`}
            >
              {getRoleIcon(user.role)}
              <span>{getRoleNameEnglish(user.role)}</span>
            </a>

            {SUB_TABS[user.role] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                {SUB_TABS[user.role]
                  .filter(tab => {
                    if (user.role === 'pharmacist' && !isChief) {
                      return tab.id !== 'add_stock' && 
                             tab.id !== 'register_drug' && 
                             tab.id !== 'suppliers' && 
                             tab.id !== 'transfers' &&
                             tab.id !== 'settings';
                    }
                    return true;
                  })
                  .map(tab => (
                    <div 
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`${styles.navSubLink} ${currentTab === tab.id ? styles.navSubLinkActive : ''}`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                  ))
                }
              </div>
            )}
            
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
              <strong>Demo Mode:</strong><br />
              Log out and select a different role to see how that module works. Data is shared using sessionStorage.
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
              <span className={styles.userRole}>{getRoleNameEnglish(user.role)}</span>
            </div>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu size={20} className={styles.noPrint} style={{ cursor: 'pointer', display: 'none' }} /> {/* Mobile toggle placeholder */}
            <h2 className={styles.headerTitle}>{getRoleNameEnglish(user.role)} Dashboard</h2>
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
