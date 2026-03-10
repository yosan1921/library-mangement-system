import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getPendingReservations,
    getApprovedReservations,
    getExpiredReservations,
    approveReservation,
    notifyMember,
    fulfillReservation,
    cancelReservationByAdmin
} from '../../services/borrowService';
import { getAllBooks } from '../../services/bookService';
import { getAllMembers } from '../../services/memberService';

// Add CSS for animations and responsive behavior
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .reservations-main {
                margin-left: 0 !important;
                padding: 1rem !important;
            }
            .reservations-title {
                font-size: 2rem !important;
            }
            .reservations-content {
                padding: 1rem !important;
            }
            .reservations-desktop-table {
                display: none !important;
            }
            .reservations-mobile-cards {
                display: block !important;
            }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
            .reservations-desktop-table {
                display: none !important;
            }
            .reservations-mobile-cards {
                display: block !important;
            }
        }
        
        @media (min-width: 1025px) {
            .reservations-desktop-table {
                display: block !important;
            }
            .reservations-mobile-cards {
                display: none !important;
            }
        }
        
        .reservations-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .reservations-button:active {
            transform: translateY(0);
        }
        
        .reservations-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .reservations-tab:hover {
            background-color: #f1f5f9;
            color: #3b82f6;
        }
        
        .reservations-tr:hover {
            background-color: #f8fafc;
        }
        
        .reservations-loading-spinner {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

export default function ReservationsManagement() {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingReservations, setPendingReservations] = useState([]);
    const [approvedReservations, setApprovedReservations] = useState([]);
    const [expiredReservations, setExpiredReservations] = useState([]);
    const [books, setBooks] = useState({});
    const [members, setMembers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pending, approved, expired, booksData, membersData] = await Promise.all([
                getPendingReservations(),
                getApprovedReservations(),
                getExpiredReservations(),
                getAllBooks(),
                getAllMembers()
            ]);

            setPendingReservations(pending);
            setApprovedReservations(approved);
            setExpiredReservations(expired);

            const booksMap = {};
            booksData.forEach(book => booksMap[book.id] = book);
            setBooks(booksMap);

            const membersMap = {};
            membersData.forEach(member => membersMap[member.id] = member);
            setMembers(membersMap);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveReservation(id);
            alert('Reservation approved successfully');
            loadData();
        } catch (error) {
            console.error('Error approving reservation:', error);
            alert('Failed to approve reservation');
        }
    };

    const handleNotify = async (id) => {
        try {
            await notifyMember(id);
            alert('Member notified successfully. Book must be picked up within 3 days.');
            loadData();
        } catch (error) {
            console.error('Error notifying member:', error);
            alert('Failed to notify member. Ensure book is available.');
        }
    };

    const handleFulfill = async (id) => {
        try {
            await fulfillReservation(id);
            alert('Reservation fulfilled successfully');
            loadData();
        } catch (error) {
            console.error('Error fulfilling reservation:', error);
            alert('Failed to fulfill reservation');
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            await cancelReservationByAdmin(id);
            alert('Reservation cancelled successfully');
            loadData();
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            alert('Failed to cancel reservation');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isBookAvailable = (bookID) => {
        const book = books[bookID];
        return book && book.copiesAvailable > 0;
    };

    const renderPendingReservations = () => (
        <div style={styles.tableContainer}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>⏳</span>
                    Pending Reservations
                </h2>
                <div style={styles.badge}>{pendingReservations.length}</div>
            </div>
            {pendingReservations.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📋</div>
                    <p style={styles.emptyMessage}>No pending reservations</p>
                    <p style={styles.emptySubtext}>New reservation requests will appear here</p>
                </div>
            ) : (
                <div style={styles.responsiveTableWrapper}>
                    <div style={styles.desktopTable} className="reservations-desktop-table">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Member</th>
                                    <th style={styles.th}>Book</th>
                                    <th style={styles.th}>Reservation Date</th>
                                    <th style={styles.th}>Book Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingReservations.map(reservation => (
                                    <tr key={reservation.id} style={styles.tr} className="reservations-tr">
                                        <td style={styles.td}>{members[reservation.memberID]?.name || reservation.memberID}</td>
                                        <td style={styles.td}>{books[reservation.bookID]?.title || reservation.bookID}</td>
                                        <td style={styles.td}>{formatDate(reservation.reservationDate)}</td>
                                        <td style={styles.td}>
                                            {isBookAvailable(reservation.bookID) ? (
                                                <span style={styles.availableTag}>Available</span>
                                            ) : (
                                                <span style={styles.unavailableTag}>Not Available</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.actionButtons}>
                                                <button
                                                    style={{ ...styles.button, ...styles.approveButton }}
                                                    className="reservations-button"
                                                    onClick={() => handleApprove(reservation.id)}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    style={{ ...styles.button, ...styles.cancelButton }}
                                                    className="reservations-button"
                                                    onClick={() => handleCancel(reservation.id)}
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.mobileCards} className="reservations-mobile-cards">
                        {pendingReservations.map(reservation => (
                            <div key={reservation.id} style={styles.mobileCard} className="reservations-card">
                                <div style={styles.cardHeader}>
                                    <h4 style={styles.cardTitle}>{books[reservation.bookID]?.title || reservation.bookID}</h4>
                                    {isBookAvailable(reservation.bookID) ? (
                                        <span style={styles.availableTag}>Available</span>
                                    ) : (
                                        <span style={styles.unavailableTag}>Not Available</span>
                                    )}
                                </div>
                                <div style={styles.cardContent}>
                                    <div style={styles.cardRow}>
                                        <span style={styles.cardLabel}>Member:</span>
                                        <span>{members[reservation.memberID]?.name || reservation.memberID}</span>
                                    </div>
                                    <div style={styles.cardRow}>
                                        <span style={styles.cardLabel}>Reserved:</span>
                                        <span>{formatDate(reservation.reservationDate)}</span>
                                    </div>
                                </div>
                                <div style={styles.cardActions}>
                                    <button
                                        style={{ ...styles.button, ...styles.approveButton }}
                                        className="reservations-button"
                                        onClick={() => handleApprove(reservation.id)}
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        style={{ ...styles.button, ...styles.cancelButton }}
                                        className="reservations-button"
                                        onClick={() => handleCancel(reservation.id)}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderApprovedReservations = () => (
        <div style={styles.tableContainer}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>✅</span>
                    Approved Reservations
                </h2>
                <div style={styles.badge}>{approvedReservations.length}</div>
            </div>
            {approvedReservations.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>✅</div>
                    <p style={styles.emptyMessage}>No approved reservations</p>
                    <p style={styles.emptySubtext}>Approved reservations awaiting pickup will appear here</p>
                </div>
            ) : (
                <div style={styles.responsiveTableWrapper}>
                    <div style={styles.desktopTable} className="reservations-desktop-table">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Member</th>
                                    <th style={styles.th}>Book</th>
                                    <th style={styles.th}>Reservation Date</th>
                                    <th style={styles.th}>Notified Date</th>
                                    <th style={styles.th}>Expiry Date</th>
                                    <th style={styles.th}>Book Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedReservations.map(reservation => {
                                    const daysLeft = getDaysUntilExpiry(reservation.expiryDate);
                                    return (
                                        <tr key={reservation.id} style={styles.tr} className="reservations-tr">
                                            <td style={styles.td}>{members[reservation.memberID]?.name || reservation.memberID}</td>
                                            <td style={styles.td}>{books[reservation.bookID]?.title || reservation.bookID}</td>
                                            <td style={styles.td}>{formatDate(reservation.reservationDate)}</td>
                                            <td style={styles.td}>
                                                {reservation.notifiedDate ? (
                                                    formatDate(reservation.notifiedDate)
                                                ) : (
                                                    <span style={styles.notNotifiedTag}>Not Notified</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                {reservation.expiryDate ? (
                                                    <span style={daysLeft < 0 ? styles.expiredText : styles.normalText}>
                                                        {formatDate(reservation.expiryDate)}
                                                        {daysLeft !== null && daysLeft >= 0 && ` (${daysLeft} days left)`}
                                                    </span>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                {isBookAvailable(reservation.bookID) ? (
                                                    <span style={styles.availableTag}>Available</span>
                                                ) : (
                                                    <span style={styles.unavailableTag}>Not Available</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtons}>
                                                    {!reservation.notifiedDate && isBookAvailable(reservation.bookID) && (
                                                        <button
                                                            style={{ ...styles.button, ...styles.notifyButton }}
                                                            className="reservations-button"
                                                            onClick={() => handleNotify(reservation.id)}
                                                        >
                                                            🔔 Notify Member
                                                        </button>
                                                    )}
                                                    {reservation.notifiedDate && (
                                                        <button
                                                            style={{ ...styles.button, ...styles.fulfillButton }}
                                                            className="reservations-button"
                                                            onClick={() => handleFulfill(reservation.id)}
                                                        >
                                                            ✓ Mark Fulfilled
                                                        </button>
                                                    )}
                                                    <button
                                                        style={{ ...styles.button, ...styles.cancelButton }}
                                                        className="reservations-button"
                                                        onClick={() => handleCancel(reservation.id)}
                                                    >
                                                        ✕ Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.mobileCards} className="reservations-mobile-cards">
                        {approvedReservations.map(reservation => {
                            const daysLeft = getDaysUntilExpiry(reservation.expiryDate);
                            return (
                                <div key={reservation.id} style={styles.mobileCard} className="reservations-card">
                                    <div style={styles.cardHeader}>
                                        <h4 style={styles.cardTitle}>{books[reservation.bookID]?.title || reservation.bookID}</h4>
                                        {isBookAvailable(reservation.bookID) ? (
                                            <span style={styles.availableTag}>Available</span>
                                        ) : (
                                            <span style={styles.unavailableTag}>Not Available</span>
                                        )}
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Member:</span>
                                            <span>{members[reservation.memberID]?.name || reservation.memberID}</span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Reserved:</span>
                                            <span>{formatDate(reservation.reservationDate)}</span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Notified:</span>
                                            <span>
                                                {reservation.notifiedDate ? (
                                                    formatDate(reservation.notifiedDate)
                                                ) : (
                                                    <span style={styles.notNotifiedTag}>Not Notified</span>
                                                )}
                                            </span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Expires:</span>
                                            <span>
                                                {reservation.expiryDate ? (
                                                    <span style={daysLeft < 0 ? styles.expiredText : styles.normalText}>
                                                        {formatDate(reservation.expiryDate)}
                                                        {daysLeft !== null && daysLeft >= 0 && ` (${daysLeft} days left)`}
                                                    </span>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.cardActions}>
                                        {!reservation.notifiedDate && isBookAvailable(reservation.bookID) && (
                                            <button
                                                style={{ ...styles.button, ...styles.notifyButton }}
                                                className="reservations-button"
                                                onClick={() => handleNotify(reservation.id)}
                                            >
                                                🔔 Notify Member
                                            </button>
                                        )}
                                        {reservation.notifiedDate && (
                                            <button
                                                style={{ ...styles.button, ...styles.fulfillButton }}
                                                className="reservations-button"
                                                onClick={() => handleFulfill(reservation.id)}
                                            >
                                                ✓ Mark Fulfilled
                                            </button>
                                        )}
                                        <button
                                            style={{ ...styles.button, ...styles.cancelButton }}
                                            className="reservations-button"
                                            onClick={() => handleCancel(reservation.id)}
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const renderExpiredReservations = () => (
        <div style={styles.tableContainer}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>⚠️</span>
                    Expired Reservations
                </h2>
                <div style={styles.badge}>{expiredReservations.length}</div>
            </div>
            <div style={styles.alertBox}>
                <span style={styles.alertIcon}>ℹ️</span>
                <p style={styles.infoText}>These reservations have passed their pickup deadline and should be cancelled.</p>
            </div>
            {expiredReservations.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⏰</div>
                    <p style={styles.emptyMessage}>No expired reservations</p>
                    <p style={styles.emptySubtext}>Overdue reservations will appear here</p>
                </div>
            ) : (
                <div style={styles.responsiveTableWrapper}>
                    <div style={styles.desktopTable} className="reservations-desktop-table">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Member</th>
                                    <th style={styles.th}>Book</th>
                                    <th style={styles.th}>Notified Date</th>
                                    <th style={styles.th}>Expiry Date</th>
                                    <th style={styles.th}>Days Overdue</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expiredReservations.map(reservation => {
                                    const daysOverdue = Math.abs(getDaysUntilExpiry(reservation.expiryDate));
                                    return (
                                        <tr key={reservation.id} style={styles.tr} className="reservations-tr">
                                            <td style={styles.td}>{members[reservation.memberID]?.name || reservation.memberID}</td>
                                            <td style={styles.td}>{books[reservation.bookID]?.title || reservation.bookID}</td>
                                            <td style={styles.td}>{formatDate(reservation.notifiedDate)}</td>
                                            <td style={styles.td}>{formatDate(reservation.expiryDate)}</td>
                                            <td style={styles.td}>
                                                <span style={styles.overdueText}>{daysOverdue} days</span>
                                            </td>
                                            <td style={styles.td}>
                                                <button
                                                    style={{ ...styles.button, ...styles.cancelButton }}
                                                    className="reservations-button"
                                                    onClick={() => handleCancel(reservation.id)}
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={styles.mobileCards} className="reservations-mobile-cards">
                        {expiredReservations.map(reservation => {
                            const daysOverdue = Math.abs(getDaysUntilExpiry(reservation.expiryDate));
                            return (
                                <div key={reservation.id} style={styles.mobileCard} className="reservations-card">
                                    <div style={styles.cardHeader}>
                                        <h4 style={styles.cardTitle}>{books[reservation.bookID]?.title || reservation.bookID}</h4>
                                        <span style={styles.overdueTag}>{daysOverdue} days overdue</span>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Member:</span>
                                            <span>{members[reservation.memberID]?.name || reservation.memberID}</span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Notified:</span>
                                            <span>{formatDate(reservation.notifiedDate)}</span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLabel}>Expired:</span>
                                            <span>{formatDate(reservation.expiryDate)}</span>
                                        </div>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button
                                            style={{ ...styles.button, ...styles.cancelButton }}
                                            className="reservations-button"
                                            onClick={() => handleCancel(reservation.id)}
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.layout}>
                    <Sidebar role="admin" />
                    <main style={styles.main}>
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Loading reservations...</p>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="admin" />
                <main style={styles.main} className="reservations-main">
                    <div style={styles.header}>
                        <h1 style={styles.title} className="reservations-title">
                            <span style={styles.titleIcon}>📚</span>
                            Reservations & Holds Management
                        </h1>
                        <div style={styles.statsCards}>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{pendingReservations.length}</div>
                                <div style={styles.statLabel}>Pending</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{approvedReservations.length}</div>
                                <div style={styles.statLabel}>Approved</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{expiredReservations.length}</div>
                                <div style={styles.statLabel}>Expired</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.infoBox}>
                        <div style={styles.infoHeader}>
                            <span style={styles.infoIcon}>💡</span>
                            <h3 style={styles.infoTitle}>Workflow Guide</h3>
                        </div>
                        <ol style={styles.workflowList}>
                            <li>Members create reservations for books</li>
                            <li>Admin approves or cancels pending reservations</li>
                            <li>When book becomes available, admin notifies member (3-day pickup window)</li>
                            <li>Member picks up book, admin marks as fulfilled</li>
                            <li>If not picked up within 3 days, reservation expires</li>
                        </ol>
                    </div>

                    <div style={styles.tabsContainer}>
                        <div style={styles.tabs}>
                            <button
                                style={activeTab === 'pending' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="reservations-tab"
                                onClick={() => setActiveTab('pending')}
                            >
                                <span style={styles.tabIcon}>⏳</span>
                                Pending
                                <span style={styles.tabBadge}>{pendingReservations.length}</span>
                            </button>
                            <button
                                style={activeTab === 'approved' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="reservations-tab"
                                onClick={() => setActiveTab('approved')}
                            >
                                <span style={styles.tabIcon}>✅</span>
                                Approved
                                <span style={styles.tabBadge}>{approvedReservations.length}</span>
                            </button>
                            <button
                                style={activeTab === 'expired' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="reservations-tab"
                                onClick={() => setActiveTab('expired')}
                            >
                                <span style={styles.tabIcon}>⚠️</span>
                                Expired
                                <span style={styles.tabBadge}>{expiredReservations.length}</span>
                            </button>
                        </div>
                    </div>

                    <div style={styles.content} className="reservations-content">
                        {activeTab === 'pending' && renderPendingReservations()}
                        {activeTab === 'approved' && renderApprovedReservations()}
                        {activeTab === 'expired' && renderExpiredReservations()}
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
    },
    main: {
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        backgroundColor: '#f8fafc',
        minHeight: 'calc(100vh - 60px)',
        transition: 'margin-left 0.3s ease',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    title: {
        color: '#1e293b',
        marginBottom: '0.5rem',
        fontSize: '2.5rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    titleIcon: {
        fontSize: '2rem',
    },
    statsCards: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        minWidth: '100px',
        border: '1px solid #e2e8f0',
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: '0.25rem',
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#64748b',
        fontWeight: '500',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '1rem',
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
    },
    loadingText: {
        color: '#64748b',
        fontSize: '1.1rem',
    },
    infoBox: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    infoHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    infoIcon: {
        fontSize: '1.5rem',
    },
    infoTitle: {
        color: '#1e293b',
        margin: '0',
        fontSize: '1.25rem',
        fontWeight: '600',
    },
    workflowList: {
        margin: '0',
        paddingLeft: '1.5rem',
        color: '#475569',
        lineHeight: '1.6',
    },
    alertBox: {
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    alertIcon: {
        fontSize: '1.25rem',
    },
    infoText: {
        color: '#92400e',
        margin: '0',
        fontWeight: '500',
    },
    tabsContainer: {
        marginBottom: '2rem',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
    },
    tab: {
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#64748b',
        borderRadius: '8px 8px 0 0',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
        whiteSpace: 'nowrap',
    },
    activeTabStyle: {
        color: '#3b82f6',
        backgroundColor: 'white',
        borderBottom: '3px solid #3b82f6',
        fontWeight: '600',
        boxShadow: '0 -2px 8px rgba(59, 130, 246, 0.1)',
    },
    tabIcon: {
        fontSize: '1.1rem',
    },
    tabBadge: {
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '12px',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        minWidth: '20px',
        textAlign: 'center',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
    },
    tableContainer: {
        width: '100%',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    sectionTitle: {
        color: '#1e293b',
        margin: '0',
        fontSize: '1.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sectionIcon: {
        fontSize: '1.25rem',
    },
    badge: {
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '20px',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        minWidth: '40px',
        textAlign: 'center',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#64748b',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        opacity: '0.5',
    },
    emptyMessage: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#475569',
    },
    emptySubtext: {
        fontSize: '1rem',
        color: '#64748b',
        margin: '0',
    },
    responsiveTableWrapper: {
        width: '100%',
    },
    desktopTable: {
        display: 'block',
    },
    mobileCards: {
        display: 'none',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        color: '#374151',
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.2s ease',
    },
    td: {
        padding: '1rem',
        color: '#374151',
        verticalAlign: 'top',
    },
    mobileCard: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s ease',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem',
    },
    cardTitle: {
        color: '#1e293b',
        margin: '0',
        fontSize: '1.1rem',
        fontWeight: '600',
        lineHeight: '1.4',
        flex: '1',
    },
    cardContent: {
        marginBottom: '1.5rem',
    },
    cardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        gap: '1rem',
    },
    cardLabel: {
        color: '#64748b',
        fontWeight: '500',
        fontSize: '0.875rem',
        minWidth: '80px',
    },
    cardActions: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    button: {
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
    },
    approveButton: {
        backgroundColor: '#10b981',
        color: 'white',
    },
    cancelButton: {
        backgroundColor: '#ef4444',
        color: 'white',
    },
    notifyButton: {
        backgroundColor: '#f59e0b',
        color: 'white',
    },
    fulfillButton: {
        backgroundColor: '#3b82f6',
        color: 'white',
    },
    availableTag: {
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid #bbf7d0',
    },
    unavailableTag: {
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid #fecaca',
    },
    notNotifiedTag: {
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid #fde68a',
    },
    overdueTag: {
        padding: '0.375rem 0.75rem',
        borderRadius: '20px',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid #fecaca',
    },
    expiredText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    normalText: {
        color: '#374151',
    },
    overdueText: {
        color: '#ef4444',
        fontWeight: '600',
    },
};
