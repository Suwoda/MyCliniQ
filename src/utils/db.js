// Database abstraction layer supporting both production Supabase and interactive Offline Demo mode.
import { supabase } from './supabase';

const INITIAL_SPECIALISTS = [
  { id: 'spec1', name: 'Dr. Prasad', specialty: 'Cardiologist', doctor_fee: 1500.00, center_fee: 500.00 },
  { id: 'spec2', name: 'Dr. Sanduni', specialty: 'Pediatrician', doctor_fee: 1200.00, center_fee: 400.00 },
  { id: 'spec3', name: 'Dr. Ruwan', specialty: 'Dermatologist', doctor_fee: 1000.00, center_fee: 500.00 }
];

const INITIAL_DRUGS = [
  { id: 'd1', brand_name: 'Panadol', generic_name: 'Paracetamol', form: 'tablet', route: 'oral', manufacturer: 'GlaxoSmithKline Ceylon', strength: '500mg', total_stock: 1200, reorder_level: 200, unit_price: 1.50, selling_price: 2.50 },
  { id: 'd2', brand_name: 'Alerid', generic_name: 'Cetirizine', form: 'tablet', route: 'oral', manufacturer: 'Cipla Ltd', strength: '10mg', total_stock: 450, reorder_level: 100, unit_price: 2.00, selling_price: 4.00 },
  { id: 'd3', brand_name: 'Amoxil', generic_name: 'Amoxicillin', form: 'capsule', route: 'oral', manufacturer: 'GlaxoSmithKline', strength: '250mg', total_stock: 300, reorder_level: 100, unit_price: 5.00, selling_price: 8.00 },
  { id: 'd4', brand_name: 'Amoxil', generic_name: 'Amoxicillin', form: 'capsule', route: 'oral', manufacturer: 'GlaxoSmithKline', strength: '500mg', total_stock: 200, reorder_level: 100, unit_price: 8.00, selling_price: 12.00 },
  { id: 'd5', brand_name: 'Lipitor', generic_name: 'Atorvastatin', form: 'tablet', route: 'oral', manufacturer: 'Pfizer', strength: '10mg', total_stock: 150, reorder_level: 50, unit_price: 12.00, selling_price: 18.00 },
  { id: 'd6', brand_name: 'Glucophage', generic_name: 'Metformin', form: 'tablet', route: 'oral', manufacturer: 'Merck', strength: '500mg', total_stock: 800, reorder_level: 150, unit_price: 3.00, selling_price: 5.00 },
  { id: 'd7', brand_name: 'Zaart', generic_name: 'Losartan Potassium', form: 'tablet', route: 'oral', manufacturer: 'MSD', strength: '50mg', total_stock: 600, reorder_level: 100, unit_price: 8.00, selling_price: 12.00 }
];

const INITIAL_LAB_TESTS = [
  { id: 't1', test_name: 'Fasting Blood Sugar (FBS)', reference_range: '70 - 100', unit: 'mg/dL', cost: 250.00 },
  { id: 't2', test_name: 'Random Blood Sugar (RBS)', reference_range: 'Below 140', unit: 'mg/dL', cost: 200.00 },
  { id: 't3', test_name: 'HbA1c', reference_range: 'Below 5.7', unit: '%', cost: 1200.00 },
  { id: 't4', test_name: 'Full Blood Count (FBC)', reference_range: 'Multiple Parameters', unit: 'cells/uL', cost: 450.00 },
  { id: 't5', test_name: 'Lipid Profile', reference_range: 'Multiple Parameters', unit: 'mg/dL', cost: 1500.00 },
  { id: 't6', test_name: 'Serum Creatinine', reference_range: '0.6 - 1.2', unit: 'mg/dL', cost: 400.00 },
  { id: 't7', test_name: 'Urine Full Report (UFR)', reference_range: 'Normal', unit: 'N/A', cost: 350.00 }
];

const INITIAL_PATIENTS = [
  { 
    id: 'SM100001', 
    prefix: 'Mr.', 
    full_name: 'Sunil Perera', 
    date_of_birth: '1978-05-12', 
    gender: 'male', 
    phone: '0771234567', 
    phone_owner_name: 'Self',
    address: '123, Galle Road, Colombo 03', 
    occupation: 'Teacher',
    allergies: ['Penicillin'], 
    past_medical_history: ['Hypertension', 'Diabetes'], 
    past_surgical_history: ['Appendectomy'],
    comments: 'Patient prefers evening visits.',
    photo_url: '',
    created_at: new Date().toISOString() 
  },
  { 
    id: 'SM100002', 
    prefix: 'Mrs.', 
    full_name: 'Anula Jayasinghe', 
    date_of_birth: '1985-09-24', 
    gender: 'female', 
    phone: '0719876543', 
    phone_owner_name: 'Husband',
    address: '45, Kandy Road, Kadawatha', 
    occupation: 'Housewife',
    allergies: [], 
    past_medical_history: ['Asthma'], 
    past_surgical_history: [],
    comments: 'Allergic to dust as well.',
    photo_url: '',
    created_at: new Date().toISOString() 
  }
];

const INITIAL_VISITS = [
  { id: 'v1', patient_id: 'SM100001', visit_date: new Date().toISOString().split('T')[0], queue_number: 1, doctor_id: 'doc1', status: 'waiting', systolic_bp: 130, diastolic_bp: 85, temperature: 36.8, weight_kg: 74.5, chief_complaint: 'Mild chest discomfort and headache.', created_at: new Date().toISOString() }
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', patient_id: 'SM100002', doctor_id: 'doc1', appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], queue_number: 5, status: 'scheduled', booked_by: 'phone', created_at: new Date().toISOString() }
];

const INITIAL_USERS = [
  { id: 'u1', username: 'admin', full_name: 'Dr. A.P.K Sanjeeva', role: 'manager', password: 'admin', created_at: new Date().toISOString() },
  { id: 'u2', username: 'doctor', full_name: 'Dr. Sunil Perera', role: 'doctor', password: 'doctor', created_at: new Date().toISOString() },
  { id: 'u3', username: 'pharmacist', full_name: 'Pharmacist Nimali', role: 'pharmacist', password: 'pharmacist', is_chief: false, created_at: new Date().toISOString() },
  { id: 'u4', username: 'mlt', full_name: 'MLT Kamalanath', role: 'mlt', password: 'mlt', created_at: new Date().toISOString() },
  { id: 'u5', username: 'assistant', full_name: 'Assistant Ruwan', role: 'assistant', password: 'assistant', created_at: new Date().toISOString() },
  { id: 'u6', username: 'chief', full_name: 'Chief Pharmacist Kamal', role: 'pharmacist', password: 'chief', is_chief: true, created_at: new Date().toISOString() }
];

// Helper to check if we are in demo mode
const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isDemo') === 'true';
};

const getActiveLocationId = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('activeLocation') || 'main';
  }
  return 'main';
};

