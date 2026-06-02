'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ShieldAlert, 
  ChevronRight, 
  Play,
  Lock,
  Mail
} from 'lucide-react';
import styles from '../styles/home.module.css';

export default function HomePage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState('assistant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle production Supabase Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('කරුණාකර Email සහ Password ඇතුළත් කරන්න.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('පරිශීලක පැතිකඩ සොයාගත නොහැකි විය. කරුණාකර Admin සම්බන්ධ කරගන්න.');
      }

      // Check if user is trying to log in with matching role
      if (profile.role !== activeRole) {
        setErrorMessage(`මෙම ගිණුම ${activeRole.toUpperCase()} සඳහා වලංගු නොවේ.`);
        setLoading(false);
        return;
      }

      setSuccessMessage('සාර්ථකව සම්බන්ධ විය! Dashboard එක වෙත පිවිසෙමින්...');
      sessionStorage.setItem('isDemo', 'false');
      sessionStorage.setItem('userRole', profile.role);
      sessionStorage.setItem('userName', profile.full_name);

      setTimeout(() => {
        router.push(`/dashboard`);
      }, 1500);

    } catch (error) {
      setErrorMessage(error.message || 'ලොග් වීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
      setLoading(false);
    }
  };

  // Setup simulated offline demo session
  const enterDemoMode = () => {
    setLoading(true);
    sessionStorage.setItem('isDemo', 'true');
    sessionStorage.setItem('userRole', activeRole);
    
    let demoName = 'Demo Assistant';
    if (activeRole === 'doctor') demoName = 'Dr. Sunil Perera';
    if (activeRole === 'pharmacist') demoName = 'Pharmacist Nimali';
    if (activeRole === 'mlt') demoName = 'MLT Kamalanath';
    if (activeRole === 'manager') demoName = 'Dr. A.P.K Sanjeeva (Manager)';
    
    sessionStorage.setItem('userName', demoName);
    
    setTimeout(() => {
      router.push(`/dashboard`);
    }, 800);
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

  const getRoleNameSinhala = (role) => {
    switch (role) {
      case 'assistant': return 'සහායක';
      case 'doctor': return 'වෛද්‍යවරයා';
      case 'pharmacist': return 'ෆාමසිස්ට්';
      case 'mlt': return 'MLT ලැබ්';
      case 'manager': return 'මැනේජර්';
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
          {/* Left panel: Clinical features list */}
          <div className={styles.heroDetails}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1.2' }}>
              මූලික රෝහල් තොරතුරු පද්ධතිය
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' }}>
              ලැබ්, ෆාමසි, ඕපීඩී, සායන සහ විශේෂඥ වෛද්‍යවරුන් චැනල් කිරීමේ මධ්‍යස්ථාන සඳහා සකස් කරන ලද සම්පූර්ණ කළමනාකරණ මෘදුකාංගය.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 className={styles.featureTitle}>රෝගීන් ලියාපදිංචිය සහ පෝලිම</h3>
                  <p className={styles.featureDesc}>ශරීර මිනුම් (BP, Vitals) සහිත දෛනික පැමිණීම් ලේඛනය සහ සජීවී පෝලිම් පාලනය.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className={styles.featureTitle}>E-Prescriptions (ඖෂධ වට්ටෝරු)</h3>
                  <p className={styles.featureDesc}>වෛද්‍යවරයා නියම කරන ඖෂධ ඍජුවම ෆාමසියට යොමු කිරීම සහ සෙවුම් පහසුකම.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Pill size={18} />
                </div>
                <div>
                  <h3 className={styles.featureTitle}>ඖෂධ තොග පාලනය (Inventory)</h3>
                  <p className={styles.featureDesc}>කල් ඉකුත් වීමේ අනතුරු ඇඟවීම්, කාණ්ඩ (Batches) සැකසීම සහ ස්වයංක්‍රීය තොග අඩු වීම.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <FlaskConical size={18} />
                </div>
                <div>
                  <h3 className={styles.featureTitle}>ලැබ් වාර්තා පද්ධතිය (MLT Portal)</h3>
                  <p className={styles.featureDesc}>වෛද්‍ය ලැබ් පරීක්ෂණ නියම කිරීම්, අගයන් ඇතුළත් කිරීම් සහ PDF රිපෝට් අප්ලෝඩ් කිරීම.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Login box */}
          <div className={styles.loginCard}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>කාර්ය මණ්ඩල පිවිසුම</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                පළමුව ඔබේ පද්ධති භූමිකාව තෝරා ගන්න
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
                  <span>{getRoleNameSinhala(role)}</span>
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
                <label className={styles.formLabel}>ඊමේල් ලිපිනය (Email)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                  <input
                    type="email"
                    placeholder="name@mycliniq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>මුරපදය (Password)</label>
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
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              >
                {loading ? 'සම්බන්ධ වෙමින්...' : 'ලොග් වන්න'}
                <ChevronRight size={18} />
              </button>
            </form>

            <div className={styles.divider}>නැතහොත් (Demo)</div>

            <button
              onClick={enterDemoMode}
              className={styles.demoButton}
              disabled={loading}
            >
              <Play size={16} />
              <span>{getRoleNameSinhala(activeRole)} ඩෙමෝ ගිණුමට පිවිසෙන්න</span>
            </button>

            <p className={styles.footerText}>
              Supabase දත්ත සමුදාය සැකසීමට සහ API Keys සටහන් කිරීමට{' '}
              <a 
                href="file:///c:/Users/A.P.K%20Sanjeeva/Desktop/MyCliniQ/supabase/README.md"
                target="_blank"
                className={styles.footerLink}
              >
                README.md
              </a>{' '}
              කියවන්න.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
