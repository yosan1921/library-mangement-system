import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import withAuth from '../../components/authGuard';

function MemberDashboard() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [stats, setStats] = useState({
        activeBorrows: 0,
        totalBorrowed: 0,
        unpaidFines: 0,
        totalOutstanding: 0,
        activeReservations: 0
    });
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [unpaidFines, setUnpaidFines] = useState([]);
    const [upcomingDueDates, setUpcomingDueDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get member ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            loadDashboardData(user.id);
            setMember(user);
        } else {
            setError('User not found. Please login again.');
            router.push('/member-login');
        }
    }, [router]);

    const loadDashboardData = async (memberId) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8080/api/members/${memberId}/dashboard`);

            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }

            const data = await response.json();

            // Set statistics
            setStats(data.stats || {
                activeBorrows: 0,
                totalBorrowed: 0,
                unpaidFines: 0,
                totalOutstanding: 0,
                activeReservations: 0
            });

            // Set active borrows
            setActiveBorrows(data.activeBorrows || []);

            // Set unpaid fines
            setUnpaidFines(data.unpaidFines || []);

            // Calculate upcoming due dates (within 3 days)
            const today = new Date();
            const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
            const upcoming = (data.activeBorrows || []).filter(borrow => {
                if (!borrow.dueDate) return false;
                const dueDate = new Date(borrow.dueDate);
                return dueDate >= today && dueDate <= threeDaysFromNow;
            });
            setUpcomingDueDates(upcoming);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <>
                <Navbar />
                <div style={styles.layout}>
                    <Sidebar role="member" />
                    <main style={styles.main}>
                        <div style={styles.errorContainer}>
                            <h2 style={styles.errorTitle}>Error</h2>
                            <p style={styles.errorMessage}>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                style={styles.retryButton}
                            >
                                Retry
                            </button>
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
                <Sidebar role="member" />
                <main style={styles.main}>
                    <div style={styles.welcomeSection}>
                        <h1 style={styles.title}>Welcome back, {member?.name || 'Member'}!</h1>
                        <p style={styles.subtitle}>Here's your library account overview</p>
                    </div>

                    {/* Stats Grid */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📚</div>
                            <h3 style={styles.statLabel}>Active Borrows</h3>
                            <p style={styles.statNumber}>{stats.activeBorrows}</p>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📖</div>
                            <h3 style={styles.statLabel}>Total Borrowed</h3>
                            <p style={{ ...styles.statNumber, color: '#3498db' }}>{stats.totalBorrowed}</p>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>💰</div>
                            <h3 style={styles.statLabel}>Outstanding Fines</h3>
                            <p style={{ ...styles.statNumber, color: '#e74c3c' }}>
                                ${(stats.totalOutstanding || 0).toFixed(2)}
                            </p>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📅</div>
                            <h3 style={styles.statLabel}>Active Reservations</h3>
                            <p style={{ ...styles.statNumber, color: '#f39c12' }}>{stats.activeReservations}</p>
                        </div>
                    </div>

                    {/* Upcoming Due Dates Alert */}
                    {upcomingDueDates.length > 0 && (
                        <div style={styles.alertBox}>
                            <h3 style={styles.alertTitle}>⚠️ Upcoming Due Dates</h3>
                            <p>You have {upcomingDueDates.length} book(s) due within the next 3 days!</p>
                            {upcomingDueDates.map(borrow => (
                                <div key={borrow.id} style={styles.alertItem}>
                                    <span>Book ID: {borrow.bookID}</span>
                                    <span style={styles.dueDate}>
                                        Due: {new Date(borrow.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Outstanding Fines Alert */}
                    {unpaidFines.length > 0 && (
                        <div style={styles.fineAlertBox}>
                            <h3 style={styles.fineAlertTitle}>💰 Outstanding Fines</h3>
                            <p>You have {unpaidFines.length} unpaid fine(s) totaling ${(stats.totalOutstanding || 0).toFixed(2)}</p>
                            <button
                                onClick={() => router.push('/member/fines')}
                                style={styles.payFinesButton}
                            >
                                View & Pay Fines
                            </button>
                        </div>
                    )}

                    <div style={styles.sectionsGrid}>
                        {/* Active Borrows */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>My Active Borrows</h2>
                            {activeBorrows.length === 0 ? (
                                <p style={styles.noData}>No active borrows</p>
                            ) : (
                                <div style={styles.borrowsList}>
                                    {activeBorrows.map((borrow) => {
                                        const isOverdue = new Date(borrow.dueDate) < new Date();
                                        const daysUntilDue = Math.ceil((new Date(borrow.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div key={borrow.id} style={styles.borrowCard}>
                                                <div style={styles.borrowInfo}>
                                                    <p><strong>Book ID:</strong> {borrow.bookID}</p>
                                                    <p><strong>Issue Date:</strong> {new Date(borrow.issueDate).toLocaleDateString()}</p>
                                                    <p><strong>Due Date:</strong> {new Date(borrow.dueDate).toLocaleDateString()}</p>
                                                    {!isOverdue && daysUntilDue <= 3 && (
                                                        <p style={styles.dueSoon}>Due in {daysUntilDue} day(s)</p>
                                                    )}
                                                </div>
                                                <span style={{
                                                    ...styles.status,
                                                    backgroundColor: isOverdue ? '#e74c3c' : (daysUntilDue <= 3 ? '#f39c12' : '#27ae60')
                                                }}>
                                                    {isOverdue ? 'Overdue' : (daysUntilDue <= 3 ? 'Due Soon' : 'Active')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Quick Actions</h2>
                            <div style={styles.actionsGrid}>
                                <button
                                    onClick={() => router.push('/member/books')}
                                    style={styles.actionBtn}
                                >
                                    <span style={styles.actionIcon}>🔍</span>
                                    Browse Books
                                </button>
                                <button
                                    onClick={() => router.push('/member/borrows')}
                                    style={styles.actionBtn}
                                >
                                    <span style={styles.actionIcon}>📖</span>
                                    My Borrows
                                </button>
                                <button
                                    onClick={() => router.push('/member/reservations')}
                                    style={styles.actionBtn}
                                >
                                    <span style={styles.actionIcon}>📅</span>
                                    Reservations
                                </button>
                                <button
                                    onClick={() => router.push('/member/fines')}
                                    style={styles.actionBtn}
                                >
                                    <span style={styles.actionIcon}>💰</span>
                                    My Fines
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    layout: { display: 'flex' },
    main: {
        flex: 1,
        padding: '2rem',
        backgroundColor: '#f8fafc',
        minHeight: 'calc(100vh - 60px)',
        marginLeft: '260px'
    },
    welcomeSection: {
        marginBottom: '2rem'
    },
    title: {
        color: '#1f2937',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem'
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1.1rem'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statIcon: {
        fontSize: '2.5rem',
        marginBottom: '1rem'
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#10b981',
        margin: 0
    },
    alertBox: {
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
    },
    alertTitle: {
        color: '#92400e',
        marginTop: 0,
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: 'bold'
    },
    alertItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid #f59e0b'
    },
    dueDate: {
        fontWeight: 'bold',
        color: '#92400e'
    },
    fineAlertBox: {
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
    },
    fineAlertTitle: {
        color: '#dc2626',
        marginTop: 0,
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: 'bold'
    },
    payFinesButton: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'background-color 0.2s'
    },
    sectionsGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
    },
    section: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
    },
    sectionTitle: {
        color: '#1f2937',
        marginTop: 0,
        marginBottom: '1.5rem',
        fontSize: '1.25rem',
        fontWeight: 'bold'
    },
    borrowsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    borrowCard: {
        padding: '1.25rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
    },
    borrowInfo: {
        flex: 1
    },
    dueSoon: {
        color: '#f59e0b',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    },
    status: {
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: '80px'
    },
    actionsGrid: {
        display: 'grid',
        gap: '1rem'
    },
    actionBtn: {
        padding: '1.25rem',
        backgroundColor: '#f8fafc',
        color: '#374151',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    actionIcon: {
        fontSize: '1.25rem'
    },
    noData: {
        textAlign: 'center',
        padding: '3rem 2rem',
        color: '#9ca3af',
        fontSize: '1.1rem'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: '1.5rem',
        marginBottom: '1rem'
    },
    errorMessage: {
        color: '#6b7280',
        marginBottom: '2rem'
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default withAuth(MemberDashboard);

// Add interactive styles
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 1024px) {
            .main { margin-left: 0 !important; }
            .sectionsGrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
            .statsGrid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
            .statsGrid { grid-template-columns: 1fr !important; }
        }
        
        /* Hover effects */
        .statCard:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important; }
        .actionBtn:hover { background-color: #e5e7eb !important; border-color: #10b981 !important; color: #10b981 !important; }
        .payFinesButton:hover { background-color: #dc2626 !important; }
        .retryButton:hover { background-color: #2563eb !important; }
    `;
    if (!document.querySelector('style[data-member-dashboard]')) {
        style.setAttribute('data-member-dashboard', 'true');
        document.head.appendChild(style);
    }
}
