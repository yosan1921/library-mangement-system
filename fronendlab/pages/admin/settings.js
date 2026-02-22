import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getSettings,
    updateSettings,
    resetToDefaults,
    getBackupStatistics,
    exportBackup,
    restoreBackup
} from '../../services/settingsService';

export default function SystemSettings() {
    const [activeTab, setActiveTab] = useState('policies');
    const [settings, setSettings] = useState(null);
    const [backupStats, setBackupStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsData, statsData] = await Promise.all([
                getSettings(),
                getBackupStatistics()
            ]);
            setSettings(settingsData);
            setFormData(settingsData);
            setBackupStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await updateSettings(formData);
            alert('Settings saved successfully');
            loadData();
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = async () => {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) return;

        setSaving(true);
        try {
            await resetToDefaults();
            alert('Settings reset to defaults');
            loadData();
        } catch (error) {
            console.error('Error resetting settings:', error);
            alert('Failed to reset settings');
        } finally {
            setSaving(false);
        }
    };

    const handleExportBackup = async () => {
        try {
            await exportBackup();
            alert('Backup exported successfully');
        } catch (error) {
            console.error('Error exporting backup:', error);
            alert('Failed to export backup');
        }
    };

    const handleImportBackup = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('WARNING: Restoring a backup will add data to the database. Continue?')) {
            event.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);
            await restoreBackup(backupData);
            alert('Backup restored successfully');
            loadData();
        } catch (error) {
            console.error('Error restoring backup:', error);
            alert('Failed to restore backup: ' + error.message);
        }
        event.target.value = '';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const renderPoliciesTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Library Policies</h2>

            <div style={styles.formGroup}>
                <label style={styles.label}>Maximum Books Per Member</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.maxBooksPerMember || ''}
                    onChange={(e) => handleInputChange('maxBooksPerMember', parseInt(e.target.value))}
                    min="1"
                    max="20"
                />
                <small style={styles.helpText}>Maximum number of books a member can borrow at once</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Borrow Duration (Days)</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.borrowDurationDays || ''}
                    onChange={(e) => handleInputChange('borrowDurationDays', parseInt(e.target.value))}
                    min="1"
                    max="90"
                />
                <small style={styles.helpText}>Number of days a book can be borrowed</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Fine Per Day ($)</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.finePerDay || ''}
                    onChange={(e) => handleInputChange('finePerDay', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                />
                <small style={styles.helpText}>Fine amount charged per day for overdue books</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Maximum Renewals</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.maxRenewals || ''}
                    onChange={(e) => handleInputChange('maxRenewals', parseInt(e.target.value))}
                    min="0"
                    max="10"
                />
                <small style={styles.helpText}>Maximum times a book can be renewed</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Reservation Expiry (Days)</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.reservationExpiryDays || ''}
                    onChange={(e) => handleInputChange('reservationExpiryDays', parseInt(e.target.value))}
                    min="1"
                    max="14"
                />
                <small style={styles.helpText}>Days to pick up reserved book after notification</small>
            </div>

            <div style={styles.buttonGroup}>
                <button
                    style={{ ...styles.button, ...styles.saveButton }}
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    style={{ ...styles.button, ...styles.resetButton }}
                    onClick={handleResetDefaults}
                    disabled={saving}
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Notification Settings</h2>

            <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.emailNotificationsEnabled || false}
                        onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
                        style={styles.checkbox}
                    />
                    Enable Email Notifications
                </label>
                <small style={styles.helpText}>Send email reminders to members</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.smsNotificationsEnabled || false}
                        onChange={(e) => handleInputChange('smsNotificationsEnabled', e.target.checked)}
                        style={styles.checkbox}
                    />
                    Enable SMS Notifications
                </label>
                <small style={styles.helpText}>Send SMS reminders to members</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Due Date Reminder (Days Before)</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.dueDateReminderDays || ''}
                    onChange={(e) => handleInputChange('dueDateReminderDays', parseInt(e.target.value))}
                    min="0"
                    max="7"
                />
                <small style={styles.helpText}>Send reminder this many days before due date</small>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Overdue Reminder Frequency (Days)</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.overdueReminderDays || ''}
                    onChange={(e) => handleInputChange('overdueReminderDays', parseInt(e.target.value))}
                    min="1"
                    max="7"
                />
                <small style={styles.helpText}>Send overdue reminder every X days</small>
            </div>

            <h3 style={styles.subsectionTitle}>Email Configuration</h3>

            <div style={styles.formGroup}>
                <label style={styles.label}>Email Host</label>
                <input
                    type="text"
                    style={styles.input}
                    value={formData.emailHost || ''}
                    onChange={(e) => handleInputChange('emailHost', e.target.value)}
                    placeholder="smtp.example.com"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Email Port</label>
                <input
                    type="number"
                    style={styles.input}
                    value={formData.emailPort || ''}
                    onChange={(e) => handleInputChange('emailPort', parseInt(e.target.value))}
                    placeholder="587"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Email Username</label>
                <input
                    type="text"
                    style={styles.input}
                    value={formData.emailUsername || ''}
                    onChange={(e) => handleInputChange('emailUsername', e.target.value)}
                    placeholder="notifications@library.com"
                />
            </div>

            <h3 style={styles.subsectionTitle}>SMS Configuration</h3>

            <div style={styles.formGroup}>
                <label style={styles.label}>SMS Provider</label>
                <select
                    style={styles.input}
                    value={formData.smsProvider || ''}
                    onChange={(e) => handleInputChange('smsProvider', e.target.value)}
                >
                    <option value="">Select Provider</option>
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Nexmo</option>
                    <option value="aws-sns">AWS SNS</option>
                </select>
            </div>

            <div style={styles.buttonGroup}>
                <button
                    style={{ ...styles.button, ...styles.saveButton }}
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderLibraryInfoTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Library Information</h2>

            <div style={styles.formGroup}>
                <label style={styles.label}>Library Name</label>
                <input
                    type="text"
                    style={styles.input}
                    value={formData.libraryName || ''}
                    onChange={(e) => handleInputChange('libraryName', e.target.value)}
                    placeholder="My Library"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Library Email</label>
                <input
                    type="email"
                    style={styles.input}
                    value={formData.libraryEmail || ''}
                    onChange={(e) => handleInputChange('libraryEmail', e.target.value)}
                    placeholder="info@library.com"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Library Phone</label>
                <input
                    type="tel"
                    style={styles.input}
                    value={formData.libraryPhone || ''}
                    onChange={(e) => handleInputChange('libraryPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Library Address</label>
                <textarea
                    style={{ ...styles.input, minHeight: '80px' }}
                    value={formData.libraryAddress || ''}
                    onChange={(e) => handleInputChange('libraryAddress', e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                />
            </div>

            <div style={styles.buttonGroup}>
                <button
                    style={{ ...styles.button, ...styles.saveButton }}
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderBackupTab = () => (
        <div style={styles.tabContent}>
            <h2 style={styles.sectionTitle}>Backup & Restore</h2>

            {backupStats && (
                <div style={styles.statsSection}>
                    <h3 style={styles.subsectionTitle}>Database Statistics</h3>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Books</p>
                            <p style={styles.statValue}>{backupStats.totalBooks}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Members</p>
                            <p style={styles.statValue}>{backupStats.totalMembers}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Borrow Records</p>
                            <p style={styles.statValue}>{backupStats.totalBorrowRecords}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Reservations</p>
                            <p style={styles.statValue}>{backupStats.totalReservations}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Fines</p>
                            <p style={styles.statValue}>{backupStats.totalFines}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Payments</p>
                            <p style={styles.statValue}>{backupStats.totalPayments}</p>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.backupSection}>
                <h3 style={styles.subsectionTitle}>Export Backup</h3>
                <p style={styles.helpText}>
                    Download a complete backup of all library data in JSON format.
                    This includes books, members, borrow records, reservations, fines, and payments.
                </p>
                <button
                    style={{ ...styles.button, ...styles.exportButton }}
                    onClick={handleExportBackup}
                >
                    Export Backup
                </button>
            </div>

            <div style={styles.backupSection}>
                <h3 style={styles.subsectionTitle}>Restore Backup</h3>
                <p style={styles.helpText}>
                    Upload a previously exported backup file to restore data.
                    <strong> Warning: This will add data to the existing database.</strong>
                </p>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={styles.fileInput}
                    id="backup-file"
                />
                <label htmlFor="backup-file" style={{ ...styles.button, ...styles.importButton }}>
                    Choose Backup File
                </label>
            </div>

            {settings && settings.lastUpdated && (
                <div style={styles.infoBox}>
                    <p><strong>Last Updated:</strong> {formatDateTime(settings.lastUpdated)}</p>
                    {settings.updatedBy && <p><strong>Updated By:</strong> {settings.updatedBy}</p>}
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
                        <p>Loading settings...</p>
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
                    <h1 style={styles.title}>System Settings</h1>

                    <div style={styles.tabs}>
                        <button
                            style={activeTab === 'policies' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('policies')}
                        >
                            Library Policies
                        </button>
                        <button
                            style={activeTab === 'notifications' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('notifications')}
                        >
                            Notifications
                        </button>
                        <button
                            style={activeTab === 'library' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('library')}
                        >
                            Library Info
                        </button>
                        <button
                            style={activeTab === 'backup' ? { ...styles.tab, ...styles.activeTabStyle } : styles.tab}
                            onClick={() => setActiveTab('backup')}
                        >
                            Backup & Restore
                        </button>
                    </div>

                    <div style={styles.content}>
                        {activeTab === 'policies' && renderPoliciesTab()}
                        {activeTab === 'notifications' && renderNotificationsTab()}
                        {activeTab === 'library' && renderLibraryInfoTab()}
                        {activeTab === 'backup' && renderBackupTab()}
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
        maxWidth: '800px',
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '1.5rem',
        marginTop: 0,
    },
    subsectionTitle: {
        color: '#2c3e50',
        marginTop: '2rem',
        marginBottom: '1rem',
        fontSize: '1.2rem',
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
        display: 'block',
        marginTop: '0.25rem',
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#2c3e50',
        fontWeight: 'bold',
    },
    checkbox: {
        marginRight: '0.75rem',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
    },
    button: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.3s',
    },
    saveButton: {
        backgroundColor: '#27ae60',
        color: 'white',
    },
    resetButton: {
        backgroundColor: '#95a5a6',
        color: 'white',
    },
    exportButton: {
        backgroundColor: '#3498db',
        color: 'white',
    },
    importButton: {
        backgroundColor: '#e67e22',
        color: 'white',
        display: 'inline-block',
    },
    statsSection: {
        marginBottom: '2rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
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
    backupSection: {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    fileInput: {
        display: 'none',
    },
    infoBox: {
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        borderLeft: '4px solid #3498db',
    },
};
