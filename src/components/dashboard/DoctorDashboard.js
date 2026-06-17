'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  Users, 
  HeartPulse, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Plus, 
  Trash2, 
  Check, 
  Search,
  AlertTriangle,
  Edit,
  Camera,
  QrCode,
  X,
  User,
  Info,
  UserPlus,
  Clock,
  CalendarDays,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

const getAge = (dobString) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age === 0) {
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const adjustDays = today.getDate() < birthDate.getDate() ? -1 : 0;
    const finalMonths = months + adjustDays;
    return finalMonths > 0 ? `${finalMonths}m` : '0m';
  }
  return age >= 0 ? `${age} years` : '';
};

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('activeDashboardTab') || 'overview';
    }
    return 'overview';
  });

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('activeDashboardTab', tab);
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: tab }));
  };

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('dashboard-tab-changed', handleTabChange);
    
    // Sync initial state
    const initialTab = sessionStorage.getItem('activeDashboardTab') || 'overview';
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    
    return () => window.removeEventListener('dashboard-tab-changed', handleTabChange);
  }, [activeTab]);

  // Search & Filter for assistant tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');

  // Zoomed Photo Modal state
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  // Smart search suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  // Selection state
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Patient Registration Form State (Shared between register tab and edit functionality)
  const [patientForm, setPatientForm] = useState({
    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: '',
    is_dob_estimated: false, estimated_age: ''
  });

  const [visitForm, setVisitForm] = useState({
    patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', temperature: '', weight_kg: '', chief_complaint: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
  });

  // QR Code Simulator State
  const [showQrModal, setShowQrModal] = useState(false);
  const [scanLaserActive, setScanLaserActive] = useState(false);

  // E-Prescription builder states
  const [rxItems, setRxItems] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);
  
  const [dosage, setDosage] = useState('1 tab');
  const [frequency, setFrequency] = useState('TID'); // TID, BID, OD, PRN
  const [duration, setDuration] = useState('5');
  const [instructions, setInstructions] = useState('After meals');

  // Lab tests states
  const [requestedLabs, setRequestedLabs] = useState([]);

  // Clinical records states
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Collapsible OPD builders
  const [showLabsCollapse, setShowLabsCollapse] = useState(false);
  const [showRxCollapse, setShowRxCollapse] = useState(false);

  // Doctor fee adjustments
  const [doctorFee, setDoctorFee] = useState(500);
  const [customFeeActive, setCustomFeeActive] = useState(false);
  const [customFee, setCustomFee] = useState('');

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  // Compute smart suggestions based on name, phone, address/city
  useEffect(() => {
    const nameQuery = (patientForm.full_name || '').trim().toLowerCase();
    const phoneQuery = (patientForm.phone || '').trim();
    const addressQuery = (patientForm.address || '').trim().toLowerCase();

    if (!nameQuery && !phoneQuery && !addressQuery) {
      setSmartSuggestions([]);
      return;
    }

    const matches = patients.filter(p => {
      // Exclude current editing patient if editing
      if (patientForm.id && p.id === patientForm.id) return false;

      const matchesName = nameQuery && p.full_name?.toLowerCase().includes(nameQuery);
      const matchesPhone = phoneQuery && p.phone?.includes(phoneQuery);
      const matchesAddress = addressQuery && p.address?.toLowerCase().includes(addressQuery);

      return matchesName || matchesPhone || matchesAddress;
    });

    setSmartSuggestions(matches.slice(0, 5));
  }, [patientForm.full_name, patientForm.phone, patientForm.address, patients, patientForm.id]);

  const loadData = async () => {
    try {
      const v = await db.getVisits();
      const d = await db.getDrugs();
      const l = await db.getLabTests();
      const p = await db.getPatients();
      const a = await db.getAppointments();
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(l || []);
      setPatients(p || []);
      setAppointments(a || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

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

  const handleSelectPatient = (visit) => {
    setSelectedVisit(visit);
    // Reset forms
    setRxItems([]);
    setRequestedLabs([]);
    setSymptoms('');
    setDiagnosis('');
    setNotes('');
    setDrugSearch('');
    setSelectedDrug(null);
    setDoctorFee(500);
    setCustomFeeActive(false);
    setCustomFee('');
    
    // Mark visit status in database as in_consultation
    db.updateVisitStatus(visit.id, 'in_consultation');
    loadData();
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
    const isEstimated = p.is_dob_estimated || false;
    let estAge = '';
    if (isEstimated && p.date_of_birth) {
      const birthYear = new Date(p.date_of_birth).getFullYear();
      estAge = (new Date().getFullYear() - birthYear).toString();
    }

    setPatientForm({
      id: p.id,
      prefix: p.prefix || 'Mr.',
      full_name: p.full_name || '',
      date_of_birth: isEstimated ? '' : (p.date_of_birth || ''),
      gender: p.gender || 'male',
      phone: p.phone || '',
      phone_owner_name: p.phone_owner_name || 'Self',
      address: p.address || '',
      occupation: p.occupation || '',
      allergies: p.allergies ? p.allergies.join(', ') : '',
      past_medical_history: p.past_medical_history ? p.past_medical_history.join(', ') : '',
      past_surgical_history: p.past_surgical_history ? p.past_surgical_history.join(', ') : '',
      comments: p.comments || '',
      photo_url: p.photo_url || '',
      is_dob_estimated: isEstimated,
      estimated_age: estAge
    });
    showNotification('info', `Loaded details for ${p.full_name} (${p.id})`);
    handleSetActiveTab('register');
  };

  const selectPatientSuggestion = (p) => {
    loadPatientToForm(p);
  };

  // Open Edit Profile modal (for consultation view)
  const handleOpenEdit = () => {
    if (!selectedVisit || !selectedVisit.patient) return;
    loadPatientToForm(selectedVisit.patient);
  };

  // Handle photo base64
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
    if (!patientForm.full_name || !patientForm.phone) {
      showNotification('error', 'Please enter name and phone number.');
      return;
    }

    let dob = patientForm.date_of_birth;
    if (patientForm.is_dob_estimated) {
      if (!patientForm.estimated_age) {
        showNotification('error', 'Please enter patient age.');
        return;
      }
      const ageNum = parseInt(patientForm.estimated_age, 10);
      if (isNaN(ageNum) || ageNum < 0) {
        showNotification('error', 'Please enter a valid age.');
        return;
      }
      const birthYear = new Date().getFullYear() - ageNum;
      dob = `${birthYear}-01-01`;
    } else {
      if (!dob) {
        showNotification('error', 'Please enter date of birth.');
        return;
      }
    }

    try {
      const formatted = {
        prefix: patientForm.prefix,
        full_name: patientForm.full_name,
        date_of_birth: dob,
        gender: patientForm.gender,
        phone: patientForm.phone,
        phone_owner_name: patientForm.phone_owner_name,
        address: patientForm.address,
        occupation: patientForm.occupation,
        allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        past_medical_history: patientForm.past_medical_history ? patientForm.past_medical_history.split(',').map(s => s.trim()).filter(Boolean) : [],
        past_surgical_history: patientForm.past_surgical_history ? patientForm.past_surgical_history.split(',').map(s => s.trim()).filter(Boolean) : [],
        comments: patientForm.comments,
        photo_url: patientForm.photo_url,
        is_dob_estimated: patientForm.is_dob_estimated
      };

      if (patientForm.id) {
        // Edit Mode
        await db.updatePatient(patientForm.id, formatted);
        showNotification('success', `Patient ${patientForm.id} profile updated successfully.`);
        
        // Live update selected visit patient if we are editing the currently consulting patient
        if (selectedVisit && selectedVisit.patient_id === patientForm.id) {
          setSelectedVisit(prev => ({
            ...prev,
            patient: { ...prev.patient, ...formatted }
          }));
        }
      } else {
        // Create Mode
        const newP = await db.addPatient(formatted);
        showNotification('success', `New patient registered successfully with ID: ${newP.id}`);
      }

      // Reset Form
      setPatientForm({
        id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
        address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: '',
        is_dob_estimated: false, estimated_age: ''
      });
      loadData();
    } catch (err) {
      showNotification('error', 'Save failed: ' + err.message);
    }
  };

  // Add to Queue (OPD Check-in)
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
      setActiveTab('consultation');
    } catch (err) {
      showNotification('error', 'Failed to add to queue: ' + err.message);
    }
  };

  // Add booking (Appointment)
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
      handleSetActiveTab('consultation');
    } catch (err) {
      showNotification('error', 'Failed to book appointment: ' + err.message);
    }
  };



  // QR scan simulator
  const simulateScan = (patientId) => {
    setScanLaserActive(true);
    setTimeout(() => {
      if (activeTab === 'consultation') {
        const visit = visits.find(v => v.patient_id === patientId && (v.status === 'waiting' || v.status === 'in_consultation'));
        if (visit) {
          handleSelectPatient(visit);
          showNotification('success', `QR code scanned: Selected ${visit.patient?.full_name} (${visit.patient?.id})`);
        } else {
          showNotification('error', `No active queue visit found for Patient ID: ${patientId}`);
        }
      } else {
        const matched = patients.find(p => p.id === patientId);
        if (matched) {
          if (activeTab === 'walkin') {
            setVisitForm(prev => ({ ...prev, patient_id: matched.id }));
          } else if (activeTab === 'booking') {
            setAppointmentForm(prev => ({ ...prev, patient_id: matched.id }));
          } else {
            handleSetActiveTab('register');
            loadPatientToForm(matched);
          }
          showNotification('success', `QR Code scanned: Loaded profile of ${matched.full_name}`);
        } else {
          showNotification('error', `Invalid or unregistered QR code.`);
        }
      }
      setScanLaserActive(false);
      setShowQrModal(false);
    }, 1200);
  };

  // Autocalculate total pills needed
  const calculateTotalQuantity = (freq, dur) => {
    let factor = 1;
    if (freq === 'TID') factor = 3;
    if (freq === 'BID') factor = 2;
    if (freq === 'OD') factor = 1;
    if (freq === 'QID') factor = 4;
    if (freq === 'PRN') factor = 1;

    const days = parseInt(dur) || 1;
    return factor * days;
  };

  const handleAddRxItem = () => {
    if (!selectedDrug) {
      showNotification('error', 'Please select a drug.');
      return;
    }

    const totalQty = calculateTotalQuantity(frequency, duration);
    const newItem = {
      drug_id: selectedDrug.id,
      brand_name: selectedDrug.brand_name,
      generic_name: selectedDrug.generic_name,
      strength: selectedDrug.strength,
      form: selectedDrug.form,
      dosage,
      frequency,
      duration: parseInt(duration) || 1,
      total_quantity: totalQty,
      instructions
    };

    setRxItems([...rxItems, newItem]);
    setSelectedDrug(null);
    setDrugSearch('');
  };

  const handleRemoveRxItem = (idx) => {
    setRxItems(rxItems.filter((_, i) => i !== idx));
  };

  const handleToggleLab = (testId) => {
    if (requestedLabs.includes(testId)) {
      setRequestedLabs(requestedLabs.filter(id => id !== testId));
    } else {
      setRequestedLabs([...requestedLabs, testId]);
    }
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    if (!diagnosis) {
      showNotification('error', 'Please enter a diagnosis.');
      return;
    }

    try {
      let finalDoctorFee = 500.00;
      if (customFeeActive) {
        finalDoctorFee = parseFloat(customFee) || 0.00;
      } else {
        finalDoctorFee = parseFloat(doctorFee);
      }

      const consultation = {
        visit_id: selectedVisit.id,
        doctor_id: 'doc1',
        symptoms,
        diagnosis,
        clinical_notes: notes,
        doctor_fee: finalDoctorFee
      };

      await db.addConsultation(consultation, rxItems, requestedLabs);
      showNotification('success', `Consultation record for ${selectedVisit.patient?.full_name} saved successfully. Prescription sent to pharmacy.`);
      setSelectedVisit(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Save failed: ' + err.message);
    }
  };

  const activeQueue = visits.filter(v => v.status === 'waiting' || v.status === 'in_consultation');

  const filteredDrugs = drugs.filter(d => 
    d.brand_name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    d.generic_name.toLowerCase().includes(drugSearch.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone?.includes(searchTerm) || 
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const directoryPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(directorySearch.toLowerCase()) || 
    p.phone?.includes(directorySearch) || 
    (p.id && p.id.toLowerCase().includes(directorySearch.toLowerCase())) ||
    (p.address && p.address.toLowerCase().includes(directorySearch.toLowerCase()))
  );

  const duplicatePatient = findDuplicatePatient();

  return (
    <div>
      {/* Stats Widgets */}
      {activeTab === 'overview' && (
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
      )}

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {activeTab === 'consultation' && (
        <div className={styles.workGrid}>
      {/* Left Pane: Consultation board */}
      <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
        {selectedVisit ? (
          <div>
            {/* Active Patient Demographics */}
            <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              {/* Photo Display */}
              {selectedVisit.patient?.photo_url ? (
                <img 
                  src={selectedVisit.patient.photo_url} 
                  alt="photo" 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                />
              ) : (
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={35} />
                </div>
              )}

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                    {selectedVisit.patient?.prefix} {selectedVisit.patient?.full_name}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>(ID: <code>{selectedVisit.patient?.id}</code>)</span>
                  
                  {/* Edit Patient profile button for doctor */}
                  <button 
                    onClick={handleOpenEdit}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Edit size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                  DOB: {selectedVisit.patient?.date_of_birth} | Tel: {selectedVisit.patient?.phone} ({selectedVisit.patient?.phone_owner_name || 'Self'}) | Job: {selectedVisit.patient?.occupation || 'None'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedVisit.patient?.allergies?.map((al, i) => (
                    <span key={i} className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <AlertTriangle size={12} style={{ marginRight: '4px' }} /> Allergy: {al}
                    </span>
                  ))}
                  {selectedVisit.patient?.past_medical_history?.map((ill, i) => (
                    <span key={i} className="badge badge-warning">Med Hx: {ill}</span>
                  ))}
                  {selectedVisit.patient?.past_surgical_history?.map((surg, i) => (
                    <span key={i} className="badge badge-primary">Surg Hx: {surg}</span>
                  ))}
                </div>
                {selectedVisit.patient?.comments && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--foreground)', marginTop: '0.5rem', background: 'var(--muted-bg)', padding: '0.4rem', borderRadius: '4px' }}>
                    <strong>Notes:</strong> {selectedVisit.patient.comments}
                  </p>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  Queue No: {selectedVisit.queue_number}
                </span>
                {/* Vitals display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  {selectedVisit.systolic_bp && <span>BP: <strong>{selectedVisit.systolic_bp}/{selectedVisit.diastolic_bp}</strong> mmHg</span>}
                  {selectedVisit.temperature && <span>Temp: <strong>{selectedVisit.temperature} °C</strong></span>}
                  {selectedVisit.weight_kg && <span>Weight: <strong>{selectedVisit.weight_kg} kg</strong></span>}
                </div>
              </div>
            </div>

            {/* Medical Documentation Form */}
            <form onSubmit={handleSubmitConsultation}>
              {/* Vitals & symptoms */}
              <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Chief Complaint:</strong>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem', color: 'var(--foreground)', fontStyle: 'italic' }}>
                  "{selectedVisit.chief_complaint}"
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Symptoms Found</label>
                  <input 
                    type="text" 
                    placeholder="e.g. fever, cough, chest tightness"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Diagnosis *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Viral Fever / Bronchial Asthma"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>Clinical Notes / Advice</label>
                  <textarea 
                    rows="2"
                    placeholder="Rest, hydration, follow-up advice..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Lab Request Module */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div 
                  onClick={() => setShowLabsCollapse(!showLabsCollapse)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
                    <span>Recommend Lab Tests {requestedLabs.length > 0 ? `(${requestedLabs.length} Selected)` : ''}</span>
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {showLabsCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                  </span>
                </div>
                {showLabsCollapse && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem' }} className="animate-fade-in">
                    {labTests.map(test => (
                      <label 
                        key={test.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          padding: '0.5rem', 
                          background: requestedLabs.includes(test.id) ? 'var(--primary-glow)' : 'var(--card-bg)',
                          border: '1px solid',
                          borderColor: requestedLabs.includes(test.id) ? 'var(--primary)' : 'var(--card-border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={requestedLabs.includes(test.id)} 
                          onChange={() => handleToggleLab(test.id)}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span>{test.test_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescription Builder */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <div 
                  onClick={() => setShowRxCollapse(!showRxCollapse)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', marginBottom: '1rem' }}
                >
                  <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={18} style={{ color: 'var(--primary)' }} />
                    <span>E-Prescription Builder {rxItems.length > 0 ? `(${rxItems.length} Items)` : ''}</span>
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {showRxCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                  </span>
                </div>

                {showRxCollapse && (
                  <div className="animate-fade-in">
                    {/* Search & Add row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem', alignItems: 'end' }}>
                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>Search Drug (Brand/Generic)</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            placeholder="e.g. Paracetamol"
                            value={drugSearch}
                            onChange={(e) => {
                              setDrugSearch(e.target.value);
                              setSelectedDrug(null);
                            }}
                          />
                          {drugSearch && !selectedDrug && (
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: '100%',
                              background: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              maxHeight: '150px',
                              overflowY: 'auto',
                              zIndex: 10,
                              boxShadow: 'var(--shadow-lg)'
                            }}>
                              {filteredDrugs.length === 0 ? (
                                <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>No drugs found.</div>
                              ) : (
                                filteredDrugs.map(d => (
                                  <div 
                                    key={d.id} 
                                    onClick={() => {
                                      setSelectedDrug(d);
                                      setDrugSearch(`${d.brand_name} (${d.generic_name}) - ${d.strength}`);
                                    }}
                                    style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--card-border)' }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--secondary-bg)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                  >
                                    <strong>{d.brand_name}</strong> - <span>{d.generic_name} ({d.strength} {d.form})</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>Dosage</label>
                        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>Frequency</label>
                        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ padding: '0.6rem 0.5rem' }}>
                          <option value="TID">TID (3 times a day)</option>
                          <option value="BID">BID (2 times a day)</option>
                          <option value="OD">OD (Once a day)</option>
                          <option value="QID">QID (4 times a day)</option>
                          <option value="PRN">PRN (As needed)</option>
                        </select>
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>Duration (Days)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>Instructions</label>
                        <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                      </div>

                      <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={handleAddRxItem}
                        style={{ padding: '0.65rem', borderRadius: '8px' }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Added items list */}
                    {rxItems.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'var(--muted-bg)', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: 'var(--secondary-bg)', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Drug Name</th>
                            <th style={{ padding: '0.5rem' }}>Dosage</th>
                            <th style={{ padding: '0.5rem' }}>Frequency</th>
                            <th style={{ padding: '0.5rem' }}>Duration (Days)</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Total Qty</th>
                            <th style={{ padding: '0.5rem' }}>Instructions</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rxItems.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--card-border)' }}>
                              <td style={{ padding: '0.5rem' }}>
                                <strong>{item.brand_name}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>({item.generic_name}) - {item.strength}</span>
                              </td>
                              <td style={{ padding: '0.5rem' }}>{item.dosage}</td>
                              <td style={{ padding: '0.5rem' }}>{item.frequency}</td>
                              <td style={{ padding: '0.5rem' }}>{item.duration}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{item.total_quantity}</td>
                              <td style={{ padding: '0.5rem', fontSize: '0.8rem' }}>{item.instructions}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveRxItem(index)}
                                  style={{ padding: '0.25rem', background: 'transparent', color: 'var(--danger)' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor's Fee Selector */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={18} style={{ color: 'var(--primary)' }} />
                  <span>OPD Consultation Doctor Fee (LKR)</span>
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setDoctorFee(500); setCustomFeeActive(false); }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: (!customFeeActive && doctorFee === 500) ? 'var(--primary)' : 'var(--card-border)',
                      background: (!customFeeActive && doctorFee === 500) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Full Fee (LKR 500)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDoctorFee(250); setCustomFeeActive(false); }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: (!customFeeActive && doctorFee === 250) ? 'var(--primary)' : 'var(--card-border)',
                      background: (!customFeeActive && doctorFee === 250) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Half Fee (LKR 250)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDoctorFee(0); setCustomFeeActive(false); }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: (!customFeeActive && doctorFee === 0) ? 'var(--primary)' : 'var(--card-border)',
                      background: (!customFeeActive && doctorFee === 0) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Waived / Free (LKR 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCustomFeeActive(true); }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: customFeeActive ? 'var(--primary)' : 'var(--card-border)',
                      background: customFeeActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Custom Fee
                  </button>

                  {customFeeActive && (
                    <input
                      type="number"
                      placeholder="Enter amount in LKR"
                      value={customFee}
                      onChange={(e) => setCustomFee(e.target.value)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--primary)',
                        width: '180px',
                        fontSize: '0.9rem',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'white'
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  <Check size={16} />
                  <span>Submit & Complete Consultation</span>
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    db.updateVisitStatus(selectedVisit.id, 'waiting');
                    setSelectedVisit(null);
                    loadData();
                  }}
                >
                  Put on Hold
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', textAlign: 'center', minHeight: '350px' }}>
            <Stethoscope size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Please select a patient from the queue to start consultation.</h3>
          </div>
        )}
      </div>

      {/* Right Pane: Waiting Queue */}
      <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={20} />
            <span>Today's Queue ({activeQueue.length})</span>
          </h3>
          
          {/* QR Scan Button for Doctor */}
          <button 
            onClick={() => setShowQrModal(true)}
            className="btn-primary" 
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          >
            <QrCode size={14} />
            <span>Scan QR</span>
          </button>
        </div>

        {notif.text && (
          <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`} style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <span>{notif.text}</span>
          </div>
        )}

        <div className={styles.queueList}>
          {activeQueue.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>No patients in queue.</p>
          ) : (
            activeQueue.map((visit) => (
              <div 
                key={visit.id} 
                onClick={() => handleSelectPatient(visit)}
                style={{ 
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedVisit && selectedVisit.id === visit.id ? 'var(--primary)' : 'var(--card-border)',
                  background: selectedVisit && selectedVisit.id === visit.id ? 'var(--primary-glow)' : 'var(--card-bg)'
                }}
                className={styles.queueItem}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={styles.queueNumber}>{visit.queue_number}</div>
                  
                  {visit.patient?.photo_url ? (
                    <img 
                      src={visit.patient.photo_url} 
                      alt="photo" 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={16} />
                    </div>
                  )}

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{visit.patient?.prefix} {visit.patient?.full_name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                      ID: {visit.patient?.id} | Temp: {visit.temperature || '?' }°C | BP: {visit.systolic_bp || '?'}/{visit.diastolic_bp || '?'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${visit.status === 'in_consultation' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {visit.status === 'in_consultation' ? 'In Room' : 'Waiting'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )}

      {/* Tab 2: Daily Queue */}
      {(activeTab === 'overview' || activeTab === 'queue') && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Live OPD Queue</h3>
            <button 
              onClick={() => setShowQrModal(true)}
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            >
              <QrCode size={16} />
              <span>Scan Patient QR</span>
            </button>
          </div>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>No patients have been added to the queue today yet.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.map((visit, idx) => (
                <div key={visit.id || idx} className={styles.queueItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className={styles.queueNumber}>{visit.queue_number}</div>
                    
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

      {/* Tab 3: Register Patient (Split Pane Layout) */}
      {activeTab === 'register' && (
        <div className={styles.splitGrid}>
          {/* Left Side: Real-time Smart Suggestions Sidebar */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              <span>Smart Search Suggestions</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
              Start typing a name, phone, or address. Match results will load here instantly to avoid duplicate registrations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {smartSuggestions.map(sug => (
                <div 
                  key={sug.id}
                  onClick={() => selectPatientSuggestion(sug)}
                  style={{ 
                    cursor: 'pointer',
                    border: '1px solid var(--card-border)',
                    background: 'var(--secondary-bg)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  className={styles.sugCard}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {sug.photo_url ? (
                      <img 
                        src={sug.photo_url} 
                        alt="thumb" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={16} />
                      </div>
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{sug.prefix} {sug.full_name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>ID: {sug.id} | Phone: {sug.phone}</p>
                      {sug.address && <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.1rem' }}>Addr: {sug.address}</p>}
                    </div>
                  </div>
                </div>
              ))}

              {smartSuggestions.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--secondary)', border: '1px dashed var(--card-border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  No duplicate suggestions found. Go ahead and fill the form.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: The Registration Form */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} />
                <span>{patientForm.id ? `Edit Patient Profile (${patientForm.id})` : 'New Patient Registration Form'}</span>
              </div>
              {patientForm.id && (
                <button 
                  onClick={() => setPatientForm({
                    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
                    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: '',
                    is_dob_estimated: false, estimated_age: ''
                  })}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Clear Form (Cancel Edit)
                </button>
              )}
            </h3>

            {duplicatePatient && (
              <div className={`${styles.alert} ${styles.alertDanger}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <AlertTriangle size={18} />
                  <span>ALERT: Duplicate Patient Found!</span>
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  A patient named <strong>{duplicatePatient.full_name}</strong> with phone number <strong>{duplicatePatient.phone}</strong> is already registered as <strong>{duplicatePatient.id}</strong>.
                </p>
                <button 
                  type="button"
                  onClick={() => selectPatientSuggestion(duplicatePatient)}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                >
                  Load existing profile instead
                </button>
              </div>
            )}

            <form onSubmit={handleSavePatient} className={styles.formGrid}>
              {/* Photo Area */}
              <div className={styles.formFull} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                {patientForm.photo_url ? (
                  <img 
                    src={patientForm.photo_url} 
                    alt="preview" 
                    onClick={() => setZoomedPhoto(patientForm.photo_url)}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '8px', 
                      objectFit: 'cover', 
                      border: '2px solid var(--primary)', 
                      cursor: 'zoom-in' 
                    }}
                    className={styles.clickablePhoto}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                    <Camera size={24} />
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

              {/* Row 1: Prefix, Name, Gender */}
              <div className={`${styles.formGroup} ${styles.colSpan2}`}>
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

              <div className={`${styles.formGroup} ${styles.colSpan7}`}>
                <label className={styles.formLabel}>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sunil Perera"
                  value={patientForm.full_name} 
                  onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan3}`}>
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

              {/* Row 2: Date of Birth, Age, Occupation */}
              <div className={`${styles.formGroup} ${styles.colSpan4}`}>
                <label className={styles.formLabel}>
                  Date of Birth {patientForm.is_dob_estimated ? '' : '*'}
                </label>
                <input 
                  type="date" 
                  value={patientForm.date_of_birth} 
                  disabled={patientForm.is_dob_estimated}
                  onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
                  style={patientForm.is_dob_estimated ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_dob_estimated_doctor"
                    checked={patientForm.is_dob_estimated}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPatientForm(prev => ({
                        ...prev,
                        is_dob_estimated: checked,
                        date_of_birth: checked ? '' : prev.date_of_birth,
                        estimated_age: checked ? prev.estimated_age : ''
                      }));
                    }}
                  />
                  <label htmlFor="is_dob_estimated_doctor" style={{ fontSize: '0.75rem', color: 'var(--secondary)', cursor: 'pointer', userSelect: 'none' }}>
                    Don't know DOB / Enter Age manually
                  </label>
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan4}`}>
                <label className={styles.formLabel}>
                  Age {patientForm.is_dob_estimated ? '*' : ''}
                </label>
                {patientForm.is_dob_estimated ? (
                  <div>
                    <input 
                      type="number" 
                      placeholder="Enter age in years"
                      value={patientForm.estimated_age}
                      min="0"
                      max="120"
                      onChange={(e) => setPatientForm({ ...patientForm, estimated_age: e.target.value })}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ⚠️ Please encourage DOB entry if possible
                    </p>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    readOnly 
                    placeholder="Calculated automatically"
                    value={getAge(patientForm.date_of_birth)}
                    style={{ background: 'var(--muted-bg)', cursor: 'not-allowed' }}
                  />
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan4}`}>
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

              {/* Row 3: Phone Number, Phone Owner Relationship */}
              <div className={`${styles.formGroup} ${styles.colSpan6}`}>
                <label className={styles.formLabel}>Phone Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0771234567"
                  value={patientForm.phone} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.colSpan6}`}>
                <label className={styles.formLabel}>Phone Owner (Relationship)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Self, Mother, Father"
                  value={patientForm.phone_owner_name} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone_owner_name: e.target.value })}
                />
              </div>

              {/* Row 4: Address */}
              <div className={`${styles.formGroup} ${styles.colSpan12}`}>
                <label className={styles.formLabel}>Address / City / Village</label>
                <input 
                  type="text" 
                  placeholder="Home Address / City / Village"
                  value={patientForm.address} 
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  list="suggested-addresses"
                />
                <datalist id="suggested-addresses">
                  {getUniqueSuggestions('address').map(a => <option key={a} value={a} />)}
                </datalist>
              </div>

              {/* Allergies, Medical History, Surgical History, Comments */}
              <div className={`${styles.formGroup} ${styles.colSpan12}`}>
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

              <div className={`${styles.formGroup} ${styles.colSpan12}`}>
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

              <div className={`${styles.formGroup} ${styles.colSpan12}`}>
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

              <div className={`${styles.formGroup} ${styles.colSpan12}`}>
                <label className={styles.formLabel}>Comments / Extra Notes</label>
                <textarea 
                  rows="2" 
                  placeholder="Any additional information..."
                  value={patientForm.comments}
                  onChange={(e) => setPatientForm({ ...patientForm, comments: e.target.value })}
                ></textarea>
              </div>

              <div className={styles.colSpan12} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setPatientForm({
                    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
                    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: ''
                  })}
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel / Reset
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  <UserCheck size={16} />
                  <span>{patientForm.id ? 'Save Profile Changes' : 'Register New Patient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Patient Directory */}
      {activeTab === 'directory' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Patient Directory</h3>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by ID, Name, Tel, or City..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className={styles.directoryTableWrapper}>
            <table className={styles.directoryTable}>
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Patient ID</th>
                  <th>Full Name</th>
                  <th style={{ width: '130px' }}>Age / Gender</th>
                  <th style={{ width: '140px' }}>Contact</th>
                  <th>City / Village</th>
                  <th>Address</th>
                  <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {directoryPatients.map(p => {
                  const city = p.address ? p.address.split(',').pop().trim() : 'N/A';
                  return (
                    <tr key={p.id} className={styles.directoryTableRow}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                        <code>{p.id}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.photo_url ? (
                            <img 
                              src={p.photo_url} 
                              alt="thumb" 
                              onClick={() => setZoomedPhoto(p.photo_url)}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <User size={14} />
                            </div>
                          )}
                          <span style={{ fontWeight: '500' }}>{p.prefix} {p.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {getAge(p.date_of_birth)} / {p.gender}
                        </span>
                      </td>
                      <td>
                        <div>{p.phone}</div>
                        {p.phone_owner_name && p.phone_owner_name !== 'Self' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>({p.phone_owner_name})</div>
                        )}
                      </td>
                      <td>{city}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{p.address || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => loadPatientToForm(p)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => {
                              setVisitForm(prev => ({ ...prev, patient_id: p.id }));
                              handleSetActiveTab('walkin');
                            }}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <HeartPulse size={12} />
                            <span>OPD Check-in</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {directoryPatients.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem', padding: '3rem 1rem' }}>No patients match the search.</p>
          )}
        </div>
      )}

      {/* Tab 5: Walk-in Check-in (Add to Queue) */}
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

      {/* Tab 6: Channeling Appointment Booking */}
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

      {/* Simulated QR Code Scanner Modal */}
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

            {/* Simulated patients list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeTab === 'consultation' ? (
                <>
                  <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Select Queue Patient to Scan:</label>
                  {activeQueue.map(v => (
                    <button 
                      key={v.id}
                      onClick={() => simulateScan(v.patient_id)}
                      className="btn-secondary"
                      style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                      disabled={scanLaserActive}
                    >
                      <span>{v.patient?.prefix} {v.patient?.full_name}</span>
                      <code>{v.patient?.id}</code>
                    </button>
                  ))}
                  {activeQueue.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.8rem' }}>No active patients in the queue to scan.</p>
                  )}
                </>
              ) : (
                <>
                  <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Select Registered Patient to Scan:</label>
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
                </>
              )}
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

      {/* Zoomed Photo Modal */}
      {zoomedPhoto && (
        <div 
          onClick={() => setZoomedPhoto(null)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.85)', 
            zIndex: 10000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '90%', 
              maxHeight: '90%', 
              background: 'var(--card-bg)', 
              padding: '8px', 
              borderRadius: '12px', 
              border: '1px solid var(--card-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedPhoto(null)}
              style={{ 
                position: 'absolute', 
                right: '-12px', 
                top: '-12px', 
                background: 'var(--primary)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                zIndex: 10001
              }}
            >
              <X size={16} />
            </button>
            <img 
              src={zoomedPhoto} 
              alt="Zoomed Patient" 
              style={{ 
                maxWidth: '450px', 
                maxHeight: '450px', 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain', 
                borderRadius: '8px' 
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
