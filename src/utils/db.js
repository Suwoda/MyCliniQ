// Database abstraction layer supporting both production Supabase and interactive Offline Demo mode.
import { supabase } from './supabase';

const INITIAL_DRUGS = [
  { id: 'd1', brand_name: 'Panadol', generic_name: 'Paracetamol', form: 'tablet', strength: '500mg', total_stock: 1200, reorder_level: 200, unit_price: 1.50, selling_price: 2.50 },
  { id: 'd2', brand_name: 'Alerid', generic_name: 'Cetirizine', form: 'tablet', strength: '10mg', total_stock: 450, reorder_level: 100, unit_price: 2.00, selling_price: 4.00 },
  { id: 'd3', brand_name: 'Amoxil', generic_name: 'Amoxicillin', form: 'capsule', strength: '250mg', total_stock: 300, reorder_level: 100, unit_price: 5.00, selling_price: 8.00 },
  { id: 'd4', brand_name: 'Amoxil', generic_name: 'Amoxicillin', form: 'capsule', strength: '500mg', total_stock: 200, reorder_level: 100, unit_price: 8.00, selling_price: 12.00 },
  { id: 'd5', brand_name: 'Lipitor', generic_name: 'Atorvastatin', form: 'tablet', strength: '10mg', total_stock: 150, reorder_level: 50, unit_price: 12.00, selling_price: 18.00 },
  { id: 'd6', brand_name: 'Glucophage', generic_name: 'Metformin', form: 'tablet', strength: '500mg', total_stock: 800, reorder_level: 150, unit_price: 3.00, selling_price: 5.00 },
  { id: 'd7', brand_name: 'Zaart', generic_name: 'Losartan Potassium', form: 'tablet', strength: '50mg', total_stock: 600, reorder_level: 100, unit_price: 8.00, selling_price: 12.00 }
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
  { id: 'p1', nic: '782345678V', full_name: 'Sunil Perera', date_of_birth: '1978-05-12', gender: 'male', phone: '0771234567', address: '123, Galle Road, Colombo 03', allergies: ['Penicillin'], chronic_illnesses: ['Hypertension', 'Diabetes'], created_at: new Date().toISOString() },
  { id: 'p2', nic: '856712345V', full_name: 'Anula Jayasinghe', date_of_birth: '1985-09-24', gender: 'female', phone: '0719876543', address: '45, Kandy Road, Kadawatha', allergies: [], chronic_illnesses: ['Asthma'], created_at: new Date().toISOString() }
];

const INITIAL_VISITS = [
  { id: 'v1', patient_id: 'p1', visit_date: new Date().toISOString().split('T')[0], queue_number: 1, doctor_id: 'doc1', status: 'waiting', systolic_bp: 130, diastolic_bp: 85, temperature: 36.8, weight_kg: 74.5, chief_complaint: 'පපුවේ මද රෝගී ගතිය සහ හිසරදය.', created_at: new Date().toISOString() }
];

const INITIAL_APPOINTMENTS = [
  { id: 'a1', patient_id: 'p2', doctor_id: 'doc1', appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], queue_number: 5, status: 'scheduled', booked_by: 'phone', created_at: new Date().toISOString() }
];

// Helper to check if we are in demo mode
const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isDemo') === 'true';
};

