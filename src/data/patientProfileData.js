import { db } from '../utils/db';

export const DEFAULT_PAST_MEDICAL_HISTORY = [
  'Hypertension (HTN)',
  'Diabetes Mellitus (DM)',
  'Bronchial Asthma (BA)',
  'Ischaemic Heart Disease (IHD)',
  'Dyslipidaemia (DL)',
  'Thyroid Disease',
  'Chronic Kidney Disease (CKD)',
  'Stroke / CVA',
  'Epilepsy / Seizures',
  'Gastritis / GORD',
  'Rheumatoid Arthritis',
  'Osteoarthritis',
  'Fatty Liver'
];

export const DEFAULT_PAST_SURGICAL_HISTORY = [
  'Appendectomy',
  'Hernia Repair',
  'Cholecystectomy',
  'Caesarean Section (LSCS)',
  'Hysterectomy',
  'Coronary Artery Bypass (CABG)',
  'Cataract Surgery',
  'Amputation',
  'Total Knee Replacement (TKR)',
  'Total Hip Replacement (THR)',
  'Tonsillectomy',
  'Thyroidectomy'
];

export const DEFAULT_FOOD_ALLERGIES = [
  'Pineapple',
  'Prawns',
  'Crab / Seafood',
  'Cuttlefish',
  'Egg',
  'Peanut',
  'Cow\'s Milk',
  'Tomato',
  'Brinjal',
  'Soya',
  'Wheat / Gluten',
  'Fish',
  'Chicken',
  'Mushroom'
];

export const DEFAULT_GENERIC_DRUGS = [
  'Penicillin',
  'Amoxicillin',
  'Paracetamol',
  'Ciprofloxacin',
  'Erythromycin',
  'Co-amoxiclav',
  'Azithromycin',
  'Metronidazole',
  'Cephalexin',
  'Doxycycline',
  'Ibuprofen',
  'Mefenamic Acid',
  'Diclofenac',
  'Aspirin',
  'Clopidogrel',
  'Amlodipine',
  'Losartan',
  'Enalapril',
  'Metformin',
  'Glibenclamide',
  'Atorvastatin',
  'Salbutamol',
  'Cetirizine',
  'Chlorpheniramine',
  'Prednisolone',
  'Dexamethasone',
  'Omeprazole',
  'Ranitidine',
  'Domperidone'
];

// Helper to get food allergies list (combining defaults + custom additions in localStorage)
export const getFoodAllergiesList = () => {
  if (typeof window === 'undefined') return DEFAULT_FOOD_ALLERGIES;
  try {
    const saved = localStorage.getItem('mycliniq_food_allergies');
    if (!saved) return DEFAULT_FOOD_ALLERGIES;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return DEFAULT_FOOD_ALLERGIES;
    return Array.from(new Set([...DEFAULT_FOOD_ALLERGIES, ...parsed]));
  } catch (e) {
    return DEFAULT_FOOD_ALLERGIES;
  }
};

// Add new custom food item to list persistently
export const addCustomFoodAllergyItem = (newFood) => {
  if (typeof window === 'undefined' || !newFood || !newFood.trim()) return;
  try {
    const current = getFoodAllergiesList();
    const formatted = newFood.trim();
    if (!current.some(f => f.toLowerCase() === formatted.toLowerCase())) {
      const updated = [...current, formatted];
      localStorage.setItem('mycliniq_food_allergies', JSON.stringify(updated));
    }
  } catch (e) {}
};

export const DEFAULT_RELATIONSHIPS = [
  'Self',
  'Parent',
  'Mother',
  'Father',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandson',
  'Granddaughter',
  'Grandparent',
  'Guardian',
  'Spouse',
  'Relative',
  'Neighbor / Friend'
];

export const DEFAULT_ADDRESSES = [
  'Colombo',
  'Kandy',
  'Galle',
  'Matara',
  'Negombo',
  'Kurunegala',
  'Anuradhapura',
  'Gampaha',
  'Ratnapura',
  'Jaffna',
  'Badulla',
  'Kalutara',
  'Panadura',
  'Horana',
  'Kegalle',
  'Chilaw',
  'Batticaloa',
  'Trincomalee',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Avissawella',
  'Hambantota'
];

// Helper to get addresses / cities list
export const getAddressesList = () => {
  if (typeof window === 'undefined') return DEFAULT_ADDRESSES;
  try {
    const saved = localStorage.getItem('mycliniq_patient_addresses');
    if (!saved) return DEFAULT_ADDRESSES;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return DEFAULT_ADDRESSES;
    return Array.from(new Set([...DEFAULT_ADDRESSES, ...parsed]));
  } catch (e) {
    return DEFAULT_ADDRESSES;
  }
};

// Add new custom address/city item to list persistently
export const addCustomAddressItem = (newAddr) => {
  if (typeof window === 'undefined' || !newAddr || !newAddr.trim()) return;
  try {
    const current = getAddressesList();
    const formatted = newAddr.trim();
    if (!current.some(a => a.toLowerCase() === formatted.toLowerCase())) {
      const updated = [...current, formatted];
      localStorage.setItem('mycliniq_patient_addresses', JSON.stringify(updated));
    }
  } catch (e) {}
};

// Frequency maps for Past Medical & Past Surgical history
export const getMedicalHistoryFrequency = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('mycliniq_med_history_freq') || '{}');
  } catch (e) {
    return {};
  }
};

export const incrementMedicalHistoryFrequency = (items) => {
  if (typeof window === 'undefined' || !items) return;
  const itemArray = Array.isArray(items) ? items : [items];
  try {
    const freq = getMedicalHistoryFrequency();
    itemArray.forEach(item => {
      if (item && typeof item === 'string') {
        const key = item.trim();
        freq[key] = (freq[key] || 0) + 1;
      }
    });
    localStorage.setItem('mycliniq_med_history_freq', JSON.stringify(freq));
  } catch (e) {}
};

export const getSurgicalHistoryFrequency = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('mycliniq_surg_history_freq') || '{}');
  } catch (e) {
    return {};
  }
};

export const incrementSurgicalHistoryFrequency = (items) => {
  if (typeof window === 'undefined' || !items) return;
  const itemArray = Array.isArray(items) ? items : [items];
  try {
    const freq = getSurgicalHistoryFrequency();
    itemArray.forEach(item => {
      if (item && typeof item === 'string') {
        const key = item.trim();
        freq[key] = (freq[key] || 0) + 1;
      }
    });
    localStorage.setItem('mycliniq_surg_history_freq', JSON.stringify(freq));
  } catch (e) {}
};
