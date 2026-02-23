import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getPendingRequests,
    getActiveBorrows,
    getOverdueBooks,
    approveBorrowRequest,
    rejectBorrowRequest,
    returnBook,
    getInvalidBorrowRecords,
    deleteInvalidBorrowRecord,
    cleanupAllInvalidRecords
} from '../../services/borrowService';
import { getAllBooks } from '../../services/bookService';
import { getAllMembers } from '../../services/memberService';

export default function BorrowsManagement() {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [invalidRecords, setInvalidRecords] = useState([]);
    const [books, setBooks] = useState({});
    const [members, setMembers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pending, active, overdue, invalid, booksData, membersData] = await Promise.all([
                getPendingRequests(),
                getActiveBorrows(),
                getOverdueBooks(),
                getInvalidBorrowRecords(),
                getAllBooks(),
                getAllMembers()
            ]);

            setPendingRequests(pending);
            setActiveBorrows(active);
            setOverdueBooks(overdue);
            setInvalidRecords(invalid);

            const booksMap = {};
            booksData.forEach(book => booksMap[book.id] = book);
            setBooks(booksMap);

            const membersMap = {};
            membersData.forEach(member => membersMap[member.id] = member);
            setMembers(membersMap);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (recordId) => {
        try {
            await approveBorrowRequest(recordId);
            setSuccess('Borrow request approved!');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error approving request:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            setError(`❌ Failed to approve request: ${errorMsg}`);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleReject = async (recordId) => {
        try {
            await rejectBorrowRequest(recordId);
            setSuccess('Borrow request rejected.');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error rejecting request:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            setError(`❌ Failed to reject request: ${errorMsg}`);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleReturn = async (recordId) => {
        try {
            await returnBook(recordId);
            setSuccess('Book returned successfully!');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error returning book:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to process return';
            setError(`Error: ${errorMessage}`);
        }
    };

    const handleDeleteInvalid = async (recordId) => {
        if (!confirm('Are you sure you want to delete this invalid borrow record?')) {
            return;
        }

        try {
            await deleteInvalidBorrowRecord(recordId);
            setSuccess('Invalid record deleted successfully!');
            loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error deleting invalid record:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            setError(`❌ Failed to delete record: ${errorMsg}`);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleCleanupAll = async () => {
        if (!confirm(`Are you sure you want to delete all ${invalidRecords.length} invalid borrow records? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await cleanupAllInvalidRecords();
            setSuccess(`✅ Cleanup completed! Deleted ${result.deletedCount} invalid records.`);
            loadData();
            setTimeout(() => setSuccess(null), 5000);
        } catch (error) {
            console.error('Error cleaning up invalid records:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            setError(`❌ Failed to cleanup records: ${errorMsg}`);
            setTimeout(() => setError(null), 5000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysOverdue = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Search helper
    const matchesSearch = (record) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const memberName = members[record.memberID]?.name?.toLowerCase() || '';
        const bookTitle = books[record.bookID]?.title?.toLowerCase() || '';
        return memberName.includes(q) || bookTitle.includes(q);
    };

    const filteredPending = useMemo(() => pendingRequests.filter(matchesSearch), [pendingRequests, searchQuery, members, books]);
    const filteredActive = useMemo(() => activeBorrows.filter(matchesSearch), [activeBorrows, searchQuery, members, books]);
    const filteredOverdue = useMemo(() => overdueBooks.filter(matchesSearch), [overdueBooks, searchQuery, members, books]);
    const filteredInvalid = useMemo(() => invalidRecords.filter(matchesSearch), [invalidRecords, searchQuery, members, books]);

    const currentList = activeTab === 'pending' ? filteredPending
        : activeTab === 'active' ? filteredActive
            : activeTab === 'overdue' ? filteredOverdue
                : filteredInvalid;

    const tabs = [
        { key: 'pending', label: 'Pending Requests', icon: '⏳', count: pendingRequests.length, color: '#f39c12' },
        { key: 'active', label: 'Active Borrows', icon: '📖', count: activeBorrows.length, color: '#2ecc71' },
        { key: 'overdue', label: 'Overdue', icon: '⚠️', count: overdueBooks.length, color: '#e74c3c' },
        { key: 'invalid', label: 'Invalid Records', icon: '🔧', count: invalidRecords.length, color: '#9b59b6' },
    ];

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="admin" />
                <main style={styles.main}>
                    {/* ── Page Header ── */}
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.pageTitle}>🔄 Borrowing & Returns</h1>
                            <p style={styles.pageSubtitle}>
                                Manage borrow requests, active loans, and overdue books
                            </p>
                        </div>
                        <button onClick={loadData} style={styles.btnRefresh} disabled={loading}>
                            🔄 Refresh
                        </button>
                    </div>

                    {/* ── Stats Overview ── */}
                    <div className="borrows-stats-grid" style={styles.statsGrid}>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #f39c12' }}>
                            <span style={styles.statIcon}>⏳</span>
                            <div>
                                <div style={styles.statValue}>{pendingRequests.length}</div>
                                <div style={styles.statLabel}>Pending</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #2ecc71' }}>
                            <span style={styles.statIcon}>📖</span>
                            <div>
                                <div style={styles.statValue}>{activeBorrows.length}</div>
                                <div style={styles.statLabel}>Active</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #e74c3c' }}>
                            <span style={styles.statIcon}>⚠️</span>
                            <div>
                                <div style={styles.statValue}>{overdueBooks.length}</div>
                                <div style={styles.statLabel}>Overdue</div>
                            </div>
                        </div>
                        <div style={{ ...styles.statCard, borderLeft: '4px solid #9b59b6' }}>
                            <span style={styles.statIcon}>🔧</span>
                            <div>
                                <div style={styles.statValue}>{invalidRecords.length}</div>
                                <div style={styles.statLabel}>Invalid</div>
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

                    {/* ── Tabs ── */}
                    <div className="borrows-tabs" style={styles.tabsBar}>
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={activeTab === tab.key
                                    ? { ...styles.tabBtn, ...styles.tabBtnActive, borderBottomColor: tab.color }
                                    : styles.tabBtn}
                            >
                                <span style={styles.tabIcon}>{tab.icon}</span>
                                <span style={styles.tabLabel}>{tab.label}</span>
                                <span style={{
                                    ...styles.tabCount,
                                    backgroundColor: activeTab === tab.key ? tab.color : '#ecf0f1',
                                    color: activeTab === tab.key ? 'white' : '#7f8c8d',
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Search Bar ── */}
                    <div className="borrows-search" style={styles.searchBar}>
                        <div style={styles.searchWrap}>
                            <span style={styles.searchIconSpan}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by member name or book title…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} style={styles.clearSearch}>✕</button>
                            )}
                        </div>
                        {!loading && (
                            <p style={styles.resultsInfo}>
                                Showing <strong>{currentList.length}</strong> records
                                {searchQuery && <> matching &quot;<em>{searchQuery}</em>&quot;</>}
                            </p>
                        )}
                    </div>

                    {/* ── Loading ── */}
                    {loading && (
                        <div style={styles.loadingWrap}>
                            <div style={styles.spinner}></div>
                            <p style={styles.loadingText}>Loading records…</p>
                        </div>
                    )}

                    {/* ── Content Area ── */}
                    {!loading && (
                        <div style={styles.contentCard}>
                            {/* Empty State */}
                            {currentList.length === 0 && (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>
                                        {activeTab === 'pending' ? '⏳' : activeTab === 'active' ? '📖' : '✅'}
                                    </div>
                                    <h3 style={styles.emptyTitle}>
                                        {searchQuery ? 'No Matching Records' : `No ${tabs.find(t => t.key === activeTab)?.label}`}
                                    </h3>
                                    <p style={styles.emptyText}>
                                        {searchQuery
                                            ? 'Try adjusting your search criteria.'
                                            : activeTab === 'overdue'
                                                ? 'Great news! No books are overdue.'
                                                : 'There are no records to display.'}
                                    </p>
                                </div>
                            )}

                            {/* ══ Pending Requests Table ══ */}
                            {activeTab === 'pending' && filteredPending.length > 0 && (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Member</th>
                                                <th style={styles.th}>Book</th>
                                                <th style={styles.th}>Request Date</th>
                                                <th style={styles.th}>Due Date</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPending.map(record => (
                                                <tr key={record.id} className="borrows-row" style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={styles.cellWithAvatar}>
                                                            <div style={styles.avatarSmall}>
                                                                {(members[record.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <strong>{members[record.memberID]?.name || record.memberID}</strong>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>{books[record.bookID]?.title || record.bookID}</td>
                                                    <td style={styles.td}>{formatDate(record.issueDate)}</td>
                                                    <td style={styles.td}>{formatDate(record.dueDate)}</td>
                                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                                        <div style={styles.actionBtns}>
                                                            <button
                                                                style={styles.btnApprove}
                                                                onClick={() => handleApprove(record.id)}
                                                            >
                                                                ✓ Approve
                                                            </button>
                                                            <button
                                                                style={styles.btnReject}
                                                                onClick={() => handleReject(record.id)}
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ══ Active Borrows Table ══ */}
                            {activeTab === 'active' && filteredActive.length > 0 && (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Member</th>
                                                <th style={styles.th}>Book</th>
                                                <th style={styles.th}>Issue Date</th>
                                                <th style={styles.th}>Due Date</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredActive.map(record => (
                                                <tr key={record.id} className="borrows-row" style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={styles.cellWithAvatar}>
                                                            <div style={styles.avatarSmall}>
                                                                {(members[record.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <strong>{members[record.memberID]?.name || record.memberID}</strong>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>{books[record.bookID]?.title || record.bookID}</td>
                                                    <td style={styles.td}>{formatDate(record.issueDate)}</td>
                                                    <td style={styles.td}>{formatDate(record.dueDate)}</td>
                                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                                        <span style={record.overdue ? styles.badgeOverdue : styles.badgeActive}>
                                                            {record.overdue ? '⚠️ Overdue' : '✓ Active'}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                                        {record.status === 'APPROVED' && (
                                                            <button
                                                                style={styles.btnReturn}
                                                                onClick={() => handleReturn(record.id)}
                                                            >
                                                                ↩️ Return
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ══ Overdue Books Table ══ */}
                            {activeTab === 'overdue' && filteredOverdue.length > 0 && (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Member</th>
                                                <th style={styles.th}>Book</th>
                                                <th style={styles.th}>Issue Date</th>
                                                <th style={styles.th}>Due Date</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Days Overdue</th>
                                                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOverdue.map(record => (
                                                <tr key={record.id} className="borrows-row" style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={styles.cellWithAvatar}>
                                                            <div style={{ ...styles.avatarSmall, background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}>
                                                                {(members[record.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <strong>{members[record.memberID]?.name || record.memberID}</strong>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>{books[record.bookID]?.title || record.bookID}</td>
                                                    <td style={styles.td}>{formatDate(record.issueDate)}</td>
                                                    <td style={styles.td}>{formatDate(record.dueDate)}</td>
                                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                                        <span style={styles.daysOverdueBadge}>
                                                            🔥 {getDaysOverdue(record.dueDate)} days
                                                        </span>
                                                    </td>
                                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                                        <button
                                                            style={styles.btnReturn}
                                                            onClick={() => handleReturn(record.id)}
                                                        >
                                                            ↩️ Return
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ══ Invalid Records Table ══ */}
                            {activeTab === 'invalid' && (
                                <>
                                    {filteredInvalid.length > 0 && (
                                        <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ color: '#856404' }}>⚠️ Data Integrity Issue</strong>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#856404' }}>
                                                    These records reference books that no longer exist in the system. You can delete them individually or clean up all at once.
                                                </p>
                                            </div>
                                            <button
                                                style={styles.btnCleanupAll}
                                                onClick={handleCleanupAll}
                                            >
                                                🗑️ Cleanup All ({invalidRecords.length})
                                            </button>
                                        </div>
                                    )}
                                    {filteredInvalid.length > 0 && (
                                        <div style={styles.tableWrap}>
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.th}>Record ID</th>
                                                        <th style={styles.th}>Member</th>
                                                        <th style={styles.th}>Book ID (Missing)</th>
                                                        <th style={styles.th}>Issue Date</th>
                                                        <th style={styles.th}>Status</th>
                                                        <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredInvalid.map(record => (
                                                        <tr key={record.id} className="borrows-row" style={styles.tr}>
                                                            <td style={styles.td}>
                                                                <code style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{record.id}</code>
                                                            </td>
                                                            <td style={styles.td}>
                                                                <div style={styles.cellWithAvatar}>
                                                                    <div style={{ ...styles.avatarSmall, background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)' }}>
                                                                        {(members[record.memberID]?.name || '?').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <strong>{members[record.memberID]?.name || record.memberID}</strong>
                                                                </div>
                                                            </td>
                                                            <td style={styles.td}>
                                                                <code style={{ fontSize: '0.8rem', color: '#e74c3c' }}>{record.bookID || 'NULL'}</code>
                                                            </td>
                                                            <td style={styles.td}>{formatDate(record.issueDate)}</td>
                                                            <td style={styles.td}>
                                                                <span style={styles.badgeInvalid}>{record.status}</span>
                                                            </td>
                                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                                <button
                                                                    style={styles.btnDelete}
                                                                    onClick={() => handleDeleteInvalid(record.id)}
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
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
                    .borrows-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                    }
                    .borrows-stats-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 0.75rem !important;
                    }
                    .borrows-tabs {
                        overflow-x: auto !important;
                        gap: 0 !important;
                    }
                    .borrows-search {
                        flex-direction: column !important;
                    }
                }
                @media (max-width: 480px) {
                    .borrows-stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .borrows-tabs button {
                        font-size: 0.8rem !important;
                        padding: 0.65rem 0.75rem !important;
                    }
                }

                .borrows-row:hover {
                    background-color: #f0f7ff !important;
                }
                input:focus {
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
    btnRefresh: {
        padding: '0.7rem 1.25rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        boxShadow: '0 4px 14px rgba(52,152,219,0.3)',
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

    /* Tabs */
    tabsBar: {
        display: 'flex',
        gap: '0.25rem',
        marginBottom: '1.25rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0.4rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    },
    tabBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        border: 'none',
        borderBottom: '3px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#7f8c8d',
        borderRadius: '8px',
        transition: 'all 0.25s',
        fontWeight: '500',
    },
    tabBtnActive: {
        color: '#2c3e50',
        fontWeight: '700',
        backgroundColor: '#f8f9fb',
    },
    tabIcon: { fontSize: '1.1rem' },
    tabLabel: {},
    tabCount: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        height: '24px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '700',
        padding: '0 0.4rem',
        transition: 'all 0.25s',
    },

    /* Search */
    searchBar: {
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
    },
    searchIconSpan: { fontSize: '1.1rem', marginRight: '0.5rem' },
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
    resultsInfo: {
        fontSize: '0.85rem',
        color: '#95a5a6',
        margin: 0,
        whiteSpace: 'nowrap',
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

    /* Content */
    contentCard: {
        backgroundColor: 'white',
        borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
    },

    /* Empty */
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
    },
    emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
    emptyTitle: { color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.25rem' },
    emptyText: { color: '#95a5a6', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' },

    /* Table */
    tableWrap: {
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
    cellWithAvatar: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    avatarSmall: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        fontWeight: '700',
        flexShrink: 0,
    },

    /* Badges */
    badgeActive: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    badgeOverdue: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fdecea',
        color: '#e74c3c',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
    daysOverdueBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fdecea',
        color: '#e74c3c',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '700',
    },

    /* Action Buttons */
    actionBtns: {
        display: 'flex',
        gap: '0.4rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    btnApprove: {
        padding: '0.4rem 0.85rem',
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(46,204,113,0.25)',
    },
    btnReject: {
        padding: '0.4rem 0.85rem',
        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(231,76,60,0.25)',
    },
    btnReturn: {
        padding: '0.4rem 0.85rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(52,152,219,0.25)',
    },
    btnDelete: {
        padding: '0.4rem 0.85rem',
        background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(149,165,166,0.25)',
    },
    btnCleanupAll: {
        padding: '0.6rem 1.2rem',
        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 10px rgba(231,76,60,0.3)',
    },
    badgeInvalid: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f5f5f5',
        color: '#7f8c8d',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: '600',
    },
};
