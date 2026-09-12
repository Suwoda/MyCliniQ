import React, { useState, useEffect } from 'react';
import { db } from '../../utils/db';
import { OPD_DIAGNOSES } from '../../data/opdData';
import { 
  HeartPulse, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Baby, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  BookOpen, 
  Sparkles,
  Info,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function PatientCareManagement() {
  const [activeSubTab, setActiveSubTab] = useState('regimes'); // 'regimes', 'pregnancy', 'pediatric', 'diagnoses'
  
  // Data states
  const [treatmentRegimes, setTreatmentRegimes] = useState([]);
  const [pregnancyList, setPregnancyList] = useState([]);
  const [pediatricRules, setPediatricRules] = useState([]);
  const [customDiagnoses, setCustomDiagnoses] = useState([]);
  const [drugsCatalog, setDrugsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Modal / Form state for Treatment Regime
  const [isRegimeModalOpen, setIsRegimeModalOpen] = useState(false);
  const [editingRegimeId, setEditingRegimeId] = useState(null);
  const [regimeForm, setRegimeForm] = useState({
    title: '',
    diagnoses: [],
    target_group: 'adult',
    notes: '',
    items: []
  });

  // Temp item input for Regime Form
  const [newItem, setNewItem] = useState({
    drug_id: '',
    brand_name: '',
    generic_name: '',
    dosage: '1 tab',
    frequency: 'TID',
    duration: 3,
    instructions: 'After meals'
  });

  // Modal / Form state for Pregnancy Contraindication
  const [isPregnancyModalOpen, setIsPregnancyModalOpen] = useState(false);
  const [pregnancyForm, setPregnancyForm] = useState({
    drug_name: '',
    generic_name: '',
    reason: ''
  });

  // Modal / Form state for Pediatric Rule
  const [isPediatricModalOpen, setIsPediatricModalOpen] = useState(false);
  const [pediatricForm, setPediatricForm] = useState({
    drug_id: '',
    brand_name: '',
    generic_name: '',
    form: 'syrup',
    strength: '120mg/5ml',
    mg_per_kg_per_dose: 15,
    ml_per_kg_per_dose: 0.625,
    max_single_dose_ml: 15,
    frequency: 'TID',
    instructions: 'Every 6-8 hours for fever'
  });

  // Pediatric Test Calculator state
  const [testWeightKg, setTestWeightKg] = useState(12);

  // Modal / Form state for Custom / Standard Diagnosis
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [editingDiagId, setEditingDiagId] = useState(null);
  const [diagnosisOverrides, setDiagnosisOverrides] = useState({});
  const [diagForm, setDiagForm] = useState({
    name: '',
    symptoms: '',
    negative_symptoms: '',
    signs: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regimesData, pregData, pedData, customDiagData, drugsData, overridesData] = await Promise.all([
        db.getTreatmentRegimes(),
        db.getPregnancyContraindications(),
        db.getPediatricDosingRules(),
        db.getCustomDiagnoses(),
        db.getDrugs(),
        db.getDiagnosisOverrides ? db.getDiagnosisOverrides() : Promise.resolve({})
      ]);

      setTreatmentRegimes(regimesData || []);
      setPregnancyList(pregData || []);
      setPediatricRules(pedData || []);
      setCustomDiagnoses(customDiagData || []);
      setDrugsCatalog(drugsData || []);
      setDiagnosisOverrides(overridesData || {});
    } catch (err) {
      console.error('Failed to load Patient Care data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  // Combine standard diagnoses (with overrides) and custom diagnoses
  const allDiagnoses = [
    ...OPD_DIAGNOSES.map(d => {
      const override = diagnosisOverrides[d.id] || {};
      return {
        id: d.id,
        name: override.name || d.name,
        symptoms: override.symptoms !== undefined ? override.symptoms : (Array.isArray(d.symptoms) ? d.symptoms.join(', ') : (d.symptoms || '')),
        negative_symptoms: override.negative_symptoms !== undefined ? override.negative_symptoms : (Array.isArray(d.negative_symptoms) ? d.negative_symptoms.join(', ') : (d.negative_symptoms || '')),
        signs: override.signs !== undefined ? override.signs : (Array.isArray(d.signs) ? d.signs.join(', ') : (d.signs || '')),
        isCustom: false
      };
    }),
    ...customDiagnoses.map(d => ({
      id: d.id,
      name: d.name,
      symptoms: Array.isArray(d.symptoms) ? d.symptoms.join(', ') : (d.symptoms || ''),
      negative_symptoms: Array.isArray(d.negative_symptoms) ? d.negative_symptoms.join(', ') : (d.negative_symptoms || ''),
      signs: Array.isArray(d.signs) ? d.signs.join(', ') : (d.signs || ''),
      isCustom: true
    }))
  ];

  // ----------------------------------------------------
  // Treatment Regime Handlers
  // ----------------------------------------------------
  const handleOpenRegimeModal = (regime = null) => {
    if (regime) {
      setEditingRegimeId(regime.id);
      setRegimeForm({
        title: regime.title,
        diagnoses: regime.diagnoses || [],
        target_group: regime.target_group || 'adult',
        notes: regime.notes || '',
        items: regime.items || []
      });
    } else {
      setEditingRegimeId(null);
      setRegimeForm({
        title: '',
        diagnoses: [],
        target_group: 'adult',
        notes: '',
        items: []
      });
    }
    setNewItem({
      drug_id: '',
      brand_name: '',
      generic_name: '',
      dosage: '1 tab',
      frequency: 'TID',
      duration: 3,
      instructions: 'After meals'
    });
    setIsRegimeModalOpen(true);
  };

  const handleSelectDrugForRegimeItem = (drugId) => {
    const selectedDrug = drugsCatalog.find(d => d.id === drugId);
    if (selectedDrug) {
      setNewItem(prev => ({
        ...prev,
        drug_id: selectedDrug.id,
        brand_name: selectedDrug.brand_name,
        generic_name: selectedDrug.generic_name,
        dosage: selectedDrug.form === 'syrup' ? 'AUTO_WEIGHT' : (selectedDrug.strength || '1 tab')
      }));
    }
  };

  const handleAddItemToRegime = () => {
    if (!newItem.brand_name && !newItem.generic_name) {
      alert('Please select a drug or type a drug name!');
      return;
    }
    setRegimeForm(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }));
    setNewItem({
      drug_id: '',
      brand_name: '',
      generic_name: '',
      dosage: '1 tab',
      frequency: 'TID',
      duration: 3,
      instructions: 'After meals'
    });
  };

  const handleRemoveItemFromRegime = (index) => {
    setRegimeForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleToggleDiagnosisInRegime = (diagName) => {
    setRegimeForm(prev => {
      const exists = prev.diagnoses.includes(diagName);
      if (exists) {
        return { ...prev, diagnoses: prev.diagnoses.filter(d => d !== diagName) };
      } else {
        return { ...prev, diagnoses: [...prev.diagnoses, diagName] };
      }
    });
  };

  const handleSaveRegime = async (e) => {
    e.preventDefault();
    if (!regimeForm.title.trim()) {
      alert('Please enter a title for the treatment regime!');
      return;
    }
    if (regimeForm.diagnoses.length === 0) {
      alert('Please select at least one diagnosis linked to this treatment set!');
      return;
    }
    if (regimeForm.items.length === 0) {
      alert('Please add at least one prescribed drug to the treatment set!');
      return;
    }

    try {
      if (editingRegimeId) {
        await db.updateTreatmentRegime(editingRegimeId, regimeForm);
        showNotification('Treatment Regime updated successfully!');
      } else {
        await db.addTreatmentRegime(regimeForm);
        showNotification('New Treatment Regime created successfully!');
      }
      setIsRegimeModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to save treatment regime: ' + err.message);
    }
  };

  const handleDeleteRegime = async (id) => {
    if (window.confirm('Are you sure you want to delete this Treatment Regime?')) {
      try {
        await db.deleteTreatmentRegime(id);
        showNotification('Treatment Regime deleted', 'warning');
        loadData();
      } catch (err) {
        alert('Failed to delete regime');
      }
    }
  };

  // ----------------------------------------------------
  // Pregnancy Contraindication Handlers
  // ----------------------------------------------------
  const handleSavePregnancyItem = async (e) => {
    e.preventDefault();
    if (!pregnancyForm.drug_name.trim()) {
      alert('Please enter the drug name!');
      return;
    }
    try {
      await db.addPregnancyContraindication(pregnancyForm);
      showNotification('Drug added to Pregnancy Contraindication Red List!');
      setIsPregnancyModalOpen(false);
      setPregnancyForm({ drug_name: '', generic_name: '', reason: '' });
      loadData();
    } catch (err) {
      alert('Failed to add contraindication');
    }
  };

  const handleDeletePregnancyItem = async (id) => {
    if (window.confirm('Remove this drug from pregnancy contraindications?')) {
      try {
        await db.deletePregnancyContraindication(id);
        showNotification('Item removed from Pregnancy Red List', 'warning');
        loadData();
      } catch (err) {
        alert('Failed to delete item');
      }
    }
  };

  // ----------------------------------------------------
  // Pediatric Rule Handlers
  // ----------------------------------------------------
  const handleSelectDrugForPediatricRule = (drugId) => {
    const selectedDrug = drugsCatalog.find(d => d.id === drugId);
    if (selectedDrug) {
      setPediatricForm(prev => ({
        ...prev,
        drug_id: selectedDrug.id,
        brand_name: selectedDrug.brand_name,
        generic_name: selectedDrug.generic_name,
        form: selectedDrug.form,
        strength: selectedDrug.strength
      }));
    }
  };

  const handleSavePediatricRule = async (e) => {
    e.preventDefault();
    if (!pediatricForm.brand_name && !pediatricForm.generic_name) {
      alert('Please select or type a drug name!');
      return;
    }
    try {
      await db.addPediatricDosingRule(pediatricForm);
      showNotification('Pediatric Weight-Based Dosing Rule saved!');
      setIsPediatricModalOpen(false);
      setPediatricForm({
        drug_id: '',
        brand_name: '',
        generic_name: '',
        form: 'syrup',
        strength: '120mg/5ml',
        mg_per_kg_per_dose: 15,
        ml_per_kg_per_dose: 0.625,
        max_single_dose_ml: 15,
        frequency: 'TID',
        instructions: 'Every 6-8 hours for fever'
      });
      loadData();
    } catch (err) {
      alert('Failed to save pediatric dosing rule');
    }
  };

  const handleDeletePediatricRule = async (id) => {
    if (window.confirm('Delete this pediatric dosing rule?')) {
      try {
        await db.deletePediatricDosingRule(id);
        showNotification('Pediatric rule deleted', 'warning');
        loadData();
      } catch (err) {
        alert('Failed to delete rule');
      }
    }
  };

  // ----------------------------------------------------
  // Custom / Standard Diagnosis Handlers
  // ----------------------------------------------------
  const handleOpenDiagModal = (diag = null) => {
    if (diag) {
      setEditingDiagId(diag.id);
      setDiagForm({
        name: diag.name || '',
        symptoms: diag.symptoms || '',
        negative_symptoms: diag.negative_symptoms || '',
        signs: diag.signs || ''
      });
    } else {
      setEditingDiagId(null);
      setDiagForm({
        name: '',
        symptoms: '',
        negative_symptoms: '',
        signs: ''
      });
    }
    setIsDiagModalOpen(true);
  };

  const handleSaveDiagnosis = async (e) => {
    e.preventDefault();
    if (!diagForm.name.trim()) {
      alert('Please enter diagnosis name!');
      return;
    }
    try {
      if (editingDiagId) {
        const isCustom = customDiagnoses.some(cd => cd.id === editingDiagId);
        if (isCustom) {
          await db.updateCustomDiagnosis(editingDiagId, diagForm);
        } else {
          await db.updateDiagnosisOverride(editingDiagId, diagForm);
        }
        showNotification('OPD Diagnosis updated successfully!');
      } else {
        await db.addCustomDiagnosis(diagForm);
        showNotification('New OPD Diagnosis added successfully!');
      }
      setIsDiagModalOpen(false);
      setEditingDiagId(null);
      setDiagForm({ name: '', symptoms: '', negative_symptoms: '', signs: '' });
      loadData();
    } catch (err) {
      alert('Failed to save diagnosis: ' + err.message);
    }
  };

  const handleDeleteCustomDiagnosis = async (id) => {
    if (window.confirm('Delete this custom diagnosis?')) {
      try {
        await db.deleteCustomDiagnosis(id);
        showNotification('Custom diagnosis deleted', 'warning');
        loadData();
      } catch (err) {
        alert('Failed to delete diagnosis');
      }
    }
  };

  // Filtered regimes
  const filteredRegimes = treatmentRegimes.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.diagnoses.some(d => d.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '1rem', color: 'var(--text-main)' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(147,51,234,0.15))',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex'
          }}>
            <HeartPulse size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Patient Care Management <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>Admin Control</span>
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--secondary)' }}>
              Standardize treatment regimes, configure drug safety contraindications, multi-diagnosis protocols & weight-based pediatric dosing.
            </p>
          </div>
        </div>

        {statusMessage.text && (
          <div style={{
            background: statusMessage.type === 'warning' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
            border: `1px solid ${statusMessage.type === 'warning' ? '#f87171' : '#34d399'}`,
            color: statusMessage.type === 'warning' ? '#f87171' : '#34d399',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} /> {statusMessage.text}
          </div>
        )}
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--card-border)',
        paddingBottom: '0.75rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveSubTab('regimes')}
          style={{
            background: activeSubTab === 'regimes' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'var(--secondary-bg)',
            color: activeSubTab === 'regimes' ? '#fff' : 'var(--text-main)',
            border: '1px solid var(--card-border)',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={17} /> Predefined Treatment Regimes ({treatmentRegimes.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pregnancy')}
          style={{
            background: activeSubTab === 'pregnancy' ? 'linear-gradient(135deg, #ec4899, #d946ef)' : 'var(--secondary-bg)',
            color: activeSubTab === 'pregnancy' ? '#fff' : 'var(--text-main)',
            border: '1px solid var(--card-border)',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <ShieldAlert size={17} /> Pregnancy Contraindications ({pregnancyList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pediatric')}
          style={{
            background: activeSubTab === 'pediatric' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--secondary-bg)',
            color: activeSubTab === 'pediatric' ? '#fff' : 'var(--text-main)',
            border: '1px solid var(--card-border)',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Baby size={17} /> Pediatric Weight Dosing ({pediatricRules.length})
        </button>

        <button
          onClick={() => setActiveSubTab('diagnoses')}
          style={{
            background: activeSubTab === 'diagnoses' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'var(--secondary-bg)',
            color: activeSubTab === 'diagnoses' ? '#fff' : 'var(--text-main)',
            border: '1px solid var(--card-border)',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Stethoscope size={17} /> OPD Diagnoses ({allDiagnoses.length})
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary)' }}>
          <Sparkles className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
          <p>Loading Patient Care configurations...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* SUBTAB 1: PREDEFINED TREATMENT REGIMES */}
          {/* ========================================================================= */}
          {activeSubTab === 'regimes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Search input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search regimes by diagnosis, title, or drug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'var(--secondary-bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <button
                  onClick={() => handleOpenRegimeModal()}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                  }}
                >
                  <Plus size={18} /> Create New Treatment Regime
                </button>
              </div>

              {/* Grid of Regimes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {filteredRegimes.map(regime => (
                  <div
                    key={regime.id}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-md)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: regime.target_group === 'pediatric' ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                            color: regime.target_group === 'pediatric' ? '#047857' : '#1d4ed8',
                            marginRight: '0.5rem'
                          }}>
                            {regime.target_group === 'pediatric' ? '👶 PEDIATRIC' : '👤 ADULT'}
                          </span>
                          {regime.diagnoses.length > 1 && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(147,51,234,0.15)',
                              color: '#7e22ce'
                            }}>
                              ⚡ MULTI-DIAGNOSIS COMBO
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenRegimeModal(regime)}
                            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0.25rem' }}
                            title="Edit Regime"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRegime(regime.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}
                            title="Delete Regime"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--foreground)', fontWeight: '700' }}>
                        {regime.title}
                      </h3>

                      {/* Linked Diagnoses Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                        {regime.diagnoses.map(diag => (
                          <span
                            key={diag}
                            style={{
                              background: 'var(--secondary-bg)',
                              border: '1px solid var(--card-border)',
                              color: 'var(--foreground)',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}
                          >
                            🩺 {diag}
                          </span>
                        ))}
                      </div>

                      {regime.notes && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.85, margin: '0 0 1rem 0', fontStyle: 'italic' }}>
                          "{regime.notes}"
                        </p>
                      )}

                      {/* Items List Table Preview */}
                      <div style={{ background: 'var(--secondary-bg)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.82rem', border: '1px solid var(--card-border)' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--foreground)', opacity: 0.85, marginBottom: '0.4rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.2rem' }}>
                          Prescribed Drug Set ({regime.items.length} items):
                        </div>
                        {regime.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: idx === regime.items.length - 1 ? 'none' : '1px dashed var(--card-border)' }}>
                            <span style={{ color: 'var(--foreground)', fontWeight: 'bold' }}>
                              • {item.brand_name || item.generic_name}
                            </span>
                            <span style={{ color: '#0284c7', fontWeight: 'bold' }}>
                              {item.dosage} | {item.frequency} x {item.duration}d
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--foreground)', opacity: 0.85 }}>
                      <span>Auto-suggests in Doctor Consultation</span>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Verified Protocol</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 2: PREGNANCY CONTRAINDICATIONS */}
          {/* ========================================================================= */}
          {activeSubTab === 'pregnancy' && (
            <div>
              <div style={{
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={24} style={{ color: '#be185d' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#be185d', fontSize: '1rem', fontWeight: 'bold' }}>Pregnancy Drug Safety Guard</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.85 }}>
                      Drugs registered here will trigger an automatic warning banner and auto-suppress prescribing when consulting pregnant patients.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPregnancyModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={18} /> Add Contraindicated Drug
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--secondary-bg)' }}>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Drug / Brand Name</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Generic Name</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Clinical Risk / Contraindication Reason</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--foreground)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pregnancyList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#be185d' }}>
                          🤰 {item.drug_name}
                        </td>
                        <td style={{ padding: '0.8rem', color: 'var(--foreground)', fontWeight: '500' }}>
                          {item.generic_name || '-'}
                        </td>
                        <td style={{ padding: '0.8rem', color: 'var(--foreground)', opacity: 0.85 }}>
                          {item.reason || 'Teratogenic / Contraindicated in pregnancy'}
                        </td>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeletePregnancyItem(item.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                            title="Remove from Red List"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 3: PEDIATRIC WEIGHT-BASED DOSING */}
          {/* ========================================================================= */}
          {activeSubTab === 'pediatric' && (
            <div>
              {/* Test Calculator Widget */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.15))',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Baby size={28} style={{ color: '#047857' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#047857', fontSize: '1.1rem', fontWeight: 'bold' }}>Pediatric Weight-Based Auto-Dosing Engine</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.85 }}>
                      System calculates exact syrup volume (mL) dynamically based on recorded patient weight (kg).
                    </p>
                  </div>
                </div>

                {/* Calculator Sandbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 'bold' }}>🧪 Test Weight:</span>
                  <input
                    type="number"
                    value={testWeightKg}
                    onChange={(e) => setTestWeightKg(parseFloat(e.target.value) || 0)}
                    style={{ width: '70px', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)', fontWeight: 'bold', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.8 }}>kg</span>
                </div>

                <button
                  onClick={() => setIsPediatricModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={18} /> Add Pediatric Dosing Rule
                </button>
              </div>

              {/* Rules Table */}
              <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--secondary-bg)' }}>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Medication (Syrup/Suspension)</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Strength</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Dose Multiplier</th>
                      <th style={{ padding: '0.8rem', background: 'rgba(16,185,129,0.15)', color: '#047857', fontWeight: 'bold' }}>
                        Calculated Dose for {testWeightKg}kg Patient
                      </th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Standard Freq & Instructions</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--foreground)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pediatricRules.map(rule => {
                      const calculatedMl = (testWeightKg * (rule.ml_per_kg_per_dose || 0.5)).toFixed(1);
                      const finalDose = Math.min(calculatedMl, rule.max_single_dose_ml || 20);

                      return (
                        <tr key={rule.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                            👶 {rule.brand_name || rule.generic_name}
                          </td>
                          <td style={{ padding: '0.8rem', color: 'var(--foreground)', opacity: 0.85 }}>
                            {rule.strength || 'Syrup'}
                          </td>
                          <td style={{ padding: '0.8rem', color: '#0284c7', fontWeight: 'bold' }}>
                            {rule.mg_per_kg_per_dose} mg/kg ({rule.ml_per_kg_per_dose} mL/kg)
                          </td>
                          <td style={{ padding: '0.8rem', background: 'rgba(16,185,129,0.05)', color: '#047857', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            👉 {finalDose} mL <span style={{ fontSize: '0.75rem', color: 'var(--foreground)', opacity: 0.7, fontWeight: 'normal' }}>(Max {rule.max_single_dose_ml}mL)</span>
                          </td>
                          <td style={{ padding: '0.8rem', color: 'var(--foreground)', opacity: 0.85 }}>
                            {rule.frequency} - {rule.instructions}
                          </td>
                          <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePediatricRule(rule.id)}
                              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                              title="Delete Rule"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB 4: OPD DIAGNOSES MANAGEMENT */}
          {/* ========================================================================= */}
          {activeSubTab === 'diagnoses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--foreground)', fontWeight: 'bold' }}>OPD Diagnoses Catalog ({allDiagnoses.length})</h4>
                <button
                  onClick={() => handleOpenDiagModal(null)}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={18} /> Add Custom Diagnosis
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--secondary-bg)' }}>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Diagnosis Name</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Associated Symptoms List</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Important Negative Symptoms</th>
                      <th style={{ padding: '0.8rem', color: 'var(--foreground)' }}>Associated Signs</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--foreground)' }}>Type</th>
                      <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--foreground)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDiagnoses.map(diag => {
                      const isCustom = customDiagnoses.some(cd => cd.id === diag.id);
                      return (
                        <tr key={diag.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '0.8rem', fontWeight: 'bold', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                            🩺 {diag.name}
                          </td>
                          <td style={{ padding: '0.8rem', color: 'var(--foreground)', opacity: 0.85, minWidth: '160px' }}>
                            {diag.symptoms || <span style={{ opacity: 0.5 }}>—</span>}
                          </td>
                          <td style={{ padding: '0.8rem', color: '#dc2626', fontWeight: '600', minWidth: '160px' }}>
                            {diag.negative_symptoms || <span style={{ opacity: 0.5 }}>—</span>}
                          </td>
                          <td style={{ padding: '0.8rem', color: '#0284c7', fontWeight: '600', minWidth: '160px' }}>
                            {diag.signs || <span style={{ opacity: 0.5 }}>—</span>}
                          </td>
                          <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: isCustom ? 'rgba(139,92,246,0.15)' : 'var(--secondary-bg)',
                              color: isCustom ? '#7c3aed' : 'var(--foreground)',
                              fontWeight: '600'
                            }}>
                              {isCustom ? 'Custom' : 'Standard'}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleOpenDiagModal(diag)}
                                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}
                                title="Edit Diagnosis"
                              >
                                <Edit3 size={16} />
                              </button>
                              {isCustom && (
                                <button
                                  onClick={() => handleDeleteCustomDiagnosis(diag.id)}
                                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                                  title="Delete Diagnosis"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT TREATMENT REGIME */}
      {/* ========================================================================= */}
      {isRegimeModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--foreground)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--foreground)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <BookOpen size={20} style={{ color: '#0284c7' }} />
              {editingRegimeId ? 'Edit Treatment Regime' : 'Create Predefined Treatment Regime'}
            </h3>

            <form onSubmit={handleSaveRegime}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Regime Title (e.g. "Standard Adult URTI Regimen", "Arthritis + GORD Protocol")
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter descriptive title for this treatment regime..."
                  value={regimeForm.title}
                  onChange={(e) => setRegimeForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--secondary-bg)',
                    color: 'var(--foreground)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Target Group & Diagnoses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Target Patient Group
                  </label>
                  <select
                    value={regimeForm.target_group}
                    onChange={(e) => setRegimeForm(prev => ({ ...prev, target_group: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'var(--secondary-bg)',
                      color: 'var(--foreground)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="adult">👤 Adult (Standard Dose)</option>
                    <option value="pediatric">👶 Pediatric (Weight-based)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Linked OPD Diagnoses (Select 1 or Multiple for Combo Sets):
                  </label>
                  <div style={{
                    maxHeight: '110px',
                    overflowY: 'auto',
                    background: 'var(--secondary-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem'
                  }}>
                    {allDiagnoses.map(d => {
                      const isSelected = regimeForm.diagnoses.includes(d.name);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleToggleDiagnosisInRegime(d.name)}
                          style={{
                            background: isSelected ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'var(--card-bg)',
                            color: isSelected ? '#fff' : 'var(--foreground)',
                            border: `1px solid ${isSelected ? '#3b82f6' : 'var(--card-border)'}`,
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 'bold' : 'normal'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '} {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rationale Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Clinical Rationale / Special Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'NSAIDs avoided for GORD safety; PPI duration extended to 14 days.'"
                  value={regimeForm.notes}
                  onChange={(e) => setRegimeForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--secondary-bg)',
                    color: 'var(--foreground)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Prescribed Items Builder */}
              <div style={{ background: 'var(--secondary-bg)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--card-border)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--foreground)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                  💊 Prescribed Medications in this Set ({regimeForm.items.length})
                </h4>

                {/* Added items list */}
                {regimeForm.items.length === 0 ? (
                  <p style={{ color: 'var(--foreground)', opacity: 0.7, fontSize: '0.8rem', fontStyle: 'italic', margin: '0 0 0.8rem 0' }}>
                    No drugs added yet. Use the form below to add drugs.
                  </p>
                ) : (
                  <div style={{ marginBottom: '1rem' }}>
                    {regimeForm.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '6px',
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem'
                      }}>
                        <div>
                          <strong style={{ color: 'var(--foreground)' }}>{item.brand_name || item.generic_name}</strong>
                          <span style={{ color: '#0284c7', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                            ({item.dosage} | {item.frequency} x {item.duration}d)
                          </span>
                          {item.instructions && (
                            <span style={{ color: 'var(--foreground)', opacity: 0.75, marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                              - {item.instructions}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromRegime(idx)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Item adder input row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Select Drug Catalog</label>
                    <select
                      value={newItem.drug_id}
                      onChange={(e) => handleSelectDrugForRegimeItem(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.8rem' }}
                    >
                      <option value="">-- Choose Drug --</option>
                      {drugsCatalog.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.brand_name} ({d.generic_name}) - {d.strength}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 tabs"
                      value={newItem.dosage}
                      onChange={(e) => setNewItem(prev => ({ ...prev, dosage: e.target.value }))}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Frequency</label>
                    <select
                      value={newItem.frequency}
                      onChange={(e) => setNewItem(prev => ({ ...prev, frequency: e.target.value }))}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.8rem' }}
                    >
                      <option value="OD">OD (Once daily)</option>
                      <option value="BID">BID (Twice daily)</option>
                      <option value="TID">TID (Thrice daily)</option>
                      <option value="QID">QID (Four times daily)</option>
                      <option value="PRN">PRN (As needed)</option>
                      <option value="STAT">STAT (Immediately)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Duration (Days)</label>
                    <input
                      type="number"
                      value={newItem.duration}
                      onChange={(e) => setNewItem(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Instructions (e.g. 'After meals', '30 min before food')"
                    value={newItem.instructions}
                    onChange={(e) => setNewItem(prev => ({ ...prev, instructions: e.target.value }))}
                    style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddItemToRegime}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Add Drug
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRegimeModalOpen(false)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Save Treatment Regime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PREGNANCY CONTRAINDICATION */}
      {/* ========================================================================= */}
      {isPregnancyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px',
            width: '100%', maxWidth: '500px', padding: '1.5rem', color: 'var(--foreground)', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#be185d', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Add Pregnancy Contraindicated Drug
            </h3>
            <form onSubmit={handleSavePregnancyItem}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Drug / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibuprofen, Diclofenac, Enalapril"
                  value={pregnancyForm.drug_name}
                  onChange={(e) => setPregnancyForm(prev => ({ ...prev, drug_name: e.target.value, generic_name: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Clinical Reason / Risk</label>
                <textarea
                  rows="3"
                  placeholder="e.g. NSAID - Risk of premature ductus arteriosus closure & renal impairment."
                  value={pregnancyForm.reason}
                  onChange={(e) => setPregnancyForm(prev => ({ ...prev, reason: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsPregnancyModalOpen(false)} style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" style={{ background: '#db2777', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold' }}>Add to Red List</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PEDIATRIC DOSING RULE */}
      {/* ========================================================================= */}
      {isPediatricModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px',
            width: '100%', maxWidth: '600px', padding: '1.5rem', color: 'var(--foreground)', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#047857', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Add Pediatric Weight-Based Dosing Rule
            </h3>
            <form onSubmit={handleSavePediatricRule}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Select Medication from Catalog</label>
                <select
                  onChange={(e) => handleSelectDrugForPediatricRule(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                >
                  <option value="">-- Select Pediatric Syrup --</option>
                  {drugsCatalog.map(d => (
                    <option key={d.id} value={d.id}>{d.brand_name} ({d.generic_name}) - {d.strength}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Dose mg / kg / dose</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pediatricForm.mg_per_kg_per_dose}
                    onChange={(e) => setPediatricForm(prev => ({ ...prev, mg_per_kg_per_dose: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Volume mL / kg / dose</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pediatricForm.ml_per_kg_per_dose}
                    onChange={(e) => setPediatricForm(prev => ({ ...prev, ml_per_kg_per_dose: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Max Single Dose (mL)</label>
                  <input
                    type="number"
                    value={pediatricForm.max_single_dose_ml}
                    onChange={(e) => setPediatricForm(prev => ({ ...prev, max_single_dose_ml: parseFloat(e.target.value) || 15 }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Frequency</label>
                  <select
                    value={pediatricForm.frequency}
                    onChange={(e) => setPediatricForm(prev => ({ ...prev, frequency: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                  >
                    <option value="OD">OD</option>
                    <option value="BID">BID</option>
                    <option value="TID">TID</option>
                    <option value="QID">QID</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Instructions</label>
                <input
                  type="text"
                  value={pediatricForm.instructions}
                  onChange={(e) => setPediatricForm(prev => ({ ...prev, instructions: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsPediatricModalOpen(false)} style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold' }}>Save Dosing Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT OPD DIAGNOSIS */}
      {/* ========================================================================= */}
      {isDiagModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px',
            width: '100%', maxWidth: '600px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', color: 'var(--foreground)', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Activity size={20} />
              {editingDiagId ? 'Edit OPD Diagnosis' : 'Add Custom OPD Diagnosis'}
            </h3>
            <form onSubmit={handleSaveDiagnosis}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Diagnosis Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dengue Fever, Migraine, Bronchial Asthma"
                  value={diagForm.name}
                  onChange={(e) => setDiagForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)' }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', marginBottom: '0.2rem', fontWeight: 'bold' }}>Associated Symptoms (Comma-separated)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. High fever, Retro-orbital pain, Myalgia, Rash"
                  value={diagForm.symptoms}
                  onChange={(e) => setDiagForm(prev => ({ ...prev, symptoms: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#dc2626', marginBottom: '0.2rem', fontWeight: 'bold' }}>Important Negative Symptoms (Comma-separated)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. No SOB, No chest pain, No bleeding, No vomiting"
                  value={diagForm.negative_symptoms}
                  onChange={(e) => setDiagForm(prev => ({ ...prev, negative_symptoms: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#0284c7', marginBottom: '0.2rem', fontWeight: 'bold' }}>Associated Physical Signs / Findings (Comma-separated)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Pale, Icteric, Abdominal tenderness, Lung crepitations, Febrile"
                  value={diagForm.signs}
                  onChange={(e) => setDiagForm(prev => ({ ...prev, signs: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--secondary-bg)', color: 'var(--foreground)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsDiagModalOpen(false)} style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancel</button>
                <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold' }}>{editingDiagId ? 'Update Diagnosis' : 'Save Diagnosis'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
