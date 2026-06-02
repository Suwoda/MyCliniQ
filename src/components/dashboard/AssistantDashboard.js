'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  UserPlus, 
  Clock, 
  CalendarDays, 
  Plus, 
  ClipboardList, 
  Search, 
  UserCheck,
  HeartPulse
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function AssistantDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('queue'); // queue, register, walkin, booking

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [patientForm, setPatientForm] = useState({
    full_name: '', nic: '', date_of_birth: '', gender: 'male', phone: '', address: '', allergies: '', chronic_illnesses: ''
  });

  const [visitForm, setVisitForm] = useState({
    patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', temperature: '', weight_kg: '', chief_complaint: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
  });

  const [notif, setNotif] = useState({ type: '', text: '' });

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const p = await db.getPatients();
      const v = await db.getVisits();
      const a = await db.getAppointments();
      setPatients(p || []);
      setVisits(v || []);
      setAppointments(a || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!patientForm.full_name || !patientForm.phone || !patientForm.date_of_birth) {
      showNotification('error', 'කරුණාකර නම, උපන් දිනය සහ දුරකථන අංකය ඇතුළත් කරන්න.');
      return;
    }

    try {
      const formatted = {
        ...patientForm,
        allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()) : [],
        chronic_illnesses: patientForm.chronic_illnesses ? patientForm.chronic_illnesses.split(',').map(s => s.trim()) : []
      };

      await db.addPatient(formatted);
      showNotification('success', 'රෝගියා සාර්ථකව ලියාපදිංචි කරන ලදී.');
      setPatientForm({
        full_name: '', nic: '', date_of_birth: '', gender: 'male', phone: '', address: '', allergies: '', chronic_illnesses: ''
      });
      loadData();
      setActiveTab('queue');
    } catch (err) {
      showNotification('error', 'ලියාපදිංචි කිරීම අසාර්ථකයි: ' + err.message);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!visitForm.patient_id || !visitForm.chief_complaint) {
      showNotification('error', 'කරුණාකර රෝගියා සහ අසනීප ලක්ෂණ (Chief Complaint) තෝරන්න.');
      return;
    }

    try {
      const todayVisits = visits.filter(v => v.visit_date === new Date().toISOString().split('T')[0]);
      const nextQueueNo = todayVisits.length + 1;

      await db.addVisit({
        patient_id: visitForm.patient_id,
        doctor_id: visitForm.doctor_id,
        queue_number: nextQueueNo,
        systolic_bp: visitForm.systolic_bp ? parseInt(visitForm.systolic_bp) : null,
        diastolic_bp: visitForm.diastolic_bp ? parseInt(visitForm.diastolic_bp) : null,
        temperature: visitForm.temperature ? parseFloat(visitForm.temperature) : null,
        weight_kg: visitForm.weight_kg ? parseFloat(visitForm.weight_kg) : null,
        chief_complaint: visitForm.chief_complaint,
        status: 'waiting'
      });

      showNotification('success', `රෝගියා Queue අංක ${nextQueueNo} යටතේ පෝලිමට එක් කරන ලදී.`);
      setVisitForm({
        patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', temperature: '', weight_kg: '', chief_complaint: ''
      });
      loadData();
      setActiveTab('queue');
    } catch (err) {
      showNotification('error', 'පෝලිමට එක් කිරීම අසාර්ථකයි: ' + err.message);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentForm.patient_id || !appointmentForm.appointment_date) {
      showNotification('error', 'කරුණාකර රෝගියා සහ දිනය තෝරන්න.');
      return;
    }

    try {
      const dateAppts = appointments.filter(a => a.appointment_date === appointmentForm.appointment_date);
      const queueNo = dateAppts.length + 1;

      await db.addAppointment({
        patient_id: appointmentForm.patient_id,
        doctor_id: appointmentForm.doctor_id,
        appointment_date: appointmentForm.appointment_date,
        queue_number: queueNo,
        status: 'scheduled',
        booked_by: appointmentForm.booked_by
      });

      showNotification('success', `නියමිත දිනයේ Queue අංක ${queueNo} යටතේ වෙන් කිරීම සාර්ථකයි!`);
      setAppointmentForm({
        patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
      });
      loadData();
      setActiveTab('queue');
    } catch (err) {
      showNotification('error', 'වෙන් කිරීම අසාර්ථකයි: ' + err.message);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) || 
    (p.nic && p.nic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Stats Widgets */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><UserPlus size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{patients.length}</span>
            <span className={styles.statLabel}>ලියාපදිංචි රෝගීන්</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{visits.filter(v => v.status === 'waiting').length}</span>
            <span className={styles.statLabel}>පෝලිමේ සිටින රෝගීන්</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <CalendarDays size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{appointments.length}</span>
            <span className={styles.statLabel}>නියමිත චැනලින් (Total)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{visits.filter(v => v.status === 'completed').length}</span>
            <span className={styles.statLabel}>අද පරීක්ෂා කළ රෝගීන්</span>
          </div>
        </div>
      </div>

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('queue')}
          className={`btn-secondary ${activeTab === 'queue' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          දෛනික පෝලිම (Queue)
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`btn-secondary ${activeTab === 'register' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          රෝගීන් ලියාපදිංචිය
        </button>
        <button 
          onClick={() => setActiveTab('walkin')}
          className={`btn-secondary ${activeTab === 'walkin' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          පෝලිමට ඇතුළත් කිරීම (OPD Check-in)
        </button>
        <button 
          onClick={() => setActiveTab('booking')}
          className={`btn-secondary ${activeTab === 'booking' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          චැනලින් වෙන්කිරීම (Appointments)
        </button>
      </div>

      {/* Tab 1: Queue Board */}
      {activeTab === 'queue' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1rem' }}>අද දින වෛද්‍ය පෝලිම (Live OPD Queue)</h3>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>අද දින පෝලිමට තවමත් රෝගීන් එක්කර නොමැත.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.map((visit, idx) => (
                <div key={visit.id || idx} className={styles.queueItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className={styles.queueNumber}>{visit.queue_number}</div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{visit.patient?.full_name || 'නොදන්නා රෝගියෙක්'}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        දුරකථන: {visit.patient?.phone} | ලිංගය: {visit.patient?.gender === 'male' ? 'පුරුෂ' : 'ස්ත්‍රී'}
                      </p>
                      {visit.chief_complaint && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginTop: '0.5rem', background: 'var(--muted-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          ලක්ෂණ: {visit.chief_complaint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Vitals display */}
                    {(visit.systolic_bp || visit.temperature || visit.weight_kg) && (
                      <div className={styles.noPrint} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)', background: 'var(--secondary-bg)', padding: '0.5rem', borderRadius: '6px' }}>
                        {visit.systolic_bp && <span>BP: {visit.systolic_bp}/{visit.diastolic_bp}</span>}
                        {visit.temperature && <span>Temp: {visit.temperature}°C</span>}
                        {visit.weight_kg && <span>Weight: {visit.weight_kg}kg</span>}
                      </div>
                    )}

                    <span className={`badge ${
                      visit.status === 'waiting' ? 'badge-warning' : 
                      visit.status === 'in_consultation' ? 'badge-primary' : 'badge-success'
                    }`}>
                      {visit.status === 'waiting' && 'පෝලිමේ'}
                      {visit.status === 'in_consultation' && 'වෛද්‍යවරයා හමුවේ'}
                      {visit.status === 'completed' && 'අවසන්'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Register Patient Form */}
      {activeTab === 'register' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>නව රෝගියෙකු ලියාපදිංචි කිරීම</h3>
          <form onSubmit={handleRegisterPatient} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>සම්පූර්ණ නම (Full Name) *</label>
              <input 
                type="text" 
                placeholder="උදා: සුනිල් පෙරේරා"
                value={patientForm.full_name} 
                onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ජාතික හැඳුනුම්පත් අංකය (NIC)</label>
              <input 
                type="text" 
                placeholder="උදා: 781234567V"
                value={patientForm.nic} 
                onChange={(e) => setPatientForm({ ...patientForm, nic: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>උපන් දිනය (Date of Birth) *</label>
              <input 
                type="date" 
                value={patientForm.date_of_birth} 
                onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ලිංගිකත්වය (Gender)</label>
              <select 
                value={patientForm.gender} 
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
              >
                <option value="male">පුරුෂ (Male)</option>
                <option value="female">ස්ත්‍රී (Female)</option>
                <option value="other">වෙනත් (Other)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>දුරකථන අංකය (Phone Number) *</label>
              <input 
                type="text" 
                placeholder="උදා: 0771234567"
                value={patientForm.phone} 
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ලිපිනය (Address)</label>
              <input 
                type="text" 
                placeholder="ගෘහ ලිපිනය"
                value={patientForm.address} 
                onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>ඖෂධ අසාත්මිකතා (Allergies) - කොමා (,) වලින් වෙන්කරන්න</label>
              <input 
                type="text" 
                placeholder="උදා: Penicillin, Sulfur"
                value={patientForm.allergies} 
                onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>දීර්ඝකාලීන රෝගී තත්ත්ව (Chronic Illnesses) - කොමා (,) වලින් වෙන්කරන්න</label>
              <input 
                type="text" 
                placeholder="උදා: Diabetes, Hypertension"
                value={patientForm.chronic_illnesses} 
                onChange={(e) => setPatientForm({ ...patientForm, chronic_illnesses: e.target.value })}
              />
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <UserCheck size={16} />
                <span>රෝගියා ලියාපදිංචි කරන්න</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Walk-in Check-in (Add to Queue) */}
      {activeTab === 'walkin' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>රෝගියෙකු දෛනික වෛද්‍ය පෝලිමට ඇතුළත් කිරීම (OPD Check-in)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="නම, දුරකථන අංකය හෝ NIC මගින් ලියාපදිංචි රෝගීන් සොයන්න..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleCheckIn} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>රෝගියා තෝරන්න *</label>
              <select 
                value={visitForm.patient_id} 
                onChange={(e) => setVisitForm({ ...visitForm, patient_id: e.target.value })}
              >
                <option value="">-- කරුණාකර රෝගියෙකු තෝරන්න --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.phone} - {p.nic || 'No NIC'})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>වෛද්‍යවරයා (Select Doctor)</label>
              <select 
                value={visitForm.doctor_id} 
                onChange={(e) => setVisitForm({ ...visitForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (OPD / General Practitioner)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>රුධිර පීඩනය (Blood Pressure) - Systolic / Diastolic</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Systolic (උදා: 120)"
                  value={visitForm.systolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, systolic_bp: e.target.value })}
                />
                <span>/</span>
                <input 
                  type="number" 
                  placeholder="Diastolic (උදා: 80)"
                  value={visitForm.diastolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, diastolic_bp: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ශරීර උෂ්ණත්වය (Temperature °C)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="උදා: 37.2"
                value={visitForm.temperature}
                onChange={(e) => setVisitForm({ ...visitForm, temperature: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ශරීර බර (Weight kg)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="උදා: 68.5"
                value={visitForm.weight_kg}
                onChange={(e) => setVisitForm({ ...visitForm, weight_kg: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>ප්‍රධාන රෝග ලක්ෂණ (Chief Complaint) *</label>
              <textarea 
                rows="3" 
                placeholder="උදා: උණ, කැස්ස, හිසරදය සහ ඇඟපත රුදාව..."
                value={visitForm.chief_complaint}
                onChange={(e) => setVisitForm({ ...visitForm, chief_complaint: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <HeartPulse size={16} />
                <span>පෝලිමට ඇතුළත් කරන්න</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Channeling Appointment Booking */}
      {activeTab === 'booking' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>චැනලින් වෙන්කිරීම (Appointments / Booking)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="රෝගීන් සොයන්න..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleBookAppointment} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>රෝගියා තෝරන්න *</label>
              <select 
                value={appointmentForm.patient_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
              >
                <option value="">-- කරුණාකර රෝගියෙකු තෝරන්න --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>වෙන්කරන දිනය (Booking Date) *</label>
              <input 
                type="date" 
                value={appointmentForm.appointment_date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>විශේෂඥ වෛද්‍යවරයා (Specialist Doctor)</label>
              <select 
                value={appointmentForm.doctor_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (Cardiologist)</option>
                <option value="doc2">Dr. (Mrs) K. Silva (Pediatrician)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ක්‍රමය (Booking Channel)</label>
              <select 
                value={appointmentForm.booked_by} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, booked_by: e.target.value })}
              >
                <option value="phone">දුරකථන මාර්ගයෙන් (Phone Booking)</option>
                <option value="walk_in">සායනයට පැමිණ (Walk-in Booking)</option>
                <option value="online">අන්තර්ජාලය හරහා (Online Patient App)</option>
              </select>
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <CalendarDays size={16} />
                <span>චැනලින් වෙන්කිරීම සම්පූර්ණ කරන්න</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
