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
  AlertTriangle
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function DoctorDashboard() {
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  
  // Selection state
  const [selectedVisit, setSelectedVisit] = useState(null);

  // E-Prescription builder states
  const [rxItems, setRxItems] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(null);
  
  const [dosage, setDosage] = useState('1 tab');
  const [frequency, setFrequency] = useState('TID'); // TID, BID, OD, PRN
  const [duration, setDuration] = useState('5');
  const [instructions, setInstructions] = useState('කෑමට පසු (After meals)');

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
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(l || []);
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

  // Autocalculate total pills needed
  const calculateTotalQuantity = (freq, dur) => {
    let factor = 1;
    if (freq === 'TID') factor = 3;
    if (freq === 'BID') factor = 2;
    if (freq === 'OD') factor = 1;
    if (freq === 'QID') factor = 4;
    if (freq === 'PRN') factor = 1; // as needed

    const days = parseInt(dur) || 1;
    return factor * days;
  };

  const handleAddRxItem = () => {
    if (!selectedDrug) {
      showNotification('error', 'කරුණාකර ඖෂධයක් තෝරන්න.');
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
      showNotification('error', 'කරුණාකර රෝග විනිශ්චය (Diagnosis) ඇතුළත් කරන්න.');
      return;
    }

    try {
      const consultation = {
        visit_id: selectedVisit.id,
        doctor_id: 'doc1', // Simulated logged in doc id
        symptoms,
        diagnosis,
        clinical_notes: notes
      };

      await db.addConsultation(consultation, rxItems, requestedLabs);
      showNotification('success', `${selectedVisit.patient?.full_name} රෝගියාගේ පරීක්ෂණ වාර්තාව සාර්ථකව සුරකිණි. ඖෂධ වට්ටෝරුව ෆාමසිය වෙත යොමු කරන ලදී.`);
      setSelectedVisit(null);
      loadData();
    } catch (err) {
      showNotification('error', 'සුරැකීම අසාර්ථකයි: ' + err.message);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedVisit.patient?.full_name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                  NIC: {selectedVisit.patient?.nic || 'No NIC'} | දුරකථන: {selectedVisit.patient?.phone} | ලිංගය: {selectedVisit.patient?.gender === 'male' ? 'පුරුෂ' : 'ස්ත්‍රී'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedVisit.patient?.allergies?.map((al, i) => (
                    <span key={i} className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <AlertTriangle size={12} style={{ marginRight: '4px' }} /> අසාත්මික: {al}
                    </span>
                  ))}
                  {selectedVisit.patient?.chronic_illnesses?.map((ill, i) => (
                    <span key={i} className="badge badge-warning" key={i}>දීර්ඝකාලීන: {ill}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  Queue No: {selectedVisit.queue_number}
                </span>
                {/* Vitals display */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  {selectedVisit.systolic_bp && <span>BP: {selectedVisit.systolic_bp}/{selectedVisit.diastolic_bp}</span>}
                  {selectedVisit.temperature && <span>Temp: {selectedVisit.temperature}°C</span>}
                  {selectedVisit.weight_kg && <span>Weight: {selectedVisit.weight_kg}kg</span>}
                </div>
              </div>
            </div>

            {/* Medical Documentation Form */}
            <form onSubmit={handleSubmitConsultation}>
              {/* Vitals & symptoms */}
              <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>රෝගියා පැමිණි හේතුව:</strong>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem', color: 'var(--foreground)', fontStyle: 'italic' }}>
                  "{selectedVisit.chief_complaint}"
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>සොයාගත් රෝග ලක්ෂණ (Symptoms)</label>
                  <input 
                    type="text" 
                    placeholder="උදා: උණ, පපුවේ සෙම, හුස්ම ගැනීමේ අපහසුව"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>රෝග විනිශ්චය (Diagnosis) *</label>
                  <input 
                    type="text" 
                    placeholder="උදා: Viral Fever / Bronchial Asthma"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formFull}`}>
                  <label className={styles.formLabel}>වෛද්‍ය උපදෙස් සහ සටහන් (Clinical Notes)</label>
                  <textarea 
                    rows="2"
                    placeholder="විවේකය, ජලය පානය කිරීම සහ සායනයට පැමිණීම පිළිබඳ උපදෙස්..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Lab Request Module */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
                  <span>ලැබ් පරීක්ෂණ නිර්දේශ කිරීම (Recommend Lab Tests)</span>
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
                  <span>E-Prescription Builder (ඖෂධ නියම කිරීම)</span>
                </h4>

                {/* Search & Add row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem', alignItems: 'end' }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>ඖෂධය සොයන්න (Brand/Generic)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="උදා: Paracetamol හෝ Panadol"
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
                            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>ඖෂධ හමුනොවිණි.</div>
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
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>මාත්‍රාව (Dosage)</label>
                    <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>වාර ගණන (Freq)</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ padding: '0.6rem 0.5rem' }}>
                      <option value="TID">TID (දිනට 3යි)</option>
                      <option value="BID">BID (දිනට 2යි)</option>
                      <option value="OD">OD (දිනට 1යි)</option>
                      <option value="QID">QID (දිනට 4යි)</option>
                      <option value="PRN">PRN (අවශ්‍ය පරිදි)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>දින (Days)</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel} style={{ fontSize: '0.75rem' }}>උපදෙස් (Instructions)</label>
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
                        <th style={{ padding: '0.5rem' }}>ඖෂධ නාමය</th>
                        <th style={{ padding: '0.5rem' }}>මාත්‍රාව</th>
                        <th style={{ padding: '0.5rem' }}>වාරය</th>
                        <th style={{ padding: '0.5rem' }}>දින ගණන</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>මුළු ප්‍රමාණය</th>
                        <th style={{ padding: '0.5rem' }}>උපදෙස්</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>ඉවත් කිරීම</th>
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
                  <span>රෝගී පරීක්ෂාව අවසන් කරන්න (Submit & Complete)</span>
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
                  පසුවට තබන්න (Hold)
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', textAlign: 'center', minHeight: '300px' }}>
            <Stethoscope size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>කරුණාකර රෝගී පරීක්ෂාව ඇරඹීමට පෝලිමෙන් (Queue) රෝගියෙක් තෝරාගන්න.</h3>
          </div>
        )}
      </div>

      {/* Right Pane: Waiting Queue */}
      <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <Users size={20} />
          <span>අද දින සායන පෝලිම ({activeQueue.length})</span>
        </h3>

        {notif.text && (
          <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`} style={{ marginTop: '0.5rem' }}>
            <span>{notif.text}</span>
          </div>
        )}

        <div className={styles.queueList}>
          {activeQueue.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>පෝලිමේ රෝගීන් නොමැත.</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={styles.queueNumber}>{visit.queue_number}</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{visit.patient?.full_name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                      ලිංගය: {visit.patient?.gender === 'male' ? 'පුරුෂ' : 'ස්ත්‍රී'} | Vitals: {visit.temperature}°C, BP: {visit.systolic_bp || '?'}/{visit.diastolic_bp || '?'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${visit.status === 'in_consultation' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {visit.status === 'in_consultation' ? 'කාමරය තුළ' : 'පොරොත්තුවෙන්'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
