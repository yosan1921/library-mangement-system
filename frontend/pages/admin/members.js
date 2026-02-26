import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import MemberCard from '../../components/MemberCard';
import { getAllMembers, addMember, updateMember, deleteMember } from '../../services/memberService';

export default function MembersManagement() {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        membershipID: '',
        active: true,
        role: 'MEMBER',
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllMembers();
            setMembers(data);
        } catch (error) {
            console.error('Error loading members:', error);
            setError('Failed to load members. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Derived data
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = searchTerm === '' ||
                member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.membershipID?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' ? member.active : !member.active);
            return matchesSearch && matchesStatus;
        });
    }, [members, searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        total: members.length,
        active: members.filter(m => m.active).length,
        inactive: members.filter(m => !m.active).length,
        roles: new Set(members.map(m => m.role).filter(Boolean)).size,
    }), [members]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate required fields
        if (!formData.name || !formData.email || !formData.contact || !formData.membershipID) {
            setError('Please fill in all required fields (Name, Email, Phone, Membership ID)');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate phone format (basic validation)
        if (formData.contact.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits)');
            return;
        }

        try {
            setLoading(true);
            if (editingMember) {
                await updateMember(editingMember.id, formData);
                setSuccess('Member updated successfully!');
            } else {
                await addMember(formData);
                setSuccess('Member added successfully!');
            }
            await loadMembers();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error saving member:', error);
            setError(`Failed to ${editingMember ? 'update' : 'add'} member: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData(member);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this member?')) {
            try {
                setLoading(true);
                setError(null);
                await deleteMember(id);
                setSuccess('Member deleted successfully!');
                await loadMembers();
                setTimeout(() => setSuccess(null), 3000);
            } catch (error) {
                console.error('Error deleting member:', error);
                setError('Failed to delete member: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            contact: '',
            membershipID: '',
            active: true,
            role: 'MEMBER',
        });
        setEditingMember(null);
        setShowForm(false);
    };

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="admin" />
                <main style={styles.main}>
                    {/* ── Page Header ── */}
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.pageTitle}>👥 Manage Members</h1>
                            <p style={styles.pageSubtitle}>
                                View, search, and manage all library members
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                            style={showForm ? styles.btnCancelHeader : styles.btnAdd}
                            disabled={loading}
                        >
                            {showForm ? '✕  Cancel' : '＋  Add New Member'}
                        </button>
                    </div>

                    {/* ── Stats Overview ── */}
                    <div className="members-stats-grid" style={styles.statsGrid}>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #3498db' }}>
                            <span style={styles.statIcon}>👤</span>
                            <div>
                                <div style={styles.statValue}>{stats.total}</div>
                                <div style={styles.statLabel}>Total Members</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #2ecc71' }}>
                            <span style={styles.statIcon}>✅</span>
                            <div>
                                <div style={styles.statValue}>{stats.active}</div>
                                <div style={styles.statLabel}>Active</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #e74c3c' }}>
                            <span style={styles.statIcon}>⏸️</span>
                            <div>
                                <div style={styles.statValue}>{stats.inactive}</div>
                                <div style={styles.statLabel}>Inactive</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #9b59b6' }}>
                            <span style={styles.statIcon}>🏷️</span>
                            <div>
                                <div style={styles.statValue}>{stats.roles}</div>
                                <div style={styles.statLabel}>Roles</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Alerts ── */}
                    {error && (
                        <div style={styles.alertError}>
                            <span>❌ {error}</span>
                            <button onClick={() => setError(null)} style={styles.alertClose}>×</button>
                        </div>
                    )}
                    {success && (
                        <div style={styles.alertSuccess}>
                            <span>✅ {success}</span>
                            <button onClick={() => setSuccess(null)} style={styles.alertClose}>×</button>
                        </div>
                    )}

                    {/* ── Add / Edit Form ── */}
                    {showForm && (
                        <div style={styles.formCard}>
                            <h3 style={styles.formTitle}>
                                {editingMember ? '✏️ Edit Member' : '👤 Add New Member'}
                            </h3>
                            <form onSubmit={handleSubmit} style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
                                    <input
                                        type="email"
                                        placeholder="example@gmail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                    <small style={styles.helpText}>Required for email notifications</small>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone Number <span style={styles.required}>*</span></label>
                                    <input
                                        type="tel"
                                        placeholder="+251912345678"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        required
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                    <small style={styles.helpText}>Required for SMS notifications</small>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Membership ID <span style={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g., M001"
                                        value={formData.membershipID}
                                        onChange={(e) => setFormData({ ...formData, membershipID: e.target.value })}
                                        required
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        style={styles.input}
                                        disabled={loading}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="LIBRARIAN">Librarian</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div style={styles.checkboxRow}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            style={styles.checkbox}
                                            disabled={loading}
                                        />
                                        <span>Active Member</span>
                                    </label>
                                </div>
                                <div style={styles.formActions}>
                                    <button type="submit" style={styles.btnSubmit} disabled={loading}>
                                        {loading ? '⏳ Saving...' : (editingMember ? '💾 Update Member' : '➕ Add Member')}
                                    </button>
                                    <button type="button" onClick={resetForm} style={styles.btnFormCancel} disabled={loading}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Toolbar: Search, Filter, View Toggle ── */}
                    <div className="members-toolbar" style={styles.toolbar}>
                        <div className="members-search-wrap" style={styles.searchWrap}>
                            <span style={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, contact or ID…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>✕</button>
                            )}
                        </div>
                        <div className="members-toolbar-right" style={styles.toolbarRight}>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Members</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                            <div style={styles.viewToggle}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={viewMode === 'grid' ? styles.viewBtnActive : styles.viewBtn}
                                    title="Grid view"
                                >▦</button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    style={viewMode === 'table' ? styles.viewBtnActive : styles.viewBtn}
                                    title="Table view"
                                >☰</button>
                            </div>
                        </div>
                    </div>

                    {/* ── Loading ── */}
                    {loading && !showForm && (
                        <div style={styles.loadingWrap}>
                            <div style={styles.spinner}></div>
                            <p style={styles.loadingText}>Loading members…</p>
                        </div>
                    )}

                    {/* ── Results Info ── */}
                    {!loading && members.length > 0 && (
                        <p style={styles.resultsInfo}>
                            Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members
                            {searchTerm && <> matching &quot;<em>{searchTerm}</em>&quot;</>}
                            {filterStatus !== 'all' && <> — <strong>{filterStatus}</strong> only</>}
                        </p>
                    )}

                    {/* ── Empty State ── */}
                    {filteredMembers.length === 0 && !loading && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>{members.length === 0 ? '👥' : '🔍'}</div>
                            <h3 style={styles.emptyTitle}>
                                {members.length === 0 ? 'No Members Yet' : 'No Results Found'}
                            </h3>
                            <p style={styles.emptyText}>
                                {members.length === 0
                                    ? 'Click "Add New Member" to register your first library member.'
                                    : 'Try adjusting your search or filter criteria.'}
                            </p>
                        </div>
                    )}

                    {/* ── Grid View ── */}
                    {viewMode === 'grid' && filteredMembers.length > 0 && (
                        <div className="members-grid" style={styles.membersGrid}>
                            {filteredMembers.map((member) => (
                                <MemberCard
                                    key={member.id}
                                    member={member}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Table View ── */}
                    {viewMode === 'table' && filteredMembers.length > 0 && (
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Member</th>
                                        <th style={styles.th}>Membership ID</th>
                                        <th style={styles.th}>Contact</th>
                                        <th style={styles.th}>Role</th>
                                        <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                        <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="members-table-row" style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.memberCellWrap}>
                                                    <div style={styles.avatarSmall}>
                                                        {member.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <strong>{member.name}</strong>
                                                </div>
                                            </td>
                                            <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {member.membershipID}
                                            </td>
                                            <td style={styles.td}>{member.contact}</td>
                                            <td style={styles.td}>
                                                <span style={styles.roleBadge}>{member.role}</span>
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                <span style={member.active ? styles.badgeActive : styles.badgeInactive}>
                                                    {member.active ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                <div style={styles.actionBtns}>
                                                    <button onClick={() => handleEdit(member)} style={styles.btnEditSmall} title="Edit">
                                                        ✏️
                                                    </button>
                                                    <button onClick={() => handleDelete(member.id)} style={styles.btnDeleteSmall} title="Delete">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Injected responsive + animation styles */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .members-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .members-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                    }
                    .members-stats-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 0.75rem !important;
                    }
                    .members-toolbar {
                        flex-direction: column !important;
                        gap: 0.75rem !important;
                    }
                    .members-search-wrap {
                        width: 100% !important;
                        min-width: 0 !important;
                    }
                    .members-toolbar-right {
                        width: 100% !important;
                        justify-content: space-between !important;
                    }
                    .members-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .members-stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                .members-table-row:hover {
                    background-color: #f0f7ff !important;
                }
                input:focus, select:focus {
                    border-color: #3498db !important;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(52,152,219,0.15);
                }
            `}</style>
        </>
    );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Styles                                                         */
