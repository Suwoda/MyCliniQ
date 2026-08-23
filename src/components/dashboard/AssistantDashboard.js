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
  Info,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Stethoscope,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day}/${month}/${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
};

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

export default function AssistantDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
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

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');

  // Zoomed Photo Modal state
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  // Smart search suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  // QR Code Simulator State
  const [showQrModal, setShowQrModal] = useState(false);
  const [scanLaserActive, setScanLaserActive] = useState(false);

  // Channeling Queue Filter States
  const [channelingFilterDoctor, setChannelingFilterDoctor] = useState('spec1');
  const [channelingFilterDate, setChannelingFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [channelingSearch, setChannelingSearch] = useState('');

  const handleUpdateAppointmentStatus = async (apptId, newStatus) => {
    try {
      await db.updateAppointmentStatus(apptId, newStatus);
      showNotification('success', `Appointment status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update appointment status: ' + err.message);
    }
  };

  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    try {
      await db.updateVisitStatus(visitId, newStatus);
      showNotification('success', `Visit status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update visit status: ' + err.message);
    }
  };

  const matchesDoctor = (apptDocId, targetDocId) => {
    if (!targetDocId) return true;
    if (apptDocId === targetDocId) return true;
    if ((apptDocId === 'doc1' || apptDocId === 'spec1') && (targetDocId === 'doc1' || targetDocId === 'spec1')) return true;
    if ((apptDocId === 'doc2' || apptDocId === 'spec2') && (targetDocId === 'doc2' || targetDocId === 'spec2')) return true;
    return false;
  };

  const getSpecialistDetails = (docId) => {
    const found = specialists.find(s => s.id === docId || (s.id === 'spec1' && docId === 'doc1') || (s.id === 'spec2' && docId === 'doc2'));
    if (found) return { name: found.name, specialty: found.specialty || found.specialization || 'Specialist' };
    if (docId === 'doc1' || docId === 'spec1') return { name: 'Dr. Prasad', specialty: 'Cardiologist' };
    if (docId === 'doc2' || docId === 'spec2') return { name: 'Dr. Sanduni', specialty: 'Pediatrician' };
    if (docId === 'spec3') return { name: 'Dr. Ruwan', specialty: 'Dermatologist' };
    return { name: 'Dr. Consultant', specialty: 'Specialist' };
  };

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
    photo_url: '',
    is_dob_estimated: false,
    estimated_age: ''
  });

  const [visitForm, setVisitForm] = useState({
    patient_id: '', 
    doctor_id: 'doc1', 
    systolic_bp: '', 
    diastolic_bp: '', 
    temperature: '', 
    weight_kg: '', 
    chief_complaint: '', 
    visit_type: 'opd', 
    specialist_id: '',
    procedure_name: 'Wound Dressing'
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '', doctor_id: 'spec1', appointment_date: '', booked_by: 'phone'
  });

  const [specialists, setSpecialists] = useState([]);
  const [labCatalog, setLabCatalog] = useState([]);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [notif, setNotif] = useState({ type: '', text: '' });

  // Fetch initial data
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
      const p = await db.getPatients();
      const v = await db.getVisits();
      const a = await db.getAppointments();
      const s = await db.getSpecialists();
      const l = await db.getLabTests();
      setPatients(p || []);
      setVisits(v || []);
      setAppointments(a || []);
      setSpecialists(s || []);
      setLabCatalog(l || []);

      if (s && s.length > 0) {
        const defaultDoc = s[0].id;
        setChannelingFilterDoctor(prev => (prev === 'all' || !prev || prev === 'doc1' ? defaultDoc : prev));
        setAppointmentForm(prev => (prev.doctor_id === 'doc1' ? { ...prev, doctor_id: defaultDoc } : prev));
      }
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

  // Add to Queue / Check-In
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!visitForm.patient_id) {
      showNotification('error', 'Please select a patient.');
      return;
    }

    const type = visitForm.visit_type || 'opd';

    if (type === 'opd' && !visitForm.chief_complaint) {
      showNotification('error', 'Please enter chief complaint for OPD check-in.');
      return;
    }

    if ((type === 'lab' || type === 'investigation') && selectedLabTests.length === 0) {
      showNotification('error', 'Please select at least one lab test or investigation.');
      return;
    }

    if (type === 'channeling' && !visitForm.specialist_id) {
      showNotification('error', 'Please select a specialist doctor.');
      return;
    }

    if (type === 'procedure' && !visitForm.procedure_name) {
      showNotification('error', 'Please select or specify the clinical procedure.');
      return;
    }

    try {
      const todayVisits = visits.filter(v => v.visit_date === new Date().toISOString().split('T')[0]);
      const nextQueueNo = todayVisits.length + 1;

      let doctorFee = 0;
      let centerFee = 0;
      let specId = null;
      let complaint = visitForm.chief_complaint;

      if (type === 'opd') {
        doctorFee = 500.00;
        if (!complaint) complaint = 'OPD Consultation';
      } else if (type === 'channeling') {
        const selectedSpec = specialists.find(s => s.id === visitForm.specialist_id);
        if (selectedSpec) {
          doctorFee = selectedSpec.doctor_fee;
          centerFee = selectedSpec.center_fee;
          specId = selectedSpec.id;
        }
        if (!complaint) complaint = 'Specialist Channeling';
      } else if (type === 'lab' || type === 'investigation') {
        if (!complaint) complaint = 'Lab Investigation';
      } else if (type === 'procedure') {
        complaint = visitForm.procedure_name || 'Clinical Procedure';
      }

      const newVisit = await db.addVisit({
        patient_id: visitForm.patient_id,
        doctor_id: type === 'opd' ? visitForm.doctor_id : null,
        queue_number: nextQueueNo,
        systolic_bp: visitForm.systolic_bp ? parseInt(visitForm.systolic_bp) : null,
        diastolic_bp: visitForm.diastolic_bp ? parseInt(visitForm.diastolic_bp) : null,
        temperature: visitForm.temperature ? parseFloat(visitForm.temperature) : null,
        weight_kg: visitForm.weight_kg ? parseFloat(visitForm.weight_kg) : null,
        chief_complaint: complaint,
        status: 'waiting',
        visit_type: type === 'investigation' ? 'lab' : type,
        specialist_id: specId,
        procedure_name: type === 'procedure' ? visitForm.procedure_name : null,
        doctor_fee: doctorFee,
        center_fee: centerFee,
        payment_status: 'pending'
      });

      if ((type === 'lab' || type === 'investigation') && selectedLabTests.length > 0) {
        await db.addLabRequests(newVisit.id, visitForm.patient_id, selectedLabTests, null);
      }

      const targetDeptLabel = type === 'opd' ? 'OPD Queue' : (type === 'channeling' ? 'Consultant Channeling' : (type === 'procedure' ? 'Clinical Procedures' : 'Lab Investigations'));
      showNotification('success', `Patient checked in under Queue No. #${nextQueueNo} and routed to ${targetDeptLabel}!`);

      setVisitForm({
        patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', temperature: '', weight_kg: '', chief_complaint: '', visit_type: 'opd', specialist_id: '', procedure_name: 'Wound Dressing'
      });
      setSelectedLabTests([]);
      await loadData();

      // Automatically switch to destination queue tab!
      if (type === 'opd') handleSetActiveTab('opd_queue');
      else if (type === 'channeling') handleSetActiveTab('channeling');
      else if (type === 'procedure') handleSetActiveTab('procedures');
      else handleSetActiveTab('investigations');
    } catch (err) {
      showNotification('error', 'Failed to check in: ' + err.message);
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
      const bookedDocId = appointmentForm.doctor_id || (specialists[0]?.id || 'spec1');
      const bookedDate = appointmentForm.appointment_date;
      const dateAppts = appointments.filter(a => a.appointment_date === bookedDate && matchesDoctor(a.doctor_id || a.specialist_id, bookedDocId));
      const queueNo = dateAppts.length + 1;

      await db.addAppointment({
        patient_id: appointmentForm.patient_id,
        doctor_id: bookedDocId,
        specialist_id: bookedDocId,
        appointment_date: bookedDate,
        queue_number: queueNo,
        status: 'scheduled',
        booked_by: appointmentForm.booked_by
      });

      const docName = getSpecialistDetails(bookedDocId).name;
      showNotification('success', `Booking successful! Queue No. #${queueNo} for ${docName} on ${formatDateDDMMYYYY(bookedDate)}.`);

      const defaultDoc = specialists[0]?.id || 'spec1';
      setAppointmentForm({
        patient_id: '', doctor_id: defaultDoc, appointment_date: '', booked_by: 'phone'
      });

      // Synchronize Queue View to the booked doctor and date so user immediately sees the appointment!
      setChannelingFilterDoctor(bookedDocId);
      setChannelingFilterDate(bookedDate);

      await loadData();
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
          handleSetActiveTab('register');
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

  const filteredChannelingAppointments = appointments.filter(appt => {
    if (channelingFilterDate && appt.appointment_date !== channelingFilterDate) {
      return false;
    }
    const apptDocId = appt.doctor_id || appt.specialist_id;
    if (channelingFilterDoctor && !matchesDoctor(apptDocId, channelingFilterDoctor)) {
      return false;
    }
    if (channelingSearch.trim()) {
      const q = channelingSearch.toLowerCase().trim();
      const pName = (appt.patient?.full_name || '').toLowerCase();
      const pPhone = appt.patient?.phone || '';
      const pId = (appt.patient?.id || '').toLowerCase();
      if (!pName.includes(q) && !pPhone.includes(q) && !pId.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const duplicatePatient = findDuplicatePatient();

  return (
    <div>
      {/* Notification Banner */}
      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tab 1: Register Patient */}
      {activeTab === 'register' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
            <div className={styles.registerSplit}>
              {/* Left Column: Smart Search Suggestions */}
              <div className={styles.leftSuggestionsPanel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  <Search size={18} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Smart Search Suggestions</h4>
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: 0, lineHeight: '1.4' }}>
                  Typing Name, Phone or City on the right will auto-search patients here.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', flexGrow: 1 }}>
                  {smartSuggestions.length === 0 ? (
                    <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--card-border)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)' }}>
                      <span>Start typing details to see suggestions...</span>
                    </div>
                  ) : (
                    smartSuggestions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPatientSuggestion(p)}
                        className={styles.suggestionItemCard}
                      >
                        {p.photo_url ? (
                          <img 
                            src={p.photo_url} 
                            alt="photo" 
                            className={styles.suggestionItemPhoto}
                          />
                        ) : (
                          <div className={styles.suggestionItemPhotoPlaceholder}>
                            <User size={16} />
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)' }}>
                            {p.prefix} {p.full_name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                            ID: {p.id}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
                            Tel: {p.phone}
                          </span>
                          {p.address && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Loc: {p.address}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Form Panel */}
              <div className={styles.rightFormPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>{patientForm.id ? `Edit Patient Profile (${patientForm.id})` : 'Register New Patient'}</h3>
                  {patientForm.id && (
                    <button 
                      type="button"
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

                <form onSubmit={handleSavePatient} className={styles.patientFormGrid}>
                  {/* Photo Upload Section */}
                  <div className={styles.colSpan12} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                    {patientForm.photo_url ? (
                      <img 
                        src={patientForm.photo_url} 
                        alt="preview" 
                        onClick={() => setZoomedPhoto(patientForm.photo_url)}
                        title="Click to enlarge"
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
                        id="is_dob_estimated_assistant"
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
                      <label htmlFor="is_dob_estimated_assistant" style={{ fontSize: '0.75rem', color: 'var(--secondary)', cursor: 'pointer', userSelect: 'none' }}>
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
          </div>
        </div>
      )}

      {/* Tab 2: Patient Directory */}
      {activeTab === 'directory' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Patient Directory ({patients.length})</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by ID, Name, Phone, Address..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className={styles.directoryTableWrapper}>
            <table className={styles.directoryTable}>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {directoryPatients.map(p => {
                  const getCity = (addr) => {
                    if (!addr) return '-';
                    const parts = addr.split(',');
                    return parts[parts.length - 1].trim();
                  };
                  return (
                    <tr key={p.id} className={styles.directoryTableRow}>
                      <td style={{ fontWeight: '600' }}>
                        <code>{p.id}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.photo_url ? (
                            <img 
                              src={p.photo_url} 
                              alt="photo" 
                              onClick={() => setZoomedPhoto(p.photo_url)}
                              title="Click to enlarge"
                              className={styles.directoryTablePhoto}
                            />
                          ) : (
                            <div className={styles.directoryTablePhotoPlaceholder}>
                              <User size={16} />
                            </div>
                          )}
                          <span style={{ fontWeight: '700' }}>{p.prefix} {p.full_name}</span>
                        </div>
                      </td>
                      <td>
                        {getAge(p.date_of_birth)}, {p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1)) : 'N/A'}
                      </td>
                      <td>
                        <div>{p.phone}</div>
                        {p.phone_owner_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            ({p.phone_owner_name})
                          </div>
                        )}
                      </td>
                      <td>{getCity(p.address)}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.address}>
                        {p.address || '-'}
                      </td>
                      <td>
                        <div className={styles.directoryTableActions}>
                          <button 
                            onClick={() => loadPatientToForm(p)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit size={12} />
                            <span>Edit Profile</span>
                          </button>
                          <button 
                            onClick={() => {
                              setVisitForm(prev => ({ ...prev, patient_id: p.id }));
                              handleSetActiveTab('checkin');
                            }}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <HeartPulse size={12} />
                            <span>Check-In Patient</span>
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

      {/* Tab 3: Patient Check-In (Department Routing) */}
      {(activeTab === 'checkin' || activeTab === 'walkin') && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Patient Check-In & Department Routing</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Record vitals & send patient to live department queue</span>
          </div>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Filter registered patients list by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleCheckIn} className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>Select Patient *</label>
              <select 
                value={visitForm.patient_id} 
                onChange={(e) => setVisitForm({ ...visitForm, patient_id: e.target.value })}
                style={{ fontSize: '0.95rem', fontWeight: 'bold' }}
              >
                <option value="">-- Please select a patient --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.prefix} {p.full_name} ({p.phone} - ID: {p.id})</option>
                ))}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>Select Destination / Visit Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.25rem' }}>
                {[
                  { id: 'opd', title: '🩺 OPD Consultation', desc: 'General Doctor Visit' },
                  { id: 'channeling', title: '👨‍⚕️ Consultant Channeling', desc: 'Specialist Appointment' },
                  { id: 'lab', title: '🧪 Lab Investigations', desc: 'Blood, Urine, ECG, etc.' },
                  { id: 'procedure', title: '💉 Clinical Procedure', desc: 'Dressing, Nebulization, etc.' },
                ].map(dept => (
                  <div 
                    key={dept.id}
                    onClick={() => setVisitForm({ ...visitForm, visit_type: dept.id })}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: visitForm.visit_type === dept.id ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: visitForm.visit_type === dept.id ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', color: visitForm.visit_type === dept.id ? 'var(--primary)' : 'var(--foreground)' }}>
                      {dept.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                      {dept.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals Recording Grid */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Blood Pressure (Systolic / Diastolic)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Systolic (e.g. 120)"
                  value={visitForm.systolic_bp || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, systolic_bp: e.target.value })}
                />
                <span>/</span>
                <input 
                  type="number" 
                  placeholder="Diastolic (e.g. 80)"
                  value={visitForm.diastolic_bp || ''}
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
                value={visitForm.temperature || ''}
                onChange={(e) => setVisitForm({ ...visitForm, temperature: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 68.5"
                value={visitForm.weight_kg || ''}
                onChange={(e) => setVisitForm({ ...visitForm, weight_kg: e.target.value })}
              />
            </div>

            {/* Department Specific Options */}
            {visitForm.visit_type === 'opd' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assigned OPD Doctor</label>
                <select 
                  value={visitForm.doctor_id} 
                  onChange={(e) => setVisitForm({ ...visitForm, doctor_id: e.target.value })}
                >
                  <option value="doc1">Dr. Sunil Perera (OPD / General Practitioner)</option>
                </select>
              </div>
            )}

            {visitForm.visit_type === 'channeling' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Specialist Doctor *</label>
                <select 
                  value={visitForm.specialist_id} 
                  onChange={(e) => setVisitForm({ ...visitForm, specialist_id: e.target.value })}
                >
                  <option value="">-- Select Specialist Doctor --</option>
                  {specialists.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>
                  ))}
                </select>
              </div>
            )}

            {visitForm.visit_type === 'procedure' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Clinical Procedure Required *</label>
                <select
                  value={visitForm.procedure_name}
                  onChange={(e) => setVisitForm({ ...visitForm, procedure_name: e.target.value })}
                >
                  <option value="Wound Dressing">Wound Dressing (තුවාල බෙහෙත් දැමීම)</option>
                  <option value="Nebulization">Nebulization (නෙබියුලයිස් කිරීම)</option>
                  <option value="Injections / Vaccination">Injections / Vaccination (එන්නත්)</option>
                  <option value="Wound Stitches / Removal">Wound Stitches / Removal (මැහුම්)</option>
                  <option value="Ear Syringing">Ear Syringing (කන් සේදීම)</option>
                  <option value="Other Procedure">Other Minor Procedure</option>
                </select>
              </div>
            )}

            {/* Fee summary for Channeling */}
            {visitForm.visit_type === 'channeling' && visitForm.specialist_id && (() => {
              const selectedSpec = specialists.find(s => s.id === visitForm.specialist_id);
              if (!selectedSpec) return null;
              return (
                <div className={`${styles.formGroup} ${styles.formFull}`} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: 'white',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block' }}>Doctor Fee</span>
                    <strong style={{ fontSize: '1.1rem' }}>LKR {parseFloat(selectedSpec.doctor_fee).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block' }}>Clinic Fee</span>
                    <strong style={{ fontSize: '1.1rem' }}>LKR {parseFloat(selectedSpec.center_fee).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block' }}>Total Fee</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>
                      LKR {parseFloat(selectedSpec.doctor_fee + selectedSpec.center_fee).toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            })()}

            {/* Lab Test checklist */}
            {(visitForm.visit_type === 'lab' || visitForm.visit_type === 'investigation') && (
              <div className={`${styles.formGroup} ${styles.formFull}`} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '1.25rem'
              }}>
                <label className={styles.formLabel} style={{ marginBottom: '0.75rem', display: 'block', fontWeight: 'bold' }}>
                  Select Lab Tests / ECG *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                  {labCatalog.map(test => {
                    const checked = selectedLabTests.includes(test.id);
                    return (
                      <label key={test.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        background: checked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: checked ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                        cursor: 'pointer'
                      }}>
                        <input 
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLabTests([...selectedLabTests, test.id]);
                            else setSelectedLabTests(selectedLabTests.filter(id => id !== test.id));
                          }}
                          style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{test.test_name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>LKR {parseFloat(test.cost).toFixed(2)}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chief Complaint / Notes */}
            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label className={styles.formLabel}>
                {visitForm.visit_type === 'opd' ? 'Chief Complaint *' : 'Clinical Notes / Reason for Visit'}
              </label>
              <textarea 
                rows="3" 
                placeholder={visitForm.visit_type === 'opd' ? "e.g. fever, cough, headache, body aches..." : "Additional notes or instructions..."}
                value={visitForm.chief_complaint || ''}
                onChange={(e) => setVisitForm({ ...visitForm, chief_complaint: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}>
                <HeartPulse size={18} />
                <span>Complete Check-In & Route to Department Queue</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Live OPD Queue */}
      {activeTab === 'opd_queue' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🩺 Live OPD Queue</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                {visits.filter(v => v.visit_type === 'opd' || !v.visit_type).length} Patients
              </span>
            </h3>
            <button 
              onClick={() => setShowQrModal(true)}
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            >
              <QrCode size={16} />
              <span>Scan Patient QR</span>
            </button>
          </div>

          {visits.filter(v => v.visit_type === 'opd' || !v.visit_type).length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 1rem' }}>No patients waiting in the OPD queue today.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.filter(v => v.visit_type === 'opd' || !v.visit_type).map((visit, idx) => (
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
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'} 
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({visit.patient?.id})</span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                        Phone: {visit.patient?.phone} ({visit.patient?.phone_owner_name || 'Self'}) | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                      {visit.chief_complaint && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginTop: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                          Complaint: {visit.chief_complaint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {(visit.systolic_bp || visit.temperature || visit.weight_kg) && (
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.5rem', borderRadius: '6px' }}>
                        {visit.systolic_bp && <span>BP: {visit.systolic_bp}/{visit.diastolic_bp}</span>}
                        {visit.temperature && <span>Temp: {visit.temperature}°C</span>}
                        {visit.weight_kg && <span>Weight: {visit.weight_kg}kg</span>}
                      </div>
                    )}

                    <select
                      value={visit.status}
                      onChange={(e) => handleUpdateVisitStatus(visit.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                    >
                      <option value="waiting">Waiting</option>
                      <option value="in_consultation">In Consultation</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Consultant Channeling */}
      {(activeTab === 'channeling' || activeTab === 'booking') && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              <Stethoscope size={22} style={{ color: 'var(--primary)' }} />
              <span>Consultant Channeling Queue</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                {filteredChannelingAppointments.length} Bookings
              </span>
            </h3>

            <button 
              onClick={() => {
                setAppointmentForm({ patient_id: '', doctor_id: channelingFilterDoctor || 'spec1', appointment_date: channelingFilterDate || new Date().toISOString().split('T')[0], booked_by: 'phone' });
                setActiveTab('booking_form_modal');
              }}
              className="btn-primary" 
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            >
              <CalendarDays size={15} />
              <span>+ Book Channeling Appointment</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--card-border)', 
            borderRadius: '10px', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                👨‍⚕️ Select Specialist Doctor
              </label>
              <select
                value={channelingFilterDoctor}
                onChange={(e) => setChannelingFilterDoctor(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              >
                {specialists.length > 0 ? (
                  specialists.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty || s.specialization})</option>
                  ))
                ) : (
                  <>
                    <option value="spec1">Dr. Prasad (Cardiologist)</option>
                    <option value="spec2">Dr. Sanduni (Pediatrician)</option>
                    <option value="spec3">Dr. Ruwan (Dermatologist)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                📅 Appointment Date
              </label>
              <input 
                type="date"
                value={channelingFilterDate}
                onChange={(e) => setChannelingFilterDate(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.35rem', fontWeight: '600' }}>
                🔍 Search Patient / Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Patient name or phone..."
                  value={channelingSearch}
                  onChange={(e) => setChannelingSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredChannelingAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--card-border)', borderRadius: '10px' }}>
              <Calendar size={40} style={{ color: 'var(--secondary)', opacity: 0.5, marginBottom: '0.75rem' }} />
              <h4 style={{ margin: '0 0 0.35rem 0' }}>No Channeling Appointments Found</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', margin: '0 0 1rem 0' }}>
                No channeling appointments booked for the selected doctor and date.
              </p>
            </div>
          ) : (
            <div className={styles.queueList}>
              {filteredChannelingAppointments.map((appt, idx) => {
                const docDetails = getSpecialistDetails(appt.doctor_id || appt.specialist_id);
                return (
                  <div key={appt.id || idx} className={styles.queueItem} style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <div className={styles.queueNumber} style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white' }}>
                        #{idx + 1}
                      </div>

                      {appt.patient?.photo_url ? (
                        <img 
                          src={appt.patient.photo_url} 
                          alt="photo" 
                          style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
                        />
                      ) : (
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                          <User size={20} />
                        </div>
                      )}

                      <div style={{ minWidth: '220px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          {appt.patient?.prefix} {appt.patient?.full_name || 'Unknown Patient'}
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({appt.patient?.id})</span>
                        </h4>
                        
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                          Phone: <strong>{appt.patient?.phone || '-'}</strong> ({appt.patient?.phone_owner_name || 'Self'})
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <strong>{docDetails.name}</strong> ({docDetails.specialty})
                          </span>

                          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            Date: <strong>{formatDateDDMMYYYY(appt.appointment_date)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${
                        appt.status === 'scheduled' ? 'badge-warning' : 
                        appt.status === 'checked_in' ? 'badge-primary' : 
                        appt.status === 'completed' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {appt.status === 'scheduled' && 'Scheduled'}
                        {appt.status === 'checked_in' && 'Checked In'}
                        {appt.status === 'completed' && 'Completed'}
                      </span>

                      {appt.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateAppointmentStatus(appt.id, 'checked_in')}
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          Check-In Patient
                        </button>
                      )}

                      {appt.status === 'checked_in' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateAppointmentStatus(appt.id, 'completed')}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Channeling Appointment Booking Form inside Tab */}
          {activeTab === 'booking_form_modal' && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Create New Channeling Appointment</h4>
                <button onClick={() => setActiveTab('channeling')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>Cancel</button>
              </div>

              <form onSubmit={handleBookAppointment} className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Patient *</label>
                  <select 
                    value={appointmentForm.patient_id} 
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                  >
                    <option value="">-- Please select a patient --</option>
                    {patients.map(p => (
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
                  <label className={styles.formLabel}>Specialist Doctor *</label>
                  <select 
                    value={appointmentForm.doctor_id} 
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
                  >
                    {specialists.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.specialty || s.specialization})</option>
                    ))}
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

                <div className={styles.formFull}>
                  <button type="submit" className="btn-primary">
                    <CalendarDays size={16} />
                    <span>Confirm & Save Appointment</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Lab Investigations Queue */}
      {activeTab === 'investigations' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🧪 Lab & Diagnostic Investigations Queue</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                {visits.filter(v => v.visit_type === 'lab' || v.visit_type === 'investigation').length} Requests
              </span>
            </h3>
          </div>

          {visits.filter(v => v.visit_type === 'lab' || v.visit_type === 'investigation').length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 1rem' }}>No pending lab investigations today.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.filter(v => v.visit_type === 'lab' || v.visit_type === 'investigation').map((visit, idx) => (
                <div key={visit.id || idx} className={styles.queueItem} style={{ borderLeft: '4px solid #a855f7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className={styles.queueNumber} style={{ background: 'linear-gradient(135deg, #9333ea, #a855f7)', color: 'white' }}>
                      #{visit.queue_number}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'}
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({visit.patient?.id})</span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                        Phone: {visit.patient?.phone} | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#c084fc', marginTop: '0.4rem', fontWeight: '500' }}>
                        Requested: {visit.chief_complaint || 'Lab Test / ECG'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select
                      value={visit.status}
                      onChange={(e) => handleUpdateVisitStatus(visit.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                    >
                      <option value="waiting">Waiting for Sample</option>
                      <option value="sample_collected">Sample Collected</option>
                      <option value="completed">Lab Results Ready</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Clinical Procedures Queue */}
      {activeTab === 'procedures' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💉 Clinical Procedures Queue</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#f472b6', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                {visits.filter(v => v.visit_type === 'procedure').length} Procedures
              </span>
            </h3>
          </div>

          {visits.filter(v => v.visit_type === 'procedure').length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 1rem' }}>No clinical procedures scheduled today.</p>
          ) : (
            <div className={styles.queueList}>
              {visits.filter(v => v.visit_type === 'procedure').map((visit, idx) => (
                <div key={visit.id || idx} className={styles.queueItem} style={{ borderLeft: '4px solid #ec4899' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className={styles.queueNumber} style={{ background: 'linear-gradient(135deg, #db2777, #ec4899)', color: 'white' }}>
                      #{visit.queue_number}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'}
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({visit.patient?.id})</span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                        Phone: {visit.patient?.phone} | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#f472b6', marginTop: '0.4rem', fontWeight: '600' }}>
                        Procedure: {visit.procedure_name || visit.chief_complaint || 'Clinical Procedure'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select
                      value={visit.status}
                      onChange={(e) => handleUpdateVisitStatus(visit.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                    >
                      <option value="waiting">Waiting Procedure</option>
                      <option value="in_progress">Procedure In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Master Daily Overview Queue */}
      {(activeTab === 'overview' || activeTab === 'daily_queue' || activeTab === 'queue') && (
        <>
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
                <span className={styles.statLabel}>Channeling Bookings</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <ClipboardList size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{visits.filter(v => v.status === 'completed').length}</span>
                <span className={styles.statLabel}>Completed Consultations</span>
              </div>
            </div>
          </div>

          <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>📋 Master Daily Queue Overview</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>All patient check-ins for today across all departments</span>
            </div>

            {visits.length === 0 ? (
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 1rem' }}>No patient check-ins recorded today.</p>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                            {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'}
                          </h4>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: 
                              visit.visit_type === 'channeling' ? 'rgba(59, 130, 246, 0.15)' :
                              visit.visit_type === 'lab' ? 'rgba(168, 85, 247, 0.15)' :
                              visit.visit_type === 'procedure' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: 
                              visit.visit_type === 'channeling' ? '#60a5fa' :
                              visit.visit_type === 'lab' ? '#c084fc' :
                              visit.visit_type === 'procedure' ? '#f472b6' : '#34d399',
                            textTransform: 'uppercase'
                          }}>
                            {visit.visit_type || 'OPD'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                          Phone: {visit.patient?.phone} | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                        </p>
                        {visit.chief_complaint && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--foreground)', marginTop: '0.35rem' }}>
                            Details: {visit.chief_complaint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${
                        visit.status === 'waiting' ? 'badge-warning' : 
                        visit.status === 'in_consultation' ? 'badge-primary' : 'badge-success'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
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
