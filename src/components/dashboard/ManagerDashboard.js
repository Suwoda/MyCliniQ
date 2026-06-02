'use client';

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { 
  Users, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  UserCheck, 
  Plus, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function ManagerDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, staff, drugs, lab_setup

  // Roster state
  const [staff, setStaff] = useState([
    { id: 's1', full_name: 'Dr. Sunil Perera', role: 'doctor', phone: '0771234567', is_active: true },
    { id: 's2', full_name: 'Pharmacist Nimali', role: 'pharmacist', phone: '0719876543', is_active: true },
    { id: 's3', full_name: 'MLT Kamalanath', role: 'mlt', phone: '0721122334', is_active: true },
    { id: 's4', full_name: 'Assistant Ruwan', role: 'assistant', phone: '0765566778', is_active: true },
    { id: 's5', full_name: 'Dr. A.P.K Sanjeeva', role: 'manager', phone: '0779988776', is_active: true }
  ]);

  // Pricing inputs
  const [newDrugForm, setNewDrugForm] = useState({
    brand_name: '', generic_name: '', form: 'tablet', strength: '', unit_price: '', selling_price: ''
  });

  const [newLabForm, setNewLabForm] = useState({
    test_name: '', reference_range: '', unit: '', cost: ''
  });

  const [notif, setNotif] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const p = await db.getPatients();
      const v = await db.getVisits();
      const d = await db.getDrugs();
      const lt = await db.getLabTests();
      const lr = await db.getLabRequests();
      
      setPatients(p || []);
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(lt || []);
      setLabRequests(lr || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

  const handleCreateDrug = async (e) => {
    e.preventDefault();
    const { brand_name, generic_name, form, strength, unit_price, selling_price } = newDrugForm;
    if (!brand_name || !generic_name || !strength || !unit_price || !selling_price) {
      showNotification('error', 'කරුණාකර සියලු විස්තර පුරවන්න.');
      return;
    }

    try {
      if (isDemoMode()) {
        const currentDrugs = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
        const newD = {
          id: 'd_' + Math.random().toString(36).substr(2, 9),
          brand_name, generic_name, form, strength,
          total_stock: 0, reorder_level: 50,
          unit_price: parseFloat(unit_price),
          selling_price: parseFloat(selling_price),
          created_at: new Date().toISOString()
        };
        currentDrugs.push(newD);
        localStorage.setItem('mycliniq_drugs', JSON.stringify(currentDrugs));
      } else {
        await supabase.from('drugs').insert({
          brand_name, generic_name, form, strength,
          unit_price: parseFloat(unit_price),
          selling_price: parseFloat(selling_price)
        });
      }

      showNotification('success', 'නව ඖෂධය සාර්ථකව නාමාවලියට එක් කරන ලදී.');
      setNewDrugForm({ brand_name: '', generic_name: '', form: 'tablet', strength: '', unit_price: '', selling_price: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'අසාර්ථකයි: ' + err.message);
    }
  };

  const handleCreateLab = async (e) => {
    e.preventDefault();
    const { test_name, reference_range, unit, cost } = newLabForm;
    if (!test_name || !cost) {
      showNotification('error', 'කරුණාකර පරීක්ෂණයේ නම සහ ගාස්තුව ඇතුළත් කරන්න.');
      return;
    }

    try {
      if (isDemoMode()) {
        const currentTests = JSON.parse(localStorage.getItem('mycliniq_lab_tests')) || [];
        const newT = {
          id: 'lt_' + Math.random().toString(36).substr(2, 9),
          test_name, reference_range, unit,
          cost: parseFloat(cost),
          created_at: new Date().toISOString()
        };
        currentTests.push(newT);
        localStorage.setItem('mycliniq_lab_tests', JSON.stringify(currentTests));
      } else {
        await supabase.from('lab_tests').insert({
          test_name, reference_range, unit,
          cost: parseFloat(cost)
        });
      }

      showNotification('success', 'නව ලැබ් පරීක්ෂණය සාර්ථකව සැකසීම් වලට එක් කරන ලදී.');
      setNewLabForm({ test_name: '', reference_range: '', unit: '', cost: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'අසාර්ථකයි: ' + err.message);
    }
  };

  const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('isDemo') === 'true';
  };

  // Financial Estimation calculations
  const calculateTotalRevenue = () => {
    // Estimations based on lab test completed fees + drug selling costs (simulation)
    const completedLabsFee = labRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.test?.cost || 0), 0);
    
    // Prescriptions completed estimation:
    let drugsDispenseFee = 0;
    if (typeof window !== 'undefined') {
      const rxItems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugsList = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      rxItems.forEach(item => {
        const drug = drugsList.find(d => d.id === item.drug_id);
        if (drug && item.dispensed_quantity > 0) {
          drugsDispenseFee += (item.dispensed_quantity * parseFloat(drug.selling_price));
        }
      });
    }

    return completedLabsFee + drugsDispenseFee;
  };

  const calculateTotalProfit = () => {
    // Profit margin estimation (selling_price - unit_price)
    let profit = 0;
    if (typeof window !== 'undefined') {
      const rxItems = JSON.parse(localStorage.getItem('mycliniq_prescription_items')) || [];
      const drugsList = JSON.parse(localStorage.getItem('mycliniq_drugs')) || [];
      rxItems.forEach(item => {
        const drug = drugsList.find(d => d.id === item.drug_id);
        if (drug && item.dispensed_quantity > 0) {
          const margin = parseFloat(drug.selling_price) - parseFloat(drug.unit_price);
          profit += (item.dispensed_quantity * margin);
        }
      });
    }
    // Assume 30% margin on lab costs for simulation
    const completedLabsProfit = labRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.test?.cost || 0) * 0.3, 0);

    return profit + completedLabsProfit;
  };

  const lowStockCount = drugs.filter(d => d.total_stock <= d.reorder_level).length;

  return (
    <div>
      {/* Tab select bar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`btn-secondary ${activeTab === 'overview' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          පද්ධති දළ විශ්ලේෂණය (Overview)
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`btn-secondary ${activeTab === 'staff' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          කාර්ය මණ්ඩලය (Staff)
        </button>
        <button 
          onClick={() => setActiveTab('drugs')}
          className={`btn-secondary ${activeTab === 'drugs' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          ඖෂධ මිල ගණන් පාලනය
        </button>
        <button 
          onClick={() => setActiveTab('lab_setup')}
          className={`btn-secondary ${activeTab === 'lab_setup' ? 'btn-primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          ලැබ් පරීක්ෂණ සැකසීම්
        </button>
      </div>

      {notif.text && (
        <div className={`${styles.alert} ${notif.type === 'success' ? styles.alertSuccess : styles.alertDanger}`}>
          <span>{notif.text}</span>
        </div>
      )}

      {/* Tab 1: Overview Dashboard */}
      {activeTab === 'overview' && (
        <div>
          {/* Revenue widgets */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className={styles.statIcon}><DollarSign size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>රු. {calculateTotalRevenue().toFixed(2)}</span>
                <span className={styles.statLabel}>දළ ආදායම් ඇස්තමේන්තුව (Revenue)</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #34d399' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}><TrendingUp size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>රු. {calculateTotalProfit().toFixed(2)}</span>
                <span className={styles.statLabel}>ශුද්ධ ලාභ ඇස්තමේන්තුව (Net Margin)</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #ef4444' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}><AlertTriangle size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{lowStockCount}</span>
                <span className={styles.statLabel}>තොග අවසන් ඖෂධ වර්ග ගණන</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}><FileText size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{labRequests.filter(r => r.status === 'completed').length}</span>
                <span className={styles.statLabel}>සූදානම් කළ ලැබ් රිපෝට් ගණන</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="glass-card animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>රෝගීන් පැමිණීමේ ඉතිහාසය</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>මුළු ලියාපදිංචි රෝගීන් සංඛ්‍යාව:</span>
                  <strong>{patients.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>අද දින පැමිණි රෝගීන් සංඛ්‍යාව:</span>
                  <strong>{visits.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>වෛද්‍යවරයා හමු වූ රෝගීන් සංඛ්‍යාව:</span>
                  <strong>{visits.filter(v => v.status === 'completed').length}</strong>
                </div>
              </div>
            </div>

            <div className="glass-card animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>හදිසි තොග ඇඟවීම් (Low Stock Warnings)</h3>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {drugs.filter(d => d.total_stock <= d.reorder_level).map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                    <span><strong>{d.brand_name} ({d.generic_name})</strong></span>
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>ඉතිරිව ඇත්තේ: {d.total_stock} (Reorder: {d.reorder_level})</span>
                  </div>
                ))}
                {lowStockCount === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>සියලුම ඖෂධ වර්ග සෑහෙන ප්‍රමාණයකින් තොග ඇත.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Staff directory */}
      {activeTab === 'staff' && (
        <div className="glass-card animate-fade-in">
          <h3 style={{ marginBottom: '1.25rem' }}>කාර්ය මණ්ඩල පැතිකඩ සටහන (Staff Roster)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-bg)', borderBottom: '2px solid var(--card-border)' }}>
                <th style={{ padding: '0.75rem' }}>නම (Staff Name)</th>
                <th style={{ padding: '0.75rem' }}>භූමිකාව (Role)</th>
                <th style={{ padding: '0.75rem' }}>දුරකථන අංකය</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>තත්ත්වය (Status)</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{s.full_name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-primary">{s.role}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{s.phone}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span className="badge badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--muted-bg)', border: '1px dashed var(--card-border)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            <strong>කාර්ය මණ්ඩල ගිණුම් සෑදීමේ උපදෙස්:</strong> Supabase Authentication පිටුවට ගොස් නව සේවකයින්ගේ Email ලිපිනයන් Invite කර, පසුව Profile Table එක හරහා අදාළ Role එක වෙනස් කරන්න. සවිස්තරාත්මක විස්තර සඳහා Supabase/README.md ගොනුව කියවන්න.
          </div>
        </div>
      )}

      {/* Tab 3: Drug Catalog Pricing Manager */}
      {activeTab === 'drugs' && (
        <div className={styles.workGrid}>
          {/* Create Drug catalog form */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.25rem' }}>නව ඖෂධයක් නාමාවලියට ඇතුළත් කිරීම</h3>
            <form onSubmit={handleCreateDrug} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>වෙළඳ නාමය (Brand Name) *</label>
                <input 
                  type="text" 
                  placeholder="උදා: Panadol"
                  value={newDrugForm.brand_name}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, brand_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>පොදු රසායනික නාමය (Generic Name) *</label>
                <input 
                  type="text" 
                  placeholder="උදා: Paracetamol"
                  value={newDrugForm.generic_name}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, generic_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ආකෘතිය (Form)</label>
                <select 
                  value={newDrugForm.form}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, form: e.target.value })}
                >
                  <option value="tablet">Tablet (පෙති)</option>
                  <option value="capsule">Capsule (කරල්)</option>
                  <option value="syrup">Syrup (පැණි දියර)</option>
                  <option value="injection">Injection (එන්නත්)</option>
                  <option value="cream">Cream (ආලේපන)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ශක්තිය (Strength) *</label>
                <input 
                  type="text" 
                  placeholder="උදා: 500mg, 120mg/5ml"
                  value={newDrugForm.strength}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, strength: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>මිලදී ගන්නා ඒකක මිල (Unit Cost) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="රුපියල් වලින්"
                  value={newDrugForm.unit_price}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, unit_price: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>විකුණන ඒකක මිල (Selling Price) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="රුපියල් වලින්"
                  value={newDrugForm.selling_price}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, selling_price: e.target.value })}
                />
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>ඖෂධය ලියාපදිංචි කරන්න</span>
                </button>
              </div>
            </form>
          </div>

          {/* Pricing lists catalog */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>පවත්නා මිල දර්ශකය</h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {drugs.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{d.brand_name}</strong> - <span style={{ color: 'var(--secondary)' }}>{d.generic_name}</span>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Cost: රු.{parseFloat(d.unit_price).toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: 'var(--primary)' }}>රු.{parseFloat(d.selling_price).toFixed(2)}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Stock: {d.total_stock}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Lab tests setup configurations */}
      {activeTab === 'lab_setup' && (
        <div className={styles.workGrid}>
          {/* Create new lab test */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.25rem' }}>නව ලැබ් පරීක්ෂණයක් එක් කිරීම</h3>
            <form onSubmit={handleCreateLab} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>පරීක්ෂණයේ නම (Test Name) *</label>
                <input 
                  type="text" 
                  placeholder="උදා: Fasting Blood Sugar (FBS)"
                  value={newLabForm.test_name}
                  onChange={(e) => setNewLabForm({ ...newLabForm, test_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>සාමාන්‍ය අගයන් (Reference Range)</label>
                <input 
                  type="text" 
                  placeholder="උදා: 70 - 100"
                  value={newLabForm.reference_range}
                  onChange={(e) => setNewLabForm({ ...newLabForm, reference_range: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>මිනුම් ඒකකය (Unit)</label>
                <input 
                  type="text" 
                  placeholder="උදා: mg/dL, %"
                  value={newLabForm.unit}
                  onChange={(e) => setNewLabForm({ ...newLabForm, unit: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>පරීක්ෂණ ගාස්තුව (Fee Cost) *</label>
                <input 
                  type="number" 
                  placeholder="රුපියල් වලින්"
                  value={newLabForm.cost}
                  onChange={(e) => setNewLabForm({ ...newLabForm, cost: e.target.value })}
                />
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>ලැබ් පරීක්ෂණය ලියාපදිංචි කරන්න</span>
                </button>
              </div>
            </form>
          </div>

          {/* Lab tests price list catalog */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>පවත්නා ලැබ් මිල දර්ශකය</h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {labTests.map(lt => (
                <div key={lt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{lt.test_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Range: {lt.reference_range} {lt.unit}</div>
                  </div>
                  <strong style={{ color: 'var(--primary)' }}>රු.{parseFloat(lt.cost).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
