import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAllNotifications, getNotificationsByMember } from '../../services/notificationService';

export default function MemberNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [memberId, setMemberId] = useState(null);

    useEffect(() => {
        // Get member ID from localStorage or session
        const storedMemberId = localStorage.getItem('memberId') || sessionStorage.getItem('memberId');
        if (storedMemberId) {
            setMemberId(storedMemberId);
            loadNotifications(storedMemberId);
        } else {
            setLoading(false);
        }
    }, []);

    const loadNotifications = async (memberIdParam) => {
        setLoading(true);
        try {
            const data = await getNotificationsByMember(memberIdParam);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
            alert('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (status, category) => {
        setFilterStatus(status);
        setFilterCategory(category);
    };

    const getFilteredNotifications = () => {
        return notifications.filter(notification => {
            const statusMatch = filterStatus === 'ALL' || notification.status === filterStatus;
            const categoryMatch = filterCategory === 'ALL' || notification.category === categoryMatch;
            return statusMatch && categoryMatch;
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const colors = {
            PENDING: '#f39c12',
            SENT: '#27ae60',
            FAILED: '#e74c3c'
        };
        return {
            backgroundColor: colors[status] || '#95a5a6',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
        };
    };

    const getCategoryBadge = (category) => {
        const colors = {
            DUE_DATE_REMINDER: '#3498db',
            OVERDUE_REMINDER: '#e74c3c',
            RESERVATION_READY: '#9b59b6',
            RESERVATION_APPROVAL: '#8e44ad',
            RESERVATION_CANCELLATION: '#e67e22',
            FINE_NOTICE: '#e67e22',
            FINE_WAIVER: '#27ae60',
            PAYMENT_CONFIRMATION: '#27ae60',
            BORROW_APPROVAL: '#2ecc71',
            BORROW_REJECTION: '#e74c3c',
            BOOK_RETURN: '#3498db',
            GENERAL: '#95a5a6'
        };
        return {
            backgroundColor: colors[category] || '#95a5a6',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem'
        };
    };

    const getCategoryDisplayName = (category) => {
        const names = {
            DUE_DATE_REMINDER: 'Due Date Reminder',
            OVERDUE_REMINDER: 'Overdue Reminder',
            RESERVATION_READY: 'Reservation Ready',
            RESERVATION_APPROVAL: 'Reservation Approved',
            RESERVATION_CANCELLATION: 'Reservation Cancelled',
            FINE_NOTICE: 'Fine Notice',
            FINE_WAIVER: 'Fine Waived',
            PAYMENT_CONFIRMATION: 'Payment Received',
            BORROW_APPROVAL: 'Borrow Approved',
            BORROW_REJECTION: 'Borrow Rejected',
            BOOK_RETURN: 'Book Returned',
            GENERAL: 'General'
        };
        return names[category] || category;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.container}>
                    <p>Loading notifications...</p>
                </div>
            </>
        );
    }

    if (!memberId) {
        return (
            <>
                <Navbar />
                <div style={styles.container}>
                    <div style={styles.errorMessage}>
                        <h2>Access Denied</h2>
                        <p>Please log in as a member to view your notifications.</p>
                        <a href="/member" style={styles.loginLink}>Go to Member Login</a>
                    </div>
                </div>
            </>
        );
    }

    const filteredNotifications = getFilteredNotifications();

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>My Notifications</h1>

                <div style={styles.filterSection}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Status:</label>
                        <select
                            style={styles.filterSelect}
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value, filterCategory)}
                        >
                            <option value="ALL">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="SENT">Sent</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Category:</label>
                        <select
                            style={styles.filterSelect}
                            value={filterCategory}
                            onChange={(e) => handleFilterChange(filterStatus, e.target.value)}
                        >
                            <option value="ALL">All</option>
                            <option value="DUE_DATE_REMINDER">Due Date Reminders</option>
                            <option value="OVERDUE_REMINDER">Overdue Reminders</option>
                            <option value="RESERVATION_READY">Reservation Ready</option>
                            <option value="RESERVATION_APPROVAL">Reservation Approved</option>
                            <option value="FINE_NOTICE">Fine Notices</option>
                            <option value="PAYMENT_CONFIRMATION">Payment Confirmations</option>
                            <option value="BORROW_APPROVAL">Borrow Approved</option>
                            <option value="BOOK_RETURN">Book Returns</option>
                            <option value="GENERAL">General</option>
                        </select>
                    </div>
                </div>

                <div style={styles.notificationsList}>
                    {filteredNotifications.length === 0 ? (
                        <div style={styles.emptyMessage}>
                            <h3>No notifications found</h3>
                            <p>You don't have any notifications matching the selected filters.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div key={notification.id} style={styles.notificationCard}>
                                <div style={styles.notificationHeader}>
                                    <div style={styles.notificationTitle}>
                                        <h3 style={styles.subject}>{notification.subject}</h3>
                                        <div style={styles.badges}>
                                            <span style={getCategoryBadge(notification.category)}>
                                                {getCategoryDisplayName(notification.category)}
                                            </span>
                                            <span style={getStatusBadge(notification.status)}>
                                                {notification.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.notificationDate}>
                                        {formatDateTime(notification.createdAt)}
                                    </div>
                                </div>

                                <div style={styles.notificationBody}>
                                    <p style={styles.message}>{notification.message}</p>
                                </div>

                                <div style={styles.notificationFooter}>
                                    <span style={styles.notificationType}>
                                        📧 {notification.type}
                                    </span>
                                    {notification.sentAt && (
                                        <span style={styles.sentDate}>
                                            Sent: {formatDateTime(notification.sentAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 60px)',
    },
    title: {
        color: '#2c3e50',
        marginBottom: '2rem',
        textAlign: 'center',
    },
    filterSection: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    filterLabel: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    filterSelect: {
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    notificationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e1e8ed',
    },
    notificationHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    },
    notificationTitle: {
        flex: 1,
    },
    subject: {
        margin: '0 0 0.5rem 0',
        color: '#2c3e50',
        fontSize: '1.1rem',
    },
    badges: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    notificationDate: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        marginLeft: '1rem',
    },
    notificationBody: {
        marginBottom: '1rem',
    },
    message: {
        color: '#34495e',
        lineHeight: '1.6',
        margin: 0,
        whiteSpace: 'pre-line',
    },
    notificationFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #ecf0f1',
        fontSize: '0.9rem',
        color: '#7f8c8d',
    },
    notificationType: {
        fontWeight: 'bold',
    },
    sentDate: {
        fontStyle: 'italic',
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    errorMessage: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#e74c3c',
    },
    loginLink: {
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
};