import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, Plus, X, ChevronDown, ChevronUp, AlertTriangle, Check, UserCheck, User, Info 
} from 'lucide-react';
import styles from '../../styles/dashboard.module.css';
import { db } from '../../utils/db';
import {
  DEFAULT_PAST_MEDICAL_HISTORY,
  DEFAULT_PAST_SURGICAL_HISTORY,
  DEFAULT_FOOD_ALLERGIES,
  DEFAULT_GENERIC_DRUGS,
  DEFAULT_RELATIONSHIPS,
  getFoodAllergiesList,
  addCustomFoodAllergyItem,
  getAddressesList,
  addCustomAddressItem,
  getMedicalHistoryFrequency,
  incrementMedicalHistoryFrequency,
  getSurgicalHistoryFrequency,
  incrementSurgicalHistoryFrequency
} from '../../data/patientProfileData';

export default function PatientProfileForm({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  setZoomedPhoto,
  duplicatePatient,
  selectPatientSuggestion,
  getAge,
  getUniqueSuggestions = () => []
}) {
  // Form Basic Fields
  const [patientId, setPatientId] = useState(initialData.id || '');
  const [prefix, setPrefix] = useState(initialData.prefix || 'Mr.');
  const [fullName, setFullName] = useState(initialData.full_name || '');
  const [gender, setGender] = useState(initialData.gender || 'male');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth || '');
  const [isDobEstimated, setIsDobEstimated] = useState(initialData.is_dob_estimated || false);
  const [isAgeEditable, setIsAgeEditable] = useState(false);
  const [estimatedAge, setEstimatedAge] = useState(initialData.estimated_age || '');
  const [occupation, setOccupation] = useState(initialData.occupation || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [phoneOwnerName, setPhoneOwnerName] = useState(initialData.phone_owner_name || 'Self');
  const [address, setAddress] = useState(initialData.address || '');
  const [addressList, setAddressList] = useState(getAddressesList());
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [comments, setComments] = useState(initialData.comments || '');
  const [photoUrl, setPhotoUrl] = useState(initialData.photo_url || '');

  // Address filter suggestion options
  const filteredAddresses = useMemo(() => {
    if (!address || !address.trim()) return [];
    const q = address.toLowerCase().trim();
    const uniqueCombined = Array.from(new Set([...addressList, ...getUniqueSuggestions('address')]));
    return uniqueCombined.filter(a => a.toLowerCase().includes(q)).slice(0, 10);
  }, [address, addressList]);

  // Allergies State (3 Parts: Drug, Food, Plaster)
  const [drugAllergies, setDrugAllergies] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [genericDrugsList, setGenericDrugsList] = useState(DEFAULT_GENERIC_DRUGS);

  const [foodAllergies, setFoodAllergies] = useState([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [showFoodDropdown, setShowFoodDropdown] = useState(false);
  const [foodList, setFoodList] = useState(getFoodAllergiesList());

  const [hasPlasterAllergy, setHasPlasterAllergy] = useState(false);

  // Past Medical & Surgical History State
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState([]);
  const [customMedicalInput, setCustomMedicalInput] = useState('');
  const [showMedicalExpand, setShowMedicalExpand] = useState(true);

  const [selectedSurgicalHistory, setSelectedSurgicalHistory] = useState([]);
  const [customSurgicalInput, setCustomSurgicalInput] = useState('');
  const [showSurgicalExpand, setShowSurgicalExpand] = useState(true);

  // Load generic drug list from database if available
  useEffect(() => {
    const fetchGenericDrugs = async () => {
      try {
        if (db && typeof db.getDrugs === 'function') {
          const drugsData = await db.getDrugs();
          if (drugsData && Array.isArray(drugsData)) {
            const generics = new Set(DEFAULT_GENERIC_DRUGS);
            drugsData.forEach(d => {
              if (d.generic_name && d.generic_name.trim()) {
                generics.add(d.generic_name.trim());
              }
            });
            setGenericDrugsList(Array.from(generics));
          }
        }
      } catch (e) {
        console.error('Error fetching generic drugs list:', e);
      }
    };
    fetchGenericDrugs();
  }, []);

  // Parse initial data when prop changes
  useEffect(() => {
    setPatientId(initialData.id || '');
    setPrefix(initialData.prefix || 'Mr.');
    setFullName(initialData.full_name || '');
    setGender(initialData.gender || 'male');
    setDateOfBirth(initialData.date_of_birth || '');
    setIsDobEstimated(initialData.is_dob_estimated || false);
    setEstimatedAge(initialData.estimated_age || '');
    setOccupation(initialData.occupation || '');
    setPhone(initialData.phone || '');
    setPhoneOwnerName(initialData.phone_owner_name || 'Self');
    setAddress(initialData.address || '');
    setComments(initialData.comments || '');
    setPhotoUrl(initialData.photo_url || '');

    // Parse Allergies
    const rawAllergies = initialData.allergies;
    let allegList = [];
    if (Array.isArray(rawAllergies)) {
      allegList = rawAllergies;
    } else if (typeof rawAllergies === 'string' && rawAllergies.trim()) {
      allegList = rawAllergies.split(',').map(s => s.trim()).filter(Boolean);
    }

    const drugs = [];
    const foods = [];
    let plaster = false;

    allegList.forEach(item => {
      if (!item) return;
      const str = item.trim();
      const lower = str.toLowerCase();
      if (lower.includes('plaster')) {
        plaster = true;
      } else if (lower.endsWith('(food)') || lower.startsWith('food:')) {
        const cleaned = str.replace(/\(food\)$/i, '').replace(/^food:\s*/i, '').trim();
        if (cleaned && !foods.includes(cleaned)) foods.push(cleaned);
      } else if (lower.endsWith('(drug)') || lower.startsWith('drug:')) {
        const cleaned = str.replace(/\(drug\)$/i, '').replace(/^drug:\s*/i, '').trim();
        if (cleaned && !drugs.includes(cleaned)) drugs.push(cleaned);
      } else {
        // Fallback check against known food list
        if (DEFAULT_FOOD_ALLERGIES.some(f => f.toLowerCase() === lower)) {
          if (!foods.includes(str)) foods.push(str);
        } else {
          if (!drugs.includes(str)) drugs.push(str);
        }
      }
    });

    setDrugAllergies(drugs);
    setFoodAllergies(foods);
    setHasPlasterAllergy(plaster);

    // Parse Past Medical History
    const rawMed = initialData.past_medical_history;
    let medList = [];
    if (Array.isArray(rawMed)) {
      medList = rawMed;
    } else if (typeof rawMed === 'string' && rawMed.trim()) {
      medList = rawMed.split(',').map(s => s.trim()).filter(Boolean);
    }
    setSelectedMedicalHistory(medList);

    // Parse Past Surgical History
    const rawSurg = initialData.past_surgical_history;
    let surgList = [];
    if (Array.isArray(rawSurg)) {
      surgList = rawSurg;
    } else if (typeof rawSurg === 'string' && rawSurg.trim()) {
      surgList = rawSurg.split(',').map(s => s.trim()).filter(Boolean);
    }
    setSelectedSurgicalHistory(surgList);
  }, [initialData]);

  // Photo Change Handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size exceeds 1MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drug Allergy Handlers
  const filteredGenericDrugs = useMemo(() => {
    if (!drugSearch.trim()) return genericDrugsList.slice(0, 15);
    const q = drugSearch.toLowerCase().trim();
    return genericDrugsList.filter(d => d.toLowerCase().includes(q)).slice(0, 15);
  }, [drugSearch, genericDrugsList]);

  const addDrugAllergy = (drugName) => {
    const trimmed = drugName.trim();
    if (trimmed && !drugAllergies.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      setDrugAllergies(prev => [...prev, trimmed]);
    }
    setDrugSearch('');
    setShowDrugDropdown(false);
  };

  const removeDrugAllergy = (drugName) => {
    setDrugAllergies(prev => prev.filter(d => d !== drugName));
  };

  // Food Allergy Handlers
  const currentFoodOptions = useMemo(() => getFoodAllergiesList(), [foodAllergies]);

  const filteredFoodOptions = useMemo(() => {
    if (!foodSearch.trim()) return currentFoodOptions.slice(0, 15);
    const q = foodSearch.toLowerCase().trim();
    return currentFoodOptions.filter(f => f.toLowerCase().includes(q)).slice(0, 15);
  }, [foodSearch, currentFoodOptions]);

  const addFoodAllergy = (foodName) => {
    const trimmed = foodName.trim();
    if (trimmed) {
      if (!foodAllergies.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
        setFoodAllergies(prev => [...prev, trimmed]);
      }
      // Add to global food list dynamically if new
      addCustomFoodAllergyItem(trimmed);
      setFoodList(getFoodAllergiesList());
    }
    setFoodSearch('');
    setShowFoodDropdown(false);
  };

  const removeFoodAllergy = (foodName) => {
    setFoodAllergies(prev => prev.filter(f => f !== foodName));
  };

  // Past Medical History Handlers (Auto-sorted by frequency)
  const sortedMedicalOptions = useMemo(() => {
    const freq = getMedicalHistoryFrequency();
    const allSet = new Set([...DEFAULT_PAST_MEDICAL_HISTORY, ...selectedMedicalHistory]);
    return Array.from(allSet).sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
  }, [selectedMedicalHistory]);

  const toggleMedicalHistoryItem = (item) => {
    if (selectedMedicalHistory.includes(item)) {
      setSelectedMedicalHistory(prev => prev.filter(i => i !== item));
    } else {
      setSelectedMedicalHistory(prev => [...prev, item]);
    }
  };

  const handleAddCustomMedical = (e) => {
    e.preventDefault();
    if (customMedicalInput.trim()) {
      const val = customMedicalInput.trim();
      if (!selectedMedicalHistory.includes(val)) {
        setSelectedMedicalHistory(prev => [...prev, val]);
      }
      setCustomMedicalInput('');
    }
  };

  // Past Surgical History Handlers (Auto-sorted by frequency)
  const sortedSurgicalOptions = useMemo(() => {
    const freq = getSurgicalHistoryFrequency();
    const allSet = new Set([...DEFAULT_PAST_SURGICAL_HISTORY, ...selectedSurgicalHistory]);
    return Array.from(allSet).sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
  }, [selectedSurgicalHistory]);

  const toggleSurgicalHistoryItem = (item) => {
    if (selectedSurgicalHistory.includes(item)) {
      setSelectedSurgicalHistory(prev => prev.filter(i => i !== item));
    } else {
      setSelectedSurgicalHistory(prev => [...prev, item]);
    }
  };

  const handleAddCustomSurgical = (e) => {
    e.preventDefault();
    if (customSurgicalInput.trim()) {
      const val = customSurgicalInput.trim();
      if (!selectedSurgicalHistory.includes(val)) {
        setSelectedSurgicalHistory(prev => [...prev, val]);
      }
      setCustomSurgicalInput('');
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Increment frequencies for chosen history items
    incrementMedicalHistoryFrequency(selectedMedicalHistory);
    incrementSurgicalHistoryFrequency(selectedSurgicalHistory);

    // Save any new custom foods & addresses
    foodAllergies.forEach(f => addCustomFoodAllergyItem(f));
    if (address && address.trim()) {
      addCustomAddressItem(address.trim());
    }

    // Combine Allergies
    const combinedAllergies = [
      ...drugAllergies.map(d => `${d} (Drug)`),
      ...foodAllergies.map(f => `${f} (Food)`),
      ...(hasPlasterAllergy ? ['Plaster Allergy'] : [])
    ];

    const formatted = {
      id: patientId,
      prefix,
      full_name: fullName,
      date_of_birth: dateOfBirth,
      gender,
      phone,
      phone_owner_name: phoneOwnerName,
      address,
      occupation,
      allergies: combinedAllergies,
      past_medical_history: selectedMedicalHistory,
      past_surgical_history: selectedSurgicalHistory,
      comments,
      photo_url: photoUrl,
      is_dob_estimated: isDobEstimated,
      estimated_age: estimatedAge
    };

    if (onSave) onSave(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.patientFormGrid}>
      {/* 1. Patient Photograph Block */}
      <div className={styles.colSpan12} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem', 
        padding: '1rem 1.25rem', 
        background: 'var(--secondary-bg)', 
        borderRadius: '12px', 
        border: '1px solid var(--card-border)',
        marginBottom: '0.25rem' 
      }}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt="Patient Photograph" 
            onClick={() => setZoomedPhoto && setZoomedPhoto(photoUrl)}
            title="Click to zoom photo"
            style={{ 
              width: '65px', 
              height: '65px', 
              borderRadius: '10px', 
              objectFit: 'cover', 
              border: '2px solid var(--primary)', 
              cursor: 'zoom-in' 
            }}
            className={styles.clickablePhoto}
          />
        ) : (
          <div style={{ width: '65px', height: '65px', borderRadius: '10px', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Camera size={28} />
          </div>
        )}
        <div style={{ flexGrow: 1 }}>
          <label className={styles.formLabel} style={{ marginBottom: '0.25rem', fontWeight: '700' }}>
            Patient Photograph
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            style={{ fontSize: '0.8rem', background: 'transparent', border: 'none', padding: 0, color: 'var(--foreground)' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', margin: '0.25rem 0 0 0' }}>
            Upload photo (JPEG/PNG, max 1MB).
          </p>
        </div>
      </div>

      {/* Row 1: Prefix, Name, Gender */}
      <div className={`${styles.formGroup} ${styles.colSpan2}`}>
        <label className={styles.formLabel}>Prefix</label>
        <select 
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          style={{ height: '42px' }}
        >
          <option value="Mr.">Mr.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Miss">Miss</option>
          <option value="Dr.">Dr.</option>
          <option value="Rev.">Rev.</option>
        </select>
      </div>

      <div className={`${styles.formGroup} ${styles.colSpan7}`}>
        <label className={styles.formLabel}>Full Name *</label>
        <input 
          type="text" 
          placeholder="e.g. Sunil Perera"
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="off"
          required
          style={{ height: '42px' }}
        />
      </div>

      <div className={`${styles.formGroup} ${styles.colSpan3}`}>
        <label className={styles.formLabel}>Gender</label>
        <select 
          value={gender} 
          onChange={(e) => setGender(e.target.value)}
          style={{ height: '42px' }}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Row 2: Date of Birth / Age, Occupation */}
      <div className={`${styles.formGroup} ${styles.colSpan6}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className={styles.formLabel}>
            Date of Birth {dateOfBirth ? '*' : ''}
          </label>
          <span style={{ fontSize: '0.72rem', color: dateOfBirth ? 'var(--primary)' : ((isAgeEditable || isDobEstimated) ? 'var(--primary)' : 'var(--secondary)'), fontWeight: (isAgeEditable || isDobEstimated) ? 'bold' : 'normal' }}>
            {dateOfBirth ? `Age: ${getAge ? getAge(dateOfBirth) : ''}` : ((isAgeEditable || isDobEstimated) ? '⚡ Direct Age Mode' : '💡 Double-click Age box to edit (when DOB empty)')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="date" 
            value={dateOfBirth} 
            onChange={(e) => {
              const val = e.target.value;
              setDateOfBirth(val);
              if (val) {
                setIsDobEstimated(false);
                setIsAgeEditable(false);
                setEstimatedAge('');
              }
            }}
            style={{ 
              flex: 2, 
              height: '42px'
            }}
          />

          <input 
            type="number" 
            readOnly={Boolean(dateOfBirth) || (!isAgeEditable && !isDobEstimated)}
            placeholder={isAgeEditable || isDobEstimated ? "Age in yrs *" : "Age auto"}
            value={dateOfBirth ? (getAge ? getAge(dateOfBirth) : estimatedAge) : estimatedAge}
            min="0"
            max="120"
            onDoubleClick={() => {
              if (!dateOfBirth) {
                setIsAgeEditable(true);
                setIsDobEstimated(true);
              }
            }}
            onChange={(e) => {
              if (!dateOfBirth) {
                setEstimatedAge(e.target.value);
                setIsDobEstimated(true);
              }
            }}
            title={dateOfBirth ? `Calculated from DOB (${getAge ? getAge(dateOfBirth) : ''})` : "Double click when DOB is empty to type age directly"}
            style={{ 
              flex: 1, 
              height: '42px', 
              textAlign: 'center', 
              fontWeight: 'bold',
              background: dateOfBirth ? 'var(--muted-bg)' : ((isAgeEditable || isDobEstimated) ? 'var(--card-bg)' : 'var(--muted-bg)'),
              border: (isAgeEditable || isDobEstimated) && !dateOfBirth ? '2px solid var(--primary)' : '1px solid var(--card-border)',
              cursor: dateOfBirth ? 'not-allowed' : ((isAgeEditable || isDobEstimated) ? 'text' : 'pointer')
            }}
          />
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.colSpan6}`}>
        <label className={styles.formLabel}>Occupation (Job)</label>
        <input 
          type="text" 
          placeholder="e.g. Teacher, Farmer, Engineer"
          value={occupation} 
          onChange={(e) => setOccupation(e.target.value)}
          list="suggested-occupations-list"
          style={{ height: '42px' }}
        />
        <datalist id="suggested-occupations-list">
          {getUniqueSuggestions('occupation').map(o => <option key={o} value={o} />)}
        </datalist>
      </div>

      {/* Row 3: Address / City / Village, Phone Number, Relationship */}
      <div className={`${styles.formGroup} ${styles.colSpan6}`} style={{ position: 'relative' }}>
        <label className={styles.formLabel}>Address / City / Village</label>
        <input 
          type="text" 
          placeholder="Type Home Address / City / Village..."
          value={address} 
          onChange={(e) => {
            setAddress(e.target.value);
            setShowAddressDropdown(true);
          }}
          onFocus={() => {
            if (address.trim()) setShowAddressDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowAddressDropdown(false), 200);
            if (address && address.trim()) {
              addCustomAddressItem(address.trim());
              setAddressList(getAddressesList());
            }
          }}
          style={{ height: '42px', width: '100%' }}
        />

        {showAddressDropdown && filteredAddresses.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            zIndex: 30,
            maxHeight: '180px',
            overflowY: 'auto',
            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
            marginTop: '4px'
          }}>
            {filteredAddresses.map((addrItem, idx) => (
              <div 
                key={idx}
                onMouseDown={() => {
                  setAddress(addrItem);
                  setShowAddressDropdown(false);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--card-border)',
                  color: 'var(--foreground)'
                }}
                className={styles.suggestionItem}
              >
                📍 {addrItem}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.colSpan3}`}>
        <label className={styles.formLabel}>Phone Number *</label>
        <input 
          type="text" 
          placeholder="e.g. 0771234567 *"
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="off"
          required
          style={{ height: '42px' }}
        />
      </div>

      <div className={`${styles.formGroup} ${styles.colSpan3}`}>
        <label className={styles.formLabel}>Relationship</label>
        <input 
          type="text" 
          placeholder="Self / Parent / Mother..."
          value={phoneOwnerName} 
          onChange={(e) => setPhoneOwnerName(e.target.value)}
          list="suggested-relationships-list"
          style={{ height: '42px' }}
        />
        <datalist id="suggested-relationships-list">
          {DEFAULT_RELATIONSHIPS.map((rel, idx) => (
            <option key={idx} value={rel} />
          ))}
        </datalist>
      </div>

      {/* Row 4: Allergies Section (3 Partitions: Drug, Food, Plaster) */}
      <div className={styles.colSpan12} style={{ 
        border: '1px solid var(--card-border)', 
        borderRadius: '12px', 
        padding: '1.25rem', 
        background: 'var(--card-bg)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Allergies ( drug / food / plaster )</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          
          {/* Partition 1: Drug Allergies (Generic Drug Names Filter) */}
          <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
              💊 Drug Allergies (Generic Names)
            </label>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Type generic drug name..."
                value={drugSearch}
                onChange={(e) => {
                  setDrugSearch(e.target.value);
                  setShowDrugDropdown(true);
                }}
                onFocus={() => setShowDrugDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (drugSearch.trim()) addDrugAllergy(drugSearch);
                  }
                }}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', width: '100%' }}
              />

              {showDrugDropdown && filteredGenericDrugs.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  zIndex: 20,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-md)',
                  marginTop: '4px'
                }}>
                  {filteredGenericDrugs.map((gDrug, idx) => (
                    <div 
                      key={idx}
                      onClick={() => addDrugAllergy(gDrug)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--card-border)',
                        color: 'var(--foreground)'
                      }}
                      className={styles.suggestionItem}
                    >
                      {gDrug}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Drug Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {drugAllergies.map((drug, idx) => (
                <span 
                  key={idx} 
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {drug}
                  <X 
                    size={12} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => removeDrugAllergy(drug)}
                  />
                </span>
              ))}
              {drugAllergies.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic' }}>No drug allergies added</span>
              )}
            </div>
          </div>

          {/* Partition 2: Food Allergies (Type, Filter, Auto-add new foods) */}
          <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
              🥑 Food Allergies
            </label>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Type food name (e.g. Pineapple, Prawns)..."
                value={foodSearch}
                onChange={(e) => {
                  setFoodSearch(e.target.value);
                  setShowFoodDropdown(true);
                }}
                onFocus={() => setShowFoodDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (foodSearch.trim()) addFoodAllergy(foodSearch);
                  }
                }}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', width: '100%' }}
              />

              {showFoodDropdown && filteredFoodOptions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '6px',
                  zIndex: 20,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-md)',
                  marginTop: '4px'
                }}>
                  {filteredFoodOptions.map((food, idx) => (
                    <div 
                      key={idx}
                      onClick={() => addFoodAllergy(food)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--card-border)',
                        color: 'var(--foreground)'
                      }}
                      className={styles.suggestionItem}
                    >
                      {food}
                    </div>
                  ))}
                  {foodSearch.trim() && !filteredFoodOptions.some(f => f.toLowerCase() === foodSearch.trim().toLowerCase()) && (
                    <div
                      onClick={() => addFoodAllergy(foodSearch)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontWeight: 'bold'
                      }}
                    >
                      + Add "{foodSearch.trim()}" (New Food Item)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Food Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
              {foodAllergies.map((food, idx) => (
                <span 
                  key={idx} 
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {food}
                  <X 
                    size={12} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => removeFoodAllergy(food)}
                  />
                </span>
              ))}
              {foodAllergies.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontStyle: 'italic' }}>No food allergies added</span>
              )}
            </div>
          </div>

          {/* Partition 3: Plaster Allergy (Tick Box) */}
          <div style={{ background: 'var(--muted-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.75rem' }}>
              🩹 Plaster Allergy
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer', 
              padding: '0.6rem 0.8rem', 
              borderRadius: '8px', 
              background: hasPlasterAllergy ? 'rgba(239, 68, 68, 0.15)' : 'var(--card-bg)',
              border: '1px solid',
              borderColor: hasPlasterAllergy ? '#ef4444' : 'var(--card-border)',
              transition: 'all 0.2s ease'
            }}>
              <input 
                type="checkbox"
                checked={hasPlasterAllergy}
                onChange={(e) => setHasPlasterAllergy(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: hasPlasterAllergy ? '#f87171' : 'var(--foreground)' }}>
                Plaster Allergy Present (ඇලවුම් ප්ලාස්ටර් ඇලජි)
              </span>
            </label>
          </div>

        </div>
      </div>

      {/* Row 5: Past Medical History (Expandable Buttons + Auto-Sorting Frequency) */}
      <div className={styles.colSpan12} style={{ 
        border: '1px solid var(--card-border)', 
        borderRadius: '12px', 
        padding: '1.25rem', 
        background: 'var(--card-bg)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label className={styles.formLabel} style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
            🏥 Past Medical History
          </label>

          <button 
            type="button"
            onClick={() => setShowMedicalExpand(prev => !prev)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontWeight: '600'
            }}
          >
            <span>{showMedicalExpand ? 'Collapse Quick List' : 'Expand Quick List'}</span>
            {showMedicalExpand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Selected Medical History Chips */}
        {selectedMedicalHistory.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {selectedMedicalHistory.map((item, idx) => (
              <span 
                key={idx} 
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '14px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {item}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => toggleMedicalHistoryItem(item)}
                />
              </span>
            ))}
          </div>
        )}

        {/* Expandable Quick Select Buttons (Auto-sorted by usage frequency) */}
        {showMedicalExpand && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.4rem', 
            padding: '0.75rem', 
            background: 'var(--muted-bg)', 
            borderRadius: '8px', 
            marginBottom: '0.75rem',
            border: '1px solid var(--card-border)' 
          }}>
            {sortedMedicalOptions.map((option, idx) => {
              const isSelected = selectedMedicalHistory.includes(option);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleMedicalHistoryItem(option)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'var(--card-bg)',
                    color: isSelected ? '#10b981' : 'var(--foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? '✓ ' : '+ '}{option}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Medical History Input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text"
            placeholder="Type custom medical condition & press Add..."
            value={customMedicalInput}
            onChange={(e) => setCustomMedicalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomMedical(e);
            }}
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button 
            type="button" 
            onClick={handleAddCustomMedical}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Row 6: Past Surgical History (Expandable Buttons + Auto-Sorting Frequency) */}
      <div className={styles.colSpan12} style={{ 
        border: '1px solid var(--card-border)', 
        borderRadius: '12px', 
        padding: '1.25rem', 
        background: 'var(--card-bg)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label className={styles.formLabel} style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
            🔪 Past Surgical History
          </label>

          <button 
            type="button"
            onClick={() => setShowSurgicalExpand(prev => !prev)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary)', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontWeight: '600'
            }}
          >
            <span>{showSurgicalExpand ? 'Collapse Quick List' : 'Expand Quick List'}</span>
            {showSurgicalExpand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Selected Surgical History Chips */}
        {selectedSurgicalHistory.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {selectedSurgicalHistory.map((item, idx) => (
              <span 
                key={idx} 
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '14px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {item}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => toggleSurgicalHistoryItem(item)}
                />
              </span>
            ))}
          </div>
        )}

        {/* Expandable Quick Select Buttons (Auto-sorted by usage frequency) */}
        {showSurgicalExpand && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.4rem', 
            padding: '0.75rem', 
            background: 'var(--muted-bg)', 
            borderRadius: '8px', 
            marginBottom: '0.75rem',
            border: '1px solid var(--card-border)' 
          }}>
            {sortedSurgicalOptions.map((option, idx) => {
              const isSelected = selectedSurgicalHistory.includes(option);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSurgicalHistoryItem(option)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'var(--card-bg)',
                    color: isSelected ? '#10b981' : 'var(--foreground)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? '✓ ' : '+ '}{option}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Surgical History Input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text"
            placeholder="Type custom surgical procedure & press Add..."
            value={customSurgicalInput}
            onChange={(e) => setCustomSurgicalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomSurgical(e);
            }}
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button 
            type="button" 
            onClick={handleAddCustomSurgical}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Row 7: Comments / Extra Notes */}
      <div className={`${styles.formGroup} ${styles.colSpan12}`}>
        <label className={styles.formLabel}>Comments / Extra Notes</label>
        <textarea 
          rows="2" 
          placeholder="Any additional information..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          style={{ width: '100%' }}
        ></textarea>
      </div>

      {/* Row 8: Action Buttons (Cancel / Reset & Save Profile Changes) */}
      <div className={styles.colSpan12} style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          className="btn-secondary" 
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
        >
          Cancel / Reset
        </button>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ flex: 2, padding: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold' }}
        >
          <UserCheck size={18} />
          <span>{patientId ? 'Save Profile Changes' : 'Register New Patient'}</span>
        </button>
      </div>
    </form>
  );
}
