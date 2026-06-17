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
  Plus, 
  AlertTriangle,
  FileText,
  Trash2,
  Edit,
  Key,
  ShieldAlert
} from 'lucide-react';
import styles from '@/styles/dashboard.module.css';

export default function ManagerDashboard() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Tab control synced with sidebar
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

  // User management forms
  const [newUserForm, setNewUserForm] = useState({
    username: '', full_name: '', role: 'assistant', password: ''
  });
  const [editingUser, setEditingUser] = useState(null); // null or user object

  // Drug / Lab forms
  const [newDrugForm, setNewDrugForm] = useState({
    brand_name: '', generic_name: '', form: 'tablet', route: 'oral', manufacturer: '', strength: '', unit_price: '', selling_price: ''
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
      const u = await db.getUsers();
      
      setPatients(p || []);
      setVisits(v || []);
      setDrugs(d || []);
      setLabTests(lt || []);
      setLabRequests(lr || []);
      setUsersList(u || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setNotif({ type, text });
    setTimeout(() => setNotif({ type: '', text: '' }), 4000);
  };

  // User CRUD Operations
  const handleAddUser = async (e) => {
    e.preventDefault();
    const { username, full_name, role, password } = newUserForm;
    if (!username || !full_name || !password) {
      showNotification('error', 'Please enter username, full name, and password.');
      return;
    }

    try {
      await db.addUser({ username, full_name, role, password });
      showNotification('success', 'New user registered successfully.');
      setNewUserForm({ username: '', full_name: '', role: 'assistant', password: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to add user: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const { id, username, full_name, role, password } = editingUser;
    if (!full_name) {
      showNotification('error', 'Please enter full name.');
      return;
    }

    try {
      const updates = { full_name, role };
      if (password) updates.password = password; // Only update password if typed
      await db.updateUser(id, updates);
      showNotification('success', `User '${username}' updated successfully.`);
      setEditingUser(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, uName) => {
    if (!confirm(`Are you sure you want to delete user '${uName}'?`)) return;
    try {
      await db.deleteUser(userId);
      showNotification('success', `User '${uName}' deleted successfully.`);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to delete user: ' + err.message);
    }
  };

  // Drug and Lab operations
  const handleCreateDrug = async (e) => {
    e.preventDefault();
    const { brand_name, generic_name, form, route, manufacturer, strength, unit_price, selling_price } = newDrugForm;
    if (!brand_name || !generic_name || !strength || !unit_price || !selling_price) {
      showNotification('error', 'Please fill in all details.');
      return;
    }

    try {
      await db.addDrug({
        brand_name,
        generic_name,
        form,
        route: route || 'oral',
        manufacturer: manufacturer || '',
        strength,
        unit_price: parseFloat(unit_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        reorder_level: 50
      });

      showNotification('success', 'New drug added to the catalog successfully.');
      setNewDrugForm({ brand_name: '', generic_name: '', form: 'tablet', route: 'oral', manufacturer: '', strength: '', unit_price: '', selling_price: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed: ' + err.message);
    }
  };

  const handleCreateLab = async (e) => {
    e.preventDefault();
    const { test_name, reference_range, unit, cost } = newLabForm;
    if (!test_name || !cost) {
      showNotification('error', 'Please enter test name and cost.');
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

      showNotification('success', 'New lab test added to settings successfully.');
      setNewLabForm({ test_name: '', reference_range: '', unit: '', cost: '' });
      loadData();
    } catch (err) {
      showNotification('error', 'Failed: ' + err.message);
    }
  };

  const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('isDemo') === 'true';
  };

  // Financial calculations
  const calculateTotalRevenue = () => {
    const completedLabsFee = labRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.test?.cost || 0), 0);
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
    const completedLabsProfit = labRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.test?.cost || 0) * 0.3, 0);
    return profit + completedLabsProfit;
  };

  const lowStockCount = drugs.filter(d => d.total_stock <= d.reorder_level).length;

  return (
    <div>

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
                <span className={styles.statValue}>LKR {calculateTotalRevenue().toFixed(2)}</span>
                <span className={styles.statLabel}>Gross Revenue Estimate (Revenue)</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #34d399' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}><TrendingUp size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>LKR {calculateTotalProfit().toFixed(2)}</span>
                <span className={styles.statLabel}>Net Profit Estimate (Net Margin)</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #ef4444' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}><AlertTriangle size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{lowStockCount}</span>
                <span className={styles.statLabel}>Low Stock Drug Types</span>
              </div>
            </div>

            <div className={styles.statCard} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}><FileText size={24} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{labRequests.filter(r => r.status === 'completed').length}</span>
                <span className={styles.statLabel}>Completed Lab Reports</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="glass-card animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Patient Visits History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Total Registered Patients:</span>
                  <strong>{patients.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Today's Patient Visits:</span>
                  <strong>{visits.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Completed Consultations:</span>
                  <strong>{visits.filter(v => v.status === 'completed').length}</strong>
                </div>
              </div>
            </div>

            <div className="glass-card animate-fade-in">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Low Stock Warnings</h3>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {drugs.filter(d => d.total_stock <= d.reorder_level).map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                    <span><strong>{d.brand_name} ({d.generic_name})</strong></span>
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Stock Left: {d.total_stock} (Reorder: {d.reorder_level})</span>
                  </div>
                ))}
                {lowStockCount === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>All drugs are sufficiently stocked.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User and Staff management */}
      {activeTab === 'staff' && (
        <div className={styles.workGrid}>
          {/* User list table */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.25rem' }}>Active Accounts & Roster</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--secondary-bg)', borderBottom: '2px solid var(--card-border)' }}>
                    <th style={{ padding: '0.75rem' }}>Full Name</th>
                    <th style={{ padding: '0.75rem' }}>Username</th>
                    <th style={{ padding: '0.75rem' }}>Role</th>
                    <th style={{ padding: '0.75rem' }}>Password</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{u.full_name}</td>
                      <td style={{ padding: '0.75rem' }}><code>{u.username}</code></td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-primary">{u.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                          {u.password ? '••••••••' : 'N/A (OAuth)'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setEditingUser({ ...u, password: '' })}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title="Edit User/Change Password"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            title="Delete Account"
                            disabled={u.username === 'admin'} // Protect primary admin account
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Add / Edit box */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            {editingUser ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3>Edit User Account</h3>
                  <button 
                    onClick={() => setEditingUser(null)}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleUpdateUser} className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Username (Read-only)</label>
                    <input 
                      type="text" 
                      value={editingUser.username}
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input 
                      type="text" 
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>System Role</label>
                    <select 
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="assistant">Assistant (OPD)</option>
                      <option value="doctor">Doctor</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="mlt">MLT Lab</option>
                      <option value="manager">Manager / Admin</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>New Password (leave blank to keep current)</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={editingUser.password}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    />
                  </div>

                  <div className={styles.formFull} style={{ marginTop: '0.75rem' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      <span>Update Account Details</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '1.25rem' }}>Create New Account</h3>
                <form onSubmit={handleAddUser} className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Username *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. sunilp"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Sunil Perera"
                      value={newUserForm.full_name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>System Role</label>
                    <select 
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      <option value="assistant">Assistant (OPD)</option>
                      <option value="doctor">Doctor</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="mlt">MLT Lab</option>
                      <option value="manager">Manager / Admin</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>Password *</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    />
                  </div>

                  <div className={styles.formFull} style={{ marginTop: '0.75rem' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      <Plus size={16} />
                      <span>Register Account</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Drug Catalog Pricing Manager */}
      {activeTab === 'drugs' && (
        <div className={styles.workGrid}>
          {/* Create Drug catalog form */}
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '1.25rem' }}>Add New Drug to Catalog</h3>
            <form onSubmit={handleCreateDrug} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Brand Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Panadol"
                  value={newDrugForm.brand_name}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, brand_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Generic Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Paracetamol"
                  value={newDrugForm.generic_name}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, generic_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manufacturer Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. GSK Ceylon PLC"
                  value={newDrugForm.manufacturer}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, manufacturer: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Form / Type</label>
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
                <label className={styles.formLabel}>Route of Administration</label>
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
                <label className={styles.formLabel}>Strength *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 500mg, 120mg/5ml"
                  value={newDrugForm.strength}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, strength: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Default Unit Cost (Purchase) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 3.50"
                  value={newDrugForm.unit_price}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, unit_price: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Default Selling Price *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 5.00"
                  value={newDrugForm.selling_price}
                  onChange={(e) => setNewDrugForm({ ...newDrugForm, selling_price: e.target.value })}
                />
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Register Drug</span>
                </button>
              </div>
            </form>
          </div>

          {/* Pricing lists catalog */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Drug Price List</h3>
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {drugs.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{d.brand_name}</strong> - <span style={{ color: 'var(--secondary)' }}>{d.generic_name}</span>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--secondary)' }}>
                      Mfr: <strong>{d.manufacturer || 'N/A'}</strong> | Form: <span style={{ textTransform: 'capitalize' }}>{d.form}</span> | Route: <span style={{ textTransform: 'capitalize' }}>{d.route || 'oral'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>Default Cost: LKR {parseFloat(d.unit_price).toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: 'var(--primary)' }}>LKR {parseFloat(d.selling_price).toFixed(2)}</strong>
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
            <h3 style={{ marginBottom: '1.25rem' }}>Add New Lab Test</h3>
            <form onSubmit={handleCreateLab} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Test Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fasting Blood Sugar (FBS)"
                  value={newLabForm.test_name}
                  onChange={(e) => setNewLabForm({ ...newLabForm, test_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Reference Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. 70 - 100"
                  value={newLabForm.reference_range}
                  onChange={(e) => setNewLabForm({ ...newLabForm, reference_range: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Measurement Unit</label>
                <input 
                  type="text" 
                  placeholder="e.g. mg/dL, %"
                  value={newLabForm.unit}
                  onChange={(e) => setNewLabForm({ ...newLabForm, unit: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Test Fee Cost *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 450.00"
                  value={newLabForm.cost}
                  onChange={(e) => setNewLabForm({ ...newLabForm, cost: e.target.value })}
                />
              </div>

              <div className={styles.formFull} style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Register Lab Test</span>
                </button>
              </div>
            </form>
          </div>

          {/* Lab tests price list catalog */}
          <div className="glass-card animate-fade-in" style={{ height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Lab Test Price List</h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {labTests.map(lt => (
                <div key={lt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)', fontSize: '0.85rem' }}>
                  <div>
                    <strong>{lt.test_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Range: {lt.reference_range} {lt.unit}</div>
                  </div>
                  <strong style={{ color: 'var(--primary)' }}>LKR {parseFloat(lt.cost).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
