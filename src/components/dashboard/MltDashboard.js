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
  CheckCircle2
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function MltDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed
  
  const [selectedReq, setSelectedReq] = useState(null);
  
  // Results form
  const [resultValue, setResultValue] = useState('');
  const [remarks, setRemarks] = useState('');

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const r = await db.getLabRequests();
      setRequests(r || []);
    } catch (err) {
      console.error(err);
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
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }} className="no-print">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`btn-secondary ${activeTab === 'pending' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Pending Requests
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`btn-secondary ${activeTab === 'completed' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Completed Reports
        </button>
      </div>

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