/* ──────────────────────────────────────────────────────────────── */
const styles = {
    /* Layout */
    layout: { display: 'flex' },
    main: {
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        backgroundColor: '#f5f6fa',
        minHeight: 'calc(100vh - 60px)',
    },

    /* Page Header */
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    pageTitle: {
        fontSize: '1.85rem',
        fontWeight: '700',
        color: '#2c3e50',
        margin: 0,
    },
    pageSubtitle: {
        color: '#7f8c8d',
        marginTop: '0.35rem',
        fontSize: '0.95rem',
    },
    btnAdd: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
        transition: 'all 0.3s',
        letterSpacing: '0.3px',
    },
    btnCancelHeader: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(127,140,141,0.3)',
        transition: 'all 0.3s',
    },

    /* Stats */
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    statIcon: { fontSize: '2rem' },
    statValue: { fontSize: '1.65rem', fontWeight: '700', color: '#2c3e50' },
    statLabel: { fontSize: '0.82rem', color: '#95a5a6', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' },

    /* Alerts */
    alertError: {
        background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
        color: '#c0392b',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #f5c6cb',
        animation: 'fadeSlideIn 0.3s ease',
    },
    alertSuccess: {
        background: 'linear-gradient(135deg, #f0fff4, #d4edda)',
        color: '#155724',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #c3e6cb',
        animation: 'fadeSlideIn 0.3s ease',
    },
    alertClose: {
        background: 'none',
        border: 'none',
        fontSize: '1.4rem',
        cursor: 'pointer',
        color: 'inherit',
        padding: '0 0.4rem',
        lineHeight: 1,
    },

    /* Form */
    formCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '14px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(52,152,219,0.12)',
        animation: 'fadeSlideIn 0.35s ease',
    },
    formTitle: {
        margin: '0 0 1.25rem 0',
        color: '#2c3e50',
        fontSize: '1.3rem',
        fontWeight: '600',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#34495e',
    },
    required: { color: '#e74c3c' },
    helpText: {
        fontSize: '0.75rem',
        color: '#7f8c8d',
        marginTop: '0.25rem',
        fontStyle: 'italic',
    },
    input: {
        padding: '0.7rem 0.9rem',
        border: '1.5px solid #dfe6e9',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        backgroundColor: '#fafbfc',
    },
    checkboxRow: {
        gridColumn: '1 / -1',
        padding: '0.75rem 1rem',
        backgroundColor: '#f8f9fb',
        borderRadius: '8px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        cursor: 'pointer',
        fontSize: '0.95rem',
        color: '#2c3e50',
        fontWeight: '500',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#3498db',
    },
    formActions: {
        gridColumn: '1 / -1',
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.5rem',
    },
    btnSubmit: {
        flex: 1,
        padding: '0.8rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s',
        boxShadow: '0 4px 14px rgba(52,152,219,0.3)',
    },
    btnFormCancel: {
        flex: 1,
        padding: '0.8rem',
        backgroundColor: '#ecf0f1',
        color: '#7f8c8d',
        border: '1.5px solid #dfe6e9',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'all 0.3s',
    },

    /* Toolbar */
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '0 1rem',
        flex: 1,
        minWidth: '260px',
        border: '1.5px solid #dfe6e9',
        transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    searchIcon: { fontSize: '1.1rem', marginRight: '0.5rem' },
    searchInput: {
        flex: 1,
        padding: '0.7rem 0',
        border: 'none',
        outline: 'none',
        fontSize: '0.95rem',
        backgroundColor: 'transparent',
    },
    clearSearch: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#95a5a6',
        padding: '0.25rem',
    },
    toolbarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    filterSelect: {
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        border: '1.5px solid #dfe6e9',
        fontSize: '0.9rem',
        backgroundColor: 'white',
        color: '#2c3e50',
        cursor: 'pointer',
        minWidth: '160px',
    },
    viewToggle: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1.5px solid #dfe6e9',
    },
    viewBtn: {
        padding: '0.55rem 0.85rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1.15rem',
        color: '#95a5a6',
        transition: 'all 0.2s',
    },
    viewBtnActive: {
        padding: '0.55rem 0.85rem',
        border: 'none',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        cursor: 'pointer',
        fontSize: '1.15rem',
        color: 'white',
        transition: 'all 0.2s',
    },

    /* Loading */
    loadingWrap: {
        textAlign: 'center',
        padding: '3rem',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #dfe6e9',
        borderTopColor: '#3498db',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
    },
    loadingText: { color: '#7f8c8d', fontSize: '1rem' },

    /* Results */
    resultsInfo: {
        fontSize: '0.88rem',
        color: '#7f8c8d',
        marginBottom: '1rem',
    },

    /* Empty */
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    },
    emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
    emptyTitle: { color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.25rem' },
    emptyText: { color: '#95a5a6', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' },

    /* Grid */
    membersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
    },

    /* Table */
    tableWrap: {
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '700px',
    },
    th: {
        textAlign: 'left',
        padding: '0.9rem 1rem',
        backgroundColor: '#f8f9fb',
        color: '#7f8c8d',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '700',
        borderBottom: '2px solid #ecf0f1',
    },
    tr: {
        borderBottom: '1px solid #f1f3f5',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '0.85rem 1rem',
        fontSize: '0.92rem',
        color: '#2c3e50',
        verticalAlign: 'middle',
    },
    memberCellWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    avatarSmall: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: '700',
        flexShrink: 0,
    },
    roleBadge: {
        display: 'inline-block',
        padding: '0.2rem 0.7rem',
        backgroundColor: '#f3e8ff',
        color: '#7c3aed',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '500',
    },
    badgeActive: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    badgeInactive: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f1f3f5',
        color: '#7f8c8d',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    actionBtns: {
        display: 'flex',
        gap: '0.4rem',
        justifyContent: 'center',
    },
    btnEditSmall: {
        padding: '0.4rem 0.65rem',
        border: '1.5px solid #3498db',
        borderRadius: '8px',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
    btnDeleteSmall: {
        padding: '0.4rem 0.65rem',
        border: '1.5px solid #e74c3c',
        borderRadius: '8px',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
};
