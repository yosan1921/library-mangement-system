import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getAllNotifications,
    getNotificationsByStatus,
    getNotificationsByCategory,
    createCustomNotification,
    sendNotification,
    sendBulkNotifications,
    getNotificationStatistics,
    deleteNotification,
    deleteOldNotifications,
    testNotificationConfiguration,
    triggerAutomaticNotifications
} from '../../services/notificationService';
import { getAllMembers } from '../../services/memberService';

export default function NotificationsManagement() {
    const [activeTab, setActiveTab] = useState('list');
    const [notifications, setNotifications] = useState([]);
    const [members, setMembers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');

    // Custom notification form
    const [customForm, setCustomForm] = useState({
        memberId: '',
        subject: '',
        message: '',
        category: 'GENERAL'
    });

    // Test form
    const [testForm, setTestForm] = useState({
        email: '',
        phone: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [notificationsData, membersData, statsData] = await Promise.all([
                getAllNotifications(),
                getAllMembers(),
                getNotificationStatistics()
            ]);
            setNotifications(notificationsData);
            setMembers(membersData);
            setStatistics(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (status, category) => {
        setFilterStatus(status);
        setFilterCategory(category);

        try {
            let data;
            if (status !== 'ALL' && category !== 'ALL') {
                data = await getAllNotifications();
                data = data.filter(n => n.status === status && n.category === category);
            } else if (status !== 'ALL') {
                data = await getNotificationsByStatus(status);
            } else if (category !== 'ALL') {
                data = await getNotificationsByCategory(category);
            } else {
                data = await getAllNotifications();
            }
            setNotifications(data);
        } catch (error) {
            console.error('Error filtering notifications:', error);
        }
    };

    const handleSendNotification = async (notificationId) => {
        try {
            await sendNotification(notificationId);
            alert('Notification sent successfully');
            loadData();
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification');
        }
    };

    const handleSendBulk = async () => {
        if (selectedNotifications.length === 0) {
            alert('Please select notifications to send');
            return;
        }

        try {
            const result = await sendBulkNotifications(selectedNotifications);
            alert(`Sent: ${result.sent}, Failed: ${result.failed}`);
            setSelectedNotifications([]);
            loadData();
        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            alert('Failed to send bulk notifications');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            await deleteNotification(notificationId);
            alert('Notification deleted successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Failed to delete notification');
        }
    };

    const handleDeleteOld = async () => {
        if (!confirm('Delete all notifications older than 90 days?')) return;

        try {
            const result = await deleteOldNotifications();
            alert(`Deleted ${result.count} old notifications`);
            loadData();
        } catch (error) {
            console.error('Error deleting old notifications:', error);
            alert('Failed to delete old notifications');
        }
    };

    const handleCreateCustom = async (e) => {
        e.preventDefault();

        if (!customForm.memberId || !customForm.subject || !customForm.message) {
            alert('Please fill all required fields');
            return;
        }

        try {
            await createCustomNotification(
                customForm.memberId,
                customForm.subject,
                customForm.message,
                customForm.category
            );
            alert('Notification created successfully');
            setCustomForm({ memberId: '', subject: '', message: '', category: 'GENERAL' });
            loadData();
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Failed to create notification');
        }
    };

    const handleTestConfiguration = async (e) => {
        e.preventDefault();

        if (!testForm.email && !testForm.phone) {
            alert('Please provide at least email or phone number');
            return;
        }

        try {
            const result = await testNotificationConfiguration(testForm.email, testForm.phone);
            let message = '';

            if (result.emailStatus) {
                message += `📧 Email: ${result.emailStatus}\n${result.emailMessage}\n\n`;
            }
            if (result.smsStatus) {
                message += `📱 SMS: ${result.smsStatus}\n${result.smsMessage}`;
            }

            if (!message) {
                message = 'No notification methods are configured.\n\nPlease enable and configure email or SMS in:\nAdmin Panel → System Settings → Notifications';
            }

            alert(message);
        } catch (error) {
            console.error('Error testing configuration:', error);
            let errorMessage = 'Failed to test configuration.\n\n';

            if (error.response) {
                errorMessage += `Server Error: ${error.response.status}\n`;
                if (error.response.data && error.response.data.error) {
                    errorMessage += `Details: ${error.response.data.error}`;
                } else if (error.response.data && error.response.data.message) {
                    errorMessage += `Details: ${error.response.data.message}`;
                }
            } else if (error.request) {
                errorMessage += 'Cannot connect to backend server.\n\nPlease ensure:\n1. Backend is running (mvn spring-boot:run)\n2. Backend is accessible at http://localhost:8081';
            } else {
                errorMessage += `Error: ${error.message}`;
            }

            alert(errorMessage);
        }
    };

    const handleTriggerAutomatic = async () => {
        if (!confirm('Trigger automatic notifications now?')) return;

        try {
            await triggerAutomaticNotifications();
            alert('Automatic notifications triggered successfully');
            loadData();
        } catch (error) {
            console.error('Error triggering notifications:', error);
            alert('Failed to trigger notifications');
        }
    };

    const toggleSelection = (notificationId) => {
        setSelectedNotifications(prev => {
            if (prev.includes(notificationId)) {
                return prev.filter(id => id !== notificationId);
            } else {
                return [...prev, notificationId];
            }
        });
    };

    const selectAll = () => {
        if (selectedNotifications.length === notifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(notifications.map(n => n.id));
        }
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
            FINE_NOTICE: '#e67e22',
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

    const renderStatistics = () => (
        <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}>Notification Statistics</h2>
            {statistics && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Total</p>
                        <p style={styles.statValue}>{statistics.total}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Sent</p>
                        <p style={{ ...styles.statValue, color: '#27ae60' }}>{statistics.sent}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Pending</p>
                        <p style={{ ...styles.statValue, color: '#f39c12' }}>{statistics.pending}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Failed</p>
                        <p style={{ ...styles.statValue, color: '#e74c3c' }}>{statistics.failed}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Due Date Reminders</p>
                        <p style={styles.statValue}>{statistics.dueDateReminders}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Overdue Reminders</p>
                        <p style={styles.statValue}>{statistics.overdueReminders}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Reservation Notices</p>
                        <p style={styles.statValue}>{statistics.reservationNotifications}</p>
                    </div>
                    <div style={styles.statCard}>
                        <p style={styles.statLabel}>Fine Notices</p>
                        <p style={styles.statValue}>{statistics.fineNotifications}</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderListTab = () => (
        <div style={styles.tabContent}>
            {renderStatistics()}

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
                        <option value="DUE_DATE_REMINDER">Due Date Reminder</option>
                        <option value="OVERDUE_REMINDER">Overdue Reminder</option>
                        <option value="RESERVATION_READY">Reservation Ready</option>
                        <option value="FINE_NOTICE">Fine Notice</option>
                        <option value="GENERAL">General</option>
                    </select>
                </div>

                <div style={styles.actionButtons}>
                    <button style={{ ...styles.button, ...styles.primaryButton }} onClick={selectAll}>
                        {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.successButton }}
                        onClick={handleSendBulk}
                        disabled={selectedNotifications.length === 0}
                    >
                        Send Selected ({selectedNotifications.length})
                    </button>
                    <button style={{ ...styles.button, ...styles.warningButton }} onClick={handleDeleteOld}>
                        Delete Old
                    </button>
                    <button style={{ ...styles.button, ...styles.infoButton }} onClick={handleTriggerAutomatic}>
                        Trigger Automatic
                    </button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                                    onChange={selectAll}
                                />
                            </th>
                            <th style={styles.th}>Member</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Created</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map(notification => (
                            <tr key={notification.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.includes(notification.id)}
                                        onChange={() => toggleSelection(notification.id)}
                                    />
                                </td>
                                <td style={styles.td}>{notification.memberName}</td>
                                <td style={styles.td}>
                                    <span style={getCategoryBadge(notification.category)}>
                                        {notification.category}
                                    </span>
                                </td>
                                <td style={styles.td}>{notification.subject}</td>
                                <td style={styles.td}>{notification.type}</td>
                                <td style={styles.td}>
                                    <span style={getStatusBadge(notification.status)}>
                                        {notification.status}
                                    </span>
                                </td>
                                <td style={styles.td}>{formatDateTime(notification.createdAt)}</td>
                                <td style={styles.td}>
                                    {notification.status === 'PENDING' && (
                                        <button
                                            style={{ ...styles.smallButton, ...styles.successButton }}
                                            onClick={() => handleSendNotification(notification.id)}
                                        >
                                            Send
                                        </button>
                                    )}
                                    <button
                                        style={{ ...styles.smallButton, ...styles.dangerButton, marginLeft: '0.5rem' }}
                                        onClick={() => handleDeleteNotification(notification.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {notifications.length === 0 && (
                    <p style={styles.emptyMessage}>No notifications found</p>
                )}
            </div>
        </div>
    );

    const renderCreateTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Create Custom Notification</h2>
            <form onSubmit={handleCreateCustom} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Select Member *</label>
                    <select
                        style={styles.input}
                        value={customForm.memberId}
                        onChange={(e) => setCustomForm({ ...customForm, memberId: e.target.value })}
                        required
                    >
                        <option value="">Choose a member...</option>
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name} ({member.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                        style={styles.input}
                        value={customForm.category}
                        onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                    >
                        <option value="GENERAL">General</option>
                        <option value="DUE_DATE_REMINDER">Due Date Reminder</option>
                        <option value="OVERDUE_REMINDER">Overdue Reminder</option>
                        <option value="RESERVATION_READY">Reservation Ready</option>
                        <option value="FINE_NOTICE">Fine Notice</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Subject *</label>
                    <input
                        type="text"
                        style={styles.input}
                        value={customForm.subject}
                        onChange={(e) => setCustomForm({ ...customForm, subject: e.target.value })}
                        placeholder="Enter notification subject"
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Message *</label>
                    <textarea
                        style={{ ...styles.input, minHeight: '150px' }}
                        value={customForm.message}
                        onChange={(e) => setCustomForm({ ...customForm, message: e.target.value })}
                        placeholder="Enter notification message"
                        required
                    />
                </div>

                <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
                    Create Notification
                </button>
            </form>
        </div>
    );

    const renderTestTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Test Notification Configuration</h2>
            <p style={styles.helpText}>
                Send test notifications to verify your email and SMS configuration is working correctly.
            </p>

            <form onSubmit={handleTestConfiguration} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Test Email Address</label>
                    <input
                        type="email"
                        style={styles.input}
                        value={testForm.email}
                        onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
                        placeholder="test@example.com"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Test Phone Number</label>
                    <input
                        type="tel"
                        style={styles.input}
                        value={testForm.phone}
                        onChange={(e) => setTestForm({ ...testForm, phone: e.target.value })}
                        placeholder="+1234567890"
                    />
                </div>

                <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
                    Send Test Notifications
                </button>
            </form>

            <div style={styles.infoBox}>
                <h3>Configuration Tips:</h3>
                <ul>
                    <li>For Gmail, use an App Password instead of your regular password</li>
                    <li>Enable "Less secure app access" or use OAuth2 for better security</li>
                    <li>For SMS, ensure you have valid API credentials from your provider</li>
                    <li>Check your spam folder if test emails don't arrive</li>
                </ul>
            </div>
        </div>
    );

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={styles.layout}>
                    <Sidebar role="admin" />
                    <main style={styles.main}>
                        <p>Loading notifications...</p>
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
                    <h1 style={styles.title}>Notifications Management</h1>

                    <div style={styles.tabs}>
                        <button
                            style={activeTab === 'list' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('list')}
                        >
                            All Notifications
                        </button>
                        <button
                            style={activeTab === 'create' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('create')}
                        >
                            Create Custom
                        </button>
                        <button
                            style={activeTab === 'test' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('test')}
                        >
                            Test Configuration
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'list' && renderListTab()}
                        {activeTab === 'create' && renderCreateTab()}
                        {activeTab === 'test' && renderTestTab()}
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
        marginBottom: '2rem',
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
    tabContent: {
        width: '100%',
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '1.5rem',
        marginTop: 0,
    },
    statsSection: {
        marginBottom: '2rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
    },
    statLabel: {
        margin: 0,
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    statValue: {
        margin: '0.5rem 0 0 0',
        color: '#2c3e50',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    filterSection: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
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
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginLeft: 'auto',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        backgroundColor: '#34495e',
        color: 'white',
        padding: '1rem',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    tr: {
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '1rem',
    },
    emptyMessage: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d',
    },
    form: {
        maxWidth: '600px',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#2c3e50',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    helpText: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        marginBottom: '1rem',
    },
    button: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.3s',
    },
    smallButton: {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
    primaryButton: {
        backgroundColor: '#3498db',
        color: 'white',
    },
    successButton: {
        backgroundColor: '#27ae60',
        color: 'white',
    },
    dangerButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
    },
    warningButton: {
        backgroundColor: '#f39c12',
        color: 'white',
    },
    infoButton: {
        backgroundColor: '#9b59b6',
        color: 'white',
    },
    infoBox: {
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        borderLeft: '4px solid #3498db',
    },
};
