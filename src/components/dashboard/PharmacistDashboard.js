'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  Pill, 
  Clock, 
  Check, 
  Printer, 
  AlertTriangle, 
  Plus,
  Package,
  CalendarRange,
  Search,
  ChevronDown,
  ChevronUp,
  Percent,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function PharmacistDashboard() {
  const [pendingBills, setPendingBills] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [discount, setDiscount] = useState('0');
  const [paymentReceived, setPaymentReceived] = useState('');
  
  // Tab control synced with sidebar
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('activeDashboardTab');
      return saved === 'overview' ? 'prescriptions' : (saved || 'prescriptions');
    }
    return 'prescriptions';
  });

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('activeDashboardTab', tab);
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: tab }));
  };

  useEffect(() => {
    const handleTabChange = (e) => {
      const tab = e.detail;
      setActiveTab(tab === 'overview' ? 'prescriptions' : tab);
    };
    window.addEventListener('dashboard-tab-changed', handleTabChange);

    // Sync initial state
    const initialTab = sessionStorage.getItem('activeDashboardTab') || 'overview';
    setActiveTab(initialTab === 'overview' ? 'prescriptions' : initialTab);

    return () => window.removeEventListener('dashboard-tab-changed', handleTabChange);
  }, []);

  const [selectedRx, setSelectedRx] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInPatientName, setWalkInPatientName] = useState('Walk-in Patient');
  const [walkInItems, setWalkInItems] = useState([]);
  const [curItem, setCurItem] = useState({
    drug_id: '',
    quantity: '',
    dosage: '1 tab',
    frequency: 'OD',
    duration: '5 days',
    instructions: ''
  });
  
  // Search and Filter states for Inventory
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('all'); // all, low_stock, near_expiry, expired
  const [expandedDrugId, setExpandedDrugId] = useState(null);

  // New Drug Registration Form
  const [newDrugForm, setNewDrugForm] = useState({
    brand_name: '',
    generic_name: '',
    manufacturer: '',
    form: 'tablet',
    route: 'oral',
    strength: '',
    reorder_level: '50'
  });

  // Stock Entry Batch Form
  const [stockForm, setStockForm] = useState({
    drug_id: '',
    batch_number: '',
    expiry_date: '',
    quantity: '',
    purchase_price: '',
    selling_price: '',
    bonus_quantity: '0'
  });

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const p = await db.getPendingBills();
      const d = await db.getDrugs();
      const b = await db.getBatches();
      setPendingBills(p || []);
      setDrugs(d || []);
      setBatches(b || []);
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

  const handleCollectPayment = async (bill) => {
    let doctorFee = parseFloat(bill.doctor_fee) || 0;
    let centerFee = parseFloat(bill.center_fee) || 0;
    
    let rxSubtotal = 0;
    const rxItemsList = bill.prescription?.items || [];
    
    // Verify drug stocks before proceeding
    for (let item of rxItemsList) {
      if (item.drug && item.drug.total_stock < item.total_quantity) {
        showNotification('error', `Low Stock: Insufficient stock for ${item.drug.brand_name} (Available: ${item.drug.total_stock} | Required: ${item.total_quantity}).`);
        return;
      }
      const price = parseFloat(item.drug?.selling_price) || 0;
      rxSubtotal += price * (parseInt(item.total_quantity) || 0);
    }

    let labSubtotal = 0;
    const labRequestsList = bill.lab_requests || [];
    labRequestsList.forEach(lr => {
      labSubtotal += parseFloat(lr.test?.cost) || 0;
    });

    const subtotal = doctorFee + centerFee + rxSubtotal + labSubtotal;
    const discVal = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, subtotal - discVal);
    const receivedVal = parseFloat(paymentReceived) || 0;
    const changeDue = Math.max(0, receivedVal - grandTotal);

    if (receivedVal < grandTotal) {
      showNotification('error', `Insufficient Payment. Grand Total is LKR ${grandTotal.toFixed(2)}, but only LKR ${receivedVal.toFixed(2)} was received.`);
      return;
    }

    try {
      await db.collectPayment(bill.id, {
        bill_amount: grandTotal,
        discount: discVal,
        payment_received: receivedVal,
        change_due: changeDue
      });
      showNotification('success', `Payment collected successfully for ${bill.patient?.full_name}! Bill amount: LKR ${grandTotal.toFixed(2)}.`);
      
      // Update the selected bill local state to reflect paid status and allow receipt printing
      setSelectedBill({
        ...bill,
        payment_status: 'paid',
        bill_amount: grandTotal,
        discount: discVal,
        payment_received: receivedVal,
        change_due: changeDue
      });
      
      loadData();
    } catch (err) {
      showNotification('error', 'Payment collection failed: ' + err.message);
    }
  };

  const handleRegisterDrug = async (e) => {
    e.preventDefault();
    const { brand_name, generic_name, manufacturer, form, route, strength, reorder_level } = newDrugForm;
    if (!brand_name || !generic_name || !manufacturer || !strength) {
      showNotification('error', 'Please enter all required drug details correctly.');
      return;
    }

    try {
      await db.addDrug({
        brand_name,
        generic_name,
        manufacturer,
        form,
        route,
        strength,
        reorder_level: parseInt(reorder_level) || 50
      });
      showNotification('success', `Drug '${brand_name}' registered in catalog successfully.`);
      setNewDrugForm({
        brand_name: '',
        generic_name: '',
        manufacturer: '',
        form: 'tablet',
        route: 'oral',
        strength: '',
        reorder_level: '50'
      });
      loadData();
      handleSetActiveTab('catalog');
    } catch (err) {
      showNotification('error', 'Failed to register drug: ' + err.message);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const { drug_id, batch_number, expiry_date, quantity, purchase_price, selling_price, bonus_quantity } = stockForm;
    if (!drug_id || !batch_number || !expiry_date || !quantity || !purchase_price || !selling_price) {
      showNotification('error', 'Please enter all required fields correctly.');
      return;
    }

    try {
      const parsedQty = parseInt(quantity);
      const parsedCost = parseFloat(purchase_price);
      const parsedSelling = parseFloat(selling_price);
      const parsedBonus = parseInt(bonus_quantity) || 0;

      await db.addDrugBatch(
        drug_id, 
        batch_number, 
        expiry_date, 
        parsedQty, 
        parsedCost, 
        parsedSelling, 
        parsedBonus
      );

      showNotification('success', 'New stock batch added successfully.');
      setStockForm({
        drug_id: '', batch_number: '', expiry_date: '', quantity: '', purchase_price: '', selling_price: '', bonus_quantity: '0'
      });
      loadData();
      handleSetActiveTab('catalog');
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

  // Calculate Batch Expiry Status
  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { label: 'Expired', color: '#ef4444', code: 'red' };
    } else if (diffDays <= 180) { // expiring in 6 months
      return { label: `Expiring in ${Math.round(diffDays / 30)} mo (${diffDays} d)`, color: '#eab308', code: 'yellow' };
    } else {
      return { label: 'Active', color: '#10b981', code: 'green' };
    }
  };

  // Calculate Profit Markup %
  const calculateMarkup = (cost, selling) => {
    const parsedCost = parseFloat(cost) || 0;
    const parsedSelling = parseFloat(selling) || 0;
    if (parsedCost <= 0) return '0%';
    const profit = parsedSelling - parsedCost;
    const markup = (profit / parsedCost) * 100;
    return `${markup.toFixed(0)}%`;
  };

  // Live FIFO preview for the current item in the builder
  const getLiveFifoPreview = (drugId, qtyStr) => {
    const qty = parseInt(qtyStr) || 0;
    if (!drugId || qty <= 0) return null;
    
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return null;

    let qtyLeft = qty;
    const allocatedBatches = [];
    const drugBatches = batches
      .filter(b => b.drug_id === drugId && b.quantity_remaining > 0)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

    for (let b of drugBatches) {
      if (qtyLeft <= 0) break;
      const deduct = Math.min(qtyLeft, b.quantity_remaining);
      allocatedBatches.push({
        batch_number: b.batch_number,
        qty: deduct,
        expiry_date: b.expiry_date
      });
      qtyLeft -= deduct;
    }

    return { allocatedBatches, qtyLeft, totalStock: drug.total_stock };
  };

  // Filter & Search Drugs List
  const filteredDrugs = drugs.filter(drug => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      drug.brand_name.toLowerCase().includes(query) || 
      drug.generic_name.toLowerCase().includes(query) || 
      (drug.manufacturer && drug.manufacturer.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // 2. Quick Filter Tabs
    const isLowStock = drug.total_stock <= drug.reorder_level;
    
    // Check batch dates for expiry
    const drugBatches = batches.filter(b => b.drug_id === drug.id && b.quantity_remaining > 0);
    const hasExpired = drugBatches.some(b => {
      const daysLeft = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 0;
    });
    const hasNearExpiry = drugBatches.some(b => {
      const daysLeft = Math.ceil((new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 180;
    });

    if (catalogFilter === 'low_stock') return isLowStock;
    if (catalogFilter === 'near_expiry') return hasNearExpiry;
    if (catalogFilter === 'expired') return hasExpired;

    return true;
  });

  // Get preview properties of selected drug in Stock In
  const selectedDrugInForm = drugs.find(d => d.id === stockForm.drug_id);

  // Auto-calculated fields for Stock In form
  const totalStockAdded = (parseInt(stockForm.quantity) || 0) + (parseInt(stockForm.bonus_quantity) || 0);
  const markupPercent = calculateMarkup(stockForm.purchase_price, stockForm.selling_price);

  // Selected Bill calculations
  let doctorFee = 0;
  let centerFee = 0;
  let rxSubtotal = 0;
  let labSubtotal = 0;
  let rxItemsList = [];
  let labRequestsList = [];

  if (selectedBill) {
    doctorFee = parseFloat(selectedBill.doctor_fee) || 0;
    centerFee = parseFloat(selectedBill.center_fee) || 0;
    rxItemsList = selectedBill.prescription?.items || [];
    rxItemsList.forEach(item => {
      const price = parseFloat(item.drug?.selling_price) || 0;
      rxSubtotal += price * (parseInt(item.total_quantity) || 0);
    });
    labRequestsList = selectedBill.lab_requests || [];
    labRequestsList.forEach(lr => {
      labSubtotal += parseFloat(lr.test?.cost) || 0;
    });
  }

  const subtotal = doctorFee + centerFee + rxSubtotal + labSubtotal;
  const discVal = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discVal);
  const receivedVal = parseFloat(paymentReceived) || 0;
  const changeDue = receivedVal > 0 ? Math.max(0, receivedVal - grandTotal) : 0;

  return (
    <div>
      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger} no-print`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tab 1: Prescriptions/Billing & Dispensing Hub */}
      {activeTab === 'prescriptions' && (
        <div className={`${styles.workGrid} no-print`}>
          {/* Left panel: Active bills queue */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', gap: '0.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Clock size={20} />
                <span>Pending Payments Queue ({pendingBills.length})</span>
              </h3>
              <button 
                onClick={() => {
                  setIsWalkIn(true);
                  setSelectedBill(null);
                  setSelectedRx(null);
                }}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <Plus size={12} /> Walk-in Rx
              </button>
            </div>
            <div className={styles.queueList} style={{ marginTop: '1rem' }}>
              {pendingBills.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>No pending bills in queue.</p>
              ) : (
                pendingBills.map((bill) => {
                  const drugsCount = bill.prescription?.items?.length || 0;
                  const labsCount = bill.lab_requests?.length || 0;
                  const isOPD = bill.visit_type === 'opd';
                  const isLab = bill.visit_type === 'lab';
                  const isChanneling = bill.visit_type === 'channeling';

                  return (
                    <div 
                      key={bill.id}
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsWalkIn(false);
                        setSelectedRx(null);
                        setDiscount('0');
                        setPaymentReceived('');
                      }}
                      style={{ 
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedBill && selectedBill.id === bill.id ? 'var(--primary)' : 'var(--card-border)',
                        background: selectedBill && selectedBill.id === bill.id ? 'var(--primary-glow)' : 'var(--card-bg)'
                      }}
                      className={styles.queueItem}
                    >
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>
                            {bill.patient?.full_name || 'Unregistered Patient'}
                          </h4>
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                            No: {bill.queue_number}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {isOPD && <span>OPD Consult</span>}
                          {isLab && <span>Lab Only ({labsCount} Tests)</span>}
                          {isChanneling && <span>Channeling (Specialist)</span>}
                          {drugsCount > 0 && <span>| {drugsCount} Meds</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        {isOPD && <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>OPD</span>}
                        {isLab && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>LAB</span>}
                        {isChanneling && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>CHANNEL</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Active billing details / dispensation interface */}
          <div className="glass-card animate-fade-in">
            {isWalkIn ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Direct Walk-in Dispensation</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      Create and dispense direct prescriptions on-the-fly.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        setIsWalkIn(false);
                        setSelectedRx(null);
                        setSelectedBill(null);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Back to Queue
                    </button>
                  </div>
                </div>

                {/* Patient Name input */}
                <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                  <label className={styles.formLabel}>Patient / Customer Name *</label>
                  <input 
                    type="text" 
                    value={walkInPatientName} 
                    onChange={(e) => setWalkInPatientName(e.target.value)} 
                    placeholder="e.g. Walk-in Patient or John Doe"
                  />
                </div>

                {/* Item Builder */}
                <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', padding: '1rem', background: 'rgba(255, 255, 255, 0.01)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
                    <Plus size={16} /> Add Prescription Item
                  </h4>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.formLabel}>Select Drug *</label>
                      <select 
                        value={curItem.drug_id} 
                        onChange={(e) => setCurItem({ ...curItem, drug_id: e.target.value })}
                      >
                        <option value="">-- Select Drug --</option>
                        {[...drugs].sort((a,b) => a.brand_name.localeCompare(b.brand_name)).map(d => (
                          <option key={d.id} value={d.id}>{d.brand_name} ({d.generic_name}) - {d.strength} [{d.form}] (Stock: {d.total_stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Quantity *</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 30"
                        value={curItem.quantity}
                        onChange={(e) => setCurItem({ ...curItem, quantity: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Dosage</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1 tab"
                        value={curItem.dosage}
                        onChange={(e) => setCurItem({ ...curItem, dosage: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Frequency</label>
                      <select 
                        value={curItem.frequency} 
                        onChange={(e) => setCurItem({ ...curItem, frequency: e.target.value })}
                      >
                        <option value="OD">Once a day (OD)</option>
                        <option value="BID">Twice a day (BID)</option>
                        <option value="TID">Three times a day (TID)</option>
                        <option value="QID">Four times a day (QID)</option>
                        <option value="PRN">As needed (PRN)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 5 days"
                        value={curItem.duration}
                        onChange={(e) => setCurItem({ ...curItem, duration: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                      <label className={styles.formLabel}>Instructions</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Before meal (optional)"
                        value={curItem.instructions}
                        onChange={(e) => setCurItem({ ...curItem, instructions: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Live FIFO Allocation Preview */}
                  {curItem.drug_id && parseInt(curItem.quantity) > 0 && (
                    <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px dashed var(--card-border)' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--secondary)' }}>Live FIFO Batch Preview:</div>
                      {(() => {
                        const preview = getLiveFifoPreview(curItem.drug_id, curItem.quantity);
                        if (!preview) return null;
                        const { allocatedBatches, qtyLeft } = preview;
                        
                        return (
                          <div>
                            {allocatedBatches.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                                {allocatedBatches.map((ab, i) => (
                                  <span key={i} style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.75rem' }}>
                                    Batch {ab.batch_number} ({ab.qty} units) | Exp: {new Date(ab.expiry_date).toLocaleDateString()}
                                  </span>
                                ))}
                                {qtyLeft > 0 && (
                                  <span style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem' }}>
                                    Deficit: {qtyLeft} units missing!
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>No stock batches available for this drug!</div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={() => {
                      if (!curItem.drug_id || !curItem.quantity) {
                        showNotification('error', 'Please select a drug and quantity to add.');
                        return;
                      }
                      const drug = drugs.find(d => d.id === curItem.drug_id);
                      const qty = parseInt(curItem.quantity);
                      if (qty <= 0) {
                        showNotification('error', 'Quantity must be greater than zero.');
                        return;
                      }
                      
                      const newItem = {
                        drug_id: curItem.drug_id,
                        drug: drug,
                        quantity: qty,
                        dosage: curItem.dosage,
                        frequency: curItem.frequency,
                        duration: curItem.duration,
                        instructions: curItem.instructions
                      };
                      
                      setWalkInItems([...walkInItems, newItem]);
                      setCurItem({
                        drug_id: '',
                        quantity: '',
                        dosage: '1 tab',
                        frequency: 'OD',
                        duration: '5 days',
                        instructions: ''
                      });
                    }}
                    className="btn-secondary" 
                    style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={16} /> Add to Prescription List
                  </button>
                </div>

                {/* List of added items */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Prescription Items List ({walkInItems.length}):</h4>
                  {walkInItems.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                      No items added yet. Use the builder above to add medications.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {walkInItems.map((item, idx) => {
                        const preview = getLiveFifoPreview(item.drug_id, item.quantity);
                        return (
                          <div 
                            key={idx}
                            style={{ 
                              padding: '0.85rem', 
                              background: 'var(--muted-bg)', 
                              border: '1px solid var(--card-border)',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ color: 'var(--primary)' }}>{item.drug?.brand_name}</strong>{' '}
                                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>({item.drug?.generic_name}) - {item.drug?.strength}</span>
                                <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--foreground)' }}>
                                  Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.duration}
                                </div>
                                {item.instructions && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontStyle: 'italic' }}>* {item.instructions}</div>}
                              </div>
                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                <strong style={{ fontSize: '1.1rem' }}>x{item.quantity}</strong>
                                <button 
                                  onClick={() => {
                                    setWalkInItems(walkInItems.filter((_, i) => i !== idx));
                                  }}
                                  style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            {preview && (
                              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>FIFO Source: </span>
                                {preview.allocatedBatches.length > 0 ? (
                                  <span style={{ color: '#10b981' }}>
                                    {preview.allocatedBatches.map(ab => `Batch ${ab.batch_number} (${ab.qty} units)`).join(', ')}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--danger)' }}>No batches available!</span>
                                )}
                                {preview.qtyLeft > 0 && <span style={{ color: 'var(--danger)' }}> (Deficit of {preview.qtyLeft}!)</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                        <button 
                          onClick={async () => {
                            for (let item of walkInItems) {
                              if (item.drug.total_stock < item.quantity) {
                                showNotification('error', `Low Stock: Insufficient stock for ${item.drug.brand_name} (Available: ${item.drug.total_stock} | Required: ${item.quantity}).`);
                                return;
                              }
                            }

                            try {
                              const dispensed = await db.dispenseDirectPrescription(
                                walkInPatientName, 
                                null, 
                                walkInItems
                              );
                              
                              showNotification('success', `Direct prescription dispensed successfully for ${walkInPatientName}!`);
                              
                              setSelectedRx({
                                id: dispensed.id,
                                patient: { full_name: walkInPatientName, phone: 'N/A' },
                                created_at: new Date().toISOString(),
                                items: walkInItems.map(item => ({
                                  drug: item.drug,
                                  total_quantity: item.quantity,
                                  dosage: item.dosage,
                                  frequency: item.frequency,
                                  instructions: item.instructions
                                }))
                              });

                              setWalkInItems([]);
                              setWalkInPatientName('Walk-in Patient');
                              setIsWalkIn(false);
                              loadData();
                            } catch (err) {
                              showNotification('error', 'Dispensing failed: ' + err.message);
                            }
                          }} 
                          className="btn-primary" 
                          style={{ flexGrow: 1 }}
                        >
                          <Check size={16} />
                          <span>Dispense & Deduct Stock</span>
                        </button>
                        <button 
                          onClick={() => {
                            setWalkInItems([]);
                            setIsWalkIn(false);
                          }} 
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedBill ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedBill.patient?.prefix} {selectedBill.patient?.full_name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                      Patient ID: <code>{selectedBill.patient?.id}</code> | Tel: {selectedBill.patient?.phone}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {selectedBill.payment_status === 'paid' ? (
                      <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Paid & Cleared</span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Awaiting Settlement</span>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                      Visit Date: {selectedBill.visit_date}
                    </p>
                  </div>
                </div>

                {/* Professional fees billing detail */}
                {(parseFloat(selectedBill.doctor_fee) > 0 || parseFloat(selectedBill.center_fee) > 0) && (
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.4rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Professional & Clinic Fees
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {parseFloat(selectedBill.doctor_fee) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--secondary)' }}>OPD Consultation Doctor Fee</span>
                          <span style={{ fontWeight: '600' }}>LKR {parseFloat(selectedBill.doctor_fee).toFixed(2)}</span>
                        </div>
                      )}
                      {parseFloat(selectedBill.center_fee) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--secondary)' }}>Center Service / Specialist Channeling Fee</span>
                          <span style={{ fontWeight: '600' }}>LKR {parseFloat(selectedBill.center_fee).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Prescription items list */}
                {selectedBill.prescription?.items?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                      Prescription Drugs & Dispensation
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedBill.prescription.items.map((item, idx) => {
                        const price = parseFloat(item.drug?.selling_price) || 0;
                        const qty = parseInt(item.total_quantity) || 0;
                        const total = price * qty;
                        
                        // FIFO batch preview computation
                        let qtyLeft = qty;
                        const allocatedBatches = [];
                        const drugBatches = batches
                          .filter(b => b.drug_id === item.drug_id && b.quantity_remaining > 0)
                          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

                        for (let b of drugBatches) {
                          if (qtyLeft <= 0) break;
                          const deduct = Math.min(qtyLeft, b.quantity_remaining);
                          allocatedBatches.push({
                            batch_number: b.batch_number,
                            qty: deduct,
                            expiry_date: b.expiry_date
                          });
                          qtyLeft -= deduct;
                        }

                        return (
                          <div 
                            key={item.id || idx} 
                            style={{ 
                              padding: '0.75rem', 
                              background: 'var(--muted-bg)', 
                              border: '1px solid var(--card-border)',
                              borderRadius: '6px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{item.drug?.brand_name || 'Drug'}</strong>{' '}
                                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>({item.drug?.generic_name}) - {item.drug?.strength}</span>
                                <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--foreground)' }}>
                                  Dosage: {item.dosage} | Frequency: {item.frequency} | Days: {item.duration}
                                </div>
                                {item.instructions && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontStyle: 'italic' }}>* {item.instructions}</div>}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>x{qty}</span>
                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--foreground)' }}>LKR {total.toFixed(2)}</div>
                                <div style={{ fontSize: '0.7rem', color: item.drug?.total_stock >= qty ? 'var(--success)' : 'var(--danger)' }}>
                                  Stock: {item.drug?.total_stock || 0}
                                </div>
                              </div>
                            </div>

                            {selectedBill.payment_status === 'pending' && (
                              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>FIFO Allocation:</span>
                                {allocatedBatches.length > 0 ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.15rem' }}>
                                    {allocatedBatches.map((ab, i) => (
                                      <span key={i} style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                        Batch {ab.batch_number} ({ab.qty})
                                      </span>
                                    ))}
                                    {qtyLeft > 0 && (
                                      <span style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                        Deficit: {qtyLeft}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--danger)', marginLeft: '0.25rem' }}>No batch stock available!</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Lab requests list */}
                {selectedBill.lab_requests?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                      Lab Tests / Investigations
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        {selectedBill.lab_requests.map((lr, idx) => {
                          const cost = parseFloat(lr.test?.cost) || 0;
                          return (
                            <tr key={lr.id || idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                              <td style={{ padding: '0.5rem 0', fontWeight: '500' }}>{lr.test?.test_name || 'Lab Test'}</td>
                              <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 'bold' }}>LKR {cost.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Calculator Card */}
                <div style={{ background: 'var(--muted-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--secondary)' }}>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>LKR {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {selectedBill.payment_status === 'pending' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--secondary)' }}>Discount (LKR)</span>
                      <input 
                        type="number" 
                        value={discount} 
                        onChange={(e) => setDiscount(e.target.value)} 
                        placeholder="0.00"
                        style={{ width: '110px', padding: '0.3rem 0.6rem', fontSize: '0.9rem', textAlign: 'right', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--secondary)' }}>Discount Allowed</span>
                      <span style={{ fontWeight: '600', color: 'var(--danger)' }}>- LKR {parseFloat(selectedBill.discount || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '0.6rem', marginBottom: '0.8rem', fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    <span>Grand Total</span>
                    <span>LKR {selectedBill.payment_status === 'paid' ? parseFloat(selectedBill.bill_amount).toFixed(2) : grandTotal.toFixed(2)}</span>
                  </div>

                  {selectedBill.payment_status === 'pending' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--secondary)' }}>Cash Received (LKR)</span>
                      <input 
                        type="number" 
                        value={paymentReceived} 
                        onChange={(e) => setPaymentReceived(e.target.value)} 
                        placeholder="0.00"
                        style={{ width: '130px', padding: '0.3rem 0.6rem', fontSize: '0.95rem', textAlign: 'right', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--secondary)' }}>Cash Received</span>
                      <span style={{ fontWeight: '600' }}>LKR {parseFloat(selectedBill.payment_received || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--card-border)', paddingTop: '0.6rem', fontSize: '1.05rem', fontWeight: 'bold' }}>
                    <span>Change Due</span>
                    <span style={{ color: (selectedBill.payment_status === 'paid' ? parseFloat(selectedBill.change_due || 0) : changeDue) > 0 ? '#34d399' : 'inherit' }}>
                      LKR {selectedBill.payment_status === 'paid' ? parseFloat(selectedBill.change_due || 0).toFixed(2) : changeDue.toFixed(2)}
                    </span>
                  </div>
                  
                  {selectedBill.payment_status === 'pending' && paymentReceived && receivedVal < grandTotal && (
                    <div style={{ marginTop: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={14} />
                      <span>Short Payment: LKR {(grandTotal - receivedVal).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  {selectedBill.payment_status === 'pending' ? (
                    <button 
                      onClick={() => handleCollectPayment(selectedBill)} 
                      className="btn-primary" 
                      style={{ flexGrow: 1 }}
                      disabled={paymentReceived === '' || receivedVal < grandTotal}
                    >
                      <Check size={16} />
                      <span>Collect Payment & Dispense</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.print();
                        }
                      }} 
                      className="btn-primary" 
                      style={{ flexGrow: 1 }}
                    >
                      <Printer size={16} />
                      <span>Print Thermal Receipt</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedBill(null);
                      loadData();
                    }} 
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : selectedRx ? (
              <div>
                {/* Fallback support for direct walk-in receipt printing */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{selectedRx.patient?.full_name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      Phone: {selectedRx.patient?.phone}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success">Walk-in Rx Dispensed</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => window.print()} className="btn-primary" style={{ flexGrow: 1 }}>
                    <Printer size={16} />
                    <span>Print Walk-in Receipt</span>
                  </button>
                  <button onClick={() => setSelectedRx(null)} className="btn-secondary">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', minHeight: '350px', textAlign: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Pill size={48} style={{ marginBottom: '1.25rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', maxWidth: '380px', margin: '0 auto 0.5rem auto' }}>No Bill / Patient Selected</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', maxWidth: '300px' }}>Select an active patient visit from the queue on the left, or dispense a direct walk-in prescription.</p>
                </div>
                
                <button 
                  onClick={() => {
                    setIsWalkIn(true);
                    setSelectedBill(null);
                    setSelectedRx(null);
                  }}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', marginTop: '0.5rem' }}
                >
                  <Plus size={16} />
                  <span>Direct Walk-in Dispensation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Drug Catalog with batches details */}
      {activeTab === 'catalog' && (
        <div className="glass-card animate-fade-in no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Package size={22} style={{ color: 'var(--primary)' }} />
              <span>Drug Inventory Catalog ({drugs.length})</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', flexGrow: 1, maxWidth: '500px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search brand/generic name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }}
                />
              </div>
              <button 
                onClick={() => handleSetActiveTab('register_drug')} 
                className="btn-primary"
                style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> New Drug Definition
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Type</th>
                  <th>Strength</th>
                  <th>Route</th>
                  <th style={{ textAlign: 'center' }}>Total Stock</th>
                  <th style={{ textAlign: 'center' }}>Reorder Level</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrugs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--secondary)', padding: '2rem' }}>
                      No drugs matching search terms.
                    </td>
                  </tr>
                ) : (
                  filteredDrugs.map(drug => {
                    const isExpanded = expandedDrugId === drug.id;
                    const drugBatches = batches.filter(b => b.drug_id === drug.id);
                    const isLowStock = drug.total_stock <= drug.reorder_level;
                    const isOutOfStock = drug.total_stock <= 0;

                    return (
                      <>
                        <tr 
                          key={drug.id} 
                          style={{ 
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--card-border)',
                            background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                          }}
                          onClick={() => setExpandedDrugId(isExpanded ? null : drug.id)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{drug.brand_name}</td>
                          <td>{drug.generic_name}</td>
                          <td style={{ textTransform: 'capitalize' }}>{drug.form}</td>
                          <td>{drug.strength}</td>
                          <td style={{ textTransform: 'capitalize' }}>{drug.route || 'oral'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{drug.total_stock}</td>
                          <td style={{ textAlign: 'center' }}>{drug.reorder_level}</td>
                          <td style={{ textAlign: 'center' }}>
                            {isOutOfStock ? (
                              <span className="badge badge-danger">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="badge badge-warning">Low Stock</span>
                            ) : (
                              <span className="badge badge-success">Available</span>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible batch detail sub-table */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="9" style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--card-border)' }}>
                              <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--secondary-bg)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Layers size={14} style={{ color: 'var(--primary)' }} />
                                  <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', tracking: '0.05em' }}>Stock Batches for {drug.brand_name}</strong>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                  <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--card-border)' }}>
                                      <th style={{ padding: '0.5rem 1rem' }}>Batch Number</th>
                                      <th style={{ padding: '0.5rem 1rem' }}>Expiry Date</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Cost Price (Purchase)</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Selling Price</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Markup / Profit</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Received Qty</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Bonus Qty</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Remaining Stock</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {drugBatches.length === 0 ? (
                                      <tr>
                                        <td colSpan="9" style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                          No stock batches recorded for this drug. Use "Stock In" to add batches.
                                        </td>
                                      </tr>
                                    ) : (
                                      drugBatches.map(b => {
                                        const expiryInfo = getExpiryStatus(b.expiry_date);
                                        const markup = calculateMarkup(b.purchase_price, b.selling_price);
                                        return (
                                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{b.batch_number}</td>
                                            <td style={{ padding: '0.5rem 1rem' }}>{new Date(b.expiry_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>LKR {parseFloat(b.purchase_price).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: '500' }}>LKR {parseFloat(b.selling_price).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#34d399', fontWeight: 'bold' }}>
                                              {markup}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>{b.quantity_received}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#10b981' }}>{b.bonus_quantity || 0}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: 'bold', color: b.quantity_remaining <= 0 ? 'var(--danger)' : 'inherit' }}>
                                              {b.quantity_remaining}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '10px', background: `${expiryInfo.color}15`, color: expiryInfo.color, border: `1px solid ${expiryInfo.color}25` }}>
                                                {expiryInfo.label}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Stock Batch Form (Stock In) */}
      {activeTab === 'add_stock' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarRange size={20} />
            <span>Add Drug Stock Batch (Stock In)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <form onSubmit={handleAddStock} className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
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
                <label className={styles.formLabel}>Bonus Quantity</label>
                <input 
                  type="number" 
                  placeholder="e.g. 50 (optional)"
                  value={stockForm.bonus_quantity}
                  onChange={(e) => setStockForm({ ...stockForm, bonus_quantity: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Purchase Cost (Per Unit) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 5.50"
                  value={stockForm.purchase_price}
                  onChange={(e) => setStockForm({ ...stockForm, purchase_price: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Selling Price (Per Unit) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 8.00"
                  value={stockForm.selling_price}
                  onChange={(e) => setStockForm({ ...stockForm, selling_price: e.target.value })}
                />
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Update Stock Inventory</span>
                </button>
              </div>
            </form>

            {/* Right Panel: Selected Drug Preview and calculations */}
            <div style={{ background: 'var(--secondary-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Selected Drug Specifications</span>
              </h4>

              {selectedDrugInForm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Brand & Generic:</span>
                    <strong>{selectedDrugInForm.brand_name}</strong> ({selectedDrugInForm.generic_name})
                  </div>
                  <div>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Manufacturer:</span>
                    <strong>{selectedDrugInForm.manufacturer || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Form & Strength:</span>
                    <span style={{ textTransform: 'capitalize' }}>{selectedDrugInForm.form}</span> | {selectedDrugInForm.strength}
                  </div>
                  <div>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Route of Administration:</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedDrugInForm.route || 'oral'}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Total Stock to Add:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{totalStockAdded} units</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginTop: '0.15rem' }}>
                      (Quantity: {stockForm.quantity || 0} + Bonus: {stockForm.bonus_quantity || 0})
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--secondary)', display: 'block' }}>Estimated Markup Margin %:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <TrendingUp size={16} /> {markupPercent}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginTop: '0.15rem' }}>
                      (Cost: LKR {parseFloat(stockForm.purchase_price || 0).toFixed(2)} | Sale: LKR {parseFloat(stockForm.selling_price || 0).toFixed(2)})
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', minHeight: '150px', fontSize: '0.85rem' }}>
                  <Pill size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <span>Select a drug from the form to view specifications and calculations.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Register New Drug */}
      {activeTab === 'register_drug' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={22} style={{ color: 'var(--primary)' }} />
            <span>Register New Drug Definition</span>
          </h3>

          <form onSubmit={handleRegisterDrug} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Brand Name / Company Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Panadol, Augmentin"
                value={newDrugForm.brand_name}
                onChange={(e) => setNewDrugForm({ ...newDrugForm, brand_name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Generic Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Paracetamol, Amoxicillin"
                value={newDrugForm.generic_name}
                onChange={(e) => setNewDrugForm({ ...newDrugForm, generic_name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Manufacturer Name *</label>
              <input 
                type="text" 
                placeholder="e.g. GSK Ceylon PLC, SPC, Cipla"
                value={newDrugForm.manufacturer}
                onChange={(e) => setNewDrugForm({ ...newDrugForm, manufacturer: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Strength / Dosage *</label>
              <input 
                type="text" 
                placeholder="e.g. 500mg, 120mg/5ml, 250mcg"
                value={newDrugForm.strength}
                onChange={(e) => setNewDrugForm({ ...newDrugForm, strength: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Drug Form / Type *</label>
              <select 
                value={newDrugForm.form} 
                onChange={(e) => setNewDrugForm({ ...newDrugForm, form: e.target.value })}
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="cream">Cream</option>
                <option value="ointment">Ointment</option>
                <option value="dropper">Dropper/Drops</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
                <option value="suppository">Suppository</option>
                <option value="other">Other Treatment</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Route of Administration *</label>
              <select 
                value={newDrugForm.route} 
                onChange={(e) => setNewDrugForm({ ...newDrugForm, route: e.target.value })}
              >
                <option value="oral">Oral</option>
                <option value="intravenous">Intravenous (IV)</option>
                <option value="intramuscular">Intramuscular (IM)</option>
                <option value="subcutaneous">Subcutaneous (SC)</option>
                <option value="sublingual">Sublingual</option>
                <option value="rectal">Rectal</option>
                <option value="vaginal">Vaginal</option>
                <option value="nasal">Nasal</option>
                <option value="ophthalmic">Ophthalmic</option>
                <option value="otic">Otic</option>
                <option value="nebulization">Nebulization</option>
                <option value="topical">Topical Application</option>
                <option value="inhalation">Inhalation</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reorder Level *</label>
              <input 
                type="number" 
                placeholder="e.g. 100"
                value={newDrugForm.reorder_level}
                onChange={(e) => setNewDrugForm({ ...newDrugForm, reorder_level: e.target.value })}
              />
            </div>

            <div className={styles.formFull} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary">
                <Check size={16} />
                <span>Register Drug Definition</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSetActiveTab('catalog')} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hidden print area for Thermal receipts (58/80mm ticket size) */}
      {(selectedBill || selectedRx) && (
        <div className="print-ticket" style={{ display: 'none' }}>
          <div className="print-ticket-title">MyCliniQ Medical Center</div>
          <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '8px' }}>No 120, Galle Road, Colombo | Tel: 077-1234567</div>
          
          <div className="print-ticket-meta">
            <div>Patient: {selectedBill ? selectedBill.patient?.full_name : selectedRx.patient?.full_name}</div>
            <div>Phone: {selectedBill ? selectedBill.patient?.phone : selectedRx.patient?.phone}</div>
            <div>Date: {new Date().toLocaleDateString('en-US')}</div>
            <div>Visit ID: {selectedBill ? selectedBill.id : (selectedRx.id || 'N/A')}</div>
            {selectedBill && <div>Type: {selectedBill.visit_type.toUpperCase()}</div>}
          </div>
          
          <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '5px', borderBottom: '1px dashed black', paddingBottom: '3px' }}>
            Payment Receipt & Invoice
          </div>
          
          <div className="print-ticket-items">
            {/* 1. Professional/Center Fees */}
            {selectedBill && (parseFloat(selectedBill.doctor_fee) > 0 || parseFloat(selectedBill.center_fee) > 0) && (
              <div style={{ borderBottom: '1px dashed rgba(0,0,0,0.2)', marginBottom: '5px', paddingBottom: '5px' }}>
                {parseFloat(selectedBill.doctor_fee) > 0 && (
                  <div className="print-ticket-item-row" style={{ fontSize: '9px' }}>
                    <span>OPD Consultation Fee</span>
                    <span>LKR {parseFloat(selectedBill.doctor_fee).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedBill.center_fee) > 0 && (
                  <div className="print-ticket-item-row" style={{ fontSize: '9px' }}>
                    <span>Center Service Fee</span>
                    <span>LKR {parseFloat(selectedBill.center_fee).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. Prescriptions */}
            {((selectedBill?.prescription?.items) || selectedRx?.items)?.length > 0 && (
              <div style={{ borderBottom: '1px dashed rgba(0,0,0,0.2)', marginBottom: '5px', paddingBottom: '5px' }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3px' }}>Medications:</div>
                {((selectedBill?.prescription?.items) || selectedRx?.items).map((item, idx) => {
                  const price = parseFloat(item.drug?.selling_price || item.price || 0);
                  const qty = parseInt(item.total_quantity || item.quantity || 0);
                  return (
                    <div key={idx} style={{ marginBottom: '4px', fontSize: '9px' }}>
                      <div className="print-ticket-item-row">
                        <span>{item.drug?.brand_name || 'Medicine'} (x{qty})</span>
                        <span>LKR {(price * qty).toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '8px', fontStyle: 'italic', paddingLeft: '5px', color: '#555' }}>
                        {item.dosage} | {item.frequency} | {item.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Lab Investigations */}
            {selectedBill?.lab_requests?.length > 0 && (
              <div style={{ borderBottom: '1px dashed rgba(0,0,0,0.2)', marginBottom: '5px', paddingBottom: '5px' }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3px' }}>Lab Tests:</div>
                {selectedBill.lab_requests.map((lr, idx) => {
                  const cost = parseFloat(lr.test?.cost) || 0;
                  return (
                    <div key={idx} className="print-ticket-item-row" style={{ fontSize: '9px', marginBottom: '3px' }}>
                      <span>{lr.test?.test_name || 'Lab Test'}</span>
                      <span>LKR {cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Summary / Total Calculations */}
          <div style={{ fontSize: '10px', marginTop: '5px', borderTop: '1px solid black', paddingTop: '5px' }}>
            {selectedBill && (
              <>
                <div className="print-ticket-item-row">
                  <span>Subtotal:</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                {parseFloat(selectedBill.discount) > 0 && (
                  <div className="print-ticket-item-row">
                    <span>Discount:</span>
                    <span>- LKR {parseFloat(selectedBill.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="print-ticket-item-row" style={{ fontWeight: 'bold', fontSize: '11px', marginTop: '2px', borderTop: '1px dashed black', paddingTop: '2px' }}>
                  <span>Grand Total:</span>
                  <span>LKR {parseFloat(selectedBill.bill_amount).toFixed(2)}</span>
                </div>
                <div className="print-ticket-item-row" style={{ fontSize: '9px', marginTop: '2px' }}>
                  <span>Received:</span>
                  <span>LKR {parseFloat(selectedBill.payment_received).toFixed(2)}</span>
                </div>
                <div className="print-ticket-item-row" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                  <span>Change Due:</span>
                  <span>LKR {parseFloat(selectedBill.change_due).toFixed(2)}</span>
                </div>
              </>
            )}
            {!selectedBill && selectedRx && (
              <div className="print-ticket-item-row" style={{ fontWeight: 'bold', fontSize: '11px' }}>
                <span>Prescription Total:</span>
                <span>Dispensed</span>
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '9px', borderTop: '1px dashed black', paddingTop: '8px' }}>
            Wish you a speedy recovery!<br />
            Thank you. Stay Healthy!<br />
            <span style={{ fontSize: '7px', color: '#666' }}>Cashier Initials: PH</span>
          </div>
        </div>
      )}
    </div>
  );
}
