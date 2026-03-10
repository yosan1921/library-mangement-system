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

// Add CSS for animations and responsive behavior
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .notifications-main {
                margin-left: 0 !important;
                padding: 1rem !important;
            }
            .notifications-title {
                font-size: 2rem !important;
            }
            .notifications-content {
                padding: 1rem !important;
            }
            .notifications-stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
            .notifications-filter-section {
                flex-direction: column !important;
                align-items: stretch !important;
            }
            .notifications-action-buttons {
                margin-left: 0 !important;
                width: 100%;
            }
            .notifications-desktop-table {
                display: none !important;
            }
            .notifications-mobile-cards {
                display: block !important;
            }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
            .notifications-stats-grid {
                grid-template-columns: repeat(3, 1fr) !important;
            }
            .notifications-desktop-table {
                display: none !important;
            }
            .notifications-mobile-cards {
                display: block !important;
            }
        }
        
        @media (min-width: 1025px) {
            .notifications-desktop-table {
                display: block !important;
            }
            .notifications-mobile-cards {
                display: none !important;
            }
        }
        
        .notifications-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .notifications-button:active {
            transform: translateY(0);
        }
        
        .notifications-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .notifications-tab:hover {
            background-color: #f1f5f9;
            color: #3b82f6;
        }
        
        .notifications-tr:hover {
            background-color: #f8fafc;
        }
        
        .notifications-loading-spinner {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

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

            let message = `📊 Bulk Send Results:\n\n`;
            message += `✅ Sent: ${result.sent}\n`;
            message += `❌ Failed: ${result.failed}\n`;
            message += `📝 Total: ${result.total}\n\n`;

            if (result.failed > 0) {
                message += `⚠️ Some notifications failed to send.\n\n`;
                message += `Common reasons:\n`;
                message += `• Member doesn't have an email address\n`;
                message += `• Email address is invalid\n`;
                message += `• Email notifications are disabled\n`;
                message += `• SMTP connection issues\n\n`;
                message += `💡 Tip: Check the "All Notifications" list to see which ones failed and view error details.`;
            } else {
                message += `🎉 All notifications sent successfully!`;
            }

            alert(message);
            setSelectedNotifications([]);
            loadData();
        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            alert('Failed to send bulk notifications: ' + (error.message || 'Unknown error'));
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
                errorMessage += 'Cannot connect to backend server.\n\nPlease ensure:\n1. Backend is running (mvn spring-boot:run)\n2. Backend is accessible at http://localhost:8080';
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
            PENDING: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
            SENT: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
            FAILED: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' }
        };
        const style = colors[status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        return {
            backgroundColor: style.bg,
            color: style.color,
            padding: '0.375rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: `1px solid ${style.border}`,
            display: 'inline-block',
        };
    };

    const getCategoryBadge = (category) => {
        const colors = {
            DUE_DATE_REMINDER: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
            OVERDUE_REMINDER: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
            RESERVATION_READY: { bg: '#e9d5ff', color: '#6b21a8', border: '#d8b4fe' },
            FINE_NOTICE: { bg: '#fed7aa', color: '#9a3412', border: '#fdba74' },
            GENERAL: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
        };
        const style = colors[category] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
        return {
            backgroundColor: style.bg,
            color: style.color,
            padding: '0.375rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: `1px solid ${style.border}`,
            display: 'inline-block',
        };
    };

    const renderStatistics = () => (
        <div style={styles.statsSection}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>📊</span>
                    Notification Statistics
                </h2>
            </div>
            {statistics && (
                <div style={styles.statsGrid} className="notifications-stats-grid">
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📬</div>
                        <p style={styles.statValue}>{statistics.total}</p>
                        <p style={styles.statLabel}>Total</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <p style={{ ...styles.statValue, color: '#10b981' }}>{statistics.sent}</p>
                        <p style={styles.statLabel}>Sent</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏳</div>
                        <p style={{ ...styles.statValue, color: '#f59e0b' }}>{statistics.pending}</p>
                        <p style={styles.statLabel}>Pending</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>❌</div>
                        <p style={{ ...styles.statValue, color: '#ef4444' }}>{statistics.failed}</p>
                        <p style={styles.statLabel}>Failed</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📅</div>
                        <p style={styles.statValue}>{statistics.dueDateReminders}</p>
                        <p style={styles.statLabel}>Due Date Reminders</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⚠️</div>
                        <p style={styles.statValue}>{statistics.overdueReminders}</p>
                        <p style={styles.statLabel}>Overdue Reminders</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📖</div>
                        <p style={styles.statValue}>{statistics.reservationNotifications}</p>
                        <p style={styles.statLabel}>Reservation Notices</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>💰</div>
                        <p style={styles.statValue}>{statistics.fineNotifications}</p>
                        <p style={styles.statLabel}>Fine Notices</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderListTab = () => (
        <div style={styles.tabContent}>
            {renderStatistics()}

            <div style={styles.filterSection} className="notifications-filter-section">
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

                <div style={styles.actionButtons} className="notifications-action-buttons">
                    <button
                        style={{ ...styles.button, ...styles.primaryButton }}
                        className="notifications-button"
                        onClick={selectAll}
                    >
                        {selectedNotifications.length === notifications.length ? '☑️ Deselect All' : '☐ Select All'}
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.successButton }}
                        className="notifications-button"
                        onClick={handleSendBulk}
                        disabled={selectedNotifications.length === 0}
                    >
                        📤 Send Selected ({selectedNotifications.length})
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.warningButton }}
                        className="notifications-button"
                        onClick={handleDeleteOld}
                    >
                        🗑️ Delete Old
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.infoButton }}
                        className="notifications-button"
                        onClick={handleTriggerAutomatic}
                    >
                        ⚡ Trigger Automatic
                    </button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                {/* Desktop Table View */}
                <div className="notifications-desktop-table">
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
                                <tr key={notification.id} style={styles.tr} className="notifications-tr">
                                    <td style={styles.td}>
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={() => toggleSelection(notification.id)}
                                        />
                                    </td>
                                    <td style={styles.td}>{notification.memberName || 'Unknown'}</td>
                                    <td style={styles.td}>
                                        <span style={getCategoryBadge(notification.category)}>
                                            {notification.category}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{notification.subject}</td>
                                    <td style={styles.td}>{notification.type}</td>
                                    <td style={styles.td}>
                                        <span
                                            style={getStatusBadge(notification.status)}
                                            title={notification.status === 'FAILED' && notification.errorMessage ? `Error: ${notification.errorMessage}` : ''}
                                        >
                                            {notification.status}
                                        </span>
                                        {notification.status === 'FAILED' && notification.errorMessage && (
                                            <div style={styles.errorHint}>
                                                ⚠️ Hover to see error
                                            </div>
                                        )}
                                    </td>
                                    <td style={styles.td}>{formatDateTime(notification.createdAt)}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionButtonsGroup}>
                                            {notification.status === 'PENDING' && (
                                                <button
                                                    style={{ ...styles.smallButton, ...styles.successButton }}
                                                    className="notifications-button"
                                                    onClick={() => handleSendNotification(notification.id)}
                                                >
                                                    📤 Send
                                                </button>
                                            )}
                                            {notification.status === 'FAILED' && (
                                                <>
                                                    <button
                                                        style={{ ...styles.smallButton, ...styles.warningButton }}
                                                        className="notifications-button"
                                                        onClick={() => alert(`❌ Error Details:\n\n${notification.errorMessage || 'No error message available'}\n\n💡 Common fixes:\n• Check member has valid email\n• Verify email settings in System Settings\n• Ensure email notifications are enabled`)}
                                                    >
                                                        ⚠️ View Error
                                                    </button>
                                                    <button
                                                        style={{ ...styles.smallButton, ...styles.successButton, marginLeft: '0.5rem' }}
                                                        className="notifications-button"
                                                        onClick={() => handleSendNotification(notification.id)}
                                                    >
                                                        🔄 Retry
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                style={{ ...styles.smallButton, ...styles.dangerButton, marginLeft: '0.5rem' }}
                                                className="notifications-button"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="notifications-mobile-cards">
                    {notifications.map(notification => (
                        <div key={notification.id} style={styles.mobileCard} className="notifications-card">
                            <div style={styles.cardHeader}>
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.includes(notification.id)}
                                    onChange={() => toggleSelection(notification.id)}
                                    style={styles.cardCheckbox}
                                />
                                <div style={styles.cardHeaderContent}>
                                    <h4 style={styles.cardTitle}>{notification.subject}</h4>
                                    <span style={getStatusBadge(notification.status)}>
                                        {notification.status}
                                    </span>
                                </div>
                            </div>
                            <div style={styles.cardContent}>
                                <div style={styles.cardRow}>
                                    <span style={styles.cardLabel}>Member:</span>
                                    <span>{notification.memberName || 'Unknown'}</span>
                                </div>
                                <div style={styles.cardRow}>
                                    <span style={styles.cardLabel}>Category:</span>
                                    <span style={getCategoryBadge(notification.category)}>
                                        {notification.category}
                                    </span>
                                </div>
                                <div style={styles.cardRow}>
                                    <span style={styles.cardLabel}>Type:</span>
                                    <span>{notification.type}</span>
                                </div>
                                <div style={styles.cardRow}>
                                    <span style={styles.cardLabel}>Created:</span>
                                    <span>{formatDateTime(notification.createdAt)}</span>
                                </div>
                                {notification.status === 'FAILED' && notification.errorMessage && (
                                    <div style={styles.errorBox}>
                                        <span style={styles.errorIcon}>⚠️</span>
                                        <span style={styles.errorText}>{notification.errorMessage}</span>
                                    </div>
                                )}
                            </div>
                            <div style={styles.cardActions}>
                                {notification.status === 'PENDING' && (
                                    <button
                                        style={{ ...styles.button, ...styles.successButton }}
                                        className="notifications-button"
                                        onClick={() => handleSendNotification(notification.id)}
                                    >
                                        📤 Send
                                    </button>
                                )}
                                {notification.status === 'FAILED' && (
                                    <>
                                        <button
                                            style={{ ...styles.button, ...styles.warningButton }}
                                            className="notifications-button"
                                            onClick={() => alert(`❌ Error Details:\n\n${notification.errorMessage || 'No error message available'}\n\n💡 Common fixes:\n• Check member has valid email\n• Verify email settings in System Settings\n• Ensure email notifications are enabled`)}
                                        >
                                            ⚠️ View Error
                                        </button>
                                        <button
                                            style={{ ...styles.button, ...styles.successButton }}
                                            className="notifications-button"
                                            onClick={() => handleSendNotification(notification.id)}
                                        >
                                            🔄 Retry
                                        </button>
                                    </>
                                )}
                                <button
                                    style={{ ...styles.button, ...styles.dangerButton }}
                                    className="notifications-button"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <p style={styles.emptyMessage}>No notifications found</p>
                        <p style={styles.emptySubtext}>Notifications will appear here when created</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCreateTab = () => (
        <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>✉️</span>
                    Create Custom Notification
                </h2>
            </div>
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
                                {member.name} ({member.email || 'No email'})
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

                <button
                    type="submit"
                    style={{ ...styles.button, ...styles.primaryButton }}
                    className="notifications-button"
                >
                    ✉️ Create Notification
                </button>
            </form>
        </div>
    );

    const renderTestTab = () => (
        <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                    <span style={styles.sectionIcon}>🧪</span>
                    Test Notification Configuration
                </h2>
            </div>
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

                <button
                    type="submit"
                    style={{ ...styles.button, ...styles.primaryButton }}
                    className="notifications-button"
                >
                    🧪 Send Test Notifications
                </button>
            </form>

            <div style={styles.infoBox}>
                <div style={styles.infoHeader}>
                    <span style={styles.infoIcon}>💡</span>
                    <h3 style={styles.infoTitle}>Configuration Tips</h3>
                </div>
                <ul style={styles.tipsList}>
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
                    <main style={styles.main} className="notifications-main">
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner} className="notifications-loading-spinner"></div>
                            <p style={styles.loadingText}>Loading notifications...</p>
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
                <main style={styles.main} className="notifications-main">
                    <div style={styles.header}>
                        <h1 style={styles.title} className="notifications-title">
                            <span style={styles.titleIcon}>🔔</span>
                            Notifications Management
                        </h1>
                    </div>

                    <div style={styles.tabsContainer}>
                        <div style={styles.tabs}>
                            <button
                                style={activeTab === 'list' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="notifications-tab"
                                onClick={() => setActiveTab('list')}
                            >
                                <span style={styles.tabIcon}>📋</span>
                                All Notifications
                            </button>
                            <button
                                style={activeTab === 'create' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="notifications-tab"
                                onClick={() => setActiveTab('create')}
                            >
                                <span style={styles.tabIcon}>✉️</span>
                                Create Custom
                            </button>
                            <button
                                style={activeTab === 'test' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                                className="notifications-tab"
                                onClick={() => setActiveTab('test')}
                            >
                                <span style={styles.tabIcon}>🧪</span>
                                Test Configuration
                            </button>
                        </div>
                    </div>

                    <div style={styles.content} className="notifications-content">
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
        marginBottom: '2rem',
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
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
    },
    tabContent: {
        width: '100%',
    },
    sectionHeader: {
        marginBottom: '2rem',
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
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    statIcon: {
        fontSize: '2rem',
        marginBottom: '0.5rem',
    },
    statLabel: {
        margin: '0.5rem 0 0 0',
        color: '#64748b',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    statValue: {
        margin: '0.5rem 0',
        color: '#1e293b',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    filterSection: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    filterLabel: {
        fontWeight: '600',
        color: '#374151',
        fontSize: '0.875rem',
    },
    filterSelect: {
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        color: '#374151',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        marginLeft: 'auto',
        flexWrap: 'wrap',
    },
    actionButtonsGroup: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    tableContainer: {
        width: '100%',
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
        backgroundColor: '#f8fafc',
        color: '#374151',
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #e2e8f0',
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
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '1rem',
    },
    cardCheckbox: {
        marginTop: '0.25rem',
    },
    cardHeaderContent: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
        flexWrap: 'wrap',
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
    form: {
        maxWidth: '600px',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#374151',
        fontWeight: '600',
        fontSize: '0.875rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        boxSizing: 'border-box',
        color: '#374151',
        transition: 'border-color 0.2s ease',
    },
    helpText: {
        color: '#64748b',
        fontSize: '0.875rem',
        marginBottom: '1.5rem',
        lineHeight: '1.6',
    },
    button: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
    },
    smallButton: {
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        whiteSpace: 'nowrap',
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        color: 'white',
    },
    successButton: {
        backgroundColor: '#10b981',
        color: 'white',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
        color: 'white',
    },
    warningButton: {
        backgroundColor: '#f59e0b',
        color: 'white',
    },
    infoButton: {
        backgroundColor: '#8b5cf6',
        color: 'white',
    },
    infoBox: {
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
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
        fontSize: '1.125rem',
        fontWeight: '600',
    },
    tipsList: {
        margin: '0',
        paddingLeft: '1.5rem',
        color: '#475569',
        lineHeight: '1.8',
    },
    errorHint: {
        fontSize: '0.7rem',
        color: '#ef4444',
        marginTop: '0.25rem',
        fontStyle: 'italic',
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        padding: '0.75rem',
        borderRadius: '8px',
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        border: '1px solid #fecaca',
    },
    errorIcon: {
        fontSize: '1rem',
        flexShrink: 0,
    },
    errorText: {
        fontSize: '0.875rem',
        color: '#991b1b',
        lineHeight: '1.4',
    },
};
