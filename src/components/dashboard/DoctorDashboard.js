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
  Info
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  
  // Selection state
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Edit Patient Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: ''
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

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const v = await db.getVisits();
      const d = await db.getDrugs();
      const l = await db.getLabTests();
      const p = await db.getPatients();
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(l || []);
      setPatients(p || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
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
    
    // Mark visit status in database as in_consultation
    db.updateVisitStatus(visit.id, 'in_consultation');
    loadData();
  };

  // Open Edit Profile modal
  const handleOpenEdit = () => {
    if (!selectedVisit || !selectedVisit.patient) return;
    const p = selectedVisit.patient;
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
    setShowEditModal(true);
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

  // Save changes to profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
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

      await db.updatePatient(patientForm.id, formatted);
      showNotification('success', 'Patient profile updated successfully.');
      
      // Live update selected visit patient
      setSelectedVisit(prev => ({
        ...prev,
        patient: { ...prev.patient, ...formatted }
      }));
      setShowEditModal(false);
      loadData();
    } catch (err) {
      showNotification('error', 'Update failed: ' + err.message);
    }
  };

  // Autocomplete Suggestions
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

  // QR scan simulator
  const simulateScan = (patientId) => {
    setScanLaserActive(true);
    setTimeout(() => {
      const visit = visits.find(v => v.patient_id === patientId && (v.status === 'waiting' || v.status === 'in_consultation'));
      if (visit) {
        handleSelectPatient(visit);
        showNotification('success', `QR code scanned: Selected ${visit.patient?.full_name} (${visit.patient?.id})`);
      } else {
        showNotification('error', `No active queue visit found for Patient ID: ${patientId}`);
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
      const consultation = {
        visit_id: selectedVisit.id,
        doctor_id: 'doc1',
        symptoms,
        diagnosis,
        clinical_notes: notes
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

  return (
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
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
                  <span>Recommend Lab Tests</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
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
              </div>

              {/* Prescription Builder */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill size={18} style={{ color: 'var(--primary)' }} />
                  <span>E-Prescription Builder</span>
                </h4>

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

      {/* Doctor's Edit Patient Profile Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Update Patient Profile ({patientForm.id})</h3>
            
            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              
              {/* Photo Upload Section */}
              <div className={styles.formFull} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: 'var(--secondary-bg)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                {patientForm.photo_url ? (
                  <img 
                    src={patientForm.photo_url} 
                    alt="preview" 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
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
                </div>
              </div>

              {/* Prefix */}
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
                  value={patientForm.phone} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Owner (Relationship)</label>
                <input 
                  type="text" 
                  value={patientForm.phone_owner_name} 
                  onChange={(e) => setPatientForm({ ...patientForm, phone_owner_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <input 
                  type="text" 
                  value={patientForm.address} 
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  list="doc-addresses"
                />
                <datalist id="doc-addresses">
                  {getUniqueSuggestions('address').map(a => <option key={a} value={a} />)}
                </datalist>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Occupation (Job)</label>
                <input 
                  type="text" 
                  value={patientForm.occupation} 
                  onChange={(e) => setPatientForm({ ...patientForm, occupation: e.target.value })}
                  list="doc-jobs"
                />
                <datalist id="doc-jobs">
                  {getUniqueSuggestions('occupation').map(o => <option key={o} value={o} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Allergies (comma separated)</label>
                <input 
                  type="text" 
                  value={patientForm.allergies} 
                  onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                  list="doc-allergies"
                />
                <datalist id="doc-allergies">
                  {getUniqueSuggestions('allergies').map(al => <option key={al} value={al} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Past Medical History (comma separated)</label>
                <input 
                  type="text" 
                  value={patientForm.past_medical_history} 
                  onChange={(e) => setPatientForm({ ...patientForm, past_medical_history: e.target.value })}
                  list="doc-med"
                />
                <datalist id="doc-med">
                  {getUniqueSuggestions('past_medical_history').map(m => <option key={m} value={m} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Past Surgical History (comma separated)</label>
                <input 
                  type="text" 
                  value={patientForm.past_surgical_history} 
                  onChange={(e) => setPatientForm({ ...patientForm, past_surgical_history: e.target.value })}
                  list="doc-surg"
                />
                <datalist id="doc-surg">
                  {getUniqueSuggestions('past_surgical_history').map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formFull}`}>
                <label className={styles.formLabel}>Comments / Extra Notes</label>
                <textarea 
                  rows="2" 
                  value={patientForm.comments}
                  onChange={(e) => setPatientForm({ ...patientForm, comments: e.target.value })}
                ></textarea>
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated QR Code Scanner Modal for Doctor */}
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
              <h4>Consultation QR Search</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Scan card to instantly select queue patient.</p>
            </div>

            {/* Simulated camera view */}
            <div style={{ position: 'relative', width: '100%', height: '180px', background: '#000', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '130px', height: '130px', border: '2px dashed rgba(16, 185, 129, 0.6)', borderRadius: '8px' }}></div>
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

            {/* Queue patient list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
