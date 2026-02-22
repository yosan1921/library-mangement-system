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
        activeReservations: 0
    });
    const [activeBorrows, setActiveBorrows] = useState([]);
    const [upcomingDueDates, setUpcomingDueDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For demo purposes, using a mock member ID
        // In production, get from authentication context
        const mockMemberId = 'member123';
        loadDashboardData(mockMemberId);
    }, []);

    const loadDashboardData = async (memberId) => {
        setLoading(true);
        try {
            const [borrows, fines, reservations] = await Promise.all([
                fetch(`http://localhost:8081/api/borrow/member/${memberId}`).then(r => r.json()).catch(() => []),
                fetch(`http://localhost:8081/api/fines/member/${memberId}`).then(r => r.json()).catch(() => []),
                fetch(`http://localhost:8081/api/reservations/member/${memberId}`).then(r => r.json()).catch(() => [])
            ]);

            const active = borrows.filter(b => !b.returned);
            const unpaid = fines.filter(f => !f.paid);
            const activeRes = reservations.filter(r => r.status === 'PENDING' || r.status === 'APPROVED');

            // Get upcoming due dates (within 3 days)
            const today = new Date();
            const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
            const upcoming = active.filter(b => {
                const dueDate = new Date(b.dueDate);
                return dueDate >= today && dueDate <= threeDaysFromNow;
            });

            setStats({
                activeBorrows: active.length,
                totalBorrowed: borrows.length,
                unpaidFines: unpaid.length,
                activeReservations: activeRes.length
            });

            setActiveBorrows(active.slice(0, 5));
            setUpcomingDueDates(upcoming);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Member Dashboard</h1>

                    {/* Stats Grid */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <h3>Active Borrows</h3>
                            <p style={styles.statNumber}>{stats.activeBorrows}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Total Borrowed</h3>
                            <p style={{ ...styles.statNumber, color: '#3498db' }}>{stats.totalBorrowed}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Unpaid Fines</h3>
                            <p style={{ ...styles.statNumber, color: '#e74c3c' }}>{stats.unpaidFines}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Active Reservations</h3>
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

                    {/* Active Borrows */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>My Active Borrows</h2>
                        {activeBorrows.length === 0 ? (
                            <p style={styles.noData}>No active borrows</p>
                        ) : (
                            <div style={styles.borrowsList}>
                                {activeBorrows.map((borrow) => {
                                    const isOverdue = new Date(borrow.dueDate) < new Date();
                                    return (
                                        <div key={borrow.id} style={styles.borrowCard}>
                                            <div style={styles.borrowInfo}>
                                                <p><strong>Book ID:</strong> {borrow.bookID}</p>
                                                <p><strong>Issue Date:</strong> {new Date(borrow.issueDate).toLocaleDateString()}</p>
                                                <p><strong>Due Date:</strong> {new Date(borrow.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <span style={{
                                                ...styles.status,
                                                backgroundColor: isOverdue ? '#e74c3c' : '#27ae60'
                                            }}>
                                                {isOverdue ? 'Overdue' : 'Active'}
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
                                📚 Browse Books
                            </button>
                            <button
                                onClick={() => router.push('/member/borrows')}
                                style={styles.actionBtn}
                            >
                                📖 My Borrows
                            </button>
                            <button
                                onClick={() => router.push('/member/reservations')}
                                style={styles.actionBtn}
                            >
                                📅 My Reservations
                            </button>
                            <button
                                onClick={() => router.push('/member/fines')}
                                style={styles.actionBtn}
                            >
                                💰 My Fines
                            </button>
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
        backgroundColor: '#ecf0f1',
        minHeight: 'calc(100vh - 60px)',
        marginLeft: '260px'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '2rem'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '1rem 0 0 0'
    },
    alertBox: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
    },
    alertTitle: {
        color: '#856404',
        marginTop: 0,
        marginBottom: '1rem'
    },
    alertItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #ffc107'
    },
    dueDate: {
        fontWeight: 'bold',
        color: '#856404'
    },
    section: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    },
    sectionTitle: {
        color: '#2c3e50',
        marginTop: 0,
        marginBottom: '1.5rem'
    },
    borrowsList: {
        display: 'grid',
        gap: '1rem'
    },
    borrowCard: {
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    borrowInfo: {
        flex: 1
    },
    status: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
    },
    actionBtn: {
        padding: '1.5rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d'
    }
};

export default withAuth(MemberDashboard);
