'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { OPD_DIAGNOSES, COMMON_NEGATIVE_SYMPTOMS, COMMON_SIGNS, SYMPTOM_DURATIONS } from '@/data/opdData';
import PatientProfileForm from '@/components/dashboard/PatientProfileForm';
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
  Info,
  UserPlus,
  Clock,
  CalendarDays,
  ClipboardList,
  UserCheck,
  Activity,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  ShieldAlert,
  Baby,
  BookOpen
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

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

const calculateBMI = (heightCm, weightKg) => {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  const heightM = h / 100;
  const bmiVal = w / (heightM * heightM);
  const bmiFixed = bmiVal.toFixed(1);
  
  let category = '';
  let color = 'var(--primary)';
  if (bmiVal < 18.5) {
    category = 'Underweight';
    color = '#f59e0b';
  } else if (bmiVal < 25) {
    category = 'Normal';
    color = '#10b981';
  } else if (bmiVal < 30) {
    category = 'Overweight';
    color = '#f59e0b';
  } else {
    category = 'Obese';
    color = '#ef4444';
  }

  return { value: bmiFixed, category, color };
};

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
  
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

  // Search & Filter for assistant tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');

  // Zoomed Photo Modal state
  const [zoomedPhoto, setZoomedPhoto] = useState(null);

  // Smart search suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  // Selection state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [previousTab, setPreviousTab] = useState(null);

  // Patient Registration Form State (Shared between register tab and edit functionality)
  const [patientForm, setPatientForm] = useState({
    id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
    address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: '',
    is_dob_estimated: false, estimated_age: ''
  });

  const [visitForm, setVisitForm] = useState({
    patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', height_cm: '', weight_kg: '', chief_complaint: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
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

  // OPD Diagnosis & Symptoms builder state
  const [showDiagnosisCollapse, setShowDiagnosisCollapse] = useState(true);
  const [showSymptomsCollapse, setShowSymptomsCollapse] = useState(true);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [selectedSymptomsList, setSelectedSymptomsList] = useState([]);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [activeSymptomIndex, setActiveSymptomIndex] = useState(null);

  // Custom Diagnoses & Overrides state
  const [customDiagnoses, setCustomDiagnoses] = useState([]);
  const [diagnosisOverrides, setDiagnosisOverrides] = useState({});

  // Important Negative Symptoms state
  const [showNegativeSymptomsCollapse, setShowNegativeSymptomsCollapse] = useState(true);
  const [selectedNegativeSymptomsList, setSelectedNegativeSymptomsList] = useState([]);
  const [negativeSymptomSearch, setNegativeSymptomSearch] = useState('');
  const [customNegativeSymptomInput, setCustomNegativeSymptomInput] = useState('');
  const [negativeSymptomsSummary, setNegativeSymptomsSummary] = useState('');

  // Associated Physical Signs state
  const [showSignsCollapse, setShowSignsCollapse] = useState(true);
  const [selectedSignsList, setSelectedSignsList] = useState([]);
  const [signSearch, setSignSearch] = useState('');
  const [customSignInput, setCustomSignInput] = useState('');
  const [signsSummary, setSignsSummary] = useState('');

  // Patient Care Management state
  const [treatmentRegimes, setTreatmentRegimes] = useState([]);
  const [pregnancyList, setPregnancyList] = useState([]);
  const [pediatricRules, setPediatricRules] = useState([]);
  const [isPatientPregnant, setIsPatientPregnant] = useState(false);

  // Frequency tracking (saved in localStorage)
  const [diagFreq, setDiagFreq] = useState({});
  const [symptomFreq, setSymptomFreq] = useState({});
  const [negativeSymptomFreq, setNegativeSymptomFreq] = useState({});
  const [signFreq, setSignFreq] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDiagFreq = localStorage.getItem('mycliniq_opd_diag_freq');
        if (savedDiagFreq) setDiagFreq(JSON.parse(savedDiagFreq));
        const savedSymptomFreq = localStorage.getItem('mycliniq_opd_symptom_freq');
        if (savedSymptomFreq) setSymptomFreq(JSON.parse(savedSymptomFreq));
        const savedNegFreq = localStorage.getItem('mycliniq_opd_neg_symptom_freq');
        if (savedNegFreq) setNegativeSymptomFreq(JSON.parse(savedNegFreq));
        const savedSignFreq = localStorage.getItem('mycliniq_opd_sign_freq');
        if (savedSignFreq) setSignFreq(JSON.parse(savedSignFreq));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      const [v, d, l, p, a, tr, preg, ped, cd, ov] = await Promise.all([
        db.getVisits(),
        db.getDrugs(),
        db.getLabTests(),
        db.getPatients(),
        db.getAppointments(),
        db.getTreatmentRegimes(),
        db.getPregnancyContraindications(),
        db.getPediatricDosingRules(),
        db.getCustomDiagnoses ? db.getCustomDiagnoses() : Promise.resolve([]),
        db.getDiagnosisOverrides ? db.getDiagnosisOverrides() : Promise.resolve({})
      ]);
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(l || []);
      setPatients(p || []);
      setAppointments(a || []);
      setTreatmentRegimes(tr || []);
      setPregnancyList(preg || []);
      setPediatricRules(ped || []);
      setCustomDiagnoses(cd || []);
      setDiagnosisOverrides(ov || {});
    } catch (err) {
      console.error(err);
    }
  };

  const incrementDiagFreq = (diagName) => {
    setDiagFreq(prev => {
      const updated = { ...prev, [diagName]: (prev[diagName] || 0) + 1 };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mycliniq_opd_diag_freq', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const incrementSymptomFreq = (sympName) => {
    setSymptomFreq(prev => {
      const updated = { ...prev, [sympName]: (prev[sympName] || 0) + 1 };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mycliniq_opd_symptom_freq', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleToggleDiagnosis = (diagName) => {
    let updated;
    if (selectedDiagnoses.includes(diagName)) {
      updated = selectedDiagnoses.filter(d => d !== diagName);
    } else {
      updated = [...selectedDiagnoses, diagName];
      incrementDiagFreq(diagName);
    }
    setSelectedDiagnoses(updated);
    setDiagnosis(updated.join(', '));
  };

  const getSuggestedTreatmentRegimes = () => {
    if (selectedDiagnoses.length === 0) return [];
    
    const matches = treatmentRegimes.filter(reg => {
      if (!reg.diagnoses || reg.diagnoses.length === 0) return false;
      return reg.diagnoses.some(d => selectedDiagnoses.includes(d));
    });

    matches.sort((a, b) => {
      const aExactCombo = a.diagnoses.every(d => selectedDiagnoses.includes(d));
      const bExactCombo = b.diagnoses.every(d => selectedDiagnoses.includes(d));
      if (aExactCombo && !bExactCombo) return -1;
      if (!aExactCombo && bExactCombo) return 1;
      return b.diagnoses.length - a.diagnoses.length;
    });

    return matches;
  };

  const handleApplyTreatmentRegime = (regime) => {
    if (!regime || !regime.items || regime.items.length === 0) return;

    const currentPatient = patients.find(p => p.id === selectedVisit?.patient_id);
    const patientAllergies = currentPatient?.allergies || [];
    const patientWeight = parseFloat(selectedVisit?.weight_kg || visitForm.weight_kg || 0);
    const isPregnant = isPatientPregnant || (currentPatient?.gender === 'female' && selectedDiagnoses.some(d => d.toLowerCase().includes('preg')));

    const updatedRx = [...rxItems];
    let added = 0;
    let skippedAllergy = 0;
    let skippedPregnancy = 0;

    regime.items.forEach(item => {
      const catalogDrug = drugs.find(d => 
        d.id === item.drug_id ||
        (item.brand_name && d.brand_name?.toLowerCase() === item.brand_name.toLowerCase()) ||
        (item.generic_name && d.generic_name?.toLowerCase() === item.generic_name.toLowerCase())
      );

      const allergyMatch = patientAllergies.some(alg => {
        const aStr = alg.toLowerCase().trim();
        return (
          (item.brand_name && item.brand_name.toLowerCase().includes(aStr)) ||
          (item.generic_name && item.generic_name.toLowerCase().includes(aStr)) ||
          (catalogDrug && catalogDrug.generic_name?.toLowerCase().includes(aStr))
        );
      });

      if (allergyMatch) {
        skippedAllergy++;
        return;
      }

      let pregMatch = false;
      if (isPregnant) {
        pregMatch = pregnancyList.some(p => {
          const pname = p.drug_name.toLowerCase().trim();
          const gname = (p.generic_name || '').toLowerCase().trim();
          return (
            (item.brand_name && item.brand_name.toLowerCase().includes(pname)) ||
            (item.generic_name && item.generic_name.toLowerCase().includes(gname || pname)) ||
            (catalogDrug && catalogDrug.generic_name?.toLowerCase().includes(gname || pname))
          );
        });
      }

      if (pregMatch) {
        skippedPregnancy++;
        return;
      }

      let doseVal = item.dosage;
      if (item.dosage === 'AUTO_WEIGHT' || regime.target_group === 'pediatric' || (catalogDrug && catalogDrug.form === 'syrup')) {
        const pedRule = pediatricRules.find(r => 
          r.drug_id === item.drug_id || 
          (item.brand_name && r.brand_name?.toLowerCase() === item.brand_name.toLowerCase()) ||
          (item.generic_name && r.generic_name?.toLowerCase() === item.generic_name.toLowerCase()) ||
          (catalogDrug && catalogDrug.generic_name?.toLowerCase() === r.generic_name?.toLowerCase())
        );

        if (pedRule && patientWeight > 0) {
          const ml = Math.min((patientWeight * (pedRule.ml_per_kg_per_dose || 0.625)).toFixed(1), pedRule.max_single_dose_ml || 20);
          doseVal = `${ml} mL (${pedRule.mg_per_kg_per_dose || 15}mg/kg for ${patientWeight}kg)`;
        } else if (patientWeight > 0 && catalogDrug && catalogDrug.form === 'syrup') {
          const ml = Math.min((patientWeight * 0.625).toFixed(1), 15);
          doseVal = `${ml} mL (${patientWeight}kg auto-calc)`;
        } else if (item.dosage === 'AUTO_WEIGHT') {
          doseVal = '5 mL (Check patient weight)';
        }
      }

      const drugToAdd = catalogDrug || {
        id: 'temp_' + Math.random().toString(36).substr(2, 6),
        brand_name: item.brand_name || item.generic_name,
        generic_name: item.generic_name || item.brand_name,
        form: 'tab',
        strength: 'Standard'
      };

      const existingIndex = updatedRx.findIndex(rx => rx.drug_id === drugToAdd.id || rx.brand_name === drugToAdd.brand_name);
      if (existingIndex !== -1) {
        updatedRx[existingIndex] = {
          ...updatedRx[existingIndex],
          dosage: doseVal,
          frequency: item.frequency || 'TID',
          duration: item.duration || 3,
          instructions: item.instructions || 'After meals'
        };
      } else {
        updatedRx.push({
          drug_id: drugToAdd.id,
          brand_name: drugToAdd.brand_name,
          generic_name: drugToAdd.generic_name,
          form: drugToAdd.form,
          strength: drugToAdd.strength,
          dosage: doseVal,
          frequency: item.frequency || 'TID',
          duration: item.duration || 3,
          instructions: item.instructions || 'After meals'
        });
      }
      added++;
    });

    setRxItems(updatedRx);
    setShowRxCollapse(true);

    let notifMsg = `Successfully added ${added} prescribed items from '${regime.title}'.`;
    if (skippedAllergy > 0) notifMsg += ` ⚠️ ${skippedAllergy} allergic drug(s) automatically skipped!`;
    if (skippedPregnancy > 0) notifMsg += ` 🤰 ${skippedPregnancy} pregnancy-unsafe drug(s) automatically skipped!`;

    showNotification('success', notifMsg);
  };

  const getAllOpdDiagnoses = () => {
    const overrides = diagnosisOverrides || {};
    const standardList = OPD_DIAGNOSES.map(d => {
      const ov = overrides[d.id] || {};
      return {
        id: d.id,
        name: ov.name || d.name,
        symptoms: ov.symptoms !== undefined ? (typeof ov.symptoms === 'string' ? ov.symptoms.split(',').map(s => s.trim()).filter(Boolean) : ov.symptoms) : d.symptoms,
        negative_symptoms: ov.negative_symptoms !== undefined ? (typeof ov.negative_symptoms === 'string' ? ov.negative_symptoms.split(',').map(s => s.trim()).filter(Boolean) : ov.negative_symptoms) : (d.negative_symptoms || []),
        signs: ov.signs !== undefined ? (typeof ov.signs === 'string' ? ov.signs.split(',').map(s => s.trim()).filter(Boolean) : ov.signs) : (d.signs || [])
      };
    });
    const customList = (customDiagnoses || []).map(cd => ({
      id: cd.id,
      name: cd.name,
      symptoms: typeof cd.symptoms === 'string' ? cd.symptoms.split(',').map(s => s.trim()).filter(Boolean) : (cd.symptoms || []),
      negative_symptoms: typeof cd.negative_symptoms === 'string' ? cd.negative_symptoms.split(',').map(s => s.trim()).filter(Boolean) : (cd.negative_symptoms || []),
      signs: typeof cd.signs === 'string' ? cd.signs.split(',').map(s => s.trim()).filter(Boolean) : (cd.signs || [])
    }));
    return [...standardList, ...customList];
  };

  const getSortedDiagnoses = () => {
    let list = getAllOpdDiagnoses();
    if (diagnosisSearch.trim()) {
      const q = diagnosisSearch.trim().toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const freqA = diagFreq[a.name] || 0;
      const freqB = diagFreq[b.name] || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.name.localeCompare(b.name);
    });
    return list;
  };

  const getAvailableSymptoms = () => {
    let rawList = [];
    const allDiag = getAllOpdDiagnoses();
    if (selectedDiagnoses.length > 0) {
      allDiag.forEach(item => {
        if (selectedDiagnoses.includes(item.name)) {
          rawList.push(...(item.symptoms || []));
        }
      });
    } else {
      allDiag.forEach(item => {
        rawList.push(...(item.symptoms || []));
      });
    }
    const uniqueMap = new Map();
    rawList.forEach(s => {
      const key = s.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s.trim());
      }
    });

    let uniqueSymptoms = Array.from(uniqueMap.values());

    if (symptomSearch.trim()) {
      const q = symptomSearch.trim().toLowerCase();
      uniqueSymptoms = uniqueSymptoms.filter(s => s.toLowerCase().includes(q));
    }

    uniqueSymptoms.sort((a, b) => {
      const freqA = symptomFreq[a.toLowerCase()] || symptomFreq[a] || 0;
      const freqB = symptomFreq[b.toLowerCase()] || symptomFreq[b] || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.localeCompare(b);
    });

    return uniqueSymptoms;
  };

  const getAvailableNegativeSymptoms = () => {
    let rawList = [];
    const allDiag = getAllOpdDiagnoses();
    if (selectedDiagnoses.length > 0) {
      allDiag.forEach(item => {
        if (selectedDiagnoses.includes(item.name)) {
          rawList.push(...(item.negative_symptoms || []));
        }
      });
    }
    if (rawList.length === 0) {
      rawList = [...(COMMON_NEGATIVE_SYMPTOMS || [])];
    } else {
      rawList.push(...(COMMON_NEGATIVE_SYMPTOMS || []));
    }

    const uniqueMap = new Map();
    rawList.forEach(s => {
      const key = s.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s.trim());
      }
    });

    let uniqueNegatives = Array.from(uniqueMap.values());

    if (negativeSymptomSearch.trim()) {
      const q = negativeSymptomSearch.trim().toLowerCase();
      uniqueNegatives = uniqueNegatives.filter(s => s.toLowerCase().includes(q));
    }

    uniqueNegatives.sort((a, b) => {
      const freqA = negativeSymptomFreq[a.toLowerCase()] || negativeSymptomFreq[a] || 0;
      const freqB = negativeSymptomFreq[b.toLowerCase()] || negativeSymptomFreq[b] || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.localeCompare(b);
    });

    return uniqueNegatives;
  };

  const getAvailableSigns = () => {
    let rawList = [];
    const allDiag = getAllOpdDiagnoses();
    if (selectedDiagnoses.length > 0) {
      allDiag.forEach(item => {
        if (selectedDiagnoses.includes(item.name)) {
          rawList.push(...(item.signs || []));
        }
      });
    }
    if (rawList.length === 0) {
      rawList = [...(COMMON_SIGNS || [])];
    } else {
      rawList.push(...(COMMON_SIGNS || []));
    }

    const uniqueMap = new Map();
    rawList.forEach(s => {
      const key = s.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s.trim());
      }
    });

    let uniqueSigns = Array.from(uniqueMap.values());

    if (signSearch.trim()) {
      const q = signSearch.trim().toLowerCase();
      uniqueSigns = uniqueSigns.filter(s => s.toLowerCase().includes(q));
    }

    uniqueSigns.sort((a, b) => {
      const freqA = signFreq[a.toLowerCase()] || signFreq[a] || 0;
      const freqB = signFreq[b.toLowerCase()] || signFreq[b] || 0;
      if (freqB !== freqA) return freqB - freqA;
      return a.localeCompare(b);
    });

    return uniqueSigns;
  };

  const syncSymptomsText = (list) => {
    const formatted = list.map(item => `${item.name} (${item.duration})`).join(', ');
    setSymptoms(formatted);
  };

  const handleSelectSymptom = (symptomName) => {
    incrementSymptomFreq(symptomName);
    const existingIdx = selectedSymptomsList.findIndex(
      item => item.name.toLowerCase() === symptomName.toLowerCase()
    );

    if (existingIdx >= 0) {
      setActiveSymptomIndex(existingIdx);
    } else {
      const newItems = [...selectedSymptomsList, { name: symptomName, duration: 'for 1 day' }];
      setSelectedSymptomsList(newItems);
      setActiveSymptomIndex(newItems.length - 1);
      syncSymptomsText(newItems);
    }
  };

  const handleSetDurationForActiveSymptom = (durationText) => {
    if (selectedSymptomsList.length === 0) return;
    let targetIdx = activeSymptomIndex;
    if (targetIdx === null || targetIdx >= selectedSymptomsList.length) {
      targetIdx = selectedSymptomsList.length - 1;
    }
    const updated = [...selectedSymptomsList];
    updated[targetIdx] = { ...updated[targetIdx], duration: durationText };
    setSelectedSymptomsList(updated);
    syncSymptomsText(updated);
  };

  const handleRemoveSymptomItem = (idx) => {
    const updated = selectedSymptomsList.filter((_, i) => i !== idx);
    setSelectedSymptomsList(updated);
    if (activeSymptomIndex === idx) {
      setActiveSymptomIndex(updated.length > 0 ? updated.length - 1 : null);
    } else if (activeSymptomIndex > idx) {
      setActiveSymptomIndex(activeSymptomIndex - 1);
    }
    syncSymptomsText(updated);
  };

  const handleAddCustomSymptom = (e) => {
    e.preventDefault();
    if (!customSymptomInput.trim()) return;
    const name = customSymptomInput.trim();
    handleSelectSymptom(name);
    setCustomSymptomInput('');
  };

  // Negative symptoms handlers
  const incrementNegativeSymptomFreq = (sympName) => {
    setNegativeSymptomFreq(prev => {
      const updated = { ...prev, [sympName]: (prev[sympName] || 0) + 1 };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mycliniq_opd_neg_symptom_freq', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleToggleNegativeSymptom = (sympName) => {
    const exists = selectedNegativeSymptomsList.some(item => item.name.toLowerCase() === sympName.toLowerCase());
    let updated;
    if (exists) {
      updated = selectedNegativeSymptomsList.filter(item => item.name.toLowerCase() !== sympName.toLowerCase());
    } else {
      updated = [...selectedNegativeSymptomsList, { name: sympName }];
      incrementNegativeSymptomFreq(sympName);
    }
    setSelectedNegativeSymptomsList(updated);
    setNegativeSymptomsSummary(updated.map(i => i.name).join(', '));
  };

  const handleAddCustomNegativeSymptom = (e) => {
    if (e) e.preventDefault();
    const val = customNegativeSymptomInput.trim();
    if (!val) return;
    handleToggleNegativeSymptom(val);
    setCustomNegativeSymptomInput('');
  };

  const handleRemoveNegativeSymptomItem = (idx) => {
    const updated = selectedNegativeSymptomsList.filter((_, i) => i !== idx);
    setSelectedNegativeSymptomsList(updated);
    setNegativeSymptomsSummary(updated.map(i => i.name).join(', '));
  };

  // Physical signs handlers
  const incrementSignFreq = (signName) => {
    setSignFreq(prev => {
      const updated = { ...prev, [signName]: (prev[signName] || 0) + 1 };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mycliniq_opd_sign_freq', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleToggleSign = (signName) => {
    const exists = selectedSignsList.some(item => item.name.toLowerCase() === signName.toLowerCase());
    let updated;
    if (exists) {
      updated = selectedSignsList.filter(item => item.name.toLowerCase() !== signName.toLowerCase());
    } else {
      updated = [...selectedSignsList, { name: signName }];
      incrementSignFreq(signName);
    }
    setSelectedSignsList(updated);
    setSignsSummary(updated.map(i => i.name).join(', '));
  };

  const handleAddCustomSign = (e) => {
    if (e) e.preventDefault();
    const val = customSignInput.trim();
    if (!val) return;
    handleToggleSign(val);
    setCustomSignInput('');
  };

  const handleRemoveSignItem = (idx) => {
    const updated = selectedSignsList.filter((_, i) => i !== idx);
    setSelectedSignsList(updated);
    setSignsSummary(updated.map(i => i.name).join(', '));
  };

  // Collapsible OPD builders
  const [showLabsCollapse, setShowLabsCollapse] = useState(false);
  const [showRxCollapse, setShowRxCollapse] = useState(false);

  // Doctor fee adjustments
  const [doctorFee, setDoctorFee] = useState(500);
  const [customFeeActive, setCustomFeeActive] = useState(false);
  const [customFee, setCustomFee] = useState('');

  const [notif, setNotif] = useState({ type: '', text: '' });

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

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

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

  const handleSelectPatient = (visit) => {
    setSelectedVisit(visit);
    setIsQueueCollapsed(true);
    // Reset forms
    setRxItems([]);
    setRequestedLabs([]);
    setSymptoms('');
    setDiagnosis('');
    setNotes('');
    setDrugSearch('');
    setSelectedDrug(null);
    setDoctorFee(500);
    setCustomFeeActive(false);
    setCustomFee('');
    
    // Reset OPD Working Diagnosis, Symptoms, Negative Symptoms & Signs builders
    setSelectedDiagnoses([]);
    setSelectedSymptomsList([]);
    setDiagnosisSearch('');
    setSymptomSearch('');
    setCustomSymptomInput('');
    setActiveSymptomIndex(null);
    setShowDiagnosisCollapse(true);
    setShowSymptomsCollapse(true);

    setSelectedNegativeSymptomsList([]);
    setNegativeSymptomSearch('');
    setCustomNegativeSymptomInput('');
    setNegativeSymptomsSummary('');
    setShowNegativeSymptomsCollapse(true);

    setSelectedSignsList([]);
    setSignSearch('');
    setCustomSignInput('');
    setSignsSummary('');
    setShowSignsCollapse(true);
    
    // Mark visit status in database as in_consultation
    db.updateVisitStatus(visit.id, 'in_consultation');
    loadData();
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

    if (activeTab !== 'register') {
      setPreviousTab(activeTab);
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

  // Open Edit Profile modal (for consultation view)
  const handleOpenEdit = () => {
    if (!selectedVisit || !selectedVisit.patient) return;
    loadPatientToForm(selectedVisit.patient);
  };

  // Handle Cancel Patient Form
  const handleCancelPatientForm = () => {
    setPatientForm({
      id: '', prefix: 'Mr.', full_name: '', date_of_birth: '', gender: 'male', phone: '', phone_owner_name: 'Self',
      address: '', occupation: '', allergies: '', past_medical_history: '', past_surgical_history: '', comments: '', photo_url: '',
      is_dob_estimated: false, estimated_age: ''
    });
    if (previousTab && previousTab !== 'register') {
      handleSetActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      handleSetActiveTab('consultation');
    }
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

  // Create or Update Patient
  const handleSavePatient = async (formData) => {
    const dataToSave = (formData && (formData.full_name || formData.id)) ? formData : patientForm;

    if (!dataToSave.full_name || !dataToSave.phone) {
      showNotification('error', 'Please enter name and phone number.');
      return;
    }

    let dob = dataToSave.date_of_birth;
    if (dataToSave.is_dob_estimated) {
      if (!dataToSave.estimated_age) {
        showNotification('error', 'Please enter patient age.');
        return;
      }
      const ageNum = parseInt(dataToSave.estimated_age, 10);
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
        prefix: dataToSave.prefix || 'Mr.',
        full_name: dataToSave.full_name,
        date_of_birth: dob,
        gender: dataToSave.gender || 'male',
        phone: dataToSave.phone,
        phone_owner_name: dataToSave.phone_owner_name || 'Self',
        address: dataToSave.address || '',
        occupation: dataToSave.occupation || '',
        allergies: Array.isArray(dataToSave.allergies) 
          ? dataToSave.allergies 
          : (dataToSave.allergies ? dataToSave.allergies.split(',').map(s => s.trim()).filter(Boolean) : []),
        past_medical_history: Array.isArray(dataToSave.past_medical_history) 
          ? dataToSave.past_medical_history 
          : (dataToSave.past_medical_history ? dataToSave.past_medical_history.split(',').map(s => s.trim()).filter(Boolean) : []),
        past_surgical_history: Array.isArray(dataToSave.past_surgical_history) 
          ? dataToSave.past_surgical_history 
          : (dataToSave.past_surgical_history ? dataToSave.past_surgical_history.split(',').map(s => s.trim()).filter(Boolean) : []),
        comments: dataToSave.comments || '',
        photo_url: dataToSave.photo_url || '',
        is_dob_estimated: dataToSave.is_dob_estimated || false
      };

      if (dataToSave.id) {
        // Edit Mode
        await db.updatePatient(dataToSave.id, formatted);
        showNotification('success', `Patient ${dataToSave.id} profile updated successfully.`);
        
        // Live update selected visit patient if we are editing the currently consulting patient
        if (selectedVisit && selectedVisit.patient_id === dataToSave.id) {
          setSelectedVisit(prev => ({
            ...prev,
            patient: { ...prev.patient, ...formatted }
          }));
        }
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

      // Switch back to previous tab!
      if (previousTab && previousTab !== 'register') {
        handleSetActiveTab(previousTab);
        setPreviousTab(null);
      } else {
        handleSetActiveTab('consultation');
      }
    } catch (err) {
      showNotification('error', 'Save failed: ' + err.message);
    }
  };

  // Add to Queue (OPD Check-in)
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!visitForm.patient_id) {
      showNotification('error', 'Please select a patient.');
      return;
    }

    try {
      const todayVisits = visits.filter(v => v.visit_date === new Date().toISOString().split('T')[0]);
      const nextQueueNo = todayVisits.length + 1;

      const calculatedBmi = calculateBMI(visitForm.height_cm, visitForm.weight_kg);

      await db.addVisit({
        patient_id: visitForm.patient_id,
        doctor_id: visitForm.doctor_id,
        queue_number: nextQueueNo,
        systolic_bp: visitForm.systolic_bp ? parseInt(visitForm.systolic_bp) : null,
        diastolic_bp: visitForm.diastolic_bp ? parseInt(visitForm.diastolic_bp) : null,
        height_cm: visitForm.height_cm ? parseFloat(visitForm.height_cm) : null,
        weight_kg: visitForm.weight_kg ? parseFloat(visitForm.weight_kg) : null,
        bmi: calculatedBmi ? parseFloat(calculatedBmi.value) : null,
        status: 'waiting'
      });

      showNotification('success', `Patient added to queue under Queue No. ${nextQueueNo}.`);
      setVisitForm({
        patient_id: '', doctor_id: 'doc1', systolic_bp: '', diastolic_bp: '', height_cm: '', weight_kg: '', chief_complaint: ''
      });
      loadData();
      setActiveTab('consultation');
    } catch (err) {
      showNotification('error', 'Failed to add to queue: ' + err.message);
    }
  };

  // Add booking (Appointment)
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentForm.patient_id || !appointmentForm.appointment_date) {
      showNotification('error', 'Please select a patient and date.');
      return;
    }

    try {
      const dateAppts = appointments.filter(a => a.appointment_date === appointmentForm.appointment_date);
      const queueNo = dateAppts.length + 1;

      await db.addAppointment({
        patient_id: appointmentForm.patient_id,
        doctor_id: appointmentForm.doctor_id,
        appointment_date: appointmentForm.appointment_date,
        queue_number: queueNo,
        status: 'scheduled',
        booked_by: appointmentForm.booked_by
      });

      showNotification('success', `Booking successful under Queue No. ${queueNo} for the scheduled date!`);
      setAppointmentForm({
        patient_id: '', doctor_id: 'doc1', appointment_date: '', booked_by: 'phone'
      });
      loadData();
      handleSetActiveTab('consultation');
    } catch (err) {
      showNotification('error', 'Failed to book appointment: ' + err.message);
    }
  };



  // QR scan simulator
  const simulateScan = (patientId) => {
    setScanLaserActive(true);
    setTimeout(() => {
      if (activeTab === 'consultation') {
        const visit = visits.find(v => v.patient_id === patientId && (v.status === 'waiting' || v.status === 'in_consultation'));
        if (visit) {
          handleSelectPatient(visit);
          showNotification('success', `QR code scanned: Selected ${visit.patient?.full_name} (${visit.patient?.id})`);
        } else {
          showNotification('error', `No active queue visit found for Patient ID: ${patientId}`);
        }
      } else {
        const matched = patients.find(p => p.id === patientId);
        if (matched) {
          if (activeTab === 'walkin') {
            setVisitForm(prev => ({ ...prev, patient_id: matched.id }));
          } else if (activeTab === 'booking') {
            setAppointmentForm(prev => ({ ...prev, patient_id: matched.id }));
          } else {
            handleSetActiveTab('register');
            loadPatientToForm(matched);
          }
          showNotification('success', `QR Code scanned: Loaded profile of ${matched.full_name}`);
        } else {
          showNotification('error', `Invalid or unregistered QR code.`);
        }
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
      let finalDoctorFee = 500.00;
      if (customFeeActive) {
        finalDoctorFee = parseFloat(customFee) || 0.00;
      } else {
        finalDoctorFee = parseFloat(doctorFee);
      }

      const consultation = {
        visit_id: selectedVisit.id,
        doctor_id: 'doc1',
        symptoms,
        negative_symptoms: negativeSymptomsSummary,
        examination_signs: signsSummary,
        diagnosis,
        clinical_notes: notes,
        doctor_fee: finalDoctorFee
      };

      await db.addConsultation(consultation, rxItems, requestedLabs);
      showNotification('success', `Consultation record for ${selectedVisit.patient?.full_name} saved successfully. Prescription sent to pharmacy.`);
      setSelectedVisit(null);
      setIsQueueCollapsed(false);
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

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone?.includes(searchTerm) || 
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const directoryPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(directorySearch.toLowerCase()) || 
    p.phone?.includes(directorySearch) || 
    (p.id && p.id.toLowerCase().includes(directorySearch.toLowerCase())) ||
    (p.address && p.address.toLowerCase().includes(directorySearch.toLowerCase()))
  );

  const duplicatePatient = findDuplicatePatient();

  return (
    <div>
      {/* Stats Widgets */}
      {activeTab === 'overview' && (
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
              <span className={styles.statLabel}>Scheduled Appointments (Total)</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <ClipboardList size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{visits.filter(v => v.status === 'completed').length}</span>
              <span className={styles.statLabel}>Patients Consulted Today</span>
            </div>
          </div>
        </div>
      )}

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {activeTab === 'consultation' && (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative', width: '100%' }}>
          {/* Left Pane: Consultation board */}
          <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: 0, padding: '2rem', transition: 'all 0.3s ease' }}>
            {/* Top Bar inside consultation pane when Queue is collapsed */}
            {isQueueCollapsed && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsQueueCollapsed(false)}
                  className="btn-secondary"
                  style={{ 
                    padding: '0.4rem 0.85rem', 
                    fontSize: '0.82rem', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    borderRadius: '20px', 
                    border: '1.5px solid var(--primary)', 
                    color: 'var(--primary)', 
                    background: 'var(--primary-glow)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title="Expand Today's Queue sidebar"
                >
                  <Users size={16} />
                  <span>Today's Queue ({activeQueue.length})</span>
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            {selectedVisit ? (
              <div>
                {/* Active Patient Demographics */}
                <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                  {/* Photo Display */}
                  {selectedVisit.patient?.photo_url ? (
                    <img 
                      src={selectedVisit.patient.photo_url} 
                      alt="photo" 
                      onClick={() => setZoomedPhoto(selectedVisit.patient.photo_url)}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', cursor: 'pointer' }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={40} />
                    </div>
                  )}

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: 'var(--foreground)' }}>
                        {selectedVisit.patient?.prefix} {selectedVisit.patient?.full_name}
                      </h2>
                      <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700', background: 'var(--primary-glow)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        ID: <code>{selectedVisit.patient?.id}</code>
                      </span>
                      
                      {/* Edit Patient profile button for doctor */}
                      <button 
                        onClick={handleOpenEdit}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                      >
                        <Edit size={13} />
                        <span>Edit Profile</span>
                      </button>
                    </div>

                    <p style={{ fontSize: '1.05rem', color: 'var(--foreground)', marginTop: '0.4rem', fontWeight: '500', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span><strong>Age:</strong> {getAge(selectedVisit.patient?.date_of_birth) || 'N/A'}</span>
                      <span style={{ opacity: 0.4 }}>|</span>
                      <span><strong>Gender:</strong> {selectedVisit.patient?.gender ? (selectedVisit.patient.gender.charAt(0).toUpperCase() + selectedVisit.patient.gender.slice(1)) : 'N/A'}</span>
                      <span style={{ opacity: 0.4 }}>|</span>
                      <span><strong>Tel:</strong> {selectedVisit.patient?.phone} ({selectedVisit.patient?.phone_owner_name || 'Self'})</span>
                      {selectedVisit.patient?.occupation && (
                        <>
                          <span style={{ opacity: 0.4 }}>|</span>
                          <span><strong>Job:</strong> {selectedVisit.patient.occupation}</span>
                        </>
                      )}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                      {selectedVisit.patient?.allergies?.map((al, i) => (
                        <span key={i} className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>
                          <AlertTriangle size={14} style={{ marginRight: '4px' }} /> Allergy: {al}
                        </span>
                      ))}
                      {selectedVisit.patient?.past_medical_history?.map((ill, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>Med Hx: {ill}</span>
                      ))}
                      {selectedVisit.patient?.past_surgical_history?.map((surg, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }}>Surg Hx: {surg}</span>
                      ))}
                    </div>
                    {selectedVisit.patient?.comments && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', marginTop: '0.5rem', background: 'var(--muted-bg)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                        <strong>Notes:</strong> {selectedVisit.patient.comments}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '0.6rem 1.1rem', fontWeight: '800' }}>
                      Queue No: {selectedVisit.queue_number}
                    </span>
                    {/* Vitals display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      {selectedVisit.systolic_bp && <span>BP: <strong style={{ color: 'var(--primary)' }}>{selectedVisit.systolic_bp}/{selectedVisit.diastolic_bp}</strong> mmHg</span>}
                      {selectedVisit.height_cm && <span>Height: <strong style={{ color: 'var(--primary)' }}>{selectedVisit.height_cm} cm</strong></span>}
                      {selectedVisit.weight_kg && <span>Weight: <strong style={{ color: 'var(--primary)' }}>{selectedVisit.weight_kg} kg</strong></span>}
                      {(() => {
                        const bmiData = calculateBMI(selectedVisit.height_cm, selectedVisit.weight_kg) || (selectedVisit.bmi ? { value: selectedVisit.bmi, category: '', color: 'var(--primary)' } : null);
                        return bmiData ? (
                          <span>BMI: <strong style={{ color: bmiData.color }}>{bmiData.value} kg/m²</strong> {bmiData.category && <span style={{ fontSize: '0.75rem', background: bmiData.color, color: 'white', padding: '0.15rem 0.5rem', borderRadius: '10px', marginLeft: '0.3rem', fontWeight: 'bold' }}>{bmiData.category}</span>}</span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Medical Documentation Form */}
                <form onSubmit={handleSubmitConsultation}>
                  {/* 1st Row: Working Diagnosis Expandable Section */}
                  <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div 
                      onClick={() => setShowDiagnosisCollapse(!showDiagnosisCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Activity size={20} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>
                          Working Diagnosis
                        </h3>
                        {selectedDiagnoses.length > 0 && (
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {selectedDiagnoses.length} Selected
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showDiagnosisCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>

                    {showDiagnosisCollapse && (
                      <div className="animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.85rem' }}>
                        {/* Search & Filter Diagnosis */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                          <div style={{ position: 'relative', flexGrow: 1 }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input 
                              type="text" 
                              placeholder="Search diagnosis (sorted by frequency)..."
                              value={diagnosisSearch}
                              onChange={(e) => setDiagnosisSearch(e.target.value)}
                              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
                            />
                          </div>
                          {selectedDiagnoses.length > 0 && (
                            <button 
                              type="button" 
                              className="btn-secondary" 
                              onClick={() => { setSelectedDiagnoses([]); setDiagnosis(''); }}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {/* Diagnosis Buttons Chips Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.25rem' }}>
                          {getSortedDiagnoses().map(item => {
                            const isSelected = selectedDiagnoses.includes(item.name);
                            const usageCount = diagFreq[item.name] || 0;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleDiagnosis(item.name)}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '20px',
                                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                                  background: isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                                  color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                                  fontSize: '0.85rem',
                                  fontWeight: isSelected ? '700' : '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  transition: 'all 0.15s ease-in-out'
                                }}
                              >
                                {isSelected && <Check size={14} />}
                                <span>{item.name}</span>
                                {usageCount > 0 && (
                                  <span style={{ fontSize: '0.68rem', opacity: 0.6, background: 'rgba(0,0,0,0.15)', padding: '0.1rem 0.3rem', borderRadius: '10px' }}>
                                    {usageCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2nd Row: Symptoms Expandable Section */}
                  <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div 
                      onClick={() => setShowSymptomsCollapse(!showSymptomsCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Stethoscope size={20} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>
                          Symptoms
                        </h3>
                        {selectedSymptomsList.length > 0 && (
                          <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {selectedSymptomsList.length} Selected
                          </span>
                        )}
                        {selectedDiagnoses.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            (Filtered for: {selectedDiagnoses.join(', ')})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showSymptomsCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>

                    {showSymptomsCollapse && (
                      <div className="animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.85rem' }}>
                        {/* Search & Custom Symptom input bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input 
                              type="text" 
                              placeholder="Filter symptoms (sorted by usage)..."
                              value={symptomSearch}
                              onChange={(e) => setSymptomSearch(e.target.value)}
                              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
                            />
                          </div>

                          {/* Custom Symptom manual adder */}
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input 
                              type="text" 
                              placeholder="Add custom symptom..."
                              value={customSymptomInput}
                              onChange={(e) => setCustomSymptomInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSymptom(e); }}
                              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                            />
                            <button 
                              type="button"
                              className="btn-primary"
                              onClick={handleAddCustomSymptom}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>

                        {/* Symptoms Buttons Chips Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', padding: '0.25rem', marginBottom: '1rem' }}>
                          {getAvailableSymptoms().map((symptomName, idx) => {
                            const existingIdx = selectedSymptomsList.findIndex(
                              item => item.name.toLowerCase() === symptomName.toLowerCase()
                            );
                            const isSelected = existingIdx >= 0;
                            const isCurrentActive = isSelected && activeSymptomIndex === existingIdx;
                            const count = symptomFreq[symptomName.toLowerCase()] || symptomFreq[symptomName] || 0;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSymptom(symptomName)}
                                style={{
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '16px',
                                  border: isCurrentActive ? '2px solid #f59e0b' : isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                                  background: isCurrentActive ? 'rgba(245, 158, 11, 0.2)' : isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                                  color: isCurrentActive ? '#f59e0b' : isSelected ? 'var(--primary)' : 'var(--foreground)',
                                  fontSize: '0.82rem',
                                  fontWeight: isSelected ? '700' : '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected && <Check size={13} />}
                                <span>{symptomName}</span>
                                {count > 0 && (
                                  <span style={{ fontSize: '0.65rem', opacity: 0.6, background: 'rgba(0,0,0,0.15)', padding: '0.1rem 0.3rem', borderRadius: '10px' }}>
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Symptom Duration Selector Row */}
                        <div style={{ background: 'var(--muted-bg)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={14} style={{ color: 'var(--primary)' }} />
                              <span>
                                Set Duration for Symptom: {selectedSymptomsList.length > 0 ? (
                                  <strong style={{ color: '#f59e0b' }}>
                                    "{selectedSymptomsList[activeSymptomIndex !== null && activeSymptomIndex < selectedSymptomsList.length ? activeSymptomIndex : selectedSymptomsList.length - 1]?.name}"
                                  </strong>
                                ) : '(Select a symptom above first)'}
                              </span>
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {SYMPTOM_DURATIONS.map((dur, dIdx) => {
                              const currentSymp = selectedSymptomsList[activeSymptomIndex !== null && activeSymptomIndex < selectedSymptomsList.length ? activeSymptomIndex : selectedSymptomsList.length - 1];
                              const isActiveDuration = currentSymp && currentSymp.duration === dur;
                              return (
                                <button
                                  key={dIdx}
                                  type="button"
                                  onClick={() => handleSetDurationForActiveSymptom(dur)}
                                  disabled={selectedSymptomsList.length === 0}
                                  style={{
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '14px',
                                    border: isActiveDuration ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                                    background: isActiveDuration ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                    color: isActiveDuration ? 'var(--primary)' : 'var(--foreground)',
                                    fontSize: '0.78rem',
                                    fontWeight: isActiveDuration ? '700' : '500',
                                    cursor: selectedSymptomsList.length > 0 ? 'pointer' : 'not-allowed',
                                    opacity: selectedSymptomsList.length > 0 ? 1 : 0.5,
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {dur}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Symptoms Chips List */}
                        {selectedSymptomsList.length > 0 && (
                          <div style={{ borderTop: '1px dashed var(--card-border)', paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>
                              Selected Symptoms List:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {selectedSymptomsList.map((item, idx) => {
                                const isSelectedActive = activeSymptomIndex === idx;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setActiveSymptomIndex(idx)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      background: isSelectedActive ? 'rgba(245, 158, 11, 0.15)' : 'var(--muted-bg)',
                                      border: '1px solid',
                                      borderColor: isSelectedActive ? '#f59e0b' : 'var(--card-border)',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      fontSize: '0.82rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <strong style={{ color: 'var(--foreground)' }}>{item.name}</strong>
                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                                      {item.duration}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleRemoveSymptomItem(idx); }}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3rd Row: Important Negative Symptoms Section */}
                  <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div 
                      onClick={() => setShowNegativeSymptomsCollapse(!showNegativeSymptomsCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShieldAlert size={20} style={{ color: '#ef4444' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>
                          Important Negative Symptoms
                        </h3>
                        {selectedNegativeSymptomsList.length > 0 && (
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 'bold' }}>
                            {selectedNegativeSymptomsList.length} Selected
                          </span>
                        )}
                        {selectedDiagnoses.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            (Relevant for: {selectedDiagnoses.join(', ')})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showNegativeSymptomsCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>

                    {showNegativeSymptomsCollapse && (
                      <div className="animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.85rem' }}>
                        {/* Search & Custom Negative Symptom input bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input 
                              type="text" 
                              placeholder="Filter negative symptoms..."
                              value={negativeSymptomSearch}
                              onChange={(e) => setNegativeSymptomSearch(e.target.value)}
                              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input 
                              type="text" 
                              placeholder="Add custom negative symptom..."
                              value={customNegativeSymptomInput}
                              onChange={(e) => setCustomNegativeSymptomInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomNegativeSymptom(e); }}
                              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                            />
                            <button 
                              type="button"
                              onClick={handleAddCustomNegativeSymptom}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>

                        {/* Negative Symptoms Chips Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', padding: '0.25rem', marginBottom: '1rem' }}>
                          {getAvailableNegativeSymptoms().map((symptomName, idx) => {
                            const isSelected = selectedNegativeSymptomsList.some(
                              item => item.name.toLowerCase() === symptomName.toLowerCase()
                            );
                            const count = negativeSymptomFreq[symptomName.toLowerCase()] || negativeSymptomFreq[symptomName] || 0;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleNegativeSymptom(symptomName)}
                                style={{
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '16px',
                                  border: isSelected ? '1.5px solid #ef4444' : '1px solid var(--card-border)',
                                  background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                                  color: isSelected ? '#f87171' : 'var(--foreground)',
                                  fontSize: '0.82rem',
                                  fontWeight: isSelected ? '700' : '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected && <Check size={13} />}
                                <span>{symptomName}</span>
                                {count > 0 && (
                                  <span style={{ fontSize: '0.65rem', opacity: 0.6, background: 'rgba(0,0,0,0.15)', padding: '0.1rem 0.3rem', borderRadius: '10px' }}>
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Negative Symptoms List */}
                        {selectedNegativeSymptomsList.length > 0 && (
                          <div style={{ borderTop: '1px dashed var(--card-border)', paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>
                              Confirmed Absent Symptoms (Negative Symptoms):
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {selectedNegativeSymptomsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid #ef4444',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  <strong style={{ color: '#f87171' }}>{item.name}</strong>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNegativeSymptomItem(idx)}
                                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4th Row: Associated Signs (Physical Examination) Section */}
                  <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
                    <div 
                      onClick={() => setShowSignsCollapse(!showSignsCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Activity size={20} style={{ color: '#38bdf8' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>
                          Associated Physical Examination Signs
                        </h3>
                        {selectedSignsList.length > 0 && (
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontWeight: 'bold' }}>
                            {selectedSignsList.length} Selected
                          </span>
                        )}
                        {selectedDiagnoses.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            (Physical findings for: {selectedDiagnoses.join(', ')})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showSignsCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>

                    {showSignsCollapse && (
                      <div className="animate-fade-in" style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.85rem' }}>
                        {/* Search & Custom Sign input bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input 
                              type="text" 
                              placeholder="Filter physical signs..."
                              value={signSearch}
                              onChange={(e) => setSignSearch(e.target.value)}
                              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input 
                              type="text" 
                              placeholder="Add custom physical sign..."
                              value={customSignInput}
                              onChange={(e) => setCustomSignInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSign(e); }}
                              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                            />
                            <button 
                              type="button"
                              onClick={handleAddCustomSign}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>

                        {/* Physical Signs Chips Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto', padding: '0.25rem', marginBottom: '1rem' }}>
                          {getAvailableSigns().map((signName, idx) => {
                            const isSelected = selectedSignsList.some(
                              item => item.name.toLowerCase() === signName.toLowerCase()
                            );
                            const count = signFreq[signName.toLowerCase()] || signFreq[signName] || 0;

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleToggleSign(signName)}
                                style={{
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '16px',
                                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid var(--card-border)',
                                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                                  color: isSelected ? '#38bdf8' : 'var(--foreground)',
                                  fontSize: '0.82rem',
                                  fontWeight: isSelected ? '700' : '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected && <Check size={13} />}
                                <span>{signName}</span>
                                {count > 0 && (
                                  <span style={{ fontSize: '0.65rem', opacity: 0.6, background: 'rgba(0,0,0,0.15)', padding: '0.1rem 0.3rem', borderRadius: '10px' }}>
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Physical Signs List */}
                        {selectedSignsList.length > 0 && (
                          <div style={{ borderTop: '1px dashed var(--card-border)', paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>
                              Recorded Physical Findings / Signs:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {selectedSignsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    border: '1px solid #38bdf8',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  <strong style={{ color: '#38bdf8' }}>{item.name}</strong>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSignItem(idx)}
                                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form inputs section for manual review / fine-tuning */}
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Symptoms Found (Summary)</label>
                      <input 
                        type="text" 
                        placeholder="Selected symptoms will appear here..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ color: '#f87171' }}>Important Negative Symptoms</label>
                      <input 
                        type="text" 
                        placeholder="Absent symptoms will appear here..."
                        value={negativeSymptomsSummary}
                        onChange={(e) => setNegativeSymptomsSummary(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ color: '#38bdf8' }}>Physical Examination Signs</label>
                      <input 
                        type="text" 
                        placeholder="Physical examination signs will appear here..."
                        value={signsSummary}
                        onChange={(e) => setSignsSummary(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Diagnosis *</label>
                      <input 
                        type="text" 
                        placeholder="Selected diagnosis will appear here..."
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
                  <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div 
                      onClick={() => setShowLabsCollapse(!showLabsCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FlaskConical size={18} style={{ color: 'var(--primary)' }} />
                        <span>Recommend Lab Tests {requestedLabs.length > 0 ? `(${requestedLabs.length} Selected)` : ''}</span>
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {showLabsCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>
                    {showLabsCollapse && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem' }} className="animate-fade-in">
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
                    )}
                  </div>

                  {/* Patient Care Clinical Decision Support — Suggested Treatment Regimes */}
                  {selectedDiagnoses.length > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginTop: '1.5rem',
                      marginBottom: '1.5rem'
                    }} className="animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <HeartPulse size={20} style={{ color: '#38bdf8' }} />
                          <span>Patient Care Clinical Decision Support — Suggested Regimes ({getSuggestedTreatmentRegimes().length})</span>
                        </h4>

                        {/* Patient Pregnancy Warning Mode Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isPatientPregnant ? 'rgba(236,72,153,0.2)' : 'var(--secondary-bg)', border: `1px solid ${isPatientPregnant ? '#f472b6' : 'var(--card-border)'}`, padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                          <label style={{ fontSize: '0.8rem', cursor: 'pointer', color: isPatientPregnant ? '#f472b6' : 'var(--secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="checkbox"
                              checked={isPatientPregnant}
                              onChange={(e) => setIsPatientPregnant(e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            🤰 Patient Pregnant Warning Mode
                          </label>
                        </div>
                      </div>

                      {getSuggestedTreatmentRegimes().length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: 0, fontStyle: 'italic' }}>
                          No predefined treatment regime found matching "{selectedDiagnoses.join(', ')}". You can configure treatment sets in Manager Dashboard -&gt; Patient Care Management.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                          {getSuggestedTreatmentRegimes().map(regime => {
                            const isExactComboMatch = regime.diagnoses.length > 1 && regime.diagnoses.every(d => selectedDiagnoses.includes(d));
                            const currentPatient = patients.find(p => p.id === selectedVisit?.patient_id);
                            const patientAllergies = currentPatient?.allergies || [];
                            const patientWeight = parseFloat(selectedVisit?.weight_kg || visitForm.weight_kg || 0);
                            const isPregnant = isPatientPregnant || (currentPatient?.gender === 'female' && selectedDiagnoses.some(d => d.toLowerCase().includes('preg')));

                            return (
                              <div
                                key={regime.id}
                                style={{
                                  background: 'var(--card-bg)',
                                  border: isExactComboMatch ? '2px solid #a855f7' : '1px solid var(--card-border)',
                                  borderRadius: '10px',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justify: 'space-between',
                                  boxShadow: isExactComboMatch ? '0 0 15px rgba(168,85,247,0.2)' : 'none'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '4px',
                                      background: isExactComboMatch ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(59,130,246,0.2)',
                                      color: '#fff'
                                    }}>
                                      {isExactComboMatch ? '⚡ EXACT COMBO PROTOCOL' : `🩺 ${regime.target_group.toUpperCase()}`}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{regime.items.length} Drugs</span>
                                  </div>

                                  <h5 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '0.95rem' }}>{regime.title}</h5>
                                  {regime.notes && (
                                    <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: 'var(--secondary)', fontStyle: 'italic' }}>"{regime.notes}"</p>
                                  )}

                                  {/* Items preview with safety status */}
                                  <div style={{ background: 'var(--secondary-bg)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                                    {regime.items.map((item, iIdx) => {
                                      const catalogDrug = drugs.find(d => d.id === item.drug_id || d.brand_name?.toLowerCase() === item.brand_name?.toLowerCase() || d.generic_name?.toLowerCase() === item.generic_name?.toLowerCase());
                                      const isAllergic = patientAllergies.some(alg => {
                                        const aStr = alg.toLowerCase().trim();
                                        return (item.brand_name && item.brand_name.toLowerCase().includes(aStr)) || (item.generic_name && item.generic_name.toLowerCase().includes(aStr)) || (catalogDrug && catalogDrug.generic_name?.toLowerCase().includes(aStr));
                                      });
                                      const isPregUnsafe = isPregnant && pregnancyList.some(p => {
                                        const pname = p.drug_name.toLowerCase().trim();
                                        return (item.brand_name && item.brand_name.toLowerCase().includes(pname)) || (item.generic_name && item.generic_name.toLowerCase().includes(pname)) || (catalogDrug && catalogDrug.generic_name?.toLowerCase().includes(pname));
                                      });

                                      let displayDose = item.dosage;
                                      if (item.dosage === 'AUTO_WEIGHT' || regime.target_group === 'pediatric' || (catalogDrug && catalogDrug.form === 'syrup')) {
                                        const pedRule = pediatricRules.find(r => r.drug_id === item.drug_id || r.brand_name?.toLowerCase() === item.brand_name?.toLowerCase());
                                        if (pedRule && patientWeight > 0) {
                                          const ml = Math.min((patientWeight * (pedRule.ml_per_kg_per_dose || 0.625)).toFixed(1), pedRule.max_single_dose_ml || 20);
                                          displayDose = `${ml} mL (${patientWeight}kg weight-based)`;
                                        } else if (patientWeight > 0 && catalogDrug && catalogDrug.form === 'syrup') {
                                          const ml = Math.min((patientWeight * 0.625).toFixed(1), 15);
                                          displayDose = `${ml} mL (${patientWeight}kg weight-based)`;
                                        }
                                      }

                                      return (
                                        <div key={iIdx} style={{ marginBottom: '0.35rem', borderBottom: iIdx === regime.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', color: isAllergic || isPregUnsafe ? '#f87171' : '#fff' }}>
                                            <span style={{ fontWeight: 'bold', textDecoration: isAllergic || isPregUnsafe ? 'line-through' : 'none' }}>
                                              • {item.brand_name || item.generic_name}
                                            </span>
                                            <span style={{ color: isAllergic || isPregUnsafe ? '#f87171' : '#38bdf8' }}>{displayDose}</span>
                                          </div>
                                          {isAllergic && (
                                            <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                              ⚠️ Allergic to patient! Drug skipped automatically.
                                            </div>
                                          )}
                                          {isPregUnsafe && (
                                            <div style={{ color: '#ec4899', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                              🤰 Pregnancy Contraindicated! Drug skipped automatically.
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleApplyTreatmentRegime(regime)}
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.55rem 1rem',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    width: '100%'
                                  }}
                                >
                                  <Sparkles size={16} /> Prescribe Treatment Set
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prescription Builder */}
                  <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div 
                      onClick={() => setShowRxCollapse(!showRxCollapse)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', marginBottom: '1rem' }}
                    >
                      <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Pill size={18} style={{ color: 'var(--primary)' }} />
                        <span>E-Prescription Builder {rxItems.length > 0 ? `(${rxItems.length} Items)` : ''}</span>
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {showRxCollapse ? 'Hide ▴' : 'Show / Expand ▾'}
                      </span>
                    </div>

                    {showRxCollapse && (
                      <div className="animate-fade-in">
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
                    )}
                  </div>

                  {/* Doctor's Fee Selector */}
                  <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Info size={18} style={{ color: 'var(--primary)' }} />
                      <span>OPD Consultation Doctor Fee (LKR)</span>
                    </h4>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => { setDoctorFee(500); setCustomFeeActive(false); }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: (!customFeeActive && doctorFee === 500) ? 'var(--primary)' : 'var(--card-border)',
                          background: (!customFeeActive && doctorFee === 500) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Full Fee (LKR 500)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDoctorFee(250); setCustomFeeActive(false); }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: (!customFeeActive && doctorFee === 250) ? 'var(--primary)' : 'var(--card-border)',
                          background: (!customFeeActive && doctorFee === 250) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Half Fee (LKR 250)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDoctorFee(0); setCustomFeeActive(false); }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: (!customFeeActive && doctorFee === 0) ? 'var(--primary)' : 'var(--card-border)',
                          background: (!customFeeActive && doctorFee === 0) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Waived / Free (LKR 0)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCustomFeeActive(true); }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: customFeeActive ? 'var(--primary)' : 'var(--card-border)',
                          background: customFeeActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Custom Fee
                      </button>

                      {customFeeActive && (
                        <input
                          type="number"
                          placeholder="Enter amount in LKR"
                          value={customFee}
                          onChange={(e) => setCustomFee(e.target.value)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            border: '1px solid var(--primary)',
                            width: '180px',
                            fontSize: '0.9rem',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'white'
                          }}
                        />
                      )}
                    </div>
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
                        setIsQueueCollapsed(false);
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

          {/* Right Pane: Waiting Queue Sidebar */}
          {!isQueueCollapsed && (
            <div className="glass-card animate-fade-in" style={{ width: '310px', flexShrink: 0, height: 'fit-content', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>
                  <Users size={18} />
                  <span>Today's Queue ({activeQueue.length})</span>
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {/* QR Scan Button for Doctor */}
                  <button 
                    onClick={() => setShowQrModal(true)}
                    className="btn-primary" 
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.2rem', alignItems: 'center' }}
                  >
                    <QrCode size={13} />
                    <span>Scan</span>
                  </button>

                  {/* Hide Queue Sidebar Button */}
                  {selectedVisit && (
                    <button 
                      onClick={() => setIsQueueCollapsed(true)}
                      className="btn-secondary" 
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.2rem', alignItems: 'center' }}
                      title="Hide Queue Sidebar"
                    >
                      <span>Hide</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {notif.text && (
                <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`} style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  <span>{notif.text}</span>
                </div>
              )}

              <div className={styles.queueList} style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                {activeQueue.length === 0 ? (
                  <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>No patients in queue.</p>
                ) : (
                  activeQueue.map((visit) => {
                    const isSelected = selectedVisit && selectedVisit.id === visit.id;
                    return (
                      <div 
                        key={visit.id} 
                        onClick={() => handleSelectPatient(visit)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                          background: isSelected ? 'var(--primary-glow)' : 'var(--card-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                          <div className={styles.queueNumber} style={{ width: '28px', height: '28px', fontSize: '0.85rem', flexShrink: 0 }}>{visit.queue_number}</div>
                          
                          {visit.patient?.photo_url ? (
                            <img 
                              src={visit.patient.photo_url} 
                              alt="photo" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                              <User size={15} />
                            </div>
                          )}

                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {visit.patient?.prefix} {visit.patient?.full_name}
                            </h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              ID: {visit.patient?.id}
                            </p>
                          </div>
                        </div>

                        <span className={`badge ${visit.status === 'in_consultation' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', flexShrink: 0 }}>
                          {visit.status === 'in_consultation' ? 'In Room' : 'Waiting'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Queue */}
      {(activeTab === 'overview' || activeTab === 'queue') && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Live OPD Queue</h3>
            <button 
              onClick={() => setShowQrModal(true)}
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
            >
              <QrCode size={16} />
              <span>Scan Patient QR</span>
            </button>
          </div>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>No patients have been added to the queue today yet.</p>
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
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>
                        {visit.patient?.prefix} {visit.patient?.full_name || 'Unknown Patient'} 
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>({visit.patient?.id})</span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        Phone: {visit.patient?.phone} ({visit.patient?.phone_owner_name || 'Self'}) | Gender: {visit.patient?.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                      {visit.chief_complaint && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginTop: '0.5rem', background: 'var(--muted-bg)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          Complaint: {visit.chief_complaint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {(visit.systolic_bp || visit.height_cm || visit.weight_kg || visit.bmi) && (
                      <div className={styles.noPrint} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)', background: 'var(--secondary-bg)', padding: '0.5rem', borderRadius: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {visit.systolic_bp && <span>BP: {visit.systolic_bp}/{visit.diastolic_bp}</span>}
                        {visit.height_cm && <span>Height: {visit.height_cm}cm</span>}
                        {visit.weight_kg && <span>Weight: {visit.weight_kg}kg</span>}
                        {(() => {
                          const bmiData = calculateBMI(visit.height_cm, visit.weight_kg) || (visit.bmi ? { value: visit.bmi, category: '', color: '#10b981' } : null);
                          return bmiData ? <span style={{ color: bmiData.color, fontWeight: 'bold' }}>BMI: {bmiData.value} {bmiData.category ? `(${bmiData.category})` : ''}</span> : null;
                        })()}
                      </div>
                    )}

                    <span className={`badge ${
                      visit.status === 'waiting' ? 'badge-warning' : 
                      visit.status === 'in_consultation' ? 'badge-primary' : 'badge-success'
                    }`}>
                      {visit.status === 'waiting' && 'Waiting'}
                      {visit.status === 'in_consultation' && 'In Consultation'}
                      {visit.status === 'completed' && 'Completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Register Patient (Split Pane Layout) */}
      {activeTab === 'register' && (
        <div className={styles.splitGrid}>
          {/* Left Side: Real-time Smart Suggestions Sidebar */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} />
              <span>Smart Search Suggestions</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
              Start typing a name, phone, or address. Match results will load here instantly to avoid duplicate registrations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {smartSuggestions.map(sug => (
                <div 
                  key={sug.id}
                  onClick={() => selectPatientSuggestion(sug)}
                  style={{ 
                    cursor: 'pointer',
                    border: '1px solid var(--card-border)',
                    background: 'var(--secondary-bg)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                  className={styles.sugCard}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {sug.photo_url ? (
                      <img 
                        src={sug.photo_url} 
                        alt="thumb" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={16} />
                      </div>
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{sug.prefix} {sug.full_name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>ID: {sug.id} | Phone: {sug.phone}</p>
                      {sug.address && <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.1rem' }}>Addr: {sug.address}</p>}
                    </div>
                  </div>
                </div>
              ))}

              {smartSuggestions.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--secondary)', border: '1px dashed var(--card-border)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  No duplicate suggestions found. Go ahead and fill the form.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: The Registration Form */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} />
                <span>{patientForm.id ? `Edit Patient Profile (${patientForm.id})` : 'New Patient Registration Form'}</span>
              </div>
              {patientForm.id && (
                <button 
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
            </h3>

            {duplicatePatient && (
              <div className={`${styles.alert} ${styles.alertDanger}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <AlertTriangle size={18} />
                  <span>ALERT: Duplicate Patient Found!</span>
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  A patient named <strong>{duplicatePatient.full_name}</strong> with phone number <strong>{duplicatePatient.phone}</strong> is already registered as <strong>{duplicatePatient.id}</strong>.
                </p>
                <button 
                  type="button"
                  onClick={() => selectPatientSuggestion(duplicatePatient)}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                >
                  Load existing profile instead
                </button>
              </div>
            )}

            <PatientProfileForm 
              initialData={patientForm}
              onSave={handleSavePatient}
              onCancel={handleCancelPatientForm}
              setZoomedPhoto={setZoomedPhoto}
              duplicatePatient={duplicatePatient}
              selectPatientSuggestion={selectPatientSuggestion}
              getAge={getAge}
              getUniqueSuggestions={getUniqueSuggestions}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Patient Directory */}
      {activeTab === 'directory' && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Patient Directory</h3>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by ID, Name, Tel, or City..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className={styles.directoryTableWrapper}>
            <table className={styles.directoryTable}>
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Patient ID</th>
                  <th>Full Name</th>
                  <th style={{ width: '130px' }}>Age / Gender</th>
                  <th style={{ width: '140px' }}>Contact</th>
                  <th>City / Village</th>
                  <th>Address</th>
                  <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {directoryPatients.map(p => {
                  const city = p.address ? p.address.split(',').pop().trim() : 'N/A';
                  return (
                    <tr key={p.id} className={styles.directoryTableRow}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                        <code>{p.id}</code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.photo_url ? (
                            <img 
                              src={p.photo_url} 
                              alt="thumb" 
                              onClick={() => setZoomedPhoto(p.photo_url)}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)', cursor: 'zoom-in' }}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <User size={14} />
                            </div>
                          )}
                          <span style={{ fontWeight: '500' }}>{p.prefix} {p.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {getAge(p.date_of_birth)} / {p.gender}
                        </span>
                      </td>
                      <td>
                        <div>{p.phone}</div>
                        {p.phone_owner_name && p.phone_owner_name !== 'Self' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>({p.phone_owner_name})</div>
                        )}
                      </td>
                      <td>{city}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{p.address || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => loadPatientToForm(p)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => {
                              setVisitForm(prev => ({ ...prev, patient_id: p.id }));
                              handleSetActiveTab('walkin');
                            }}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <HeartPulse size={12} />
                            <span>OPD Check-in</span>
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

      {/* Tab 5: Walk-in Check-in (Add to Queue) */}
      {activeTab === 'walkin' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>OPD Check-in (Add to Queue)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Filter patients list by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleCheckIn} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Patient *</label>
              <select 
                value={visitForm.patient_id} 
                onChange={(e) => setVisitForm({ ...visitForm, patient_id: e.target.value })}
              >
                <option value="">-- Please select a patient --</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.prefix} {p.full_name} ({p.phone} - {p.id})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Doctor (Select Doctor)</label>
              <select 
                value={visitForm.doctor_id} 
                onChange={(e) => setVisitForm({ ...visitForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (OPD / General Practitioner)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Blood Pressure (Systolic / Diastolic)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Systolic (e.g. 120)"
                  value={visitForm.systolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, systolic_bp: e.target.value })}
                />
                <span>/</span>
                <input 
                  type="number" 
                  placeholder="Diastolic (e.g. 80)"
                  value={visitForm.diastolic_bp}
                  onChange={(e) => setVisitForm({ ...visitForm, diastolic_bp: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Height (cm)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 170"
                value={visitForm.height_cm}
                onChange={(e) => setVisitForm({ ...visitForm, height_cm: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 68.5"
                value={visitForm.weight_kg}
                onChange={(e) => setVisitForm({ ...visitForm, weight_kg: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>BMI (Auto Calculated)</label>
              {(() => {
                const bmiData = calculateBMI(visitForm.height_cm, visitForm.weight_kg);
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '42px',
                    padding: '0 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: bmiData ? bmiData.color : 'var(--secondary)'
                  }}>
                    {bmiData ? (
                      <span>{bmiData.value} kg/m² ({bmiData.category})</span>
                    ) : (
                      <span style={{ opacity: 0.6, fontWeight: 'normal', fontSize: '0.8rem' }}>Auto calculated from Height & Weight</span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <HeartPulse size={16} />
                <span>Add to Queue</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 6: Channeling Appointment Booking */}
      {activeTab === 'booking' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Channeling Booking (Appointments)</h3>
          
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <form onSubmit={handleBookAppointment} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Patient *</label>
              <select 
                value={appointmentForm.patient_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
              >
                <option value="">-- Please select a patient --</option>
                {filteredPatients.map(p => (
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
              <label className={styles.formLabel}>Specialist Doctor</label>
              <select 
                value={appointmentForm.doctor_id} 
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
              >
                <option value="doc1">Dr. Sunil Perera (Cardiologist)</option>
                <option value="doc2">Dr. (Mrs) K. Silva (Pediatrician)</option>
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

            <div className={styles.formFull} style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <CalendarDays size={16} />
                <span>Complete Channeling Booking</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulated QR Code Scanner Modal */}
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

            {/* Simulated patients list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeTab === 'consultation' ? (
                <>
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
                </>
              ) : (
                <>
                  <label style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>Select Registered Patient to Scan:</label>
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
                </>
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
