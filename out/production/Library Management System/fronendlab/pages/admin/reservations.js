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
            <h2 style={styles.sectionTitle}>Pending Reservations</h2>
            {pendingReservations.length === 0 ? (
                <p style={styles.emptyMessage}>No pending reservations</p>
            ) : (
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
                            <tr key={reservation.id} style={styles.tr}>
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
                                    <button
                                        style={{ ...styles.button, ...styles.approveButton }}
                                        onClick={() => handleApprove(reservation.id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        style={{ ...styles.button, ...styles.cancelButton }}
                                        onClick={() => handleCancel(reservation.id)}
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderApprovedReservations = () => (
        <div style={styles.tableContainer}>
            <h2 style={styles.sectionTitle}>Approved Reservations</h2>
            {approvedReservations.length === 0 ? (
                <p style={styles.emptyMessage}>No approved reservations</p>
            ) : (
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
                                <tr key={reservation.id} style={styles.tr}>
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
                                        {!reservation.notifiedDate && isBookAvailable(reservation.bookID) && (
                                            <button
                                                style={{ ...styles.button, ...styles.notifyButton }}
                                                onClick={() => handleNotify(reservation.id)}
                                            >
                                                Notify Member
                                            </button>
                                        )}
                                        {reservation.notifiedDate && (
                                            <button
                                                style={{ ...styles.button, ...styles.fulfillButton }}
                                                onClick={() => handleFulfill(reservation.id)}
                                            >
                                                Mark Fulfilled
                                            </button>
                                        )}
                                        <button
                                            style={{ ...styles.button, ...styles.cancelButton }}
                                            onClick={() => handleCancel(reservation.id)}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderExpiredReservations = () => (
        <div style={styles.tableContainer}>
            <h2 style={styles.sectionTitle}>Expired Reservations</h2>
            <p style={styles.infoText}>These reservations have passed their pickup deadline and should be cancelled.</p>
            {expiredReservations.length === 0 ? (
                <p style={styles.emptyMessage}>No expired reservations</p>
            ) : (
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
                                <tr key={reservation.id} style={styles.tr}>
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
                                            onClick={() => handleCancel(reservation.id)}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
                        <p>Loading...</p>
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
                <main style={styles.main}>
                    <h1 style={styles.title}>Reservations & Holds Management</h1>

                    <div style={styles.infoBox}>
                        <h3>Workflow:</h3>
                        <ol style={styles.workflowList}>
                            <li>Members create reservations for books</li>
                            <li>Admin approves or cancels pending reservations</li>
                            <li>When book becomes available, admin notifies member (3-day pickup window)</li>
                            <li>Member picks up book, admin marks as fulfilled</li>
                            <li>If not picked up within 3 days, reservation expires</li>
                        </ol>
                    </div>

                    <div style={styles.tabs}>
                        <button
                            style={activeTab === 'pending' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending ({pendingReservations.length})
                        </button>
                        <button
                            style={activeTab === 'approved' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('approved')}
                        >
                            Approved ({approvedReservations.length})
                        </button>
                        <button
                            style={activeTab === 'expired' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('expired')}
                        >
                            Expired ({expiredReservations.length})
                        </button>
                    </div>

                    <div style={styles.content}>
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
    },
    main: {
        flex: 1,
        marginLeft: '260px',
        padding: '2rem',
        backgroundColor: '#ecf0f1',
        minHeight: 'calc(100vh - 60px)',
    },
    title: {
        color: '#2c3e50',
        marginBottom: '1.5rem',
    },
    infoBox: {
        backgroundColor: '#e8f4f8',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        borderLeft: '4px solid #3498db',
    },
    workflowList: {
        margin: '0.5rem 0 0 1.5rem',
        color: '#2c3e50',
    },
    infoText: {
        color: '#7f8c8d',
        marginBottom: '1rem',
        fontStyle: 'italic',
    },
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #ddd',
    },
    tab: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#7f8c8d',
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s',
    },
    activeTabStyle: {
        color: '#3498db',
        borderBottom: '3px solid #3498db',
        fontWeight: 'bold',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableContainer: {
        width: '100%',
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '1.5rem',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#7f8c8d',
        padding: '2rem',
        fontSize: '1.1rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        color: '#2c3e50',
        fontWeight: 'bold',
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '1rem',
        color: '#495057',
    },
    button: {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginRight: '0.5rem',
        transition: 'all 0.3s',
    },
    approveButton: {
        backgroundColor: '#27ae60',
        color: 'white',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
    },
    notifyButton: {
        backgroundColor: '#f39c12',
        color: 'white',
    },
    fulfillButton: {
        backgroundColor: '#3498db',
        color: 'white',
    },
    availableTag: {
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    unavailableTag: {
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    notNotifiedTag: {
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    expiredText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    normalText: {
        color: '#495057',
    },
    overdueText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
};
