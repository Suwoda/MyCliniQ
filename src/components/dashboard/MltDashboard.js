'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  FlaskConical, 
  Clock, 
  Check, 
  Beaker, 
  FileSpreadsheet, 
  Printer, 
  Search,
  CheckCircle2,
  DollarSign,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function MltDashboard() {
  const [requests, setRequests] = useState([]);
  // Tab control synced with sidebar
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('activeDashboardTab');
      return saved === 'overview' ? 'pending' : (saved || 'pending');
    }
    return 'pending';
  });

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('activeDashboardTab', tab);
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: tab }));
  };

  useEffect(() => {
    const handleTabChange = (e) => {
      const tab = e.detail;
      setActiveTab(tab === 'overview' ? 'pending' : tab);
    };
    window.addEventListener('dashboard-tab-changed', handleTabChange);

    // Sync initial state
    const initialTab = sessionStorage.getItem('activeDashboardTab') || 'overview';
    setActiveTab(initialTab === 'overview' ? 'pending' : initialTab);

    return () => window.removeEventListener('dashboard-tab-changed', handleTabChange);
  }, []);

  const [selectedReq, setSelectedReq] = useState(null);
  
  // Results form
  const [resultValue, setResultValue] = useState('');
  const [remarks, setRemarks] = useState('');

  const [notif, setNotif] = useState({ type: '', text: '' });

  // Additional States for Lab Cashier & Settlements
  const [patients, setPatients] = useState([]);
  const [labCatalog, setLabCatalog] = useState([]);
  const [weeklyBalances, setWeeklyBalances] = useState([]);
  
  // Direct Lab Collection Form States
  const [directPatientType, setDirectPatientType] = useState('registered'); // 'registered' or 'walkin'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinGender, setWalkinGender] = useState('male');
  const [walkinDob, setWalkinDob] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [paymentReceived, setPaymentReceived] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  // Weekly Settlement States
  const [settleStartDate, setSettleStartDate] = useState('');
  const [settleEndDate, setSettleEndDate] = useState('');
  const [settleExpected, setSettleExpected] = useState(0);
  const [settleActual, setSettleActual] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const r = await db.getLabRequests();
      setRequests(r || []);
      const p = await db.getPatients();
      setPatients(p || []);
      const t = await db.getLabTests();
      setLabCatalog(t || []);
      const b = await db.getLabWeeklyBalances();
      setWeeklyBalances(b || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateRevenue = async () => {
    if (!settleStartDate || !settleEndDate) {
      showNotification('error', 'කරුණාකර ආරම්භක සහ අවසාන දිනයන් තෝරන්න.');
      return;
    }
    try {
      const total = await db.getLabRevenueForPeriod(settleStartDate, settleEndDate);
      setSettleExpected(total);
      showNotification('success', `Expected revenue: LKR ${total.toFixed(2)}`);
    } catch (err) {
      showNotification('error', 'Error calculating revenue: ' + err.message);
    }
  };

  const handleSaveWeeklyBalance = async (e) => {
    e.preventDefault();
    if (!settleStartDate || !settleEndDate || settleActual === '') {
      showNotification('error', 'කරුණාකර සියලු විස්තර සහ සැබෑ මුදල ඇතුළත් කරන්න.');
      return;
    }
    try {
      const uName = sessionStorage.getItem('userName') || 'mlt';
      await db.addLabWeeklyBalance(settleStartDate, settleEndDate, settleExpected, settleActual, settleNotes, uName);
      showNotification('success', 'සතිපතා පියවීම් වාර්තාව සාර්ථකව කළමනාකරු වෙත යොමු කරන ලදී.');
      setSettleStartDate('');
      setSettleEndDate('');
      setSettleExpected(0);
      setSettleActual('');
      setSettleNotes('');
      loadData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleCollectLabPayment = async (e) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      showNotification('error', 'කරුණාකර අවම වශයෙන් එක් පරීක්ෂණයක්වත් තෝරන්න.');
      return;
    }

    let patientId = '';
    let patObj = null;

    if (directPatientType === 'registered') {
      if (!selectedPatient) {
        showNotification('error', 'කරුණාකර රෝගියෙකු තෝරන්න.');
        return;
      }
      patientId = selectedPatient.id;
      patObj = selectedPatient;
    } else {
      if (!walkinName || !walkinPhone) {
        showNotification('error', 'කරුණාකර රෝගියාගේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න.');
        return;
      }
      try {
        const dob = walkinDob || '1990-01-01';
        const newPat = await db.addPatient({
          full_name: walkinName,
          phone: walkinPhone,
          gender: walkinGender,
          date_of_birth: dob,
          prefix: 'Mr.',
          address: 'Walk-in'
        });
        patientId = newPat.id;
        patObj = newPat;
      } catch (err) {
        showNotification('error', 'Failed to register patient: ' + err.message);
        return;
      }
    }

    const totalCost = selectedTests.reduce((sum, tId) => {
      const t = labCatalog.find(tc => tc.id === tId);
      return sum + (t ? parseFloat(t.cost) : 0);
    }, 0);

    const received = parseFloat(paymentReceived) || 0;
    if (received < totalCost) {
      showNotification('error', `අවම මුදල: LKR ${totalCost.toFixed(2)} විය යුතුය.`);
      return;
    }

    try {
      // 1. Create a Completed Visit for Lab Test
      const visit = await db.addVisit({
        patient_id: patientId,
        queue_number: 999, // Walk-in indicator
        chief_complaint: 'Direct Lab Request',
        status: 'completed',
        visit_type: 'lab',
        doctor_fee: 0,
        center_fee: totalCost,
        payment_status: 'paid'
      });

      // 2. Add Lab requests under this visit
      await db.addLabRequests(visit.id, patientId, selectedTests, null);

      const changeDue = received - totalCost;
      setReceiptData({
        patient: patObj,
        tests: selectedTests.map(tId => labCatalog.find(tc => tc.id === tId)).filter(Boolean),
        total: totalCost,
        received,
        change: changeDue,
        receiptNo: 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date().toLocaleString()
      });

      showNotification('success', 'මුදල් ගෙවීම සාර්ථකයි! ලදුපත මුද්‍රණය කිරීමට සූදානම්.');
      
      // Clear forms
      setSelectedPatient(null);
      setPatientSearchQuery('');
      setWalkinName('');
      setWalkinPhone('');
      setWalkinGender('male');
      setWalkinDob('');
      setSelectedTests([]);
      setPaymentReceived('');
      loadData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

  const handleCollectSample = async (id) => {
    if (isDemoMode()) {
      const reqs = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
      const idx = reqs.findIndex(r => r.id === id);
      if (idx !== -1) {
        reqs[idx].status = 'collected';
        localStorage.setItem('mycliniq_lab_requests', JSON.stringify(reqs));
      }
      showNotification('success', 'Blood/urine sample collected successfully.');
      loadData();
      return;
    }

    try {
      const { error } = await supabase.from('lab_requests').update({ status: 'collected' }).eq('id', id);
      if (error) throw error;
      showNotification('success', 'Sample collected successfully.');
      loadData();
    } catch (err) {
      showNotification('error', 'Failed: ' + err.message);
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!selectedReq || !resultValue) {
      showNotification('error', 'Please enter the test result value.');
      return;
    }

    try {
      await db.updateLabResult(selectedReq.id, resultValue, remarks, 'mlt1');
      showNotification('success', `Lab report for ${selectedReq.patient?.full_name} (${selectedReq.test?.test_name}) created successfully.`);
      setSelectedReq(null);
      setResultValue('');
      setRemarks('');
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to save: ' + err.message);
    }
  };

  const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('isDemo') === 'true';
  };

  const pendingReqs = requests.filter(r => r.status === 'requested' || r.status === 'collected');
  const completedReqs = requests.filter(r => r.status === 'completed');

  const triggerPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div>

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger} no-print`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tab 1: Pending requests */}
      {activeTab === 'pending' && (
        <div className={`${styles.workGrid} no-print`}>
          {/* Left panel: Result Entry Card */}
          <div className="glass-card animate-fade-in">
            {selectedReq ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{selectedReq.test?.test_name}</h3>
                    <p style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '0.25rem' }}>Patient: {selectedReq.patient?.full_name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Phone: {selectedReq.patient?.phone} | Age: {new Date().getFullYear() - new Date(selectedReq.patient?.date_of_birth).getFullYear()} yrs</p>
                  </div>
                  <div>
                    <span className={`badge ${selectedReq.status === 'collected' ? 'badge-primary' : 'badge-warning'}`}>
                      {selectedReq.status === 'collected' ? 'Sample Collected' : 'Sample Required'}
                    </span>
                  </div>
                </div>

                {selectedReq.status === 'requested' ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--muted-bg)', borderRadius: '12px' }}>
                    <Beaker size={32} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
                    <h4>Please collect the test sample (Blood/Urine/etc.) from the patient.</h4>
                    <button 
                      onClick={() => handleCollectSample(selectedReq.id)}
                      className="btn-primary" 
                      style={{ marginTop: '1.5rem' }}
                    >
                      <Check size={16} />
                      <span>Mark Sample as Collected</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveResult} className={styles.formGrid}>
                    <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>Reference Range: <strong>{selectedReq.test?.reference_range} {selectedReq.test?.unit}</strong></span>
                      <span>Test Cost: <strong>LKR {parseFloat(selectedReq.test?.cost).toFixed(2)}</strong></span>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Observed Result Value *</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Enter observed value"
                          value={resultValue}
                          onChange={(e) => setResultValue(e.target.value)}
                        />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedReq.test?.unit}</span>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>MLT Remarks / Observations</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Normal / High / Borderline"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>

                    <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                      <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        <CheckCircle2 size={16} />
                        <span>Submit & Save Lab Report</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', minHeight: '300px' }}>
                <FlaskConical size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Please select a patient from the list to enter lab test results.</h3>
              </div>
            )}
          </div>

          {/* Right panel: pending requests list */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <Clock size={20} />
              <span>Recommended Lab Tests ({pendingReqs.length})</span>
            </h3>

            <div className={styles.queueList} style={{ marginTop: '1rem' }}>
              {pendingReqs.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>No pending lab requests.</p>
              ) : (
                pendingReqs.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    style={{ 
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedReq && selectedReq.id === req.id ? 'var(--primary)' : 'var(--card-border)',
                      background: selectedReq && selectedReq.id === req.id ? 'var(--primary-glow)' : 'var(--card-bg)'
                    }}
                    className={styles.queueItem}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{req.patient?.full_name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.25rem' }}>
                        {req.test?.test_name}
                      </div>
                    </div>
                    <span className={`badge ${req.status === 'collected' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {req.status === 'collected' ? 'Sample Collected' : 'Sample Required'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Completed Reports List */}
      {activeTab === 'completed' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={20} />
            <span>Completed Lab Reports</span>
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', borderBottom: '2px solid var(--card-border)' }}>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Test Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Observed Result</th>
                <th style={{ padding: '0.75rem' }}>Reference Range</th>
                <th style={{ padding: '0.75rem' }}>Remarks</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Print</th>
              </tr>
            </thead>
            <tbody>
              {completedReqs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>No completed lab reports found.</td>
                </tr>
              ) : (
                completedReqs.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{req.patient?.full_name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: '500' }}>{req.test?.test_name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {req.result_value} {req.test?.unit}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--secondary)' }}>{req.test?.reference_range} {req.test?.unit}</td>
                    <td style={{ padding: '0.75rem', fontStyle: 'italic' }}>{req.remarks || 'No remarks'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => {
                          setSelectedReq(req);
                          setTimeout(() => triggerPrint(), 100);
                        }} 
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                      >
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Lab Cashier & Settlements */}
      {activeTab === 'lab_billing' && (
        <div className="glass-card animate-fade-in no-print" style={{ color: 'white' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={22} style={{ color: 'var(--primary)' }} />
            <span>ලැබ් අංශයේ මුදල් කවුන්ටරය සහ පියවීම් (Lab Cashier & Settlements)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
            {/* Left Column: Direct Lab Collection Billing */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>ඍජු ලැබ් පරීක්ෂණ ගෙවීම් (Direct Lab Cashier)</h4>
              
              <form onSubmit={handleCollectLabPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Patient Type Select */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.4rem' }}>Patient Category</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="patientType" 
                        value="registered" 
                        checked={directPatientType === 'registered'} 
                        onChange={() => { setDirectPatientType('registered'); setSelectedPatient(null); }} 
                      />
                      Registered Patient
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="patientType" 
                        value="walkin" 
                        checked={directPatientType === 'walkin'} 
                        onChange={() => { setDirectPatientType('walkin'); setSelectedPatient(null); }} 
                      />
                      New Walk-in Patient
                    </label>
                  </div>
                </div>

                {directPatientType === 'registered' ? (
                  /* Select Registered Patient */
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Search Patient *</label>
                    {!selectedPatient ? (
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          placeholder="Type Patient Name, Phone or ID..."
                          value={patientSearchQuery}
                          onChange={(e) => setPatientSearchQuery(e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                        />
                        {patientSearchQuery.trim() && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1d24', border: '1px solid var(--card-border)', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto', zIndex: 10 }}>
                            {patients
                              .filter(p => p.full_name.toLowerCase().includes(patientSearchQuery.toLowerCase()) || p.phone.includes(patientSearchQuery) || p.id.toLowerCase().includes(patientSearchQuery.toLowerCase()))
                              .slice(0, 8)
                              .map(p => (
                                <div 
                                  key={p.id}
                                  onClick={() => { setSelectedPatient(p); setPatientSearchQuery(''); }}
                                  style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.8rem' }}
                                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                  {p.full_name} ({p.phone}) - ID: {p.id}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div>
                          <strong>{selectedPatient.full_name}</strong> ({selectedPatient.phone}) <br/>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Patient ID: {selectedPatient.id}</span>
                        </div>
                        <button type="button" onClick={() => setSelectedPatient(null)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}><X size={16} /></button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Walkin patient details */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Patient Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="Sunil Silva"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Phone Number *</label>
                      <input 
                        type="text" 
                        placeholder="0771234567"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Gender</label>
                      <select 
                        value={walkinGender}
                        onChange={(e) => setWalkinGender(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>DOB (Optional)</label>
                      <input 
                        type="date" 
                        value={walkinDob}
                        onChange={(e) => setWalkinDob(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* Choose Lab Tests */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.4rem' }}>Select Lab Tests *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '0.5rem', background: 'rgba(0,0,0,0.1)' }}>
                    {labCatalog.map(test => {
                      const isChecked = selectedTests.includes(test.id);
                      return (
                        <label 
                          key={test.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            fontSize: '0.8rem', 
                            padding: '0.3rem', 
                            borderRadius: '4px',
                            background: isChecked ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTests([...selectedTests, test.id]);
                              } else {
                                setSelectedTests(selectedTests.filter(id => id !== test.id));
                              }
                            }}
                          />
                          <span>{test.test_name} (LKR {parseFloat(test.cost).toFixed(0)})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Billing Summary & Cash Collection */}
                {selectedTests.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--primary)' }}>
                        LKR {selectedTests.reduce((sum, id) => sum + (labCatalog.find(t => t.id === id)?.cost || 0), 0).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Cash Received (LKR)</label>
                        <input 
                          type="number" 
                          value={paymentReceived}
                          onChange={(e) => setPaymentReceived(e.target.value)}
                          placeholder="0.00"
                          style={{ fontSize: '0.95rem', padding: '0.4rem', fontWeight: 'bold' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Change Due (LKR)</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', paddingTop: '0.4rem' }}>
                          {(() => {
                            const total = selectedTests.reduce((sum, id) => sum + (labCatalog.find(t => t.id === id)?.cost || 0), 0);
                            const rec = parseFloat(paymentReceived) || 0;
                            return rec >= total ? `LKR ${(rec - total).toFixed(2)}` : 'LKR 0.00';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                  disabled={selectedTests.length === 0}
                >
                  <Check size={16} /> Collect Payment & Generate Receipt
                </button>
              </form>
            </div>

            {/* Right Column: Lab Weekly Settlements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fbbf24' }}>සතිපතා කළමනාකරුට මුදල් පියවීම් (Weekly Settlements)</h4>
                
                <form onSubmit={handleSaveWeeklyBalance} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Period Start Date *</label>
                      <input 
                        type="date" 
                        value={settleStartDate}
                        onChange={(e) => setSettleStartDate(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Period End Date *</label>
                      <input 
                        type="date" 
                        value={settleEndDate}
                        onChange={(e) => setSettleEndDate(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleCalculateRevenue}
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                  >
                    Calculate Period Revenue
                  </button>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Expected Lab Revenue:</span>
                      <span style={{ fontWeight: 'bold' }}>LKR {settleExpected.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Actual Cash Handed Over (LKR) *</label>
                    <input 
                      type="number" 
                      value={settleActual}
                      onChange={(e) => setSettleActual(e.target.value)}
                      placeholder="0.00"
                      style={{ fontSize: '0.9rem', padding: '0.5rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Settlement Notes</label>
                    <input 
                      type="text" 
                      value={settleNotes}
                      onChange={(e) => setSettleNotes(e.target.value)}
                      placeholder="e.g. Discrepancies if any, remarks"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                    />
                  </div>

                  {settleActual !== '' && (
                    <div style={{ fontSize: '0.8rem', color: parseFloat(settleActual) - settleExpected >= 0 ? '#34d399' : '#f87171', padding: '0.2rem' }}>
                      <strong>Variance:</strong> LKR {(parseFloat(settleActual) - settleExpected).toFixed(2)}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  >
                    Submit Settlement Report
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Historical Settlements List */}
          <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem' }}>පසුගිය ලැබ් පියවීම් ලේඛනය (Past Weekly Settlements Log)</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Period Start</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Period End</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Expected Revenue</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Submitted Cash</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Variance</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Submitted By</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Notes</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyBalances.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)' }}>පියවීම් වාර්තා කිසිවක් නැත. (No settlement history found)</td>
                    </tr>
                  ) : (
                    weeklyBalances.map(bal => {
                      const diff = parseFloat(bal.actual_amount) - parseFloat(bal.expected_amount);
                      return (
                        <tr key={bal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '0.5rem' }}>{bal.start_date}</td>
                          <td style={{ padding: '0.5rem' }}>{bal.end_date}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>LKR {parseFloat(bal.expected_amount).toFixed(2)}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>LKR {parseFloat(bal.actual_amount).toFixed(2)}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: diff === 0 ? 'inherit' : diff > 0 ? '#34d399' : '#f87171' }}>
                            LKR {diff.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.5rem' }}>{bal.created_by}</td>
                          <td style={{ padding: '0.5rem', color: 'var(--secondary)' }}>{bal.notes || '-'}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              color: bal.status === 'approved' ? '#34d399' : '#fbbf24',
                              background: bal.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
                            }}>
                              {bal.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Lab Direct Collection Receipt Print Modal */}
      {receiptData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '380px', padding: '1.5rem', position: 'relative', color: 'black', background: 'white' }}>
            <button 
              onClick={() => setReceiptData(null)}
              className="no-print"
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Printable Receipt Layout */}
            <div className="print-ticket" style={{ width: '100%', fontFamily: 'monospace', fontSize: '11px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '10px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>MYCLINIQ LABORATORY</h3>
                <p style={{ margin: 0, fontSize: '9px', color: '#555' }}>No 120, Galle Road, Colombo</p>
                <p style={{ margin: 0, fontSize: '9px', color: '#555' }}>Tel: 077-1234567</p>
              </div>

              <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                <div><strong>Receipt No:</strong> {receiptData.receiptNo}</div>
                <div><strong>Date:</strong> {receiptData.date}</div>
                <div><strong>Patient:</strong> {receiptData.patient?.prefix || 'Mr.'} {receiptData.patient?.full_name}</div>
                <div><strong>Phone:</strong> {receiptData.patient?.phone}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px dashed black', borderBottom: '1px dashed black', margin: '8px 0', fontSize: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Test Name</th>
                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.tests.map((test, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '3px 0' }}>{test.test_name}</td>
                      <td style={{ padding: '3px 0', textAlign: 'right' }}>LKR {parseFloat(test.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', marginTop: '4px' }}>
                <span>Total Amount:</span>
                <span>LKR {receiptData.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
                <span>Received:</span>
                <span>LKR {receiptData.received.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10px' }}>
                <span>Change Due:</span>
                <span>LKR {receiptData.change.toFixed(2)}</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px', borderTop: '1px dashed black', paddingTop: '8px', fontSize: '9px' }}>
                Thank you! Stay Safe.<br/>
                <span style={{ fontSize: '8px', color: '#888' }}>MLT Cashier: {sessionStorage.getItem('userName') || 'MLT'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }} className="no-print">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="btn-primary" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button 
                onClick={() => setReceiptData(null)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area for Lab Report Sheets */}
      {selectedReq && selectedReq.status === 'completed' && (
        <div className="print-ticket" style={{ display: 'none', width: '100%', fontFamily: 'sans-serif' }}>
          <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>MyCliniQ Laboratory Reports</h1>
            <p style={{ fontSize: '12px' }}>No 120, Galle Road, Colombo | Tel: 077-1234567 | Email: lab@mycliniq.com</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', fontSize: '12px', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>
            <div>
              <div><strong>Patient Name:</strong> {selectedReq.patient?.full_name}</div>
              <div><strong>Age / Gender:</strong> {new Date().getFullYear() - new Date(selectedReq.patient?.date_of_birth).getFullYear()} Yrs / {selectedReq.patient?.gender}</div>
              <div><strong>Patient Contact:</strong> {selectedReq.patient?.phone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>Report ID:</strong> {selectedReq.id?.toUpperCase().substring(0,8)}</div>
              <div><strong>Date of Test:</strong> {new Date(selectedReq.created_at).toLocaleDateString()}</div>
              <div><strong>Referred By:</strong> Dr. Sunil Perera</div>
            </div>
          </div>

          <h3 style={{ textAlign: 'center', fontSize: '14px', textDecoration: 'underline', marginBottom: '20px' }}>CLINICAL LABORATORY REPORT</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>TEST PARAMETER</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>OBSERVED VALUE</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>UNIT</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>REFERENCE RANGE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{selectedReq.test?.test_name}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{selectedReq.result_value}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>{selectedReq.test?.unit}</td>
                <td style={{ padding: '12px 8px' }}>{selectedReq.test?.reference_range}</td>
              </tr>
            </tbody>
          </table>

          {selectedReq.remarks && (
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px', fontSize: '11px', marginBottom: '40px' }}>
              <strong>Remarks / MLT Observations:</strong><br />
              {selectedReq.remarks}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '60px', fontSize: '11px' }}>
            <div>
              <div style={{ width: '150px', borderTop: '1px solid black', marginTop: '30px', textAlign: 'center' }}>
                Lab Assistant
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ width: '180px', borderTop: '1px solid black', marginTop: '30px', textAlign: 'center' }}>
                Medical Laboratory Technologist<br />
                (MLT Signature & Seal)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
