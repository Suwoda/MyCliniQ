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
  HeartPulse,
  Camera,
  QrCode,
  Edit,
  X,
  User,
  Info
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
  const [directorySearch, setDirectorySearch] = useState('');

  // QR Code Simulator State
  const [showQrModal, setShowQrModal] = useState(false);
  const [scanLaserActive, setScanLaserActive] = useState(false);

  // Form states
  const [patientForm, setPatientForm] = useState({
    id: '', // If present, we are in edit mode
    prefix: 'Mr.',
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    phone_owner_name: 'Self',
    address: '',
    occupation: '',
    allergies: '',
    past_medical_history: '',
    past_surgical_history: '',
    comments: '',
    photo_url: ''
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

  // Extract unique lists for Auto-suggest datalists
  const getUniqueSuggestions = (field) => {
    if (!patients) return [];
    if (field === 'address') {
      return Array.from(new Set(patients.map(p => p.address).filter(Boolean)));
    }
    if (field === 'occupation') {
      return Array.from(new Set(patients.map(p => p.occupation).filter(Boolean)));
    }
    if (field === 'allergies') {
      return Array.from(new Set(patients.flatMap(p => p.allergies || []).filter(Boolean)));
    }
    if (field === 'past_medical_history') {
      return Array.from(new Set(patients.flatMap(p => p.past_medical_history || []).filter(Boolean)));
    }
    if (field === 'past_surgical_history') {
      return Array.from(new Set(patients.flatMap(p => p.past_surgical_history || []).filter(Boolean)));
    }
    return [];
  };

  // Find duplicate alert
  const findDuplicatePatient = () => {
    if (patientForm.id) return null; // Do not check duplication in Edit Mode
    if (!patientForm.full_name && !patientForm.phone) return null;
    return patients.find(p => 
      (patientForm.phone && p.phone === patientForm.phone) || 
      (patientForm.full_name && p.full_name.toLowerCase().trim() === patientForm.full_name.toLowerCase().trim())
    );
  };

  const loadPatientToForm = (p) => {
    setPatientForm({
      id: p.id,
      prefix: p.prefix || 'Mr.',
      full_name: p.full_name || '',
      date_of_birth: p.date_of_birth || '',
      gender: p.gender || 'male',
      phone: p.phone || '',
      phone_owner_name: p.phone_owner_name || 'Self',
      address: p.address || '',
      occupation: p.occupation || '',
      allergies: p.allergies ? p.allergies.join(', ') : '',
      past_medical_history: p.past_medical_history ? p.past_medical_history.join(', ') : '',
      past_surgical_history: p.past_surgical_history ? p.past_surgical_history.join(', ') : '',
      comments: p.comments || '',
      photo_url: p.photo_url || ''
    });
    showNotification('info', `Loaded details for ${p.full_name} (${p.id})`);
  };

  // Handle Photo Upload Base64 conversion
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showNotification('error', 'Image size should be less than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatientForm(prev => ({ ...prev, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Create or Update Patient
  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!patientForm.full_name || !patientForm.phone || !patientForm.date_of_birth) {
      showNotification('error', 'Please enter name, date of birth, and phone number.');
      return;
    }

    try {
      const formatted = {
        prefix: patientForm.prefix,
        full_name: patientForm.full_name,
        date_of_birth: patientForm.date_of_birth,
        gender: patientForm.gender,
        phone: patientForm.phone,
        phone_owner_name: patientForm.phone_owner_name,
        address: patientForm.address,
        occupation: patientForm.occupation,
        allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        past_medical_history: patientForm.past_medical_history ? patientForm.past_medical_history.split(',').map(s => s.trim()).filter(Boolean) : [],
        past_surgical_history: patientForm.past_surgical_history ? patientForm.past_surgical_history.split(',').map(s => s.trim()).filter(Boolean) : [],
        comments: patientForm.comments,
        photo_url: patientForm.photo_url
      };

      if (patientForm.id) {
        // Edit Mode
        await db.updatePatient(patientForm.id, formatted);
        showNotification('success', `Patient ${patientForm.id} profile updated successfully.`);
      } else {
        // Create Mode
        const newP = await db.addPatient(formatted);
        showNotification('success', `New patient registered successfully with ID: ${newP.id}`);
      }

      // Reset Form
      setPatientForm({
        id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
        address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: ''
      });
      loadData();
    } catch (err) {
      showNotification('error', 'Save failed: ' + err.message);
    }
  };

  // Add to Queue
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!visitForm.patient_id || !visitForm.chief_complaint) {
      showNotification('error', 'Please select a patient and enter chief complaint.');
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

      showNotification('success', `Patient added to queue under Queue No. ${nextQueueNo}.`);
      setVisitForm({
        patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', temperature: '', weight_kg: '', chief_complaint: ''
      });
      loadData();
      setActiveTab('queue');
    } catch (err) {
      showNotification('error', 'Failed to add to queue: ' + err.message);
    }
  };

  // Add booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentForm.patient_id || !appointmentForm.appointment_date) {
      showNotification('error', 'Please select a patient and date.');
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

      showNotification('success', `Booking successful under Queue No. ${queueNo} for the scheduled date!`);
      setAppointmentForm({
        patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
      });
      loadData();
      setActiveTab('queue');
    } catch (err) {
      showNotification('error', 'Booking failed: ' + err.message);
    }
  };

  // QR Code scan simulation
  const simulateScan = (patientId) => {
    setScanLaserActive(true);
    setTimeout(() => {
      const matched = patients.find(p => p.id === patientId);
      if (matched) {
        // Depending on context, load patient to check-in or register/edit form
        if (activeTab === 'walkin') {
          setVisitForm(prev => ({ ...prev, patient_id: matched.id }));
        } else if (activeTab === 'booking') {
          setAppointmentForm(prev => ({ ...prev, patient_id: matched.id }));
        } else {
          setActiveTab('register');
          loadPatientToForm(matched);
        }
        showNotification('success', `QR scanned successfully: loaded ${matched.full_name} (${matched.id})`);
      } else {
        showNotification('error', `No patient found with ID: ${patientId}`);
      }
      setScanLaserActive(false);
      setShowQrModal(false);
    }, 1200);
  };

  // Directory filter
  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm) || 
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const directoryPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(directorySearch.toLowerCase()) || 
    p.phone.includes(directorySearch) || 
    (p.id && p.id.toLowerCase().includes(directorySearch.toLowerCase())) ||
    (p.address && p.address.toLowerCase().includes(directorySearch.toLowerCase()))
  );

  const duplicatePatient = findDuplicatePatient();

  return (
    <div>
      {/* Stats Widgets */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><UserPlus size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{patients.length}</span>
            <span className={styles.statLabel}>Registered Patients</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{visits.filter(v => v.status === 'waiting').length}</span>
            <span className={styles.statLabel}>Patients in Queue</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <CalendarDays size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{appointments.length}</span>
            <span className={styles.statLabel}>Scheduled Appointments (Total)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{visits.filter(v => v.status === 'completed').length}</span>
            <span className={styles.statLabel}>Patients Consulted Today</span>
          </div>
        </div>
      </div>

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`btn-secondary ${activeTab === 'queue' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Daily Queue
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`btn-secondary ${activeTab === 'register' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Patient Profiles
          </button>
          <button 
            onClick={() => setActiveTab('walkin')}
            className={`btn-secondary ${activeTab === 'walkin' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            OPD Check-in
          </button>
          <button 
            onClick={() => setActiveTab('booking')}
            className={`btn-secondary ${activeTab === 'booking' ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Appointments
          </button>
        </div>

        {/* QR Scan Button in nav header */}
        <button 
          onClick={() => setShowQrModal(true)}
          className="btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
        >
          <QrCode size={16} />
          <span>Scan Patient QR</span>
        </button>
      </div>

      {/* Tab 1: Queue Board */}
      {activeTab === 'queue' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1rem' }}>Live OPD Queue</h3>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>No patients have been added to the queue today yet.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.map((visit, idx) => (
                <div key={visit.id || idx} className={styles.queueItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className={styles.queueNumber}>{visit.queue_number}</div>
                    
                    {/* Patient Photo/Avatar */}
                    {visit.patient?.photo_url ? (
                      <img 
                        src={visit.patient.photo_url} 
                        alt="photo" 
                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                      />
                    ) : (
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={20} />
                      </div>
                    )}

                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'} 
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({visit.patient?.id})</span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        Phone: {visit.patient?.phone} ({visit.patient?.phone_owner_name || 'Self'}) | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                      {visit.chief_complaint && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginTop: '0.5rem', background: 'var(--muted-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          Complaint: {visit.chief_complaint}
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
                      {visit.status === 'waiting' && 'Waiting'}
                      {visit.status === 'in_consultation' && 'In Consultation'}
                      {visit.status === 'completed' && 'Completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Register & Edit Patient Forms Side-by-Side with Directory */}
      {activeTab === 'register' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '1.5rem' }}>
          
          {/* Patient Form */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{patientForm.id ? `Edit Patient Profile (${patientForm.id})` : 'Register New Patient'}</h3>
              {patientForm.id && (
                <button 
                  onClick={() => setPatientForm({
                    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
                    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: ''
                  })}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Clear Form
                </button>
              )}
            </div>

            {duplicatePatient && (
              <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <Info size={16} />
                  <span>Duplicate Profile Detected!</span>
                </div>
                <p style={{ fontSize: '0.75rem', margin: 0 }}>
                  A patient named <strong>{duplicatePatient.full_name}</strong> ({duplicatePatient.id}) with phone {duplicatePatient.phone} is already in the database.
                </p>
                <button 
                  type="button"
                  onClick={() => loadPatientToForm(duplicatePatient)}
                  className="btn-secondary" 
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', border: '1px solid var(--danger)' }}
                >
                  Load existing profile to Edit
                </button>
              </div>
            )}

            <form onSubmit={handleSavePatient} className={styles.formGrid}>
              
              {/* Photo Upload Section */}
              <div className={styles.formFull} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                {patientForm.photo_url ? (
                  <img 
                    src={patientForm.photo_url} 
                    alt="preview" 
                    style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                    <Camera size={28} />
                  </div>
                )}
                <div>
                  <label className={styles.formLabel} style={{ marginBottom: '0.25rem' }}>Patient Photograph</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    style={{ fontSize: '0.8rem', background: 'transparent', border: 'none', padding: 0 }}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Upload file (JPEG/PNG, max 1MB).</p>
                </div>
              </div>

              {/* Prefix selection */}
              <div className={styles.formGroup} style={{ gridColumn: 'span 1' }}>
                <label className={styles.formLabel}>Prefix</label>
                <select 
                  value={patientForm.prefix}
                  onChange={(e) => setPatientForm({ ...patientForm, prefix: e.target.value })}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Rev.">Rev.</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 3' }}>
                <label className={styles.formLabel}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sunil Perera"
                  value={patientForm.full_name} 
                  onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date of Birth *</label>
                <input 
                  type="date" 
                  value={patientForm.date_of_birth} 
                  onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gender</label>
                <select 
                  value={patientForm.gender} 
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0771234567"
                  value={patientForm.phone} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Owner (Relationship)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Self, Mother, Father"
                  value={patientForm.phone_owner_name} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone_owner_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <input 
                  type="text" 
                  placeholder="Home Address"
                  value={patientForm.address} 
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  list="suggested-addresses"
                />
                <datalist id="suggested-addresses">
                  {getUniqueSuggestions('address').map(a => <option key={a} value={a} />)}
                </datalist>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Occupation (Job)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Farmer, Teacher"
                  value={patientForm.occupation} 
                  onChange={(e) => setPatientForm({ ...patientForm, occupation: e.target.value })}
                  list="suggested-occupations"
                />
                <datalist id="suggested-occupations">
                  {getUniqueSuggestions('occupation').map(o => <option key={o} value={o} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Allergies (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Penicillin, Dust, Seafood"
                  value={patientForm.allergies} 
                  onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                  list="suggested-allergies"
                />
                <datalist id="suggested-allergies">
                  {getUniqueSuggestions('allergies').map(al => <option key={al} value={al} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Past Medical History (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hypertension, Diabetes, Asthma"
                  value={patientForm.past_medical_history} 
                  onChange={(e) => setPatientForm({ ...patientForm, past_medical_history: e.target.value })}
                  list="suggested-med"
                />
                <datalist id="suggested-med">
                  {getUniqueSuggestions('past_medical_history').map(m => <option key={m} value={m} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Past Surgical History (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Appendectomy, Hernia Repair"
                  value={patientForm.past_surgical_history} 
                  onChange={(e) => setPatientForm({ ...patientForm, past_surgical_history: e.target.value })}
                  list="suggested-surg"
                />
                <datalist id="suggested-surg">
                  {getUniqueSuggestions('past_surgical_history').map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Comments / Extra Notes</label>
                <textarea 
                  rows="2" 
                  placeholder="Any additional information..."
                  value={patientForm.comments}
                  onChange={(e) => setPatientForm({ ...patientForm, comments: e.target.value })}
                ></textarea>
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <UserCheck size={16} />
                  <span>{patientForm.id ? 'Save Profile Changes' : 'Register New Patient'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Directory Panel */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem' }}>Patient Directory ({patients.length})</h3>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by ID, Name, Phone, Address..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {directoryPatients.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--secondary-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {p.photo_url ? (
                      <img 
                        src={p.photo_url} 
                        alt="photo" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={18} />
                      </div>
                    )}
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{p.prefix} {p.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.15rem' }}>
                        ID: <code>{p.id}</code> | Tel: {p.phone}
                      </div>
                      {p.address && <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Addr: {p.address}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={() => loadPatientToForm(p)}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        setVisitForm(prev => ({ ...prev, patient_id: p.id }));
                        setActiveTab('walkin');
                      }}
                      className="btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Check-in
                    </button>
                  </div>
                </div>
              ))}
              {directoryPatients.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem' }}>No patients match the search.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Walk-in Check-in (Add to Queue) */}
      {activeTab === 'walkin' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>OPD Check-in (Add to Queue)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Filter patients list by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleCheckIn} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Patient *</label>
              <select 
                value={visitForm.patient_id} 
                onChange={(e) => setVisitForm({ ...visitForm, patient_id: e.target.value })}
              >
                <option value="">-- Please select a patient --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.prefix} {p.full_name} ({p.phone} - {p.id})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Doctor (Select Doctor)</label>
              <select 
                value={visitForm.doctor_id} 
                onChange={(e) => setVisitForm({ ...visitForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (OPD / General Practitioner)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Blood Pressure (Systolic / Diastolic)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Systolic (e.g. 120)"
                  value={visitForm.systolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, systolic_bp: e.target.value })}
                />
                <span>/</span>
                <input 
                  type="number" 
                  placeholder="Diastolic (e.g. 80)"
                  value={visitForm.diastolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, diastolic_bp: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Temperature (°C)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 37.2"
                value={visitForm.temperature}
                onChange={(e) => setVisitForm({ ...visitForm, temperature: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 68.5"
                value={visitForm.weight_kg}
                onChange={(e) => setVisitForm({ ...visitForm, weight_kg: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>Chief Complaint *</label>
              <textarea 
                rows="3" 
                placeholder="e.g. fever, cough, headache, body aches..."
                value={visitForm.chief_complaint}
                onChange={(e) => setVisitForm({ ...visitForm, chief_complaint: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <HeartPulse size={16} />
                <span>Add to Queue</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Channeling Appointment Booking */}
      {activeTab === 'booking' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Channeling Booking (Appointments)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleBookAppointment} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Patient *</label>
              <select 
                value={appointmentForm.patient_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
              >
                <option value="">-- Please select a patient --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.prefix} {p.full_name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Booking Date *</label>
              <input 
                type="date" 
                value={appointmentForm.appointment_date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Specialist Doctor</label>
              <select 
                value={appointmentForm.doctor_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (Cardiologist)</option>
                <option value="doc2">Dr. (Mrs) K. Silva (Pediatrician)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Booking Channel</label>
              <select 
                value={appointmentForm.booked_by} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, booked_by: e.target.value })}
              >
                <option value="phone">Phone Booking</option>
                <option value="walk_in">Walk-in Booking</option>
                <option value="online">Online Patient App</option>
              </select>
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <CalendarDays size={16} />
                <span>Complete Channeling Booking</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* simulated QR Code Scanner Modal */}
      {showQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowQrModal(false)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <QrCode size={40} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h4>Simulating QR Scanner</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Scan a physical patient card or simulate below.</p>
            </div>

            {/* Simulated camera view */}
            <div style={{ position: 'relative', width: '100%', height: '180px', background: '#000', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '130px', height: '130px', border: '2px dashed rgba(16, 185, 129, 0.6)', borderRadius: '8px' }}></div>
              
              {/* Scanning red line animation */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '2px', 
                background: 'red', 
                boxShadow: '0 0 8px red',
                animation: scanLaserActive ? 'none' : 'scanLaser 2s linear infinite'
              }}></div>
              
              {scanLaserActive ? (
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>SCANNING MATCH... 🟢</div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', zIndex: 1 }}>Align Patient QR Code inside frame</div>
              )}
            </div>

            {/* Simulated patients buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Simulate Scan For Registered Patients:</label>
              {patients.map(p => (
                <button 
                  key={p.id}
                  onClick={() => simulateScan(p.id)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                  disabled={scanLaserActive}
                >
                  <span>{p.prefix} {p.full_name}</span>
                  <code>{p.id}</code>
                </button>
              ))}
            </div>
          </div>

          <style jsx global>{`
            @keyframes scanLaser {
              0% { top: 0px; }
              50% { top: 178px; }
              100% { top: 0px; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