// Initialize Storage if empty
const initDemoDb = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mycliniq_specialists')) localStorage.setItem('mycliniq_specialists', JSON.stringify(INITIAL_SPECIALISTS));
  if (!localStorage.getItem('mycliniq_patients')) localStorage.setItem('mycliniq_patients', JSON.stringify(INITIAL_PATIENTS));
  if (!localStorage.getItem('mycliniq_drugs')) localStorage.setItem('mycliniq_drugs', JSON.stringify(INITIAL_DRUGS));
  if (!localStorage.getItem('mycliniq_lab_tests')) localStorage.setItem('mycliniq_lab_tests', JSON.stringify(INITIAL_LAB_TESTS));
  if (!localStorage.getItem('mycliniq_visits')) localStorage.setItem('mycliniq_visits', JSON.stringify(INITIAL_VISITS));
  if (!localStorage.getItem('mycliniq_appointments')) localStorage.setItem('mycliniq_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  if (!localStorage.getItem('mycliniq_users')) {
    localStorage.setItem('mycliniq_users', JSON.stringify(INITIAL_USERS));
  } else {
    // Make sure 'mycliniq_users' contains chief user and is_chief property
    const users = JSON.parse(localStorage.getItem('mycliniq_users'));
    let changed = false;
    const pharmacistIdx = users.findIndex(u => u.username === 'pharmacist');
    if (pharmacistIdx !== -1 && users[pharmacistIdx].is_chief === undefined) {
      users[pharmacistIdx].is_chief = false;
      changed = true;
    }
    if (!users.some(u => u.username === 'chief')) {
      users.push({ id: 'u6', username: 'chief', full_name: 'Chief Pharmacist Kamal', role: 'pharmacist', password: 'chief', is_chief: true, created_at: new Date().toISOString() });
      changed = true;
    }
    if (changed) {
      localStorage.setItem('mycliniq_users', JSON.stringify(users));
    }
  }
  if (!localStorage.getItem('mycliniq_prescriptions')) localStorage.setItem('mycliniq_prescriptions', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_prescription_items')) localStorage.setItem('mycliniq_prescription_items', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_lab_requests')) localStorage.setItem('mycliniq_lab_requests', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_consultations')) localStorage.setItem('mycliniq_consultations', JSON.stringify([]));
  
  const existingBatchesStr = localStorage.getItem('mycliniq_stock_batches');
  if (!existingBatchesStr || JSON.parse(existingBatchesStr).length <= 3) {
    const batches = [
      { id: 'b1', drug_id: 'd1', batch_number: 'PAN-2026', expiry_date: '2027-12-31', quantity_received: 1500, quantity_remaining: 1200, purchase_price: 1.50, selling_price: 2.50, bonus_quantity: 0 },
      { id: 'b2', drug_id: 'd2', batch_number: 'ALE-004', expiry_date: '2026-11-30', quantity_received: 500, quantity_remaining: 450, purchase_price: 2.00, selling_price: 4.00, bonus_quantity: 0 },
      { id: 'b3', drug_id: 'd7', batch_number: 'ZAA-19', expiry_date: '2027-05-15', quantity_received: 1000, quantity_remaining: 600, purchase_price: 8.00, selling_price: 12.00, bonus_quantity: 0 },
      { id: 'b4', drug_id: 'd3', batch_number: 'AMX-250', expiry_date: '2027-08-31', quantity_received: 500, quantity_remaining: 300, purchase_price: 3.50, selling_price: 5.00, bonus_quantity: 0 },
      { id: 'b5', drug_id: 'd4', batch_number: 'AMX-500', expiry_date: '2027-08-31', quantity_received: 300, quantity_remaining: 200, purchase_price: 5.00, selling_price: 8.00, bonus_quantity: 0 },
      { id: 'b6', drug_id: 'd5', batch_number: 'LIP-010', expiry_date: '2027-10-31', quantity_received: 200, quantity_remaining: 150, purchase_price: 8.00, selling_price: 12.00, bonus_quantity: 0 },
      { id: 'b7', drug_id: 'd6', batch_number: 'GLU-500', expiry_date: '2027-12-31', quantity_received: 1000, quantity_remaining: 800, purchase_price: 1.50, selling_price: 5.00, bonus_quantity: 0 }
    ];
    localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
  }

  // Initialize new tables
  if (!localStorage.getItem('mycliniq_locations')) {
    localStorage.setItem('mycliniq_locations', JSON.stringify([
      { id: 'main', name: 'Main Pharmacy', is_main: true },
      { id: 'branch_1', name: 'Affiliated Branch Pharmacy A', is_main: false }
    ]));
  }
  if (!localStorage.getItem('mycliniq_suppliers')) {
    localStorage.setItem('mycliniq_suppliers', JSON.stringify([
      { id: 's1', name: 'Astron Limited', phone: '0112345678', address: 'Colombo' },
      { id: 's2', name: 'Galle Wholesalers', phone: '0912234567', address: 'Galle' }
    ]));
  }
  if (!localStorage.getItem('mycliniq_supplier_bills')) {
    localStorage.setItem('mycliniq_supplier_bills', JSON.stringify([
      { id: 'sb1', supplier_id: 's1', bill_number: 'AST-9901', total_amount: 15000.00, amount_paid: 5000.00, payment_status: 'partially_paid', created_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem('mycliniq_supplier_payments')) {
    localStorage.setItem('mycliniq_supplier_payments', JSON.stringify([
      { id: 'sp1', bill_id: 'sb1', payment_date: new Date().toISOString().split('T')[0], amount: 5000.00, payment_mode: 'cash', remarks: 'Advance payment' }
    ]));
  }
  if (!localStorage.getItem('mycliniq_stock_transfers')) {
    localStorage.setItem('mycliniq_stock_transfers', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_stock_transfer_items')) {
    localStorage.setItem('mycliniq_stock_transfer_items', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_location_stock')) {
    const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
    const locStocks = batches.map((b, idx) => ({
      id: 'ls_' + idx,
      location_id: 'main',
      drug_id: b.drug_id,
      batch_id: b.id,
      quantity: b.quantity_remaining
    }));
    localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
  }
  if (!localStorage.getItem('mycliniq_cash_sessions')) {
    localStorage.setItem('mycliniq_cash_sessions', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_cash_transactions')) {
    localStorage.setItem('mycliniq_cash_transactions', JSON.stringify([]));
  }
  if (!localStorage.getItem('mycliniq_lab_weekly_balances')) {
    localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify([]));
  }
};

// Database API helper
export const db = {
  // Patients API
  getPatients: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_patients'));
    }
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addPatient: async (patient) => {
    if (isDemoMode()) {
      initDemoDb();
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      
      // Auto-generate Patient ID like SM100001
      const ids = patients
        .map(p => p.id)
        .filter(id => id && (id.startsWith('SM-') || id.startsWith('SM') || id.startsWith('sm') || id.startsWith('sm-')))
        .map(id => {
          const numPart = id.replace('SM-', '').replace('SM', '').replace('sm-', '').replace('sm', '');
          return parseInt(numPart, 10);
        })
        .filter(num => !isNaN(num));
      const maxId = ids.length > 0 ? Math.max(...ids) : 100000;
      const nextId = maxId + 1;
      const newId = 'SM' + nextId;

      const newPatient = { 
        ...patient, 
        id: newId, 
        created_at: new Date().toISOString() 
      };
      patients.push(newPatient);
      localStorage.setItem('mycliniq_patients', JSON.stringify(patients));
      return newPatient;
    }
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  },

  updatePatient: async (patientId, updates) => {
    if (isDemoMode()) {
      initDemoDb();
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      const idx = patients.findIndex(p => p.id === patientId);
      if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...updates };
        localStorage.setItem('mycliniq_patients', JSON.stringify(patients));
        return patients[idx];
      }
      throw new Error('Patient not found.');
    }
    const { data, error } = await supabase.from('patients').update(updates).eq('id', patientId).select().single();
    if (error) throw error;
    return data;
  },

  // Appointments API
  getAppointments: async (date) => {
    if (isDemoMode()) {
      initDemoDb();
      const appointments = JSON.parse(localStorage.getItem('mycliniq_appointments'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      let filtered = appointments;
      if (date) {
        filtered = appointments.filter(a => a.appointment_date === date);
      }
      return filtered.map(a => ({
        ...a,
        patient: patients.find(p => p.id === a.patient_id)
      }));
    }
    let query = supabase.from('appointments').select('*, patient:patients(*)');
    if (date) query = query.eq('appointment_date', date);
    const { data, error } = await query.order('queue_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  addAppointment: async (appointment) => {
    if (isDemoMode()) {
      initDemoDb();
      const appointments = JSON.parse(localStorage.getItem('mycliniq_appointments'));
      const newAppointment = { ...appointment, id: 'a_' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
      appointments.push(newAppointment);
      localStorage.setItem('mycliniq_appointments', JSON.stringify(appointments));
      return newAppointment;
    }
    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
    if (error) throw error;
    return data;
  },

  // Visits API
  getVisits: async (date) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const filtered = visits.filter(v => v.visit_date === targetDate);
      return filtered.map(v => ({
        ...v,
        patient: patients.find(p => p.id === v.patient_id)
      }));
    }
    const { data, error } = await supabase
      .from('visits')
      .select('*, patient:patients(*)')
      .eq('visit_date', targetDate)
      .order('queue_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  addVisit: async (visit) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const newVisit = { 
        ...visit, 
        id: 'v_' + Math.random().toString(36).substr(2, 9), 
        visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
        visit_type: visit.visit_type || 'opd',
        payment_status: visit.payment_status || 'pending',
        doctor_fee: visit.doctor_fee !== undefined ? visit.doctor_fee : (visit.visit_type === 'channeling' ? 0 : 500.00),
        center_fee: visit.center_fee || 0,
        bill_amount: visit.bill_amount || 0,
        created_at: new Date().toISOString() 
      };
      visits.push(newVisit);
      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));
      return newVisit;
    }
    const { data, error } = await supabase.from('visits').insert(visit).select().single();
    if (error) throw error;
    return data;
  },

  updateVisitStatus: async (visitId, status) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const idx = visits.findIndex(v => v.id === visitId);
      if (idx !== -1) {
        visits[idx].status = status;
        localStorage.setItem('mycliniq_visits', JSON.stringify(visits));
      }
      return visits[idx];
    }
    const { data, error } = await supabase.from('visits').update({ status }).eq('id', visitId).select().single();
    if (error) throw error;
    return data;
  },

  // Specialists List
  getSpecialists: async () => {
    if (isDemoMode() || !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_specialists')) || INITIAL_SPECIALISTS;
    }
    try {
      const { data, error } = await supabase.from('specialists').select('*').order('name', { ascending: true });
      if (error) {
        return INITIAL_SPECIALISTS;
      }
      return data;
    } catch (e) {
      return INITIAL_SPECIALISTS;
    }
  },

  // Pending Payments Queue
  getPendingBills: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
      const prescriptionItems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      const labTests = JSON.parse(localStorage.getItem('mycliniq_lab_tests')) || [];

      // Filter visits:
      // payment_status should be 'pending' (default to pending if not present).
      // OPD visits must be 'completed' (consulted) to be billed.
      // Lab and channeling visits are billed immediately upon check-in.
      const pendingVisits = visits.filter(v => {
        const payStatus = v.payment_status || 'pending';
        if (payStatus !== 'pending') return false;
        
        const type = v.visit_type || 'opd';
        if (type === 'opd') {
          return v.status === 'completed';
        }
        return true;
      });

      return pendingVisits.map(v => {
        const patient = patients.find(p => p.id === v.patient_id);
        
        // Find prescription for this visit
        const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations')) || [];
        const consultation = consultations.find(c => c.visit_id === v.id);
        
        let prescription = null;
        if (consultation) {
          const rx = prescriptions.find(p => p.consultation_id === consultation.id);
          if (rx) {
            const items = prescriptionItems.filter(item => item.prescription_id === rx.id).map(item => ({
              ...item,
              drug: drugs.find(d => d.id === item.drug_id)
            }));
            prescription = { ...rx, items };
          }
        }

        // Find lab requests for this visit
        const vLabRequests = labRequests.filter(lr => lr.visit_id === v.id).map(lr => ({
          ...lr,
          test: labTests.find(t => t.id === lr.test_id)
        }));

        return {
          ...v,
          visit_type: v.visit_type || 'opd',
          payment_status: v.payment_status || 'pending',
          doctor_fee: v.doctor_fee !== undefined ? v.doctor_fee : (v.visit_type === 'opd' ? 500.00 : 0),
          center_fee: v.center_fee || 0,
          patient,
          prescription,
          lab_requests: vLabRequests
        };
      });
    }

    try {
      const { data: visits, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients(*),
          consultations(
            id,
            prescriptions(
              *,
              items:prescription_items(
                *,
                drug:drugs(*)
              )
            )
          ),
          lab_requests(
            *,
            test:lab_tests(*)
          )
        `)
        .eq('payment_status', 'pending');
        
      if (error) throw error;
      
      const filtered = visits.filter(v => {
        const type = v.visit_type || 'opd';
        if (type === 'opd') {
          return v.status === 'completed';
        }
        return true;
      });

      return filtered.map(v => {
        let prescription = null;
        if (v.consultations && v.consultations.length > 0) {
          const consultation = v.consultations[0];
          if (consultation.prescriptions && consultation.prescriptions.length > 0) {
            prescription = consultation.prescriptions[0];
          }
        }
        return {
          ...v,
          visit_type: v.visit_type || 'opd',
          payment_status: v.payment_status || 'pending',
          prescription,
          lab_requests: v.lab_requests || []
        };
      });
    } catch (err) {
      console.error("Error in getPendingBills:", err);
      return [];
    }
  },

  collectPayment: async (visitId, paymentDetails) => {
    if (isDemoMode()) {
      initDemoDb();
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];
      const idx = visits.findIndex(v => v.id === visitId);
      if (idx === -1) throw new Error('Visit not found');

      const visit = visits[idx];
      visit.payment_status = 'paid';
      visit.bill_amount = paymentDetails.bill_amount;
      visit.discount = paymentDetails.discount || 0;
      visit.payment_received = paymentDetails.payment_received || 0;
      visit.change_due = paymentDetails.change_due || 0;

      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));

      // Update Active Cash Session (only if NOT direct lab payment)
      if (!paymentDetails.collected_at_lab) {
        const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
        const activeSession = sessions.find(s => s.status === 'open');
        if (activeSession) {
          activeSession.cash_sales = (parseFloat(activeSession.cash_sales) || 0) + parseFloat(paymentDetails.bill_amount);
          localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));

          // Get patient name
          const patients = JSON.parse(localStorage.getItem('mycliniq_patients')) || [];
          const patient = patients.find(p => p.id === visit.patient_id);
          const pName = patient ? patient.full_name : (visit.patient_name || 'Patient');

          // Add cash transaction
          const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
          txs.push({
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            session_id: activeSession.id,
            transaction_type: 'income',
            amount: parseFloat(paymentDetails.bill_amount),
            description: `Patient Payment (${visit.visit_type?.toUpperCase() || 'OPD'}) - ${pName}`,
            reference_id: visitId,
            created_by: paymentDetails.collected_by || 'pharmacist',
            created_at: new Date().toISOString()
          });
          localStorage.setItem('mycliniq_cash_transactions', JSON.stringify(txs));
        }
      }

      // Find prescription to dispense
      const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations')) || [];
      const consultation = consultations.find(c => c.visit_id === visitId);
      
      if (consultation) {
        const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
        const rx = prescriptions.find(p => p.consultation_id === consultation.id && p.status === 'pending');
        if (rx) {
          const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
          const rxItems = pitems.filter(item => item.prescription_id === rx.id);

          const itemsToDispense = rxItems.map(item => ({
            item_id: item.id,
            drug_id: item.drug_id,
            quantity: item.total_quantity
          }));

          const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
          const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];

          itemsToDispense.forEach(dispItem => {
            const itemIdx = pitems.findIndex(pi => pi.id === dispItem.item_id);
            if (itemIdx !== -1) {
              pitems[itemIdx].dispensed_quantity = dispItem.quantity;
            }

            let qtyToDeduct = dispItem.quantity;
            const drugBatches = batches.filter(b => b.drug_id === dispItem.drug_id).sort((a,b) => new Date(a.expiry_date) - new Date(b.expiry_date));
            
            for (let batch of drugBatches) {
              if (qtyToDeduct <= 0) break;
              const available = batch.quantity_remaining;
              if (available > 0) {
                const deduct = Math.min(qtyToDeduct, available);
                batch.quantity_remaining -= deduct;
                qtyToDeduct -= deduct;
              }
            }

            const drugIdx = drugs.findIndex(d => d.id === dispItem.drug_id);
            if (drugIdx !== -1) {
              const remaining = batches.filter(b => b.drug_id === dispItem.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
              drugs[drugIdx].total_stock = remaining;
            }
          });

          rx.status = 'dispensed';

          localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
          localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
          localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
          localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
        }
      }
      return visit;
    }

    try {
      // 1. Update visit
      const { data: visitData, error: visitErr } = await supabase
        .from('visits')
        .update({
          payment_status: 'paid',
          bill_amount: paymentDetails.bill_amount,
          discount: paymentDetails.discount || 0,
          payment_received: paymentDetails.payment_received || 0,
          change_due: paymentDetails.change_due || 0
        })
        .eq('id', visitId)
        .select()
        .single();
        
      if (visitErr) throw visitErr;

      // Update Active Cash Session in Supabase (only if NOT direct lab payment)
      if (!paymentDetails.collected_at_lab) {
        const { data: activeSession } = await supabase
          .from('cash_sessions')
          .select('*')
          .eq('status', 'open')
          .maybeSingle();

        if (activeSession) {
          await supabase
            .from('cash_sessions')
            .update({ cash_sales: (parseFloat(activeSession.cash_sales) || 0) + parseFloat(paymentDetails.bill_amount) })
            .eq('id', activeSession.id);

          await supabase.from('cash_transactions').insert({
            session_id: activeSession.id,
            transaction_type: 'income',
            amount: parseFloat(paymentDetails.bill_amount),
            description: `Patient Payment (${visitData.visit_type?.toUpperCase() || 'OPD'})`,
            reference_id: visitId,
            created_by: paymentDetails.collected_by || 'pharmacist'
          });
        }
      }

      // 2. Dispense prescription if any
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id')
        .eq('visit_id', visitId)
        .maybeSingle();

      if (consultation) {
        const { data: rx } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('consultation_id', consultation.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (rx) {
          const { data: rxItems } = await supabase
            .from('prescription_items')
            .select('*')
            .eq('prescription_id', rx.id);

          if (rxItems && rxItems.length > 0) {
            const itemsToDispense = rxItems.map(item => ({
              item_id: item.id,
              drug_id: item.drug_id,
              quantity: item.total_quantity
            }));
            
            await db.dispensePrescription(rx.id, itemsToDispense);
          }
        }
      }

      return visitData;
    } catch (err) {
      console.error("Error collecting payment:", err);
      throw err;
    }
  },
  addLabRequests: async (visitId, patientId, testIds, doctorId) => {
    if (isDemoMode()) {
      initDemoDb();
      const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      testIds.forEach(testId => {
        labRequests.push({
          id: 'lr_' + Math.random().toString(36).substr(2, 9),
          visit_id: visitId,
          patient_id: patientId,
          test_id: testId,
          doctor_id: doctorId || 'doc1',
          status: 'requested',
          result_value: '',
          remarks: '',
          created_at: new Date().toISOString()
        });
      });
      localStorage.setItem('mycliniq_lab_requests', JSON.stringify(labRequests));
      return true;
    }
    const labRequestsToInsert = testIds.map(testId => ({
      visit_id: visitId,
      patient_id: patientId,
      test_id: testId,
      doctor_id: doctorId || null,
      status: 'requested'
    }));
    const { error } = await supabase.from('lab_requests').insert(labRequestsToInsert);
    if (error) throw error;
    return true;
  },

  // Clinical Consultation & Prescriptions
  addConsultation: async (consultation, prescriptionItems, labTests) => {
    if (isDemoMode()) {
      initDemoDb();
      const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations'));
      const cid = 'c_' + Math.random().toString(36).substr(2, 9);
      
      // Separate doctor_fee from consultation since it is saved to visits table
      const { doctor_fee, ...consProps } = consultation;
      
      const newConsultation = { ...consProps, id: cid, created_at: new Date().toISOString() };
      consultations.push(newConsultation);
      localStorage.setItem('mycliniq_consultations', JSON.stringify(consultations));

      // Update visit status and doctor fee
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const vidx = visits.findIndex(v => v.id === consultation.visit_id);
      if (vidx !== -1) {
        visits[vidx].status = 'completed';
        if (doctor_fee !== undefined) {
          visits[vidx].doctor_fee = doctor_fee;
        }
      }
      localStorage.setItem('mycliniq_visits', JSON.stringify(visits));

      // Handle Prescriptions
      if (prescriptionItems && prescriptionItems.length > 0) {
        const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
        const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
        const pid = 'pr_' + Math.random().toString(36).substr(2, 9);
        
        prescriptions.push({
          id: pid,
          consultation_id: cid,
          patient_id: visits[vidx]?.patient_id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

        prescriptionItems.forEach(item => {
          pitems.push({
            ...item,
            id: 'pi_' + Math.random().toString(36).substr(2, 9),
            prescription_id: pid,
            dispensed_quantity: 0
          });
        });

        localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
        localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      }

      // Handle Lab requests
      if (labTests && labTests.length > 0) {
        const labRequests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
        labTests.forEach(testId => {
          labRequests.push({
            id: 'lr_' + Math.random().toString(36).substr(2, 9),
            visit_id: consultation.visit_id,
            patient_id: visits[vidx]?.patient_id,
            test_id: testId,
            doctor_id: consultation.doctor_id || 'doc1',
            status: 'requested',
            result_value: '',
            remarks: '',
            created_at: new Date().toISOString()
          });
        });
        localStorage.setItem('mycliniq_lab_requests', JSON.stringify(labRequests));
      }

      return newConsultation;
    }

    // Separate doctor_fee
    const { doctor_fee, ...consProps } = consultation;

    const { data: consData, error: consErr } = await supabase.from('consultations').insert(consProps).select().single();
    if (consErr) throw consErr;

    // Update visit status and doctor fee
    const updateObj = { status: 'completed' };
    if (doctor_fee !== undefined) {
      updateObj.doctor_fee = doctor_fee;
    }
    await supabase.from('visits').update(updateObj).eq('id', consultation.visit_id);

    // Insert prescription header
    if (prescriptionItems && prescriptionItems.length > 0) {
      const { data: visitData } = await supabase.from('visits').select('patient_id').eq('id', consultation.visit_id).single();
      
      const { data: rxData, error: rxErr } = await supabase.from('prescriptions').insert({
        consultation_id: consData.id,
        patient_id: visitData.patient_id,
        status: 'pending'
      }).select().single();

      if (!rxErr) {
        const itemsToInsert = prescriptionItems.map(item => ({
          prescription_id: rxData.id,
          drug_id: item.drug_id,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          total_quantity: item.total_quantity,
          instructions: item.instructions
        }));
        await supabase.from('prescription_items').insert(itemsToInsert);
      }
    }

    // Insert Lab requests
    if (labTests && labTests.length > 0) {
      const { data: visitData } = await supabase.from('visits').select('patient_id').eq('id', consultation.visit_id).single();
      const labRequestsToInsert = labTests.map(testId => ({
        visit_id: consultation.visit_id,
        patient_id: visitData.patient_id,
        test_id: testId,
        doctor_id: consultation.doctor_id,
        status: 'requested'
      }));
      await supabase.from('lab_requests').insert(labRequestsToInsert);
    }

    return consData;
  },

  // Pharmacy API
  getPrescriptions: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));

      // Filter only pending prescriptions for ease of workflow
      return prescriptions.filter(p => p.status === 'pending').map(p => {
        const patient = patients.find(pat => pat.id === p.patient_id);
        const items = pitems.filter(item => item.prescription_id === p.id).map(item => ({
          ...item,
          drug: drugs.find(d => d.id === item.drug_id)
        }));
        return { ...p, patient, items };
      });
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .select('*, patient:patients(*), items:prescription_items(*, drug:drugs(*))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  dispensePrescription: async (prescriptionId, dispensedItems) => {
    // dispensedItems = [{ item_id, drug_id, quantity }]
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions'));
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items'));
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches'));
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const activeLocId = getActiveLocationId();

      // Update prescription items
      dispensedItems.forEach(dispItem => {
        const itemIdx = pitems.findIndex(pi => pi.id === dispItem.item_id);
        if (itemIdx !== -1) {
          pitems[itemIdx].dispensed_quantity = dispItem.quantity;
        }

        // Deduct from location stock
        let qtyToDeduct = dispItem.quantity;
        const drugLocBatches = locStocks
          .filter(ls => ls.location_id === activeLocId && ls.drug_id === dispItem.drug_id && ls.quantity > 0)
          .map(ls => {
            const batch = batches.find(b => b.id === ls.batch_id);
            return { ls, batch };
          })
          .filter(item => item.batch !== undefined)
          .sort((a, b) => new Date(a.batch.expiry_date) - new Date(b.batch.expiry_date));

        for (let item of drugLocBatches) {
          if (qtyToDeduct <= 0) break;
          const available = item.ls.quantity;
          const deduct = Math.min(qtyToDeduct, available);
          
          item.ls.quantity -= deduct;
          
          // Deduct from batch total
          const batchIdx = batches.findIndex(b => b.id === item.batch.id);
          if (batchIdx !== -1) {
            batches[batchIdx].quantity_remaining -= deduct;
          }
          
          qtyToDeduct -= deduct;
        }

        // Recompute drug total stock
        const drugIdx = drugs.findIndex(d => d.id === dispItem.drug_id);
        if (drugIdx !== -1) {
          const remaining = batches.filter(b => b.drug_id === dispItem.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
          drugs[drugIdx].total_stock = remaining;
        }
      });

      // Update prescription status
      const rxIdx = prescriptions.findIndex(p => p.id === prescriptionId);
      if (rxIdx !== -1) {
        prescriptions[rxIdx].status = 'dispensed';
      }

      localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return true;
    }

    // Supabase operations
    const activeLocId = getActiveLocationId();
    for (let dispItem of dispensedItems) {
      // Update item dispensed qty
      await supabase.from('prescription_items').update({ dispensed_quantity: dispItem.quantity }).eq('id', dispItem.item_id);

      // Decrement location stock & batch inventory
      const { data: activeLocStocks } = await supabase
        .from('location_stock')
        .select('*, stock_batches!inner(expiry_date)')
        .eq('location_id', activeLocId)
        .eq('drug_id', dispItem.drug_id)
        .gt('quantity', 0)
        .order('stock_batches(expiry_date)', { ascending: true });

      let qtyLeft = dispItem.quantity;
      if (activeLocStocks) {
        for (let locStockItem of activeLocStocks) {
          if (qtyLeft <= 0) break;
          const deduct = Math.min(qtyLeft, locStockItem.quantity);
          
          // Update location stock
          await supabase
            .from('location_stock')
            .update({ quantity: locStockItem.quantity - deduct })
            .eq('id', locStockItem.id);

          // Update batch stock
          const { data: batch } = await supabase
            .from('stock_batches')
            .select('quantity_remaining')
            .eq('id', locStockItem.batch_id)
            .single();
          if (batch) {
            await supabase
              .from('stock_batches')
              .update({ quantity_remaining: Math.max(0, batch.quantity_remaining - deduct) })
              .eq('id', locStockItem.batch_id);
          }
          
          // Log Transaction
          await supabase.from('inventory_transactions').insert({
            drug_id: dispItem.drug_id,
            batch_id: locStockItem.batch_id,
            transaction_type: 'dispense',
            quantity: -deduct
          });

          qtyLeft -= deduct;
        }
      }
    }

    // Set prescription status to completed
    await supabase.from('prescriptions').update({ status: 'dispensed' }).eq('id', prescriptionId);
    return true;
  },

  dispenseDirectPrescription: async (patientName, patientId, items) => {
    // items = [{ drug_id, dosage, frequency, duration, quantity, instructions }]
    if (isDemoMode()) {
      initDemoDb();
      const prescriptions = JSON.parse(localStorage.getItem('mycliniq_prescriptions')) || [];
      const pitems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const activeLocId = getActiveLocationId();

      // Create a dummy patient if not selected
      let finalPatientId = patientId;
      if (!finalPatientId) {
        finalPatientId = 'SM_WALKIN';
      }

      const rxId = 'rx_' + Math.random().toString(36).substr(2, 9);
      const newRx = {
        id: rxId,
        patient_id: finalPatientId,
        patient_name: patientName || 'Walk-in Patient',
        status: 'dispensed',
        created_at: new Date().toISOString()
      };
      prescriptions.push(newRx);

      items.forEach(item => {
        const itemId = 'pi_' + Math.random().toString(36).substr(2, 9);
        pitems.push({
          id: itemId,
          prescription_id: rxId,
          drug_id: item.drug_id,
          dosage: item.dosage || '1 tab',
          frequency: item.frequency || 'OD',
          duration: item.duration || '5 days',
          total_quantity: item.quantity,
          dispensed_quantity: item.quantity,
          instructions: item.instructions || ''
        });

        // Deduct from location stock
        let qtyToDeduct = item.quantity;
        const drugLocBatches = locStocks
          .filter(ls => ls.location_id === activeLocId && ls.drug_id === item.drug_id && ls.quantity > 0)
          .map(ls => {
            const batch = batches.find(b => b.id === ls.batch_id);
            return { ls, batch };
          })
          .filter(x => x.batch !== undefined)
          .sort((a, b) => new Date(a.batch.expiry_date) - new Date(b.batch.expiry_date));

        for (let pair of drugLocBatches) {
          if (qtyToDeduct <= 0) break;
          const available = pair.ls.quantity;
          const deduct = Math.min(qtyToDeduct, available);
          
          pair.ls.quantity -= deduct;
          
          const batchIdx = batches.findIndex(b => b.id === pair.batch.id);
          if (batchIdx !== -1) {
            batches[batchIdx].quantity_remaining -= deduct;
          }
          
          qtyToDeduct -= deduct;
        }

        // Recompute drug total stock
        const drugIdx = drugs.findIndex(d => d.id === item.drug_id);
        if (drugIdx !== -1) {
          const remaining = batches.filter(b => b.drug_id === item.drug_id).reduce((sum, b) => sum + b.quantity_remaining, 0);
          drugs[drugIdx].total_stock = remaining;
        }
      });

      localStorage.setItem('mycliniq_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('mycliniq_prescription_items', JSON.stringify(pitems));
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return { id: rxId, patient_name: patientName, items };
    }

    // Supabase mode
    let finalPatientId = patientId;
    if (!finalPatientId) {
      const { data: walkinPat } = await supabase.from('patients').select('id').eq('full_name', 'Walk-in Patient').limit(1);
      if (walkinPat && walkinPat.length > 0) {
        finalPatientId = walkinPat[0].id;
      } else {
        const { data: newPat } = await supabase.from('patients').insert({
          id: 'SM999999',
          full_name: 'Walk-in Patient',
          gender: 'other',
          phone: '0000000000',
          address: 'Walk-in'
        }).select().single();
        finalPatientId = newPat.id;
      }
    }

    const { data: rxData, error: rxErr } = await supabase.from('prescriptions').insert({
      patient_id: finalPatientId,
      status: 'dispensed',
      notes: `Walk-in Dispense for: ${patientName}`
    }).select().single();

    if (rxErr) throw rxErr;

    const activeLocId = getActiveLocationId();
    for (let item of items) {
      await supabase.from('prescription_items').insert({
        prescription_id: rxData.id,
        drug_id: item.drug_id,
        dosage: item.dosage || '1 tab',
        frequency: item.frequency || 'OD',
        duration: item.duration || '5 days',
        total_quantity: item.quantity,
        dispensed_quantity: item.quantity,
        instructions: item.instructions || ''
      });

      const { data: activeLocStocks } = await supabase
        .from('location_stock')
        .select('*, stock_batches!inner(expiry_date)')
        .eq('location_id', activeLocId)
        .eq('drug_id', item.drug_id)
        .gt('quantity', 0)
        .order('stock_batches(expiry_date)', { ascending: true });

      let qtyLeft = item.quantity;
      if (activeLocStocks) {
        for (let locStockItem of activeLocStocks) {
          if (qtyLeft <= 0) break;
          const deduct = Math.min(qtyLeft, locStockItem.quantity);
          
          await supabase
            .from('location_stock')
            .update({ quantity: locStockItem.quantity - deduct })
            .eq('id', locStockItem.id);

          const { data: batch } = await supabase
            .from('stock_batches')
            .select('quantity_remaining')
            .eq('id', locStockItem.batch_id)
            .single();
          if (batch) {
            await supabase
              .from('stock_batches')
              .update({ quantity_remaining: Math.max(0, batch.quantity_remaining - deduct) })
              .eq('id', locStockItem.batch_id);
          }
          
          await supabase.from('inventory_transactions').insert({
            drug_id: item.drug_id,
            batch_id: locStockItem.batch_id,
            transaction_type: 'dispense',
            quantity: -deduct
          });

          qtyLeft -= deduct;
        }
      }
    }

    return rxData;
  },

  // Inventory Catalog API
  getDrugs: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_drugs'));
    }
    const { data, error } = await supabase.from('drugs').select('*').order('brand_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addDrugBatch: async (drugId, batchNumber, expiryDate, qty, cost, sellingPrice, bonusQty, locationId = 'main', billId = null) => {
    const parsedQty = parseInt(qty) || 0;
    const parsedBonusQty = parseInt(bonusQty) || 0;
    const totalQty = parsedQty + parsedBonusQty;
    const parsedCost = parseFloat(cost) || 0;
    const parsedSellingPrice = parseFloat(sellingPrice) || 0;

    if (isDemoMode()) {
      initDemoDb();
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches'));
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];

      const newBatch = {
        id: 'b_' + Math.random().toString(36).substr(2, 9),
        drug_id: drugId,
        batch_number: batchNumber,
        expiry_date: expiryDate,
        quantity_received: parsedQty,
        bonus_quantity: parsedBonusQty,
        quantity_remaining: totalQty,
        purchase_price: parsedCost,
        selling_price: parsedSellingPrice,
        bill_id: billId,
        created_at: new Date().toISOString()
      };

      batches.push(newBatch);
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));

      // Add to location stock
      const locIdx = locStocks.findIndex(ls => ls.location_id === locationId && ls.drug_id === drugId && ls.batch_id === newBatch.id);
      if (locIdx !== -1) {
        locStocks[locIdx].quantity += totalQty;
      } else {
        locStocks.push({
          id: 'ls_' + Math.random().toString(36).substr(2, 9),
          location_id: locationId,
          drug_id: drugId,
          batch_id: newBatch.id,
          quantity: totalQty
        });
      }
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));

      // Recalculate stock
      const drugIdx = drugs.findIndex(d => d.id === drugId);
      if (drugIdx !== -1) {
        drugs[drugIdx].total_stock = batches.filter(b => b.drug_id === drugId).reduce((sum, b) => sum + b.quantity_remaining, 0);
        drugs[drugIdx].unit_price = parsedCost;
        drugs[drugIdx].selling_price = parsedSellingPrice;
        localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      }
      return newBatch;
    }

    const insertObj = {
      drug_id: drugId,
      batch_number: batchNumber,
      expiry_date: expiryDate,
      quantity_received: parsedQty,
      quantity_remaining: totalQty,
      purchase_price: parsedCost,
      bill_id: billId
    };

    try {
      insertObj.selling_price = parsedSellingPrice;
      insertObj.bonus_quantity = parsedBonusQty;
    } catch(e) {}

    const { data: batchData, error } = await supabase.from('stock_batches').insert(insertObj).select().single();

    if (error) throw error;

    // Add to location_stock
    await supabase.from('location_stock').insert({
      location_id: locationId,
      drug_id: drugId,
      batch_id: batchData.id,
      quantity: totalQty
    });

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      drug_id: drugId,
      batch_id: batchData.id,
      transaction_type: 'stock_in',
      quantity: totalQty
    });

    return batchData;
  },

  addDrug: async (drug) => {
    if (isDemoMode()) {
      initDemoDb();
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      const newDrug = {
        ...drug,
        id: 'd_' + Math.random().toString(36).substr(2, 9),
        total_stock: 0,
        reorder_level: parseInt(drug.reorder_level) || 50,
        unit_price: parseFloat(drug.unit_price) || 0,
        selling_price: parseFloat(drug.selling_price) || 0,
        created_at: new Date().toISOString()
      };
      drugs.push(newDrug);
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return newDrug;
    }

    const { data, error } = await supabase.from('drugs').insert({
      brand_name: drug.brand_name,
      generic_name: drug.generic_name,
      form: drug.form,
      route: drug.route || 'oral',
      manufacturer: drug.manufacturer || '',
      strength: drug.strength,
      reorder_level: parseInt(drug.reorder_level) || 50,
      unit_price: parseFloat(drug.unit_price) || 0,
      selling_price: parseFloat(drug.selling_price) || 0
    }).select().single();

    if (error) throw error;
    return data;
  },

  // Lab Module API
  getLabRequests: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const requests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const tests = JSON.parse(localStorage.getItem('mycliniq_lab_tests'));

      // Filter only requested/collected
      return requests.map(req => ({
        ...req,
        patient: patients.find(p => p.id === req.patient_id),
        test: tests.find(t => t.id === req.test_id)
      }));
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .select('*, patient:patients(*), test:lab_tests(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  updateLabResult: async (requestId, resultValue, remarks, mltId) => {
    if (isDemoMode()) {
      initDemoDb();
      const requests = JSON.parse(localStorage.getItem('mycliniq_lab_requests'));
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].result_value = resultValue;
        requests[idx].remarks = remarks;
        requests[idx].status = 'completed';
        requests[idx].mlt_id = mltId || 'mlt1';
        localStorage.setItem('mycliniq_lab_requests', JSON.stringify(requests));
      }
      return requests[idx];
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        result_value: resultValue,
        remarks: remarks,
        status: 'completed',
        mlt_id: mltId
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Lab Tests Catalog
  getLabTests: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_lab_tests'));
    }
    const { data, error } = await supabase.from('lab_tests').select('*').order('test_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  getBatches: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_stock_batches')) || [];
    }
    const { data, error } = await supabase.from('stock_batches').select('*').order('expiry_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  getUsers: async () => {
    if (isDemoMode() || !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-')) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_users')) || [];
    }
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_users')) || [];
    }
  },

  addUser: async (user) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error('Username already exists.');
      }
      const newUser = { 
        ...user, 
        id: 'u_' + Math.random().toString(36).substr(2, 9), 
        created_at: new Date().toISOString() 
      };
      users.push(newUser);
      localStorage.setItem('mycliniq_users', JSON.stringify(users));
      return newUser;
    }
    const { data, error } = await supabase.from('profiles').insert(user).select().single();
    if (error) throw error;
    return data;
  },

  deleteUser: async (userId) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      const filtered = users.filter(u => u.id !== userId);
      localStorage.setItem('mycliniq_users', JSON.stringify(filtered));
      return true;
    }
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  },

  updateUser: async (userId, updates) => {
    if (isDemoMode()) {
      initDemoDb();
      const users = JSON.parse(localStorage.getItem('mycliniq_users')) || [];
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('mycliniq_users', JSON.stringify(users));
        return users[idx];
      }
      throw new Error('User not found.');
    }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  getSuppliers: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_suppliers')) || [];
    }
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addSupplier: async (supplier) => {
    if (isDemoMode()) {
      initDemoDb();
      const suppliers = JSON.parse(localStorage.getItem('mycliniq_suppliers')) || [];
      const newSupplier = {
        ...supplier,
        id: 's_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      suppliers.push(newSupplier);
      localStorage.setItem('mycliniq_suppliers', JSON.stringify(suppliers));
      return newSupplier;
    }
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
    if (error) throw error;
    return data;
  },

  getSupplierBills: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
    }
    const { data, error } = await supabase.from('supplier_bills').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addSupplierBill: async (bill) => {
    if (isDemoMode()) {
      initDemoDb();
      const bills = JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
      const newBill = {
        ...bill,
        id: 'sb_' + Math.random().toString(36).substr(2, 9),
        amount_paid: 0.00,
        payment_status: bill.payment_status || 'credit',
        created_at: new Date().toISOString()
      };
      bills.push(newBill);
      localStorage.setItem('mycliniq_supplier_bills', JSON.stringify(bills));
      return newBill;
    }
    const { data, error } = await supabase.from('supplier_bills').insert(bill).select().single();
    if (error) throw error;
    return data;
  },

  getSupplierPayments: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_supplier_payments')) || [];
    }
    const { data, error } = await supabase.from('supplier_payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addSupplierPayment: async (payment) => {
    const amount = parseFloat(payment.amount) || 0;
    if (isDemoMode()) {
      initDemoDb();
      const payments = JSON.parse(localStorage.getItem('mycliniq_supplier_payments')) || [];
      const bills = JSON.parse(localStorage.getItem('mycliniq_supplier_bills')) || [];
      
      const newPayment = {
        ...payment,
        id: 'sp_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      payments.push(newPayment);
      localStorage.setItem('mycliniq_supplier_payments', JSON.stringify(payments));

      // Update bill
      const billIdx = bills.findIndex(b => b.id === payment.bill_id);
      if (billIdx !== -1) {
        bills[billIdx].amount_paid = (parseFloat(bills[billIdx].amount_paid) || 0) + amount;
        if (bills[billIdx].amount_paid >= bills[billIdx].total_amount) {
          bills[billIdx].payment_status = 'paid';
        } else if (bills[billIdx].amount_paid > 0) {
          bills[billIdx].payment_status = 'partially_paid';
        }
        localStorage.setItem('mycliniq_supplier_bills', JSON.stringify(bills));
      }
      return newPayment;
    }

    const { data, error } = await supabase.from('supplier_payments').insert(payment).select().single();
    if (error) throw error;

    // Fetch and update bill
    const { data: bill } = await supabase.from('supplier_bills').select('*').eq('id', payment.bill_id).single();
    if (bill) {
      const newPaid = (parseFloat(bill.amount_paid) || 0) + amount;
      let newStatus = 'credit';
      if (newPaid >= bill.total_amount) {
        newStatus = 'paid';
      } else if (newPaid > 0) {
        newStatus = 'partially_paid';
      }
      await supabase.from('supplier_bills').update({ amount_paid: newPaid, payment_status: newStatus }).eq('id', payment.bill_id);
    }

    return data;
  },

  getLocations: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_locations')) || [];
    }
    const { data, error } = await supabase.from('locations').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  getLocationStock: async () => {
    if (isDemoMode()) {
      initDemoDb();
      return JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
    }
    const { data, error } = await supabase.from('location_stock').select('*');
    if (error) throw error;
    return data;
  },

  getStockTransfers: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const transfers = JSON.parse(localStorage.getItem('mycliniq_stock_transfers')) || [];
      const items = JSON.parse(localStorage.getItem('mycliniq_stock_transfer_items')) || [];
      return transfers.map(t => ({
        ...t,
        items: items.filter(i => i.transfer_id === t.id)
      }));
    }
    const { data, error } = await supabase
      .from('stock_transfers')
      .select('*, items:stock_transfer_items(*)')
      .order('transfer_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  transferStock: async (fromLocationId, toLocationId, items) => {
    // items = [{ drug_id, batch_id, quantity }]
    if (isDemoMode()) {
      initDemoDb();
      const locStocks = JSON.parse(localStorage.getItem('mycliniq_location_stock')) || [];
      const transfers = JSON.parse(localStorage.getItem('mycliniq_stock_transfers')) || [];
      const transferItems = JSON.parse(localStorage.getItem('mycliniq_stock_transfer_items')) || [];

      const transferId = 't_' + Math.random().toString(36).substr(2, 9);
      const newTransfer = {
        id: transferId,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        transfer_date: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString()
      };

      for (let item of items) {
        const qty = parseInt(item.quantity) || 0;
        if (qty <= 0) continue;

        // Deduct from sender location
        const fromIdx = locStocks.findIndex(ls => ls.location_id === fromLocationId && ls.drug_id === item.drug_id && ls.batch_id === item.batch_id);
        if (fromIdx !== -1) {
          locStocks[fromIdx].quantity = Math.max(0, locStocks[fromIdx].quantity - qty);
        }

        // Add to receiver location
        const toIdx = locStocks.findIndex(ls => ls.location_id === toLocationId && ls.drug_id === item.drug_id && ls.batch_id === item.batch_id);
        if (toIdx !== -1) {
          locStocks[toIdx].quantity += qty;
        } else {
          locStocks.push({
            id: 'ls_' + Math.random().toString(36).substr(2, 9),
            location_id: toLocationId,
            drug_id: item.drug_id,
            batch_id: item.batch_id,
            quantity: qty
          });
        }

        transferItems.push({
          id: 'ti_' + Math.random().toString(36).substr(2, 9),
          transfer_id: transferId,
          drug_id: item.drug_id,
          batch_id: item.batch_id,
          quantity: qty,
          created_at: new Date().toISOString()
        });
      }

      transfers.push(newTransfer);
      localStorage.setItem('mycliniq_location_stock', JSON.stringify(locStocks));
      localStorage.setItem('mycliniq_stock_transfers', JSON.stringify(transfers));
      localStorage.setItem('mycliniq_stock_transfer_items', JSON.stringify(transferItems));
      return { ...newTransfer, items: transferItems.filter(i => i.transfer_id === transferId) };
    }

    // Supabase mode
    const { data: transferData, error: tErr } = await supabase.from('stock_transfers').insert({
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      status: 'completed'
    }).select().single();

    if (tErr) throw tErr;

    for (let item of items) {
      const qty = parseInt(item.quantity) || 0;
      if (qty <= 0) continue;

      // Deduct from sender location
      const { data: fromStock } = await supabase
        .from('location_stock')
        .select('*')
        .eq('location_id', fromLocationId)
        .eq('drug_id', item.drug_id)
        .eq('batch_id', item.batch_id)
        .single();
      if (fromStock) {
        await supabase
          .from('location_stock')
          .update({ quantity: Math.max(0, fromStock.quantity - qty) })
          .eq('id', fromStock.id);
      }

      // Add to receiver location
      const { data: toStock } = await supabase
        .from('location_stock')
        .select('*')
        .eq('location_id', toLocationId)
        .eq('drug_id', item.drug_id)
        .eq('batch_id', item.batch_id);

      if (toStock && toStock.length > 0) {
        await supabase
          .from('location_stock')
          .update({ quantity: toStock[0].quantity + qty })
          .eq('id', toStock[0].id);
      } else {
        await supabase.from('location_stock').insert({
          location_id: toLocationId,
          drug_id: item.drug_id,
          batch_id: item.batch_id,
          quantity: qty
        });
      }

      // Insert item
      await supabase.from('stock_transfer_items').insert({
        transfer_id: transferData.id,
        drug_id: item.drug_id,
        batch_id: item.batch_id,
        quantity: qty
      });
    }

    return transferData;
  },

  getActiveCashSession: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const active = sessions.find(s => s.status === 'open');
      return active || null;
    }
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('status', 'open')
      .maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  },

  openCashSession: async (openedBy, openingBalance) => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const active = sessions.find(s => s.status === 'open');
      if (active) throw new Error('A cash register session is already open.');

      const newSession = {
        id: 'cs_' + Math.random().toString(36).substr(2, 9),
        opened_at: new Date().toISOString(),
        opened_by: openedBy,
        closed_at: null,
        closed_by: null,
        opening_balance: parseFloat(openingBalance) || 0,
        cash_sales: 0,
        expenses: 0,
        payouts: 0,
        closing_balance_actual: null,
        closing_balance_expected: null,
        status: 'open',
        manager_handover_amount: 0,
        notes: '',
        created_at: new Date().toISOString()
      };
      sessions.push(newSession);
      localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      return newSession;
    }

    const { data: active } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('status', 'open')
      .maybeSingle();
    if (active) throw new Error('A cash register session is already open.');

    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({
        opened_by: openedBy,
        opening_balance: parseFloat(openingBalance) || 0,
        status: 'open'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  closeCashSession: async (sessionId, closedBy, actualBalance, handoverAmount, notes) => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx === -1) throw new Error('Session not found');

      const s = sessions[idx];
      const expected = parseFloat(s.opening_balance) + parseFloat(s.cash_sales) - parseFloat(s.expenses) - parseFloat(s.payouts);
      
      s.closed_at = new Date().toISOString();
      s.closed_by = closedBy;
      s.closing_balance_actual = parseFloat(actualBalance) || 0;
      s.closing_balance_expected = expected;
      s.status = 'closed';
      s.manager_handover_amount = parseFloat(handoverAmount) || 0;
      s.notes = notes;

      localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      return s;
    }

    const { data: s, error: fErr } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (fErr) throw fErr;

    const expected = parseFloat(s.opening_balance) + parseFloat(s.cash_sales) - parseFloat(s.expenses) - parseFloat(s.payouts);

    const { data, error } = await supabase
      .from('cash_sessions')
      .update({
        closed_at: new Date().toISOString(),
        closed_by: closedBy,
        closing_balance_actual: parseFloat(actualBalance) || 0,
        closing_balance_expected: expected,
        status: 'closed',
        manager_handover_amount: parseFloat(handoverAmount) || 0,
        notes: notes
      })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  addCashTransaction: async (sessionId, type, amount, description, createdBy, referenceId = null) => {
    if (isDemoMode()) {
      initDemoDb();
      const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
      const newTx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        session_id: sessionId,
        transaction_type: type,
        amount: parseFloat(amount) || 0,
        description,
        reference_id: referenceId,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      txs.push(newTx);
      localStorage.setItem('mycliniq_cash_transactions', JSON.stringify(txs));

      // Update session totals
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      const sIdx = sessions.findIndex(s => s.id === sessionId);
      if (sIdx !== -1) {
        const val = parseFloat(amount) || 0;
        if (type === 'expense') {
          sessions[sIdx].expenses = (parseFloat(sessions[sIdx].expenses) || 0) + val;
        } else if (type === 'payout') {
          sessions[sIdx].payouts = (parseFloat(sessions[sIdx].payouts) || 0) + val;
        } else if (type === 'income') {
          sessions[sIdx].cash_sales = (parseFloat(sessions[sIdx].cash_sales) || 0) + val;
        }
        localStorage.setItem('mycliniq_cash_sessions', JSON.stringify(sessions));
      }
      return newTx;
    }

    const { data, error } = await supabase
      .from('cash_transactions')
      .insert({
        session_id: sessionId,
        transaction_type: type,
        amount: parseFloat(amount) || 0,
        description,
        reference_id: referenceId,
        created_by: createdBy
      })
      .select()
      .single();
    if (error) throw error;

    // Update session totals in database
    const val = parseFloat(amount) || 0;
    const { data: s } = await supabase.from('cash_sessions').select('*').eq('id', sessionId).single();
    if (s) {
      const updates = {};
      if (type === 'expense') updates.expenses = (parseFloat(s.expenses) || 0) + val;
      else if (type === 'payout') updates.payouts = (parseFloat(s.payouts) || 0) + val;
      else if (type === 'income') updates.cash_sales = (parseFloat(s.cash_sales) || 0) + val;
      
      if (Object.keys(updates).length > 0) {
        await supabase.from('cash_sessions').update(updates).eq('id', sessionId);
      }
    }

    return data;
  },

  getCashSessions: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const sessions = JSON.parse(localStorage.getItem('mycliniq_cash_sessions')) || [];
      return [...sessions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getCashTransactions: async (sessionId) => {
    if (isDemoMode()) {
      initDemoDb();
      const txs = JSON.parse(localStorage.getItem('mycliniq_cash_transactions')) || [];
      return txs.filter(t => t.session_id === sessionId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('cash_transactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getLabWeeklyBalances: async () => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      return [...balances].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  addLabWeeklyBalance: async (startDate, endDate, expectedAmount, actualAmount, notes, createdBy) => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      const newB = {
        id: 'wb_' + Math.random().toString(36).substr(2, 9),
        start_date: startDate,
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount) || 0,
        actual_amount: parseFloat(actualAmount) || 0,
        status: 'pending',
        settled_by: null,
        settled_at: null,
        notes,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
      balances.push(newB);
      localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify(balances));
      return newB;
    }

    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .insert({
        start_date: startDate,
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount) || 0,
        actual_amount: parseFloat(actualAmount) || 0,
        status: 'pending',
        notes,
        created_by: createdBy
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateLabWeeklyBalanceStatus: async (balanceId, status, settledBy) => {
    if (isDemoMode()) {
      initDemoDb();
      const balances = JSON.parse(localStorage.getItem('mycliniq_lab_weekly_balances')) || [];
      const idx = balances.findIndex(b => b.id === balanceId);
      if (idx !== -1) {
        balances[idx].status = status;
        balances[idx].settled_by = settledBy;
        balances[idx].settled_at = new Date().toISOString();
        localStorage.setItem('mycliniq_lab_weekly_balances', JSON.stringify(balances));
        return balances[idx];
      }
      throw new Error('Settlement not found');
    }

    const { data, error } = await supabase
      .from('lab_weekly_balances')
      .update({
        status,
        settled_by: settledBy,
        settled_at: new Date().toISOString()
      })
      .eq('id', balanceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getLabRevenueForPeriod: async (startDate, endDate) => {
    if (isDemoMode()) {
      initDemoDb();
      const lr = JSON.parse(localStorage.getItem('mycliniq_lab_requests')) || [];
      const lt = JSON.parse(localStorage.getItem('mycliniq_lab_tests')) || [];
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits')) || [];

      // Filter visits of type 'lab' or other visits that are paid
      const paidVisits = visits.filter(v => v.payment_status === 'paid');
      
      const filtered = lr.filter(r => {
        // Must belong to a paid visit or be completed
        const isPaid = paidVisits.some(v => v.id === r.visit_id);
        if (!isPaid) return false;

        const dateStr = r.created_at ? r.created_at.split('T')[0] : '';
        return dateStr >= startDate && dateStr <= endDate;
      });

      const total = filtered.reduce((sum, r) => {
        const test = lt.find(t => t.id === r.test_id);
        return sum + (test ? parseFloat(test.cost) : 0);
      }, 0);
      return total;
    }

    // Supabase mode
    const { data, error } = await supabase
      .from('lab_requests')
      .select(`
        created_at,
        visit_id,
        test:lab_tests(cost),
        visit:visits(payment_status)
      `)
      .gte('created_at', startDate + 'T00:00:00Z')
      .lte('created_at', endDate + 'T23:59:59Z');

    if (error) throw error;
    
    // Filter client-side where visit is paid
    const paidRequests = data.filter(r => r.visit && r.visit.payment_status === 'paid');
    const total = paidRequests.reduce((sum, r) => {
      return sum + (r.test ? parseFloat(r.test.cost) : 0);
    }, 0);
    return total;
  }
};
