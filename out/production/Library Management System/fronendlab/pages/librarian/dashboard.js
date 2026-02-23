import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import withAuth from '../../components/authGuard';

function LibrarianDashboard() {
    const [stats, setStats] = useState({
        activeBorrows: 0,
        overdueBooks: 0,
        totalBooks: 0,
        availableBooks: 0,
        totalMembers: 0,
        unpaidFines: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentBorrows, setRecentBorrows] = useState([]);

    useEffect(() => {
        loadStats();
        loadRecentBorrows();
    }, []);

    const loadStats = async () => {
        try {
            const [active, overdue, books, members, fines] = await Promise.all([
                fetch('http://localhost:8081/api/borrow/active').then(r => r.json()),
                fetch('http://localhost:8081/api/borrow/overdue').then(r => r.json()),
                fetch('http://localhost:8081/api/books').then(r => r.json()),
                fetch('http://localhost:8081/api/members').then(r => r.json()),
                fetch('http://localhost:8081/api/fines/unpaid').then(r => r.json())
            ]);

            const availableBooks = books.filter(b => b.copiesAvailable > 0).length;

            setStats({
                activeBorrows: active.length,
                overdueBooks: overdue.length,
                totalBooks: books.length,
                availableBooks: availableBooks,
                totalMembers: members.length,
                unpaidFines: fines.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentBorrows = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/borrow/active');
            const data = await response.json();
            setRecentBorrows(data.slice(0, 5));
        } catch (error) {
            console.error('Error loading recent borrows:', error);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Librarian Dashboard</h1>

                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <h3>Total Books</h3>
                            <p style={styles.statNumber}>{stats.totalBooks}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Available Books</h3>
                            <p style={{ ...styles.statNumber, color: '#27ae60' }}>{stats.availableBooks}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Active Borrows</h3>
                            <p style={styles.statNumber}>{stats.activeBorrows}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Overdue Books</h3>
                            <p style={{ ...styles.statNumber, color: '#e74c3c' }}>{stats.overdueBooks}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Total Members</h3>
                            <p style={styles.statNumber}>{stats.totalMembers}</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3>Unpaid Fines</h3>
                            <p style={{ ...styles.statNumber, color: '#f39c12' }}>{stats.unpaidFines}</p>
                        </div>
                    </div>

                    <div style={styles.recentSection}>
                        <h2 style={styles.sectionTitle}>Recent Active Borrows</h2>
                        {recentBorrows.length === 0 ? (
                            <p style={styles.noData}>No active borrows</p>
                        ) : (
                            <div style={styles.borrowsList}>
                                {recentBorrows.map((borrow) => (
                                    <div key={borrow.id} style={styles.borrowCard}>
                                        <div>
                                            <p><strong>Member ID:</strong> {borrow.memberID}</p>
                                            <p><strong>Book ID:</strong> {borrow.bookID}</p>
                                            <p><strong>Due Date:</strong> {new Date(borrow.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <span style={{
                                            ...styles.status,
                                            backgroundColor: new Date(borrow.dueDate) < new Date() ? '#e74c3c' : '#27ae60'
                                        }}>
                                            {new Date(borrow.dueDate) < new Date() ? 'Overdue' : 'Active'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
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
    title: { color: '#2c3e50', marginBottom: '2rem' },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
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
        color: '#3498db',
        margin: '1rem 0 0 0'
    },
    recentSection: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        color: '#2c3e50',
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
    status: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d'
    }
};

export default withAuth(LibrarianDashboard);
