import { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function AdminManagement() {
    const [activeTab, setActiveTab] = useState('list');
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [loading, setLoading] = useState(false);

    // Current logged-in admin (simulated)
    const currentAdmin = {
        id: '1',
        username: 'admin',
        fullName: 'System Administrator',
        email: 'admin@library.com',
        phone: '(123) 456-7890',
        role: 'SUPER_ADMIN',
    };

    // Form states
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
    });

    // Profile photo state
    const [profilePhoto, setProfilePhoto] = useState(null);          // File object
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(null); // data-URL
    const fileInputRef = useRef(null);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [newAdminForm, setNewAdminForm] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'ADMIN',
        permissions: [],
    });

    const availableRoles = [
        { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system access' },
        { value: 'ADMIN', label: 'Admin', description: 'Manage books, members, and reports' },
        { value: 'LIBRARIAN', label: 'Librarian', description: 'Handle borrowing and returns' },
    ];

    const availablePermissions = [
        { id: 'MANAGE_BOOKS', name: 'Manage Books', description: 'Add, edit, delete books' },
        { id: 'MANAGE_MEMBERS', name: 'Manage Members', description: 'Add, edit, delete members' },
        { id: 'MANAGE_BORROWS', name: 'Manage Borrowing', description: 'Approve/reject borrow requests' },
        { id: 'MANAGE_RESERVATIONS', name: 'Manage Reservations', description: 'Handle book reservations' },
        { id: 'MANAGE_FINES', name: 'Manage Fines', description: 'Process fines and payments' },
        { id: 'VIEW_REPORTS', name: 'View Reports', description: 'Access analytics and reports' },
        { id: 'MANAGE_SETTINGS', name: 'Manage Settings', description: 'Update system settings' },
        { id: 'MANAGE_ADMINS', name: 'Manage Admins', description: 'Add/remove admin users' },
    ];

    useEffect(() => {
        loadAdmins();
        setProfileForm({
            fullName: currentAdmin.fullName,
            email: currentAdmin.email,
            phone: currentAdmin.phone,
        });
    }, []);

    const loadAdmins = () => {
        setAdmins([
            {
                id: '1',
                username: 'admin',
                fullName: 'System Administrator',
                email: 'admin@library.com',
                role: 'SUPER_ADMIN',
                active: true,
                permissions: ['ALL'],
                lastLogin: '2024-01-15T10:30:00',
            },
            {
                id: '2',
                username: 'librarian1',
                fullName: 'John Librarian',
                email: 'john@library.com',
                role: 'LIBRARIAN',
                active: true,
                permissions: ['MANAGE_BORROWS', 'MANAGE_RESERVATIONS'],
                lastLogin: '2024-01-14T14:20:00',
            },
            {
                id: '3',
                username: 'admin2',
                fullName: 'Jane Admin',
                email: 'jane@library.com',
                role: 'ADMIN',
                active: false,
                permissions: ['MANAGE_BOOKS', 'MANAGE_MEMBERS', 'VIEW_REPORTS'],
                lastLogin: '2024-01-10T09:15:00',
            },
        ]);
    };

    // Step 1 – clicking "Update Profile" opens the hidden file input
    const handleProfilePhotoClick = () => {
        fileInputRef.current.click();
    };

    // Step 2 – file chosen → build preview; form submit becomes available
    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;           // user cancelled — do nothing
        const reader = new FileReader();
        reader.onload = (ev) => {
            setProfilePhoto(file);
            setProfilePhotoPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';         // allow re-selecting the same file
    };

    // Step 3 – actual form submit; only succeeds after a photo is selected
    const handleUpdateProfile = (e) => {
        e.preventDefault();
        if (!profilePhoto) {
            alert('Please select a profile photo first.');
            return;
        }
        // ── backend call would go here when API is ready ──
        alert('Profile updated successfully!');
        setProfilePhoto(null);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }
        alert('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleCreateAdmin = (e) => {
        e.preventDefault();
        alert('Admin created successfully!');
        setNewAdminForm({
            username: '', password: '', fullName: '', email: '', phone: '', role: 'ADMIN', permissions: [],
        });
        loadAdmins();
    };

    const handleTogglePermission = (permissionId) => {
        setNewAdminForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const handleToggleAdminStatus = (adminId) => {
        const admin = admins.find(a => a.id === adminId);
        if (confirm(`Are you sure you want to ${admin.active ? 'deactivate' : 'activate'} this admin?`)) {
            alert(`Admin ${admin.active ? 'deactivated' : 'activated'} successfully!`);
            loadAdmins();
        }
    };

    const handleDeleteAdmin = (adminId) => {
        if (confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            alert('Admin deleted successfully!');
            loadAdmins();
        }
    };

    /* ── Helper: Role badge color ── */
    const roleMeta = {
        SUPER_ADMIN: { emoji: '👑', bg: '#fef3c7', color: '#92400e', gradient: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
        ADMIN: { emoji: '👨‍💼', bg: '#dbeafe', color: '#1e40af', gradient: 'linear-gradient(135deg,#60a5fa,#3b82f6)' },
        LIBRARIAN: { emoji: '📖', bg: '#d1fae5', color: '#065f46', gradient: 'linear-gradient(135deg,#34d399,#10b981)' },
    };

    /* ═══════════════ TAB CONTENT RENDERERS ═══════════════ */

    const renderProfileTab = () => (
        <div className="adm-tab-content">
            <div className="adm-section-card">
                <h2 className="adm-section-title">My Profile</h2>

                {/* Hidden file input – accept images; capture="environment" opens camera on mobile */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleProfilePhotoChange}
                />

                {/* Profile header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                    padding: '1.25rem', background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
                    borderRadius: '14px', marginBottom: '1.75rem', flexWrap: 'wrap',
                }}>
                    {/* Avatar — shows photo preview if one is selected, otherwise emoji */}
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: profilePhotoPreview ? 'transparent' : roleMeta[currentAdmin.role].gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        flexShrink: 0, overflow: 'hidden',
                    }}>
                        {profilePhotoPreview
                            ? <img src={profilePhotoPreview} alt="preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : roleMeta[currentAdmin.role].emoji
                        }
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>{currentAdmin.fullName}</h3>
                        <p style={{ color: '#6b7280', margin: '2px 0', fontWeight: 600, fontSize: '0.85rem' }}>{currentAdmin.role.replace('_', ' ')}</p>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>@{currentAdmin.username}</p>

                        {/* Change Photo button opens the file picker / camera */}
                        <button
                            type="button"
                            className="adm-btn adm-btn-secondary"
                            style={{ marginTop: '0.6rem', fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                            onClick={handleProfilePhotoClick}
                        >
                            📷 {profilePhotoPreview ? 'Change Photo' : 'Add Photo'}
                        </button>
                        {profilePhotoPreview && (
                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                ✓ Photo selected — submit the form to update
                            </p>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateProfile} style={{ maxWidth: '540px' }}>
                    <div className="adm-form-group">
                        <label className="adm-label">Full Name</label>
                        <input className="adm-input" type="text" value={profileForm.fullName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
                    </div>
                    <div className="adm-form-group">
                        <label className="adm-label">Email</label>
                        <input className="adm-input" type="email" value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                    </div>
                    <div className="adm-form-group">
                        <label className="adm-label">Phone</label>
                        <input className="adm-input" type="tel" value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>

                    {/* Update Profile button — clicking it prompts for a photo then submits */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="adm-btn adm-btn-primary"
                            onClick={handleProfilePhotoClick}
                        >
                            📷 Update Profile
                        </button>
                        {profilePhotoPreview && (
                            <button type="submit" className="adm-btn adm-btn-success">
                                ✓ Save Changes
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );

    const renderPasswordTab = () => (
        <div className="adm-tab-content">
            <div className="adm-section-card">
                <h2 className="adm-section-title">Change Password</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '-0.75rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                    Ensure your password is strong and secure.
                </p>
                <form onSubmit={handleChangePassword} style={{ maxWidth: '540px' }}>
                    <div className="adm-form-group">
                        <label className="adm-label">Current Password</label>
                        <input className="adm-input" type="password" value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
                    </div>
                    <div className="adm-form-group">
                        <label className="adm-label">New Password</label>
                        <input className="adm-input" type="password" value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength="6" />
                        <small style={{ display: 'block', marginTop: '4px', color: '#9ca3af', fontSize: '0.78rem' }}>Minimum 6 characters</small>
                    </div>
                    <div className="adm-form-group">
                        <label className="adm-label">Confirm New Password</label>
                        <input className="adm-input" type="password" value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                    </div>
                    <button type="submit" className="adm-btn adm-btn-primary">Change Password</button>
                </form>
            </div>
        </div>
    );

    const renderAdminListTab = () => (
        <div className="adm-tab-content">
            <div className="adm-section-card">
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                    <h2 className="adm-section-title" style={{ marginBottom: 0 }}>Admin Users</h2>
                    <button className="adm-btn adm-btn-success" onClick={() => setActiveTab('create')}>+ Add New Admin</button>
                </div>

                <div className="adm-admin-grid">
                    {admins.map((admin) => {
                        const rm = roleMeta[admin.role] || roleMeta.ADMIN;
                        return (
                            <div key={admin.id} className="adm-admin-card">
                                {/* Card header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '46px', height: '46px', borderRadius: '14px',
                                        background: rm.gradient, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0,
                                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                    }}>
                                        {rm.emoji}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin.fullName}</h3>
                                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>@{admin.username}</p>
                                    </div>
                                    <span style={{
                                        padding: '0.2rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                                        backgroundColor: admin.active ? '#d1fae5' : '#fee2e2',
                                        color: admin.active ? '#065f46' : '#991b1b',
                                    }}>
                                        {admin.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Details */}
                                <div style={{ fontSize: '0.82rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                                    <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: '#374151' }}>Email:</span> {admin.email}</p>
                                    <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: '#374151' }}>Role:</span> {admin.role.replace('_', ' ')}</p>
                                    <p style={{ margin: 0 }}><span style={{ fontWeight: 700, color: '#374151' }}>Last Login:</span> {new Date(admin.lastLogin).toLocaleString()}</p>
                                </div>

                                {/* Permissions */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem', margin: '0 0 0.4rem' }}>Permissions:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                        {admin.permissions.map((perm) => (
                                            <span key={perm} style={{
                                                padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem',
                                                fontWeight: 600, backgroundColor: '#eef2ff', color: '#4338ca',
                                            }}>
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="adm-btn adm-btn-warning" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
                                        onClick={() => handleToggleAdminStatus(admin.id)}>
                                        {admin.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="adm-btn adm-btn-danger" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
                                        onClick={() => handleDeleteAdmin(admin.id)}
                                        disabled={admin.id === currentAdmin.id}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderCreateAdminTab = () => (
        <div className="adm-tab-content">
            <div className="adm-section-card">
                <h2 className="adm-section-title">Create New Admin</h2>
                <form onSubmit={handleCreateAdmin}>
                    <div className="adm-form-row">
                        <div className="adm-form-group">
                            <label className="adm-label">Username *</label>
                            <input className="adm-input" type="text" value={newAdminForm.username}
                                onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })} required />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Password *</label>
                            <input className="adm-input" type="password" value={newAdminForm.password}
                                onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })} required minLength="6" />
                        </div>
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Full Name *</label>
                        <input className="adm-input" type="text" value={newAdminForm.fullName}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })} required />
                    </div>

                    <div className="adm-form-row">
                        <div className="adm-form-group">
                            <label className="adm-label">Email *</label>
                            <input className="adm-input" type="email" value={newAdminForm.email}
                                onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })} required />
                        </div>
                        <div className="adm-form-group">
                            <label className="adm-label">Phone</label>
                            <input className="adm-input" type="tel" value={newAdminForm.phone}
                                onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })} />
                        </div>
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Role *</label>
                        <select className="adm-input" value={newAdminForm.role}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })} required>
                            {availableRoles.map((role) => (
                                <option key={role.value} value={role.value}>{role.label} - {role.description}</option>
                            ))}
                        </select>
                    </div>

                    <div className="adm-form-group">
                        <label className="adm-label">Permissions</label>
                        <div className="adm-permissions-grid">
                            {availablePermissions.map((permission) => (
                                <label key={permission.id} className={`adm-perm-item ${newAdminForm.permissions.includes(permission.id) ? 'adm-perm-item--checked' : ''}`}>
                                    <input type="checkbox" checked={newAdminForm.permissions.includes(permission.id)}
                                        onChange={() => handleTogglePermission(permission.id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px', accentColor: '#4f46e5' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.85rem' }}>{permission.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1px' }}>{permission.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button type="submit" className="adm-btn adm-btn-success">Create Admin</button>
                        <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setActiveTab('list')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );

    /* ═══════════════ TAB CONFIG ═══════════════ */
    const tabs = [
        { id: 'list', label: 'Admin Users', icon: '👥' },
        { id: 'profile', label: 'My Profile', icon: '👤' },
        { id: 'password', label: 'Password', icon: '🔒' },
        { id: 'create', label: 'Create Admin', icon: '➕' },
    ];

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <Sidebar role="admin" />
                <main className="adm-main" style={{ flex: 1, marginLeft: '260px', padding: '2rem', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

                        {/* Page Header */}
                        <div className="adm-page-header">
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.03em' }}>
                                    Admin Account Management
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Manage admin users, profiles, and permissions
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="adm-tabs-wrapper">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`adm-tab ${activeTab === tab.id ? 'adm-tab--active' : ''}`}
                                >
                                    <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        {activeTab === 'profile' && renderProfileTab()}
                        {activeTab === 'password' && renderPasswordTab()}
                        {activeTab === 'list' && renderAdminListTab()}
                        {activeTab === 'create' && renderCreateAdminTab()}
                    </div>
                </main>
            </div>
            <style jsx global>{admStyles}</style>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════ */
const admStyles = `
/* ── Page Header ── */
.adm-page-header {
    padding: 1.5rem 1.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
    border: 1px solid #e5e7eb; border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    margin-bottom: 1.25rem;
}

/* ── Tabs ── */
.adm-tabs-wrapper {
    display: flex; gap: 0.35rem; padding: 5px;
    background: #f1f5f9; border-radius: 14px;
    margin-bottom: 1.5rem; overflow-x: auto;
    -ms-overflow-style: none; scrollbar-width: none;
}
.adm-tabs-wrapper::-webkit-scrollbar { display: none; }
.adm-tab {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.6rem 1.2rem; border-radius: 10px;
    font-weight: 700; font-size: 0.82rem;
    border: none; cursor: pointer; white-space: nowrap;
    background: transparent; color: #6b7280;
    transition: all 0.25s ease;
}
.adm-tab:hover { background: #e2e8f0; color: #374151; }
.adm-tab--active {
    background: white !important; color: #4f46e5 !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Tab Content ── */
.adm-tab-content {
    animation: admFadeIn 0.35s ease;
}
@keyframes admFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Section Card ── */
.adm-section-card {
    background: white; border-radius: 18px;
    border: 1px solid #f0f0f5; padding: 1.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.adm-section-title {
    font-size: 1.2rem; font-weight: 800; color: #111827;
    margin: 0 0 1.25rem;
}

/* ── Forms ── */
.adm-form-group { margin-bottom: 1.25rem; }
.adm-form-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}
.adm-label {
    display: block; margin-bottom: 0.4rem;
    color: #374151; font-weight: 700; font-size: 0.82rem;
}
.adm-input {
    width: 100%; padding: 0.65rem 0.85rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.88rem; background: #fafbfc;
    box-sizing: border-box; transition: all 0.2s;
    outline: none; color: #111827;
}
.adm-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    background: white;
}

/* ── Buttons ── */
.adm-btn {
    padding: 0.6rem 1.35rem; border: none; border-radius: 10px;
    cursor: pointer; font-size: 0.85rem; font-weight: 700;
    transition: all 0.25s ease; display: inline-flex;
    align-items: center; justify-content: center; gap: 0.4rem;
}
.adm-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.adm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.adm-btn-primary {
    background: linear-gradient(135deg, #4f46e5, #4338ca); color: white;
    box-shadow: 0 3px 10px rgba(79,70,229,0.2);
}
.adm-btn-success {
    background: linear-gradient(135deg, #10b981, #059669); color: white;
    box-shadow: 0 3px 10px rgba(16,185,129,0.2);
}
.adm-btn-warning {
    background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
    box-shadow: 0 3px 10px rgba(245,158,11,0.2);
}
.adm-btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626); color: white;
    box-shadow: 0 3px 10px rgba(239,68,68,0.2);
}
.adm-btn-secondary {
    background: #e5e7eb; color: #374151;
}

/* ── Admin Grid ── */
.adm-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
}
.adm-admin-card {
    background: #fafbfc; border: 1px solid #f0f0f5;
    border-radius: 16px; padding: 1.25rem;
    transition: all 0.25s ease;
}
.adm-admin-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    transform: translateY(-2px);
}

/* ── Permissions Grid ── */
.adm-permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem; margin-top: 0.5rem;
}
.adm-perm-item {
    display: flex; align-items: flex-start; gap: 0.65rem;
    padding: 0.75rem 0.85rem; background: #fafbfc;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    cursor: pointer; transition: all 0.2s;
}
.adm-perm-item:hover {
    border-color: #a5b4fc; background: #eef2ff;
}
.adm-perm-item--checked {
    border-color: #818cf8 !important; background: #eef2ff !important;
}

/* ═══ RESPONSIVE ═══ */

@media (max-width: 768px) {
    .adm-main {
        margin-left: 0 !important;
        padding: 1rem !important;
    }
    .adm-section-card { padding: 1.25rem; }
    .adm-form-row { grid-template-columns: 1fr; }
    .adm-admin-grid { grid-template-columns: 1fr; }
    .adm-permissions-grid { grid-template-columns: 1fr; }
    .adm-page-header { padding: 1.25rem; }
    .adm-page-header h1 { font-size: 1.35rem !important; }
}

@media (max-width: 480px) {
    .adm-tab { padding: 0.5rem 0.85rem; font-size: 0.75rem; }
    .adm-section-card { padding: 1rem; border-radius: 14px; }
}
`;