// Initialize Storage if empty
const initDemoDb = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mycliniq_patients')) localStorage.setItem('mycliniq_patients', JSON.stringify(INITIAL_PATIENTS));
  if (!localStorage.getItem('mycliniq_drugs')) localStorage.setItem('mycliniq_drugs', JSON.stringify(INITIAL_DRUGS));
  if (!localStorage.getItem('mycliniq_lab_tests')) localStorage.setItem('mycliniq_lab_tests', JSON.stringify(INITIAL_LAB_TESTS));
  if (!localStorage.getItem('mycliniq_visits')) localStorage.setItem('mycliniq_visits', JSON.stringify(INITIAL_VISITS));
  if (!localStorage.getItem('mycliniq_appointments')) localStorage.setItem('mycliniq_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  if (!localStorage.getItem('mycliniq_prescriptions')) localStorage.setItem('mycliniq_prescriptions', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_prescription_items')) localStorage.setItem('mycliniq_prescription_items', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_lab_requests')) localStorage.setItem('mycliniq_lab_requests', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_consultations')) localStorage.setItem('mycliniq_consultations', JSON.stringify([]));
  if (!localStorage.getItem('mycliniq_stock_batches')) {
    const batches = [
      { id: 'b1', drug_id: 'd1', batch_number: 'PAN-2026', expiry_date: '2027-12-31', quantity_received: 1500, quantity_remaining: 1200, purchase_price: 1.50 },
      { id: 'b2', drug_id: 'd2', batch_number: 'ALE-004', expiry_date: '2026-11-30', quantity_received: 500, quantity_remaining: 450, purchase_price: 2.00 },
      { id: 'b3', drug_id: 'd7', batch_number: 'ZAA-19', expiry_date: '2027-05-15', quantity_received: 1000, quantity_remaining: 600, purchase_price: 8.00 }
    ];
    localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));
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
      const patients = JSON.parse(localStorage.getItem('mycliniq_patients'));
      const newPatient = { ...patient, id: 'p_' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
      patients.push(newPatient);
      localStorage.setItem('mycliniq_patients', JSON.stringify(patients));
      return newPatient;
    }
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
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
      const newVisit = { ...visit, id: 'v_' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
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

  // Clinical Consultation & Prescriptions
  addConsultation: async (consultation, prescriptionItems, labTests) => {
    if (isDemoMode()) {
      initDemoDb();
      const consultations = JSON.parse(localStorage.getItem('mycliniq_consultations'));
      const cid = 'c_' + Math.random().toString(36).substr(2, 9);
      const newConsultation = { ...consultation, id: cid, created_at: new Date().toISOString() };
      consultations.push(newConsultation);
      localStorage.setItem('mycliniq_consultations', JSON.stringify(consultations));

      // Update visit status
      const visits = JSON.parse(localStorage.getItem('mycliniq_visits'));
      const vidx = visits.findIndex(v => v.id === consultation.visit_id);
      if (vidx !== -1) visits[vidx].status = 'completed';
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

    // Supabase multi-step transaction simulation
    const { data: consData, error: consErr } = await supabase.from('consultations').insert(consultation).select().single();
    if (consErr) throw consErr;

    // Update visit status
    await supabase.from('visits').update({ status: 'completed' }).eq('id', consultation.visit_id);

    // Insert prescription header
    if (prescriptionItems && prescriptionItems.length > 0) {
      // Find patient_id from visit
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

      // Update prescription items
      dispensedItems.forEach(dispItem => {
        const itemIdx = pitems.findIndex(pi => pi.id === dispItem.item_id);
        if (itemIdx !== -1) {
          pitems[itemIdx].dispensed_quantity = dispItem.quantity;
        }

        // Deduct from stock batches (FIFO style or simple batch match)
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
      localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      return true;
    }

    // Supabase operations
    for (let dispItem of dispensedItems) {
      // Update item dispensed qty
      await supabase.from('prescription_items').update({ dispensed_quantity: dispItem.quantity }).eq('id', dispItem.item_id);

      // Decrement batch inventory
      // Simple logic: fetch active batches for this drug, sort by expiry
      const { data: activeBatches } = await supabase
        .from('stock_batches')
        .select('*')
        .eq('drug_id', dispItem.drug_id)
        .gt('quantity_remaining', 0)
        .order('expiry_date', { ascending: true });

      let qtyLeft = dispItem.quantity;
      if (activeBatches) {
        for (let batch of activeBatches) {
          if (qtyLeft <= 0) break;
          const deduct = Math.min(qtyLeft, batch.quantity_remaining);
          await supabase
            .from('stock_batches')
            .update({ quantity_remaining: batch.quantity_remaining - deduct })
            .eq('id', batch.id);
          
          // Log Transaction
          await supabase.from('inventory_transactions').insert({
            drug_id: dispItem.drug_id,
            batch_id: batch.id,
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

  addDrugBatch: async (drugId, batchNumber, expiryDate, qty, cost) => {
    if (isDemoMode()) {
      initDemoDb();
      const drugs = JSON.parse(localStorage.getItem('mycliniq_drugs'));
      const batches = JSON.parse(localStorage.getItem('mycliniq_stock_batches'));

      const newBatch = {
        id: 'b_' + Math.random().toString(36).substr(2, 9),
        drug_id: drugId,
        batch_number: batchNumber,
        expiry_date: expiryDate,
        quantity_received: parseInt(qty),
        quantity_remaining: parseInt(qty),
        purchase_price: parseFloat(cost),
        created_at: new Date().toISOString()
      };

      batches.push(newBatch);
      localStorage.setItem('mycliniq_stock_batches', JSON.stringify(batches));

      // Recalculate stock
      const drugIdx = drugs.findIndex(d => d.id === drugId);
      if (drugIdx !== -1) {
        drugs[drugIdx].total_stock = batches.filter(b => b.drug_id === drugId).reduce((sum, b) => sum + b.quantity_remaining, 0);
        localStorage.setItem('mycliniq_drugs', JSON.stringify(drugs));
      }
      return newBatch;
    }

    const { data: batchData, error } = await supabase.from('stock_batches').insert({
      drug_id: drugId,
      batch_number: batchNumber,
      expiry_date: expiryDate,
      quantity_received: qty,
      quantity_remaining: qty,
      purchase_price: cost
    }).select().single();

    if (error) throw error;

    // Log transaction
    await supabase.from('inventory_transactions').insert({
      drug_id: drugId,
      batch_id: batchData.id,
      transaction_type: 'stock_in',
      quantity: qty
    });

    return batchData;
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
  }
};
