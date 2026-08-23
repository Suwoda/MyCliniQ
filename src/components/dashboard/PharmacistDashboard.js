'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  Pill, 
  Clock, 
  Check, 
  Printer, 
  AlertTriangle, 
  DollarSign,
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
  TrendingUp,
  QrCode,
  X,
  Briefcase,
  RefreshCw,
  Settings,
  Edit3,
  Trash2
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function PharmacistDashboard() {
  const [pendingBills, setPendingBills] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [discount, setDiscount] = useState('0');
  const [paymentReceived, setPaymentReceived] = useState('');
  
  // Location and wholesale states
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState('main');
  const [locationStocks, setLocationStocks] = useState([]);
  
  const [suppliers, setSuppliers] = useState([]);
  const [supplierBills, setSupplierBills] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Cash Register States
  const [activeSession, setActiveSession] = useState(null);
  const [cashSessions, setCashSessions] = useState([]);
  const [sessionTransactions, setSessionTransactions] = useState([]);
  const [openingFloatInput, setOpeningFloatInput] = useState('');
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '' });
  const [payoutForm, setPayoutForm] = useState({ amount: '', description: '', doctorId: '' });
  const [closeDrawerForm, setCloseDrawerForm] = useState({ actualBalance: '', handoverAmount: '', notes: '' });
  const [selectedPastSession, setSelectedPastSession] = useState(null);
  const [pastSessionTransactions, setPastSessionTransactions] = useState([]);

  // Forms state
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', phone: '', address: '' });
  const [newBillForm, setNewBillForm] = useState({ supplier_id: '', bill_number: '', total_amount: '', payment_status: 'credit' });
  const [paymentForm, setPaymentForm] = useState({ bill_id: '', amount: '', payment_mode: 'cash', remarks: '' });
  
  const [transferTargetLoc, setTransferTargetLoc] = useState('');
  const [transferItems, setTransferItems] = useState([]);
  const [curTransferItem, setCurTransferItem] = useState({ drug_id: '', batch_id: '', quantity: '' });

  // Tab control synced with sidebar
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('activeDashboardTab');
      return saved === 'overview' ? 'prescriptions' : (saved || 'prescriptions');
    }
    return 'prescriptions';
  });

  const [isChief, setIsChief] = useState(false);

  // Drug Catalog Filter States
  const [hideZeroStock, setHideZeroStock] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  const [settingsSubTab, setSettingsSubTab] = useState('suppliers');
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(-1);

  // Add Stock drug autocomplete search states
  const [stockDrugSearch, setStockDrugSearch] = useState('');
  const [showStockDrugSuggestions, setShowStockDrugSuggestions] = useState(false);
  const [stockDrugIndex, setStockDrugIndex] = useState(-1);

  // Transfer Item drug autocomplete search states
  const [transferDrugSearch, setTransferDrugSearch] = useState('');
  const [showTransferDrugSuggestions, setShowTransferDrugSuggestions] = useState(false);
  const [transferDrugIndex, setTransferDrugIndex] = useState(-1);

  // Edit Drug Definition state
  const [editingDrug, setEditingDrug] = useState(null);
  const [showEditGroupSuggestions, setShowEditGroupSuggestions] = useState(false);
  const [editActiveGroupIndex, setEditActiveGroupIndex] = useState(-1);
  const [editDrugForm, setEditDrugForm] = useState({
    brand_name: '',
    generic_name: '',
    manufacturer: '',
    form: 'tablet',
    route: 'oral',
    strength: '',
    reorder_level: '50',
    drug_group: ''
  });

  // Edit Stock Batch state
  const [editingBatch, setEditingBatch] = useState(null);
  const [editBatchForm, setEditBatchForm] = useState({
    batch_number: '',
    expiry_date: '',
    purchase_price: '',
    selling_price: '',
    quantity_received: '',
    bonus_quantity: '0',
    quantity_remaining: ''
  });

  // Date Formatting Helper (DD/MM/YYYY)
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '-';
    try {
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

  const handleSetActiveTab = (tab) => {
    if (!isChief && (tab === 'add_stock' || tab === 'register_drug' || tab === 'suppliers' || tab === 'transfers' || tab === 'settings')) {
      return;
    }
    setActiveTab(tab);
    sessionStorage.setItem('activeDashboardTab', tab);
    window.dispatchEvent(new CustomEvent('dashboard-tab-changed', { detail: tab }));
  };

  useEffect(() => {
    const isChiefUser = sessionStorage.getItem('isChief') === 'true';
    setIsChief(isChiefUser);

    const handleTabChange = (e) => {
      const tab = e.detail;
      const targetTab = tab === 'overview' ? 'prescriptions' : tab;
      if (!isChiefUser && (targetTab === 'add_stock' || targetTab === 'register_drug' || targetTab === 'suppliers' || targetTab === 'transfers' || targetTab === 'settings')) {
        setActiveTab('prescriptions');
        sessionStorage.setItem('activeDashboardTab', 'prescriptions');
      } else {
        setActiveTab(targetTab);
      }
    };
    window.addEventListener('dashboard-tab-changed', handleTabChange);

    // Sync initial state
    const initialTab = sessionStorage.getItem('activeDashboardTab') || 'overview';
    const targetInit = initialTab === 'overview' ? 'prescriptions' : initialTab;
    if (!isChiefUser && (targetInit === 'add_stock' || targetInit === 'register_drug' || targetInit === 'suppliers' || targetInit === 'transfers' || targetInit === 'settings')) {
      setActiveTab('prescriptions');
      sessionStorage.setItem('activeDashboardTab', 'prescriptions');
    } else {
      setActiveTab(targetInit);
    }

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
  
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [selectedDrugFromSearch, setSelectedDrugFromSearch] = useState(null);
  const [showDrugQrModal, setShowDrugQrModal] = useState(false);
  const [drugScanLaserActive, setDrugScanLaserActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
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
    reorder_level: '50',
    drug_group: ''
  });

  // Stock Entry Batch Form
  const [stockForm, setStockForm] = useState({
    drug_id: '',
    batch_number: '',
    expiry_date: '',
    quantity: '',
    purchase_price: '',
    selling_price: '',
    bonus_quantity: '0',
    bill_id: ''
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

      // Load locations and activeLocation from sessionStorage
      const locs = await db.getLocations();
      setLocations(locs || []);
      if (typeof window !== 'undefined') {
        const savedLoc = sessionStorage.getItem('activeLocation') || 'main';
        setActiveLocation(savedLoc);
      }

      // Load location stock details
      const locStocks = await db.getLocationStock();
      setLocationStocks(locStocks || []);

      // Load Cash Session details
      const activeSess = await db.getActiveCashSession();
      setActiveSession(activeSess);
      
      const sessList = await db.getCashSessions();
      setCashSessions(sessList || []);
      
      if (activeSess) {
        const txsList = await db.getCashTransactions(activeSess.id);
        setSessionTransactions(txsList || []);
      } else {
        setSessionTransactions([]);
      }

      // Load supplier details if chief
      const isChiefUser = sessionStorage.getItem('isChief') === 'true';
      if (isChiefUser) {
        const sups = await db.getSuppliers();
        setSuppliers(sups || []);
        const bills = await db.getSupplierBills();
        setSupplierBills(bills || []);
        const pmts = await db.getSupplierPayments();
        setSupplierPayments(pmts || []);
        const trsf = await db.getStockTransfers();
        setTransfers(trsf || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocationChange = (locId) => {
    setActiveLocation(locId);
    sessionStorage.setItem('activeLocation', locId);
    loadData();
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierForm.name || !newSupplierForm.phone) {
      showNotification('error', 'Please enter Name and Phone Number.');
      return;
    }
    try {
      await db.addSupplier(newSupplierForm);
      showNotification('success', `Supplier '${newSupplierForm.name}' registered successfully.`);
      setNewSupplierForm({ name: '', phone: '', address: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to register supplier: ' + err.message);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const { supplier_id, bill_number, total_amount, payment_status } = newBillForm;
    if (!supplier_id || !bill_number || !total_amount) {
      showNotification('error', 'Please fill in all required bill details.');
      return;
    }
    try {
      await db.addSupplierBill({
        supplier_id,
        bill_number,
        total_amount: parseFloat(total_amount),
        payment_status
      });
      showNotification('success', `Bill #${bill_number} added successfully.`);
      setNewBillForm({ supplier_id: '', bill_number: '', total_amount: '', payment_status: 'credit' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to add bill: ' + err.message);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const { bill_id, amount, payment_mode, remarks } = paymentForm;
    if (!bill_id || !amount) {
      showNotification('error', 'Please select a bill and specify the payment amount.');
      return;
    }
    
    const bill = supplierBills.find(b => b.id === bill_id);
    if (!bill) return;
    const remaining = bill.total_amount - (parseFloat(bill.amount_paid) || 0);
    const amt = parseFloat(amount);
    
    if (amt <= 0) {
      showNotification('error', 'Amount must be greater than zero.');
      return;
    }
    if (amt > remaining) {
      showNotification('error', `Payment amount exceeds outstanding balance of LKR ${remaining.toFixed(2)}.`);
      return;
    }

    try {
      await db.addSupplierPayment({
        bill_id,
        amount: amt,
        payment_mode,
        remarks
      });
      showNotification('success', `Recorded payment of LKR ${amt.toFixed(2)} successfully.`);
      setPaymentForm({ bill_id: '', amount: '', payment_mode: 'cash', remarks: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to record payment: ' + err.message);
    }
  };

  const handleAddToTransferList = () => {
    const { drug_id, batch_id, quantity } = curTransferItem;
    if (!drug_id || !batch_id || !quantity) {
      showNotification('error', 'Please select a drug, batch, and enter transfer quantity.');
      return;
    }
    const qty = parseInt(quantity);
    if (qty <= 0) {
      showNotification('error', 'Quantity must be greater than zero.');
      return;
    }

    const stockRecord = locationStocks.find(ls => ls.location_id === activeLocation && ls.drug_id === drug_id && ls.batch_id === batch_id);
    const available = stockRecord ? stockRecord.quantity : 0;
    if (qty > available) {
      showNotification('error', `Insufficient stock in active location. Available: ${available}, Required: ${qty}.`);
      return;
    }

    const existingIdx = transferItems.findIndex(i => i.drug_id === drug_id && i.batch_id === batch_id);
    if (existingIdx !== -1) {
      const newQty = transferItems[existingIdx].quantity + qty;
      if (newQty > available) {
        showNotification('error', `Cumulative quantity exceeds available stock of ${available}.`);
        return;
      }
      const updated = [...transferItems];
      updated[existingIdx].quantity = newQty;
      setTransferItems(updated);
    } else {
      setTransferItems([...transferItems, { drug_id, batch_id, quantity: qty }]);
    }

    setCurTransferItem({ drug_id: '', batch_id: '', quantity: '' });
    setTransferDrugSearch('');
  };

  const handleRemoveFromTransferList = (idx) => {
    const updated = [...transferItems];
    updated.splice(idx, 1);
    setTransferItems(updated);
  };

  const handleSubmitTransfer = async () => {
    if (!transferTargetLoc) {
      showNotification('error', 'Please select a target branch location.');
      return;
    }
    if (transferTargetLoc === activeLocation) {
      showNotification('error', 'Source and target locations must be different.');
      return;
    }
    if (transferItems.length === 0) {
      showNotification('error', 'Please add at least one item to transfer.');
      return;
    }

    try {
      await db.transferStock(activeLocation, transferTargetLoc, transferItems);
      showNotification('success', 'Stock transfer processed successfully.');
      setTransferItems([]);
      setTransferTargetLoc('');
      loadData();
    } catch (err) {
      showNotification('error', 'Stock transfer failed: ' + err.message);
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
    if (!activeSession) {
      showNotification('error', 'Cannot collect payment: Cash register session is closed. Please open a session first.');
      return;
    }

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
        change_due: changeDue,
        collected_by: (typeof window !== 'undefined' ? sessionStorage.getItem('userName') : 'pharmacist')
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
    const { brand_name, generic_name, manufacturer, form, route, strength, reorder_level, drug_group } = newDrugForm;
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
        reorder_level: parseInt(reorder_level) || 50,
        drug_group: (drug_group || '').trim()
      });
      showNotification('success', `Drug '${brand_name}' registered in catalog successfully.`);
      setNewDrugForm({
        brand_name: '',
        generic_name: '',
        manufacturer: '',
        form: 'tablet',
        route: 'oral',
        strength: '',
        reorder_level: '50',
        drug_group: ''
      });
      loadData();
      handleSetActiveTab('catalog');
    } catch (err) {
      showNotification('error', 'Failed to register drug: ' + err.message);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const { drug_id, batch_number, expiry_date, quantity, purchase_price, selling_price, bonus_quantity, bill_id } = stockForm;
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
        parsedBonus,
        'main', // Stock always received at Main Pharmacy (main) by default
        bill_id || null
      );

      showNotification('success', 'New stock batch added successfully to Main Pharmacy.');
      setStockForm({
        drug_id: '', batch_number: '', expiry_date: '', quantity: '', purchase_price: '', selling_price: '', bonus_quantity: '0', bill_id: ''
      });
      setStockDrugSearch('');
      loadData();
      handleSetActiveTab('catalog');
    } catch (err) {
      showNotification('error', 'Failed to add stock batch: ' + err.message);
    }
  };

  // Handlers for Drug Definition Edit & Delete
  const handleOpenEditDrug = (drug) => {
    setEditingDrug(drug);
    setEditDrugForm({
      brand_name: drug.brand_name || '',
      generic_name: drug.generic_name || '',
      manufacturer: drug.manufacturer || '',
      form: drug.form || 'tablet',
      route: drug.route || 'oral',
      strength: drug.strength || '',
      reorder_level: String(drug.reorder_level || 50),
      drug_group: drug.drug_group || ''
    });
  };

  const handleSaveEditDrug = async (e) => {
    e.preventDefault();
    if (!editingDrug) return;
    if (!editDrugForm.brand_name || !editDrugForm.generic_name || !editDrugForm.strength) {
      showNotification('error', 'Please enter Brand Name, Generic Name, and Strength.');
      return;
    }
    try {
      await db.updateDrug(editingDrug.id, editDrugForm);
      showNotification('success', `Drug "${editDrugForm.brand_name}" updated successfully.`);
      setEditingDrug(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update drug: ' + err.message);
    }
  };

  const handleDeleteDrug = async (drug) => {
    if (window.confirm(`Are you sure you want to delete "${drug.brand_name} (${drug.generic_name})"?\n\nWARNING: This will permanently remove this drug and all associated stock batches!`)) {
      try {
        await db.deleteDrug(drug.id);
        showNotification('success', `Drug "${drug.brand_name}" and its stock batches deleted successfully.`);
        loadData();
      } catch (err) {
        showNotification('error', 'Failed to delete drug: ' + err.message);
      }
    }
  };

  // Handlers for Stock Batch Edit & Delete
  const handleOpenEditBatch = (batch) => {
    setEditingBatch(batch);
    setEditBatchForm({
      batch_number: batch.batch_number || '',
      expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toISOString().split('T')[0] : '',
      purchase_price: String(batch.purchase_price || 0),
      selling_price: String(batch.selling_price || 0),
      quantity_received: String(batch.quantity_received || 0),
      bonus_quantity: String(batch.bonus_quantity || 0),
      quantity_remaining: String(batch.quantity_remaining !== undefined ? batch.quantity_remaining : batch.quantity_received || 0)
    });
  };

  const handleSaveEditBatch = async (e) => {
    e.preventDefault();
    if (!editingBatch) return;
    if (!editBatchForm.batch_number || !editBatchForm.expiry_date || !editBatchForm.purchase_price || !editBatchForm.selling_price) {
      showNotification('error', 'Please fill in all required batch fields.');
      return;
    }
    try {
      await db.updateDrugBatch(editingBatch.id, editBatchForm);
      showNotification('success', `Stock batch "${editBatchForm.batch_number}" updated successfully.`);
      setEditingBatch(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update batch: ' + err.message);
    }
  };

  const handleDeleteBatch = async (batch) => {
    if (window.confirm(`Are you sure you want to delete batch "${batch.batch_number}"?\n\nThis will remove this batch stock and update drug total stock.`)) {
      try {
        await db.deleteDrugBatch(batch.id);
        showNotification('success', `Batch "${batch.batch_number}" deleted successfully.`);
        loadData();
      } catch (err) {
        showNotification('error', 'Failed to delete batch: ' + err.message);
      }
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
    const drugLocStocks = locationStocks.filter(ls => ls.location_id === activeLocation && ls.drug_id === drugId && ls.quantity > 0);
    const drugBatches = drugLocStocks.map(ls => {
      const batch = batches.find(b => b.id === ls.batch_id);
      return { ls, batch };
    }).filter(x => x.batch !== undefined).sort((a, b) => new Date(a.batch.expiry_date) - new Date(b.batch.expiry_date));

    for (let item of drugBatches) {
      if (qtyLeft <= 0) break;
      const deduct = Math.min(qtyLeft, item.ls.quantity);
      allocatedBatches.push({
        batch_number: item.batch.batch_number,
        qty: deduct,
        expiry_date: item.batch.expiry_date
      });
      qtyLeft -= deduct;
    }

    const totalStock = drugLocStocks.reduce((sum, ls) => sum + ls.quantity, 0);
    return { allocatedBatches, qtyLeft, totalStock };
  };

  // Extract unique existing drug groups for auto-complete
  const existingDrugGroups = Array.from(
    new Set(
      drugs
        .map(d => (d.drug_group || '').trim())
        .filter(Boolean)
    )
  ).sort();

  const filteredDrugGroups = existingDrugGroups.filter(g =>
    g.toLowerCase().includes((newDrugForm.drug_group || '').toLowerCase())
  );

  const filteredEditDrugGroups = existingDrugGroups.filter(g =>
    g.toLowerCase().includes((editDrugForm.drug_group || '').toLowerCase())
  );

  // Filter & Search Drugs List for builder autocomplete
  const filteredDrugsForBuilder = drugs.filter(d => 
    d.brand_name.toLowerCase().includes(drugSearchQuery.toLowerCase()) ||
    d.generic_name.toLowerCase().includes(drugSearchQuery.toLowerCase()) ||
    (d.drug_group && d.drug_group.toLowerCase().includes(drugSearchQuery.toLowerCase()))
  );

  // Filter & Search Drugs List for Add Stock Batch form autocomplete
  const filteredDrugsForStock = drugs.filter(d => {
    if (!stockDrugSearch.trim()) return true;
    const query = stockDrugSearch.toLowerCase().trim();
    return (
      d.brand_name.toLowerCase().includes(query) ||
      d.generic_name.toLowerCase().includes(query) ||
      (d.strength && d.strength.toLowerCase().includes(query)) ||
      (d.drug_group && d.drug_group.toLowerCase().includes(query)) ||
      (d.manufacturer && d.manufacturer.toLowerCase().includes(query))
    );
  });

  const selectedStockDrug = drugs.find(d => d.id === stockForm.drug_id);

  // Filter & Search Drugs List for Inter-Branch Transfer form autocomplete
  const filteredDrugsForTransfer = drugs.filter(d => {
    if (!transferDrugSearch.trim()) return true;
    const query = transferDrugSearch.toLowerCase().trim();
    return (
      d.brand_name.toLowerCase().includes(query) ||
      d.generic_name.toLowerCase().includes(query) ||
      (d.strength && d.strength.toLowerCase().includes(query)) ||
      (d.drug_group && d.drug_group.toLowerCase().includes(query)) ||
      (d.manufacturer && d.manufacturer.toLowerCase().includes(query))
    );
  });

  const selectedTransferDrug = drugs.find(d => d.id === curTransferItem.drug_id);

  // Filter & Search Drugs List for Catalog
  const filteredDrugs = drugs.filter(drug => {
    // 1. Location stock calculation
    const drugLocStocks = locationStocks.filter(ls => ls.location_id === activeLocation && ls.drug_id === drug.id);
    const locStockTotal = drugLocStocks.reduce((sum, ls) => sum + ls.quantity, 0);

    // 2. Hide Zero Stock option
    if (hideZeroStock && locStockTotal <= 0) {
      return false;
    }

    // 3. Show Low Stock Only option
    if (showLowStockOnly && locStockTotal > drug.reorder_level) {
      return false;
    }

    // 4. Group Filter option
    if (selectedGroupFilter !== 'all' && (drug.drug_group || '') !== selectedGroupFilter) {
      return false;
    }

    // 5. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        drug.brand_name.toLowerCase().includes(query) || 
        drug.generic_name.toLowerCase().includes(query) || 
        (drug.manufacturer && drug.manufacturer.toLowerCase().includes(query)) ||
        (drug.drug_group && drug.drug_group.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

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

      {/* Top Header with Active Location Selector */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'rgba(30, 41, 59, 0.7)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        borderRadius: '12px', 
        padding: '1.25rem 1.75rem', 
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></span>
            <span>Pharmacy Operations Hub</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Manage pharmacy inventory, prescriptions, supplier accounts, and branch locations.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>Active Location:</span>
          <select 
            value={activeLocation} 
            onChange={(e) => handleLocationChange(e.target.value)}
            style={{ 
              width: '230px', 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              background: 'rgba(15, 23, 42, 0.8)', 
              color: 'white', 
              fontWeight: '600', 
              outline: 'none',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              transition: 'border-color 0.2s'
            }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id} style={{ background: '#0f172a', color: 'white' }}>
                {loc.name} {loc.id === 'main' ? ' (Main Hub) ★' : ' (Branch)'}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    {/* 1. Scan QR Button */}
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <button 
                        type="button" 
                        onClick={() => setShowDrugQrModal(true)}
                        className="btn-primary" 
                        style={{ width: '100%', padding: '0.65rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                      >
                        <QrCode size={18} />
                        <span>Scan Drug QR Code</span>
                      </button>
                    </div>

                    {/* 2. Select Drug (Autocomplete) */}
                    <div className={styles.formGroup} style={{ marginBottom: 0, position: 'relative' }}>
                      <label className={styles.formLabel}>Select Drug *</label>
                      <input 
                        type="text" 
                        placeholder="Search by brand or generic name..."
                        value={drugSearchQuery}
                        onChange={(e) => {
                          setDrugSearchQuery(e.target.value);
                          setSelectedDrugFromSearch(null);
                          setCurItem({ ...curItem, drug_id: '' });
                          setActiveSuggestionIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (filteredDrugsForBuilder.length === 0) return;
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setActiveSuggestionIndex(prev => 
                              prev < filteredDrugsForBuilder.length - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setActiveSuggestionIndex(prev => 
                              prev > 0 ? prev - 1 : filteredDrugsForBuilder.length - 1
                            );
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredDrugsForBuilder.length) {
                              const d = filteredDrugsForBuilder[activeSuggestionIndex];
                              setSelectedDrugFromSearch(d);
                              setDrugSearchQuery(`${d.brand_name} (${d.generic_name}) - ${d.strength} [${d.form}]`);
                              setCurItem({ ...curItem, drug_id: d.id });
                              setActiveSuggestionIndex(-1);
                            }
                          } else if (e.key === 'Escape') {
                            setSelectedDrugFromSearch(null);
                            setActiveSuggestionIndex(-1);
                          }
                        }}
                      />
                      {drugSearchQuery && !selectedDrugFromSearch && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '100%',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 100,
                          boxShadow: 'var(--shadow-lg)'
                        }}>
                          {filteredDrugsForBuilder.length === 0 ? (
                            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>No drugs found.</div>
                          ) : (
                            filteredDrugsForBuilder.map((d, idx) => {
                              const drugLocStocks = locationStocks.filter(ls => ls.location_id === activeLocation && ls.drug_id === d.id);
                              const realStock = drugLocStocks.reduce((sum, ls) => sum + ls.quantity, 0);
                              const isOutOfStock = realStock <= 0;
                              
                              return (
                                <div 
                                  key={d.id} 
                                  onClick={() => {
                                    setSelectedDrugFromSearch(d);
                                    setDrugSearchQuery(`${d.brand_name} (${d.generic_name}) - ${d.strength} [${d.form}]`);
                                    setCurItem({ ...curItem, drug_id: d.id });
                                    setActiveSuggestionIndex(-1);
                                  }}
                                  style={{ 
                                    padding: '0.5rem 0.75rem', 
                                    cursor: 'pointer', 
                                    fontSize: '0.85rem', 
                                    borderBottom: '1px solid var(--card-border)',
                                    background: activeSuggestionIndex === idx ? 'var(--secondary-bg)' : 'transparent'
                                  }}
                                  onMouseEnter={() => setActiveSuggestionIndex(idx)}
                                  onMouseLeave={() => setActiveSuggestionIndex(-1)}
                                >
                                  <strong>{d.brand_name}</strong> - <span>{d.generic_name} ({d.strength}) [Form: {d.form}] </span>
                                  {isOutOfStock ? (
                                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>(Out of Stock)</span>
                                  ) : (
                                    <span style={{ color: 'var(--primary)' }}>(Stock: {realStock})</span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Quantity */}
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.formLabel}>Quantity *</label>
                      <input 
                        type="number" 
                        placeholder="Enter quantity (e.g. 30)"
                        value={curItem.quantity}
                        onChange={(e) => setCurItem({ ...curItem, quantity: e.target.value })}
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
                      
                      // Check available stock in the active location
                      const drugLocStocks = locationStocks.filter(ls => ls.location_id === activeLocation && ls.drug_id === curItem.drug_id);
                      const totalAvailableStock = drugLocStocks.reduce((sum, ls) => sum + ls.quantity, 0);
                      
                      if (totalAvailableStock <= 0) {
                        showNotification('error', `This medication is out of stock in the active location.`);
                        return;
                      }
                      
                      const existingQty = walkInItems
                        .filter(item => item.drug_id === curItem.drug_id)
                        .reduce((sum, item) => sum + item.quantity, 0);
                      
                      if (qty + existingQty > totalAvailableStock) {
                        if (existingQty > 0) {
                          showNotification('error', `Insufficient stock in active location. You already have ${existingQty} units in list. Only ${totalAvailableStock} units total available.`);
                        } else {
                          showNotification('error', `Insufficient stock in active location. Only ${totalAvailableStock} units available.`);
                        }
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
                      setDrugSearchQuery('');
                      setSelectedDrugFromSearch(null);
                      setActiveSuggestionIndex(-1);
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
                                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>({item.drug?.generic_name}) - {item.drug?.strength} [{item.drug?.form}]</span>
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
                              const drugBatches = batches.filter(b => b.drug_id === item.drug_id && b.quantity_remaining > 0);
                              const totalAvailableStock = drugBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);
                              if (totalAvailableStock < item.quantity) {
                                showNotification('error', `Low Stock: Insufficient stock for ${item.drug.brand_name} (Available: ${totalAvailableStock} | Required: ${item.quantity}).`);
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

                  {selectedBill.payment_status === 'pending' && !activeSession && (
                    <div style={{ marginTop: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold' }}>මුදල් ලාච්චුව වසා ඇත (Cash Drawer Closed)</span>
                      <span>ගනුදෙනු සිදු කිරීමට පෙර 'Cash Register' ටැබ් එකෙන් මුදල් ලාච්චුව විවෘත කරන්න.</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  {selectedBill.payment_status === 'pending' ? (
                    <button 
                      onClick={() => handleCollectPayment(selectedBill)} 
                      className="btn-primary" 
                      style={{ flexGrow: 1 }}
                      disabled={!activeSession || paymentReceived === '' || receivedVal < grandTotal}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Package size={22} style={{ color: 'var(--primary)' }} />
              <span>Drug Inventory Catalog</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '12px', color: 'var(--secondary)' }}>
                {filteredDrugs.length} of {drugs.length} items
              </span>
            </h3>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexGrow: 1, maxWidth: '580px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search brand, generic, group..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.9rem', width: '100%' }}
                />
              </div>

              {/* Group Filter Selector */}
              {existingDrugGroups.length > 0 && (
                <select 
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem', maxWidth: '170px' }}
                >
                  <option value="all">All Groups</option>
                  {existingDrugGroups.map((grp, idx) => (
                    <option key={idx} value={grp}>{grp}</option>
                  ))}
                </select>
              )}

              {isChief && (
                <button 
                  onClick={() => handleSetActiveTab('register_drug')} 
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> New Drug Definition
                </button>
              )}
            </div>
          </div>

          {/* Quick Inventory Filter Toggles */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'space-between', 
            gap: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--card-border)', 
            borderRadius: '10px', 
            padding: '0.75rem 1.25rem', 
            marginBottom: '1.25rem', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: hideZeroStock ? '#f87171' : 'white', fontWeight: hideZeroStock ? '600' : 'normal' }}>
                <input 
                  type="checkbox" 
                  checked={hideZeroStock}
                  onChange={(e) => setHideZeroStock(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ef4444' }}
                />
                <span>🚫 Stock බින්දුව (0) වූ බෙහෙත් සඟවන්න (Hide Zero Stock)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: showLowStockOnly ? '#fbbf24' : 'white', fontWeight: showLowStockOnly ? '600' : 'normal' }}>
                <input 
                  type="checkbox" 
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#f59e0b' }}
                />
                <span>⚠️ Low Stock පමණක් පෙන්වන්න (Low Stock Only)</span>
              </label>
            </div>

            {(hideZeroStock || showLowStockOnly || selectedGroupFilter !== 'all' || searchQuery) && (
              <button 
                type="button"
                onClick={() => {
                  setHideZeroStock(false);
                  setShowLowStockOnly(false);
                  setSelectedGroupFilter('all');
                  setSearchQuery('');
                }}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: 'var(--secondary)' }}
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Drug Group</th>
                  <th>Type</th>
                  <th>Strength</th>
                  <th>Route</th>
                  <th style={{ textAlign: 'center' }}>Branch Stock</th>
                  <th style={{ textAlign: 'center' }}>Global Stock</th>
                  <th style={{ textAlign: 'center' }}>Reorder Level</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrugs.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', color: 'var(--secondary)', padding: '2rem' }}>
                      No drugs matching search terms.
                    </td>
                  </tr>
                ) : (
                  filteredDrugs.map(drug => {
                    const isExpanded = expandedDrugId === drug.id;
                    const drugBatches = batches.filter(b => b.drug_id === drug.id);
                    const drugLocStocks = locationStocks.filter(ls => ls.location_id === activeLocation && ls.drug_id === drug.id);
                    const locStockTotal = drugLocStocks.reduce((sum, ls) => sum + ls.quantity, 0);
                    const isLowStock = locStockTotal <= drug.reorder_level;
                    const isOutOfStock = locStockTotal <= 0;

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
                          <td>
                            {drug.drug_group ? (
                              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: '600' }}>
                                {drug.drug_group}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Unassigned</span>
                            )}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{drug.form}</td>
                          <td>{drug.strength}</td>
                          <td style={{ textTransform: 'capitalize' }}>{drug.route || 'oral'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', color: locStockTotal <= drug.reorder_level ? 'var(--warning)' : '#10b981' }}>{locStockTotal}</td>
                          <td style={{ textAlign: 'center' }}>{drug.total_stock}</td>
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
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditDrug(drug)}
                                style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '4px', padding: '0.25rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                                title="Edit Drug Definition"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDrug(drug)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '4px', padding: '0.25rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                                title="Delete Drug Definition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible batch detail sub-table */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="13" style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--card-border)' }}>
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
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Branch Remaining</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Global Remaining</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>Status</th>
                                      <th style={{ padding: '0.5rem 1rem', textAlign: 'center', width: '90px' }}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {drugBatches.length === 0 ? (
                                      <tr>
                                        <td colSpan="11" style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                          No stock batches recorded for this drug. Use "Stock In" to add batches.
                                        </td>
                                      </tr>
                                    ) : (
                                      drugBatches.map(b => {
                                        const expiryInfo = getExpiryStatus(b.expiry_date);
                                        const markup = calculateMarkup(b.purchase_price, b.selling_price);
                                        const batchLocStockObj = locationStocks.find(ls => ls.location_id === activeLocation && ls.drug_id === drug.id && ls.batch_id === b.id);
                                        const batchLocStockQty = batchLocStockObj ? batchLocStockObj.quantity : 0;
                                        return (
                                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{b.batch_number}</td>
                                            <td style={{ padding: '0.5rem 1rem' }}>{formatDateDDMMYYYY(b.expiry_date)}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>LKR {parseFloat(b.purchase_price).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: '500' }}>LKR {parseFloat(b.selling_price).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#34d399', fontWeight: 'bold' }}>
                                              {markup}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>{b.quantity_received}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#10b981' }}>{b.bonus_quantity || 0}</td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: 'bold', color: batchLocStockQty <= 0 ? 'var(--danger)' : 'inherit' }}>
                                              {batchLocStockQty}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: '500', color: b.quantity_remaining <= 0 ? 'var(--danger)' : 'inherit' }}>
                                              {b.quantity_remaining}
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '10px', background: `${expiryInfo.color}15`, color: expiryInfo.color, border: `1px solid ${expiryInfo.color}25` }}>
                                                {expiryInfo.label}
                                              </span>
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                              <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                <button
                                                  type="button"
                                                  onClick={() => handleOpenEditBatch(b)}
                                                  style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '4px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                                                  title="Edit Stock Batch"
                                                >
                                                  <Edit3 size={12} /> Edit
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteBatch(b)}
                                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '4px', padding: '0.2rem 0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                                                  title="Delete Stock Batch"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
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
              <div className={styles.formGroup} style={{ gridColumn: 'span 2', position: 'relative' }}>
                <label className={styles.formLabel}>
                  Select Drug (බෙහෙත තෝරන්න) *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Type brand name, generic name, group or strength e.g. Panadol, Amoxicillin 500mg..."
                    value={stockDrugSearch}
                    onChange={(e) => {
                      setStockDrugSearch(e.target.value);
                      setShowStockDrugSuggestions(true);
                      setStockDrugIndex(-1);
                      if (!e.target.value) {
                        setStockForm(prev => ({ ...prev, drug_id: '' }));
                      }
                    }}
                    onFocus={() => setShowStockDrugSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowStockDrugSuggestions(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (!showStockDrugSuggestions || filteredDrugsForStock.length === 0) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setStockDrugIndex(prev => prev < filteredDrugsForStock.length - 1 ? prev + 1 : 0);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setStockDrugIndex(prev => prev > 0 ? prev - 1 : filteredDrugsForStock.length - 1);
                      } else if (e.key === 'Enter' && stockDrugIndex >= 0 && stockDrugIndex < filteredDrugsForStock.length) {
                        e.preventDefault();
                        const selected = filteredDrugsForStock[stockDrugIndex];
                        setStockForm(prev => ({ ...prev, drug_id: selected.id }));
                        setStockDrugSearch(`${selected.brand_name} (${selected.generic_name}) - ${selected.strength}`);
                        setShowStockDrugSuggestions(false);
                      } else if (e.key === 'Escape') {
                        setShowStockDrugSuggestions(false);
                      }
                    }}
                    style={{ paddingRight: (stockDrugSearch || stockForm.drug_id) ? '2.5rem' : '0.85rem' }}
                  />
                  {(stockDrugSearch || stockForm.drug_id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStockForm(prev => ({ ...prev, drug_id: '' }));
                        setStockDrugSearch('');
                        setShowStockDrugSuggestions(true);
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title="Clear drug selection"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions List */}
                {showStockDrugSuggestions && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '100%',
                      background: '#0f172a',
                      border: '1px solid var(--primary)',
                      borderRadius: '8px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      zIndex: 150,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.7)',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>MATCHING DRUGS IN CATALOG ({filteredDrugsForStock.length}):</span>
                      <span>Press Up/Down to navigate</span>
                    </div>
                    {filteredDrugsForStock.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No drugs found matching "{stockDrugSearch}". <br />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Please check spelling or register the new drug first.</span>
                      </div>
                    ) : (
                      filteredDrugsForStock.map((d, idx) => {
                        const isSelected = stockForm.drug_id === d.id;
                        const isHighlighted = stockDrugIndex === idx;
                        return (
                          <div 
                            key={d.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStockForm(prev => ({ ...prev, drug_id: d.id }));
                              setStockDrugSearch(`${d.brand_name} (${d.generic_name}) - ${d.strength}`);
                              setShowStockDrugSuggestions(false);
                            }}
                            onMouseEnter={() => setStockDrugIndex(idx)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              color: 'white',
                              background: isHighlighted ? 'rgba(59, 130, 246, 0.25)' : isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold', color: isHighlighted ? '#60a5fa' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{d.brand_name}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#cbd5e1' }}>({d.generic_name})</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span>Strength: <strong style={{ color: '#e2e8f0' }}>{d.strength}</strong></span>
                                <span>•</span>
                                <span style={{ textTransform: 'capitalize' }}>Form: {d.form}</span>
                                {d.drug_group && (
                                  <>
                                    <span>•</span>
                                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                      {d.drug_group}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.06)', color: isSelected ? 'white' : '#94a3b8', fontWeight: isSelected ? 'bold' : 'normal' }}>
                                {isSelected ? 'Selected ✓' : 'Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Selected Drug Info Banner */}
                {selectedStockDrug && (
                  <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                      Selected: <strong style={{ color: '#60a5fa' }}>{selectedStockDrug.brand_name}</strong> ({selectedStockDrug.generic_name}) — {selectedStockDrug.strength} [{selectedStockDrug.form}]
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span>Reorder Level: <strong>{selectedStockDrug.reorder_level}</strong></span>
                      {selectedStockDrug.drug_group && (
                        <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {selectedStockDrug.drug_group}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Receiving Location</label>
                <input 
                  type="text" 
                  value="Main Pharmacy (Central Hub)" 
                  disabled 
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--secondary)', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Link Supplier Bill (Optional)</label>
                <select 
                  value={stockForm.bill_id || ''} 
                  onChange={(e) => setStockForm({ ...stockForm, bill_id: e.target.value })}
                >
                  <option value="">-- No Linked Bill --</option>
                  {supplierBills.map(b => {
                    const sup = suppliers.find(s => s.id === b.supplier_id);
                    const outstanding = b.total_amount - (parseFloat(b.amount_paid) || 0);
                    return (
                      <option key={b.id} value={b.id}>
                        {sup ? sup.name : 'Unknown'} - Bill: {b.bill_number} (Bal: LKR {outstanding.toFixed(2)})
                      </option>
                    );
                  })}
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

            <div className={styles.formGroup} style={{ position: 'relative' }}>
              <label className={styles.formLabel}>
                Drug Group / Category (බෙහෙත් කාණ්ඩය)
              </label>
              <input 
                type="text" 
                placeholder="Search or enter group e.g. Antibiotics, Analgesics"
                value={newDrugForm.drug_group || ''}
                onChange={(e) => {
                  setNewDrugForm({ ...newDrugForm, drug_group: e.target.value });
                  setShowGroupSuggestions(true);
                  setActiveGroupIndex(-1);
                }}
                onFocus={() => setShowGroupSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowGroupSuggestions(false), 200);
                }}
                onKeyDown={(e) => {
                  if (!showGroupSuggestions || filteredDrugGroups.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveGroupIndex(prev => prev < filteredDrugGroups.length - 1 ? prev + 1 : 0);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveGroupIndex(prev => prev > 0 ? prev - 1 : filteredDrugGroups.length - 1);
                  } else if (e.key === 'Enter' && activeGroupIndex >= 0 && activeGroupIndex < filteredDrugGroups.length) {
                    e.preventDefault();
                    setNewDrugForm({ ...newDrugForm, drug_group: filteredDrugGroups[activeGroupIndex] });
                    setShowGroupSuggestions(false);
                  } else if (e.key === 'Escape') {
                    setShowGroupSuggestions(false);
                  }
                }}
              />
              {showGroupSuggestions && filteredDrugGroups.length > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    background: '#1e293b',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    marginTop: '4px'
                  }}
                >
                  <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                    EXISTING GROUPS (Select or type new):
                  </div>
                  {filteredDrugGroups.map((grp, idx) => (
                    <div 
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setNewDrugForm({ ...newDrugForm, drug_group: grp });
                        setShowGroupSuggestions(false);
                      }}
                      onMouseEnter={() => setActiveGroupIndex(idx)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: 'white',
                        background: activeGroupIndex === idx ? '#3b82f6' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{grp}</span>
                      <span style={{ fontSize: '0.7rem', color: activeGroupIndex === idx ? '#e2e8f0' : '#64748b' }}>Select</span>
                    </div>
                  ))}
                </div>
              )}
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
                      {selectedBill && (
                        <div style={{ fontSize: '8px', fontStyle: 'italic', paddingLeft: '5px', color: '#555' }}>
                          {item.dosage} | {item.frequency} | {item.duration}
                        </div>
                      )}
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

      {/* Tab 5: Supplier Bills & Payments */}
      {activeTab === 'suppliers' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={22} style={{ color: 'var(--primary)' }} />
            <span>Wholesale Supplier Bills & Payments Dashboard</span>
          </h3>

          {/* Metrics summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Total Outstanding (Accounts Payable)</span>
              <h2 style={{ fontSize: '1.5rem', color: '#f87171', margin: '0.3rem 0 0 0', fontWeight: 'bold' }}>
                LKR {(() => {
                  const totalBilled = supplierBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
                  const totalPaid = supplierBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
                  return Math.max(0, totalBilled - totalPaid).toFixed(2);
                })()}
              </h2>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Total Payments Recorded</span>
              <h2 style={{ fontSize: '1.5rem', color: '#34d399', margin: '0.3rem 0 0 0', fontWeight: 'bold' }}>
                LKR {supplierPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Grid: Record Bill & Record Payment Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Record Supplier Bill */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>Record Supplier Bill</h4>
                <form onSubmit={handleCreateBill} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Supplier *</label>
                    <select 
                      value={newBillForm.supplier_id}
                      onChange={(e) => setNewBillForm({ ...newBillForm, supplier_id: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Bill / Invoice Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SPC-INV-1092"
                      value={newBillForm.bill_number}
                      onChange={(e) => setNewBillForm({ ...newBillForm, bill_number: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Total Amount *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 75000.00"
                      value={newBillForm.total_amount}
                      onChange={(e) => setNewBillForm({ ...newBillForm, total_amount: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Initial Status</label>
                    <select 
                      value={newBillForm.payment_status}
                      onChange={(e) => setNewBillForm({ ...newBillForm, payment_status: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="credit">Credit / Unpaid</option>
                      <option value="paid">Paid upfront</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem', marginTop: '0.25rem' }}>
                    <Check size={14} /> Record Bill
                  </button>
                </form>
              </div>

              {/* Record Payment to Supplier */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>Record Supplier Payment</h4>
                <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Select Invoice / Bill *</label>
                    <select 
                      value={paymentForm.bill_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bill_id: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="">-- Select Bill --</option>
                      {supplierBills.filter(b => b.total_amount - (parseFloat(b.amount_paid) || 0) > 0).map(b => {
                        const sup = suppliers.find(s => s.id === b.supplier_id);
                        const remaining = b.total_amount - (parseFloat(b.amount_paid) || 0);
                        return (
                          <option key={b.id} value={b.id}>
                            {sup ? sup.name : 'Unknown'} - #{b.bill_number} (Bal: {remaining.toFixed(2)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Payment Amount (LKR) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 5000.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Payment Mode</label>
                    <select 
                      value={paymentForm.payment_mode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                    >
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Remarks</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tx Ref #908"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem', marginTop: '0.25rem' }}>
                    <Check size={14} /> Record Payment
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom: Bills and Payments Log */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600' }}>Recent Supplier Bills Log</h4>
              <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--secondary-bg)' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Supplier</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Bill Number</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount Paid</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierBills.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--secondary)' }}>No bills recorded yet.</td>
                      </tr>
                    ) : (
                      [...supplierBills].reverse().map(b => {
                        const sup = suppliers.find(s => s.id === b.supplier_id);
                        const isFullyPaid = parseFloat(b.amount_paid || 0) >= parseFloat(b.total_amount);
                        return (
                          <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.5rem' }}>{formatDateDDMMYYYY(b.created_at || b.date)}</td>
                            <td style={{ padding: '0.5rem', fontWeight: '500' }}>{sup ? sup.name : 'Unknown'}</td>
                            <td style={{ padding: '0.5rem' }}>{b.bill_number}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>LKR {parseFloat(b.total_amount).toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>LKR {parseFloat(b.amount_paid || 0).toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <span className={`badge ${isFullyPaid ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                {isFullyPaid ? 'Paid' : 'Credit'}
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
        </div>
      )}

      {/* Tab 7: Settings & Supplier Registration */}
      {activeTab === 'settings' && (
        <div className="glass-card animate-fade-in no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={22} style={{ color: 'var(--primary)' }} />
              <span>Pharmacy Operations Settings</span>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                type="button"
                onClick={() => setSettingsSubTab('suppliers')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: settingsSubTab === 'suppliers' ? 'var(--primary)' : 'transparent',
                  color: settingsSubTab === 'suppliers' ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                Supplier Management (සප්ලයර්ස්)
              </button>
              <button 
                type="button"
                onClick={() => setSettingsSubTab('general')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: settingsSubTab === 'general' ? 'var(--primary)' : 'transparent',
                  color: settingsSubTab === 'general' ? 'white' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                Other Settings (වෙනත් Settings)
              </button>
            </div>
          </div>

          {settingsSubTab === 'suppliers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
              {/* Register New Supplier */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={16} /> Register New Supplier (සප්ලයර්ස් ලියාපදිංචිය)
                </h4>
                <form onSubmit={handleCreateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Supplier Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SPC Lanka, Morison PLC, Astron"
                      value={newSupplierForm.name}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Phone Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0112345678"
                      value={newSupplierForm.phone}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Colombo, Sri Lanka"
                      value={newSupplierForm.address}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem', marginTop: '0.5rem' }}>
                    <Check size={14} /> Save & Register Supplier
                  </button>
                </form>
              </div>

              {/* Registered Suppliers List */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem', maxHeight: '520px', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
                  Registered Suppliers Catalog ({suppliers.length})
                </h4>
                {suppliers.length === 0 ? (
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>No suppliers registered yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {suppliers.map(sup => {
                      const supBills = supplierBills.filter(b => b.supplier_id === sup.id);
                      const billed = supBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
                      const paid = supBills.reduce((sum, b) => sum + parseFloat(b.amount_paid || 0), 0);
                      const outstanding = billed - paid;
                      return (
                        <div key={sup.id} style={{ padding: '0.85rem', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.95rem' }}>{sup.name}</div>
                              <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>📞 {sup.phone} | 📍 {sup.address || 'No address provided'}</div>
                            </div>
                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                              {supBills.length} Bills
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '0.75rem' }}>
                            <span>Total Billed: LKR {billed.toFixed(2)}</span>
                            <span style={{ color: outstanding > 0 ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
                              Balance Due: LKR {outstanding.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {settingsSubTab === 'general' && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--card-border)', borderRadius: '10px' }}>
              <Settings size={40} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }} />
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'white' }}>Additional Settings (එකතු කිරීමට නියමිත Settings)</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto' }}>
                මෙම ස්ථානයේ ඉදිරියට එකතු කිරීමට නියමිත System & Pharmacy Settings පහසුවෙන් එකතු කරගත හැක.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Stock Transfers */}
      {activeTab === 'transfers' && (
        <div className="glass-card animate-fade-in no-print">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={22} style={{ color: 'var(--primary)' }} />
            <span>Inter-Branch Stock Transfers</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Left Panel: Transfer Form & Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary)' }}>New Stock Transfer</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Source Location</label>
                    <input 
                      type="text" 
                      value={locations.find(l => l.id === activeLocation)?.name || activeLocation} 
                      disabled 
                      style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--secondary)', cursor: 'not-allowed', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Target Destination *</label>
                    <select 
                      value={transferTargetLoc}
                      onChange={(e) => setTransferTargetLoc(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem' }}
                    >
                      <option value="">-- Select Target Branch --</option>
                      {locations.filter(l => l.id !== activeLocation).map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add Transfer Item Box */}
                <div style={{ border: '1px dashed var(--card-border)', borderRadius: '8px', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>Add Transfer Item</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Search & select medication..."
                        value={selectedTransferDrug ? `${selectedTransferDrug.brand_name} (${selectedTransferDrug.generic_name})` : transferDrugSearch}
                        onChange={(e) => {
                          setTransferDrugSearch(e.target.value);
                          setShowTransferDrugSuggestions(true);
                          setTransferDrugIndex(-1);
                          if (curTransferItem.drug_id) {
                            setCurTransferItem({ ...curTransferItem, drug_id: '', batch_id: '' });
                          }
                        }}
                        onFocus={() => setShowTransferDrugSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowTransferDrugSuggestions(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (!showTransferDrugSuggestions || filteredDrugsForTransfer.length === 0) return;
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setTransferDrugIndex(prev => prev < filteredDrugsForTransfer.length - 1 ? prev + 1 : 0);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setTransferDrugIndex(prev => prev > 0 ? prev - 1 : filteredDrugsForTransfer.length - 1);
                          } else if (e.key === 'Enter' && transferDrugIndex >= 0 && transferDrugIndex < filteredDrugsForTransfer.length) {
                            e.preventDefault();
                            const chosen = filteredDrugsForTransfer[transferDrugIndex];
                            setCurTransferItem({ ...curTransferItem, drug_id: chosen.id, batch_id: '' });
                            setTransferDrugSearch(`${chosen.brand_name} (${chosen.generic_name})`);
                            setShowTransferDrugSuggestions(false);
                          } else if (e.key === 'Escape') {
                            setShowTransferDrugSuggestions(false);
                          }
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100%' }}
                      />
                      {showTransferDrugSuggestions && filteredDrugsForTransfer.length > 0 && (
                        <div 
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '100%',
                            background: '#1e293b',
                            border: '1px solid var(--card-border)',
                            borderRadius: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                            marginTop: '4px'
                          }}
                        >
                          {filteredDrugsForTransfer.map((d, idx) => (
                            <div 
                              key={d.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setCurTransferItem({ ...curTransferItem, drug_id: d.id, batch_id: '' });
                                setTransferDrugSearch(`${d.brand_name} (${d.generic_name})`);
                                setShowTransferDrugSuggestions(false);
                              }}
                              onMouseEnter={() => setTransferDrugIndex(idx)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                color: 'white',
                                background: transferDrugIndex === idx ? '#3b82f6' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <strong>{d.brand_name}</strong> <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({d.generic_name})</span>
                                {d.strength && <span style={{ color: 'var(--primary)', marginLeft: '6px', fontSize: '0.7rem' }}>{d.strength}</span>}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: transferDrugIndex === idx ? '#e2e8f0' : '#64748b' }}>Select</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <select 
                        value={curTransferItem.batch_id}
                        onChange={(e) => setCurTransferItem({ ...curTransferItem, batch_id: e.target.value })}
                        disabled={!curTransferItem.drug_id}
                        style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                      >
                        <option value="">-- Select Batch --</option>
                        {curTransferItem.drug_id && locationStocks
                          .filter(ls => ls.location_id === activeLocation && ls.drug_id === curTransferItem.drug_id && ls.quantity > 0)
                          .map(ls => {
                            const b = batches.find(b => b.id === ls.batch_id);
                            return b ? (
                              <option key={ls.batch_id} value={ls.batch_id}>
                                {b.batch_number} (Qty: {ls.quantity})
                              </option>
                            ) : null;
                          })
                        }
                      </select>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        placeholder="Qty"
                        value={curTransferItem.quantity}
                        onChange={(e) => setCurTransferItem({ ...curTransferItem, quantity: e.target.value })}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddToTransferList} 
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', width: '100%', padding: '0.4rem', marginTop: '0.5rem' }}
                  >
                    Add to Transfer List
                  </button>
                </div>

                {/* Transfer items table */}
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Items in Transfer List ({transferItems.length})</span>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '0.4rem', border: '1px solid var(--card-border)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--card-border)' }}>
                        <th style={{ padding: '0.4rem', textAlign: 'left' }}>Medication</th>
                        <th style={{ padding: '0.4rem', textAlign: 'left' }}>Batch Number</th>
                        <th style={{ padding: '0.4rem', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '0.4rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferItems.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--secondary)' }}>List is empty. Add items above.</td>
                        </tr>
                      ) : (
                        transferItems.map((item, idx) => {
                          const drug = drugs.find(d => d.id === item.drug_id);
                          const batch = batches.find(b => b.id === item.batch_id);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.4rem' }}>{drug ? `${drug.brand_name} (${drug.strength})` : 'Unknown'}</td>
                              <td style={{ padding: '0.4rem' }}>{batch ? batch.batch_number : 'Unknown'}</td>
                              <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                              <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleRemoveFromTransferList(idx)} 
                                  className="btn-danger" 
                                  style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={handleSubmitTransfer}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '0.6rem', marginTop: '1.25rem', fontSize: '0.85rem' }}
                  disabled={transferItems.length === 0 || !transferTargetLoc}
                >
                  <RefreshCw size={14} /> Process Stock Transfer
                </button>
              </div>
            </div>

            {/* Right Panel: Transfer History Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.25rem', minHeight: '400px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Transfer History Log</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {transfers.length === 0 ? (
                    <p style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>No transfers recorded yet.</p>
                  ) : (
                    [...transfers].reverse().map((t, idx) => {
                      const src = locations.find(l => l.id === t.from_location_id)?.name || t.from_location_id;
                      const dest = locations.find(l => l.id === t.to_location_id)?.name || t.to_location_id;
                      
                      const itemsOverview = (t.items || []).map(i => {
                        const d = drugs.find(dr => dr.id === i.drug_id);
                        return d ? `${d.brand_name} (x${i.quantity})` : `Med (x${i.quantity})`;
                      }).join(', ');

                      return (
                        <div key={t.id || idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '6px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--primary)' }}>
                            <span>Transfer ID: {t.id?.substring(0, 8) || `TR-${t.created_at}`}</span>
                            <span style={{ color: 'var(--secondary)' }}>{new Date(t.created_at || t.date).toLocaleDateString()}</span>
                          </div>
                          <div style={{ marginTop: '0.3rem', color: 'white' }}>
                            <strong>{src}</strong> → <strong>{dest}</strong>
                          </div>
                          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--secondary)', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
                            <strong>Items:</strong> {itemsOverview || 'None'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Cash Register */}
      {activeTab === 'cash_register' && (
        <div className="glass-card animate-fade-in no-print" style={{ color: 'white' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={22} style={{ color: 'var(--primary)' }} />
            <span>මුදල් ලාච්චුව සහ මාරුවීම් කළමනාකරණය (Cash Drawer & Shift Handover)</span>
          </h3>

          {!activeSession ? (
            /* Drawer Closed State */
            <div style={{ maxWidth: '500px', margin: '2rem auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <AlertTriangle size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>මුදල් ලාච්චුව වසා ඇත (Cash Drawer Closed)</h4>
              <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                බිල්පත් කිරීම් සහ ගෙවීම් ලබා ගැනීමට පෙර කරුණාකර මුදල් ලාච්චුව ආරම්භක ශේෂයක් සමඟින් විවෘත කරන්න.
              </p>
              
              <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  ආරම්භක මුදල් ශේෂය (Opening Float Balance) - LKR *
                </label>
                <input 
                  type="number" 
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(e.target.value)}
                  placeholder="5000.00"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'white', textAlign: 'center' }}
                />
              </div>

              <button 
                onClick={async () => {
                  const val = parseFloat(openingFloatInput) || 5000;
                  try {
                    const uName = sessionStorage.getItem('userName') || 'pharmacist';
                    await db.openCashSession(uName, val);
                    showNotification('success', 'මුදල් ලාච්චුව සාර්ථකව විවෘත කරන ලදී! (Cash Drawer Opened)');
                    setOpeningFloatInput('');
                    loadData();
                  } catch (e) {
                    showNotification('error', e.message);
                  }
                }}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
              >
                මුදල් ලාච්චුව විවෘත කරන්න (Open Cash Register)
              </button>
            </div>
          ) : (
            /* Drawer Open State */
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
              {/* Left Column: Live Session & Transactions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Live Session Status */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>ACTIVE SHIFT</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        Opened by <strong>{activeSession.opened_by}</strong> on {new Date(activeSession.opened_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Expected Balance</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        LKR {(parseFloat(activeSession.opening_balance) + parseFloat(activeSession.cash_sales || 0) - parseFloat(activeSession.expenses || 0) - parseFloat(activeSession.payouts || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Opening Float</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>LKR {parseFloat(activeSession.opening_balance).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Cash Sales</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#34d399' }}>LKR {parseFloat(activeSession.cash_sales || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Expenses</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#f87171' }}>LKR {parseFloat(activeSession.expenses || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'rgba(245,158,11,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Payouts</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#fbbf24' }}>LKR {parseFloat(activeSession.payouts || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Session Transactions List */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>වත්මන් ගනුදෙනු ලේඛනය (Current Session Transactions)</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--card-border)' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Time</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Type</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center' }}>User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionTransactions.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)' }}>
                              ගනුදෙනු කිසිවක් සිදු වී නැත. (No transactions in this session)
                            </td>
                          </tr>
                        ) : (
                          sessionTransactions.map(tx => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '0.5rem', color: 'var(--secondary)' }}>{new Date(tx.created_at).toLocaleTimeString()}</td>
                              <td style={{ padding: '0.5rem' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  color: tx.transaction_type === 'income' ? '#34d399' : tx.transaction_type === 'expense' ? '#f87171' : '#fbbf24',
                                  background: tx.transaction_type === 'income' ? 'rgba(16,185,129,0.1)' : tx.transaction_type === 'expense' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
                                }}>
                                  {tx.transaction_type.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '0.5rem' }}>{tx.description}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>LKR {parseFloat(tx.amount).toFixed(2)}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--secondary)' }}>{tx.created_by}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions (Expense, Payout, Close Drawer) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Actions Box */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>ලාච්චුවේ ගනුදෙනු ඇතුළත් කිරීම් (Record Transactions)</h4>
                  
                  {/* Record Expense Form */}
                  <div style={{ marginBottom: '1.25rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#f87171' }}>1. සුළු වියදම් ලියාපදිංචි කිරීම (Record Expense)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="LKR"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                      <input 
                        type="text" 
                        placeholder="වියදම් විස්තරය (e.g. Tea & Lunch)"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!expenseForm.amount || !expenseForm.description) {
                          showNotification('error', 'කරුණාකර ගණන සහ විස්තරය ඇතුළත් කරන්න.');
                          return;
                        }
                        try {
                          const uName = sessionStorage.getItem('userName') || 'pharmacist';
                          await db.addCashTransaction(activeSession.id, 'expense', expenseForm.amount, expenseForm.description, uName);
                          showNotification('success', 'වියදම සාර්ථකව ඇතුළත් කරන ලදී.');
                          setExpenseForm({ amount: '', description: '' });
                          loadData();
                        } catch (e) {
                          showNotification('error', e.message);
                        }
                      }}
                      className="btn-secondary" 
                      style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                    >
                      වියදම ඇතුළත් කරන්න (Add Expense)
                    </button>
                  </div>

                  {/* Record Doctor Payout Form */}
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#fbbf24' }}>2. වෛද්‍ය ගෙවීම් සිදු කිරීම (Doctor Payout)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="LKR"
                        value={payoutForm.amount}
                        onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                      <input 
                        type="text" 
                        placeholder="වෛද්‍යවරයාගේ නම (e.g. Dr. Silva)"
                        value={payoutForm.description}
                        onChange={(e) => setPayoutForm({ ...payoutForm, description: e.target.value })}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!payoutForm.amount || !payoutForm.description) {
                          showNotification('error', 'කරුණාකර ගණන සහ වෛද්‍යවරයාගේ නම ඇතුළත් කරන්න.');
                          return;
                        }
                        try {
                          const uName = sessionStorage.getItem('userName') || 'pharmacist';
                          await db.addCashTransaction(activeSession.id, 'payout', payoutForm.amount, `Doctor Fee Payout - ${payoutForm.description}`, uName);
                          showNotification('success', 'වෛද්‍යවරයා සඳහා කළ ගෙවීම සාර්ථකව ඇතුළත් කරන ලදී.');
                          setPayoutForm({ amount: '', description: '', doctorId: '' });
                          loadData();
                        } catch (e) {
                          showNotification('error', e.message);
                        }
                      }}
                      className="btn-secondary" 
                      style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}
                    >
                      ගෙවීම ඇතුළත් කරන්න (Add Doctor Payout)
                    </button>
                  </div>
                </div>

                {/* Close Drawer & Shift Handover Form */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--danger)' }}>3. ශිෆ්ට් එක වසා දමා මුදල් භාරදීම (Close Shift & Handover)</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Expected Drawer Balance (පද්ධතියේ ශේෂය):</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
                        LKR {(parseFloat(activeSession.opening_balance) + parseFloat(activeSession.cash_sales || 0) - parseFloat(activeSession.expenses || 0) - parseFloat(activeSession.payouts || 0)).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Actual Closing Balance (ලාච්චුවේ ඇති සැබෑ ශේෂය) *</label>
                      <input 
                        type="number" 
                        value={closeDrawerForm.actualBalance}
                        onChange={(e) => setCloseDrawerForm({ ...closeDrawerForm, actualBalance: e.target.value })}
                        placeholder="0.00"
                        style={{ fontSize: '0.95rem', padding: '0.5rem', fontWeight: 'bold', width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Handover Amount to Manager (කළමනාකරුට භාරදෙන මුදල) *</label>
                      <input 
                        type="number" 
                        value={closeDrawerForm.handoverAmount}
                        onChange={(e) => setCloseDrawerForm({ ...closeDrawerForm, handoverAmount: e.target.value })}
                        placeholder="0.00"
                        style={{ fontSize: '0.95rem', padding: '0.5rem', fontWeight: 'bold', width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Handover Notes / වෙනස්වීම් පිළිබඳ සටහන්</label>
                      <textarea 
                        value={closeDrawerForm.notes}
                        onChange={(e) => setCloseDrawerForm({ ...closeDrawerForm, notes: e.target.value })}
                        placeholder="e.g. All matched, or variance due to cash discount"
                        style={{ fontSize: '0.85rem', padding: '0.5rem', width: '100%', height: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'white' }}
                      />
                    </div>

                    {/* Variance Warning */}
                    {(() => {
                      const expected = parseFloat(activeSession.opening_balance) + parseFloat(activeSession.cash_sales || 0) - parseFloat(activeSession.expenses || 0) - parseFloat(activeSession.payouts || 0);
                      const actual = parseFloat(closeDrawerForm.actualBalance) || 0;
                      const diff = actual - expected;
                      if (closeDrawerForm.actualBalance && Math.abs(diff) > 0.01) {
                        return (
                          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#f87171' }}>
                            <strong>ශේෂයේ වෙනසක් ඇත (Variance Warning):</strong> {diff > 0 ? `LKR ${diff.toFixed(2)} ක වැඩිවීමක්` : `LKR ${Math.abs(diff).toFixed(2)} ක අඩුවීමක්`}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <button 
                    onClick={async () => {
                      if (!closeDrawerForm.actualBalance || !closeDrawerForm.handoverAmount) {
                        showNotification('error', 'කරුණාකර අවසාන සැබෑ ශේෂය සහ කළමනාකරුට භාරදෙන මුදල ඇතුළත් කරන්න.');
                        return;
                      }
                      try {
                        const uName = sessionStorage.getItem('userName') || 'pharmacist';
                        await db.closeCashSession(activeSession.id, uName, closeDrawerForm.actualBalance, closeDrawerForm.handoverAmount, closeDrawerForm.notes);
                        showNotification('success', 'ශිෆ්ට් එක සාර්ථකව වසා දමා කළමනාකරුට වාර්තා කරන ලදී.');
                        setCloseDrawerForm({ actualBalance: '', handoverAmount: '', notes: '' });
                        loadData();
                      } catch (e) {
                        showNotification('error', e.message);
                      }
                    }}
                    className="btn-danger" 
                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    ශිෆ්ට් එක වසා දමන්න (Close Drawer & Submit)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Historical Shift sessions table */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>පසුගිය ශිෆ්ට් වාර්තා (Shift History & Audits)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: selectedPastSession ? '1.5fr 1fr' : '1fr', gap: '1.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--secondary-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Session ID</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Opened At</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Closed At</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Opened By</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Float</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Sales</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Expected</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actual</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Variance</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Handover</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashSessions.length === 0 ? (
                      <tr>
                        <td colSpan="12" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--secondary)' }}>පසුගිය ශිෆ්ට් දත්ත කිසිවක් නැත. (No historical shifts found)</td>
                      </tr>
                    ) : (
                      cashSessions.map(sess => {
                        const variance = sess.closing_balance_actual !== null ? sess.closing_balance_actual - sess.closing_balance_expected : 0;
                        const isSelected = selectedPastSession && selectedPastSession.id === sess.id;
                        return (
                          <tr key={sess.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                            <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{sess.id.substring(0, 8)}</td>
                            <td style={{ padding: '0.5rem' }}>{new Date(sess.opened_at).toLocaleDateString()} {new Date(sess.opened_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td style={{ padding: '0.5rem' }}>{sess.closed_at ? `${new Date(sess.closed_at).toLocaleDateString()} ${new Date(sess.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '-'}</td>
                            <td style={{ padding: '0.5rem' }}>{sess.opened_by}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{parseFloat(sess.opening_balance).toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{parseFloat(sess.cash_sales || 0).toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{sess.closing_balance_expected !== null ? parseFloat(sess.closing_balance_expected).toFixed(2) : '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{sess.closing_balance_actual !== null ? parseFloat(sess.closing_balance_actual).toFixed(2) : '-'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: variance === 0 ? 'inherit' : variance > 0 ? '#34d399' : '#f87171' }}>
                              {sess.closing_balance_actual !== null ? variance.toFixed(2) : '-'}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(sess.manager_handover_amount || 0).toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                color: sess.status === 'open' ? '#34d399' : '#f87171',
                                background: sess.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
                              }}>
                                {sess.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button 
                                onClick={() => handleSelectPastSession(sess)}
                                className="btn-secondary"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                View TXs
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {selectedPastSession && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Transactions for {selectedPastSession.id.substring(0, 8)}</span>
                    <button onClick={() => handleSelectPastSession(null)} style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}>Close</button>
                  </div>
                  
                  {pastSessionTransactions.length === 0 ? (
                    <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>No transactions recorded.</p>
                  ) : (
                    pastSessionTransactions.map(tx => (
                      <div key={tx.id} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{tx.description}</div>
                          <div style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}>{new Date(tx.created_at).toLocaleTimeString()} by {tx.created_by}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontWeight: 'bold',
                            color: tx.transaction_type === 'income' ? '#34d399' : tx.transaction_type === 'expense' ? '#f87171' : '#fbbf24'
                          }}>
                            {tx.transaction_type === 'income' ? '+' : '-'} LKR {parseFloat(tx.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Drug QR Code Scanner Modal */}
      {showDrugQrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowDrugQrModal(false)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <QrCode size={40} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h4>Simulating Drug QR Scanner</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Scan the QR/Barcode on medication packaging or select below.</p>
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
                animation: drugScanLaserActive ? 'none' : 'scanLaser 2s linear infinite'
              }}></div>
              
              {drugScanLaserActive ? (
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>SCANNING DRUG CODE... 🟢</div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', zIndex: 1 }}>Align Drug Barcode inside frame</div>
              )}
            </div>

            {/* Simulated drugs list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Select Medication to Scan:</label>
              {[...drugs].sort((a,b) => a.brand_name.localeCompare(b.brand_name)).map(d => (
                <button 
                  key={d.id}
                  onClick={() => {
                    setDrugScanLaserActive(true);
                    setTimeout(() => {
                      setSelectedDrugFromSearch(d);
                      setDrugSearchQuery(`${d.brand_name} (${d.generic_name}) - ${d.strength} [${d.form}]`);
                      setCurItem(prev => ({ ...prev, drug_id: d.id }));
                      setDrugScanLaserActive(false);
                      setShowDrugQrModal(false);
                      setActiveSuggestionIndex(-1);
                      showNotification('success', `Scanned: ${d.brand_name} selected successfully.`);
                    }, 1000);
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                  disabled={drugScanLaserActive}
                >
                  <span>{d.brand_name} ({d.strength})</span>
                  <code>{d.id.toUpperCase()}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Drug Definition Modal */}
      {editingDrug && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', border: '1px solid var(--primary)' }}>
            <button 
              onClick={() => setEditingDrug(null)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '1.1rem' }}>
              <Edit3 size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Drug Definition ({editingDrug.brand_name})</span>
            </h3>

            <form onSubmit={handleSaveEditDrug} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Brand Name *</label>
                <input 
                  type="text" 
                  value={editDrugForm.brand_name}
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, brand_name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Generic Name *</label>
                <input 
                  type="text" 
                  value={editDrugForm.generic_name}
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, generic_name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manufacturer / Brand</label>
                <input 
                  type="text" 
                  value={editDrugForm.manufacturer}
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, manufacturer: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dosage Form *</label>
                <select 
                  value={editDrugForm.form} 
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, form: e.target.value })}
                >
                  <option value="tablet">Tablet (පෙති)</option>
                  <option value="capsule">Capsule (කැප්සියුල)</option>
                  <option value="syrup">Syrup (සිරප්)</option>
                  <option value="injection">Injection (එන්නත්)</option>
                  <option value="cream">Cream / Ointment (ක්රීම්)</option>
                  <option value="drops">Eye/Ear Drops (බිංදු)</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Strength / Dosage *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 500mg, 10mg/5ml"
                  value={editDrugForm.strength}
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, strength: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Reorder Alert Level</label>
                <input 
                  type="number" 
                  value={editDrugForm.reorder_level}
                  onChange={(e) => setEditDrugForm({ ...editDrugForm, reorder_level: e.target.value })}
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2', position: 'relative' }}>
                <label className={styles.formLabel}>Drug Group / Category (බෙහෙත් කාණ්ඩය)</label>
                <input 
                  type="text" 
                  placeholder="Search or enter group e.g. Antibiotics, Analgesics, Vitamins"
                  value={editDrugForm.drug_group || ''}
                  onChange={(e) => {
                    setEditDrugForm({ ...editDrugForm, drug_group: e.target.value });
                    setShowEditGroupSuggestions(true);
                    setEditActiveGroupIndex(-1);
                  }}
                  onFocus={() => setShowEditGroupSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowEditGroupSuggestions(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (!showEditGroupSuggestions || filteredEditDrugGroups.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setEditActiveGroupIndex(prev => prev < filteredEditDrugGroups.length - 1 ? prev + 1 : 0);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setEditActiveGroupIndex(prev => prev > 0 ? prev - 1 : filteredEditDrugGroups.length - 1);
                    } else if (e.key === 'Enter' && editActiveGroupIndex >= 0 && editActiveGroupIndex < filteredEditDrugGroups.length) {
                      e.preventDefault();
                      setEditDrugForm({ ...editDrugForm, drug_group: filteredEditDrugGroups[editActiveGroupIndex] });
                      setShowEditGroupSuggestions(false);
                    } else if (e.key === 'Escape') {
                      setShowEditGroupSuggestions(false);
                    }
                  }}
                />
                {showEditGroupSuggestions && filteredEditDrugGroups.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '100%',
                      background: '#1e293b',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      zIndex: 100,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                      EXISTING GROUPS (Select or type new):
                    </div>
                    {filteredEditDrugGroups.map((grp, idx) => (
                      <div 
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setEditDrugForm({ ...editDrugForm, drug_group: grp });
                          setShowEditGroupSuggestions(false);
                        }}
                        onMouseEnter={() => setEditActiveGroupIndex(idx)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: 'white',
                          background: editActiveGroupIndex === idx ? '#3b82f6' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{grp}</span>
                        <span style={{ fontSize: '0.7rem', color: editActiveGroupIndex === idx ? '#e2e8f0' : '#64748b' }}>Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formFull} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingDrug(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Batch Modal */}
      {editingBatch && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', border: '1px solid var(--primary)' }}>
            <button 
              onClick={() => setEditingBatch(null)}
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '1.1rem' }}>
              <Edit3 size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Stock Batch ({editingBatch.batch_number})</span>
            </h3>

            <form onSubmit={handleSaveEditBatch} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Batch Number *</label>
                <input 
                  type="text" 
                  value={editBatchForm.batch_number}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, batch_number: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Expiry Date *</label>
                <input 
                  type="date" 
                  value={editBatchForm.expiry_date}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, expiry_date: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Purchase Cost (Per Unit) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editBatchForm.purchase_price}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, purchase_price: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Selling Price (Per Unit) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editBatchForm.selling_price}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, selling_price: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quantity Received *</label>
                <input 
                  type="number" 
                  value={editBatchForm.quantity_received}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, quantity_received: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bonus Quantity</label>
                <input 
                  type="number" 
                  value={editBatchForm.bonus_quantity}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, bonus_quantity: e.target.value })}
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formLabel}>Current Remaining Stock Qty *</label>
                <input 
                  type="number" 
                  value={editBatchForm.quantity_remaining}
                  onChange={(e) => setEditBatchForm({ ...editBatchForm, quantity_remaining: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formFull} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingBatch(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Save Batch Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scanLaser {
          0% { top: 0px; }
          50% { top: 178px; }
          100% { top: 0px; }
        }
      `}</style>
    </div>
  );
}
