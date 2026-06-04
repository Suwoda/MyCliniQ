'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  Pill, 
  Clock, 
  Check, 
  Printer, 
  FolderLock, 
  AlertTriangle, 
  Plus,
  Package,
  CalendarRange
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeTab, setActiveTab] = useState('prescriptions'); // prescriptions, catalog, add_stock

  const [selectedRx, setSelectedRx] = useState(null);
  
  // Stock entry form
  const [stockForm, setStockForm] = useState({
    drug_id: '', batch_number: '', expiry_date: '', quantity: '', purchase_price: ''
  });

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
    // Load batches for detailed inventory view
    const loadBatches = () => {
      if (typeof window !== 'undefined') {
        const b = localStorage.getItem('mycliniq_stock_batches');
        setBatches(b ? JSON.parse(b) : []);
      }
    };
    loadBatches();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const p = await db.getPrescriptions();
      const d = await db.getDrugs();
      setPrescriptions(p || []);
      setDrugs(d || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

  const handleDispense = async (rx) => {
    // Prepare items list for stock reduction
    const itemsToDispense = rx.items.map(item => ({
      item_id: item.id,
      drug_id: item.drug_id,
      quantity: item.total_quantity
    }));

    // Verify stock availability first
    for (let item of rx.items) {
      if (item.drug.total_stock < item.total_quantity) {
        showNotification('error', `Low Stock: Insufficient stock for ${item.drug.brand_name} (Available: ${item.drug.total_stock} | Required: ${item.total_quantity}).`);
        return;
      }
    }

    try {
      await db.dispensePrescription(rx.id, itemsToDispense);
      showNotification('success', `Prescription dispensed successfully for ${rx.patient?.full_name}!`);
      setSelectedRx(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Dispensing failed: ' + err.message);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const { drug_id, batch_number, expiry_date, quantity, purchase_price } = stockForm;
    if (!drug_id || !batch_number || !expiry_date || !quantity || !purchase_price) {
      showNotification('error', 'Please enter all required fields correctly.');
      return;
    }

    try {
      await db.addDrugBatch(drug_id, batch_number, expiry_date, parseInt(quantity), parseFloat(purchase_price));
      showNotification('success', 'New stock batch added successfully.');
      setStockForm({
        drug_id: '', batch_number: '', expiry_date: '', quantity: '', purchase_price: ''
      });
      loadData();
      setActiveTab('catalog');
    } catch (err) {
      showNotification('error', 'Failed to add stock batch: ' + err.message);
    }
  };

  // Convert English frequency terms to labels
  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case 'TID': return 'Three times a day (TID) after meals';
      case 'BID': return 'Twice a day (BID) after meals';
      case 'OD': return 'Once a day (OD) after meals';
      case 'QID': return 'Four times a day (QID) after meals';
      case 'PRN': return 'As needed (PRN)';
      default: return freq;
    }
  };

  const triggerPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div>
      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }} className="no-print">
        <button 
          onClick={() => setActiveTab('prescriptions')}
          className={`btn-secondary ${activeTab === 'prescriptions' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Dispense Prescriptions
        </button>
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`btn-secondary ${activeTab === 'catalog' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Drug Catalog & Inventory
        </button>
        <button 
          onClick={() => setActiveTab('add_stock')}
          className={`btn-secondary ${activeTab === 'add_stock' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          Stock In (Add Batch)
        </button>
      </div>

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger} no-print`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tab 1: Prescriptions Dispensing Queue */}
      {activeTab === 'prescriptions' && (
        <div className={`${styles.workGrid} no-print`}>
          {/* Left panel: Active prescription selected */}
          <div className="glass-card animate-fade-in">
            {selectedRx ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{selectedRx.patient?.full_name}</h3>
                    <p style={{ fontSize: '0.8', color: 'var(--secondary)' }}>
                      Gender: {selectedRx.patient?.gender === 'male' ? 'Male' : 'Female'} | Phone: {selectedRx.patient?.phone}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-warning">Prescription Ready</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                      Date: {new Date(selectedRx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Prescribed Drugs:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedRx.items.map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        style={{ 
                          padding: '0.75rem', 
                          background: 'var(--muted-bg)', 
                          border: '1px solid var(--card-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{item.drug?.brand_name}</strong>{' '}
                          <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>({item.drug?.generic_name}) - {item.drug?.strength}</span>
                          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--foreground)' }}>
                            Dosage: {item.dosage} | Frequency: <strong>{item.frequency}</strong> ({getFrequencyLabel(item.frequency)}) | Days: {item.duration}
                          </div>
                          {item.instructions && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontStyle: 'italic' }}>* {item.instructions}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>x{item.total_quantity}</span>
                          <div style={{ fontSize: '0.75rem', color: item.drug?.total_stock >= item.total_quantity ? 'var(--success)' : 'var(--danger)' }}>
                            Stock Available: {item.drug?.total_stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => handleDispense(selectedRx)} className="btn-primary" style={{ flexGrow: 1 }}>
                    <Check size={16} />
                    <span>Dispense & Deduct Stock</span>
                  </button>
                  <button onClick={triggerPrint} className="btn-secondary">
                    <Printer size={16} />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', minHeight: '300px' }}>
                <Pill size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Please select a patient from the queue to dispense medications.</h3>
              </div>
            )}
          </div>

          {/* Right panel: Active prescriptions list */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <Clock size={20} />
              <span>Prescriptions Queue ({prescriptions.length})</span>
            </h3>
            <div className={styles.queueList} style={{ marginTop: '1rem' }}>
              {prescriptions.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>No prescriptions in queue.</p>
              ) : (
                prescriptions.map((rx) => (
                  <div 
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    style={{ 
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedRx && selectedRx.id === rx.id ? 'var(--primary)' : 'var(--card-border)',
                      background: selectedRx && selectedRx.id === rx.id ? 'var(--primary-glow)' : 'var(--card-bg)'
                    }}
                    className={styles.queueItem}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{rx.patient?.full_name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        Drugs Count: {rx.items?.length || 0} | Date: {new Date(rx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Pending</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Drug Catalog */}
      {activeTab === 'catalog' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyStyle: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} />
              <span>Drug Inventory</span>
            </div>
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', borderBottom: '2px solid var(--card-border)' }}>
                <th style={{ padding: '0.75rem' }}>Brand Name</th>
                <th style={{ padding: '0.75rem' }}>Generic Name</th>
                <th style={{ padding: '0.75rem' }}>Form</th>
                <th style={{ padding: '0.75rem' }}>Strength</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total Stock</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Selling Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map(drug => {
                const isLow = drug.total_stock <= drug.reorder_level;
                return (
                  <tr key={drug.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{drug.brand_name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--secondary)' }}>{drug.generic_name}</td>
                    <td style={{ padding: '0.75rem' }}>{drug.form}</td>
                    <td style={{ padding: '0.75rem' }}>{drug.strength}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: isLow ? 'var(--danger)' : 'inherit' }}>
                      {drug.total_stock}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>LKR {parseFloat(drug.selling_price).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {isLow ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-success">Available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Add Stock Form */}
      {activeTab === 'add_stock' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarRange size={20} />
            <span>Add New Drug Stock Batch (Stock In)</span>
          </h3>
          <form onSubmit={handleAddStock} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Drug *</label>
              <select 
                value={stockForm.drug_id} 
                onChange={(e) => setStockForm({ ...stockForm, drug_id: e.target.value })}
              >
                <option value="">-- Select Drug --</option>
                {drugs.map(d => (
                  <option key={d.id} value={d.id}>{d.brand_name} ({d.generic_name}) - {d.strength}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Batch Number *</label>
              <input 
                type="text" 
                placeholder="e.g. BAT-509"
                value={stockForm.batch_number}
                onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expiry Date *</label>
              <input 
                type="date" 
                value={stockForm.expiry_date}
                onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Quantity Received *</label>
              <input 
                type="number" 
                placeholder="e.g. 500"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Purchase Price (Per Unit) *</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="e.g. 5.50"
                value={stockForm.purchase_price}
                onChange={(e) => setStockForm({ ...stockForm, purchase_price: e.target.value })}
              />
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <Plus size={16} />
                <span>Update Stock</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hidden print area for Thermal receipts (58/80mm ticket size) */}
      {selectedRx && (
        <div className="print-ticket" style={{ display: 'none' }}>
          <div className="print-ticket-title">MyCliniQ Medical Center</div>
          <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '8px' }}>No 120, Galle Road, Colombo | 077-1234567</div>
          
          <div className="print-ticket-meta">
            <div>Patient: {selectedRx.patient?.full_name}</div>
            <div>Phone: {selectedRx.patient?.phone}</div>
            <div>Date: {new Date().toLocaleDateString('en-US')}</div>
            <div>Doctor: Dr. Sunil Perera</div>
          </div>
          
          <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '5px' }}>Prescription Dispensed Receipt</div>
          
          <div className="print-ticket-items">
            {selectedRx.items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '8px', fontSize: '10px' }}>
                <div className="print-ticket-item-row" style={{ fontWeight: 'bold' }}>
                  <span>{idx + 1}. {item.drug?.brand_name} ({item.drug?.strength})</span>
                  <span>x{item.total_quantity}</span>
                </div>
                <div style={{ fontSize: '9px', fontStyle: 'italic', paddingLeft: '8px' }}>
                  {item.dosage} | {getFrequencyLabel(item.frequency)}
                </div>
                {item.instructions && <div style={{ fontSize: '8px', paddingLeft: '8px' }}>* {item.instructions}</div>}
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '9px', borderTop: '1px dashed black', paddingTop: '8px' }}>
            Wish you a speedy recovery!<br />
            Thank you. Stay Healthy!
          </div>
        </div>
      )}
    </div>
  );
}
