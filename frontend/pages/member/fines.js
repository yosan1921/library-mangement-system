import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MemberFines() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unpaid, paid
    const [message, setMessage] = useState('');
    const [totalUnpaid, setTotalUnpaid] = useState(0);

    // Mock member ID - in production, get from auth context
    const memberId = 'member123';

    useEffect(() => {
        loadFines();
    }, []);

    const loadFines = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/fines/member/${memberId}`);
            const data = await response.json();
            setFines(data);

            // Calculate total unpaid
            const unpaid = data
                .filter(f => !f.paid)
                .reduce((sum, f) => sum + f.amount, 0);
            setTotalUnpaid(unpaid);
        } catch (error) {
            console.error('Error loading fines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayFine = async (fineId) => {
        if (!confirm('Confirm payment of this fine?')) return;

        try {
            const response = await fetch(`http://localhost:8081/api/fines/${fineId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setMessage('Fine paid successfully!');
                loadFines();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error processing payment');
            }
        } catch (error) {
            console.error('Error paying fine:', error);
            setMessage('Error processing payment');
        }
    };

    const filteredFines = fines.filter(fine => {
        if (filter === 'unpaid') return !fine.paid;
        if (filter === 'paid') return fine.paid;
        return true;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>My Fines</h1>

                    {message && (
                        <div style={{
                            ...styles.message,
                            backgroundColor: message.includes('Error') ? '#e74c3c' : '#27ae60'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Total Unpaid Summary */}
                    {totalUnpaid > 0 && (
                        <div style={styles.summaryCard}>
                            <div style={styles.summaryContent}>
                                <h3 style={styles.summaryTitle}>Total Unpaid Fines</h3>
                                <p style={styles.summaryAmount}>${totalUnpaid.toFixed(2)}</p>
                            </div>
                            <p style={styles.summaryNote}>
                                Please pay your fines to continue borrowing books
                            </p>
                        </div>
                    )}

                    {/* Filter Buttons */}
                    <div style={styles.filterBar}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'all' ? styles.filterBtnActive : {})
                            }}
                        >
                            All ({fines.length})
                        </button>
                        <button
                            onClick={() => setFilter('unpaid')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'unpaid' ? styles.filterBtnActive : {})
                            }}
                        >
                            Unpaid ({fines.filter(f => !f.paid).length})
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'paid' ? styles.filterBtnActive : {})
                            }}
                        >
                            Paid ({fines.filter(f => f.paid).length})
                        </button>
                    </div>

                    {/* Fines List */}
                    <div style={styles.finesList}>
                        {filteredFines.length === 0 ? (
                            <p style={styles.noData}>
                                {filter === 'all' ? 'No fines found' :
                                    filter === 'unpaid' ? 'No unpaid fines' :
                                        'No paid fines'}
                            </p>
                        ) : (
                            filteredFines.map((fine) => (
                                <div key={fine.id} style={styles.fineCard}>
                                    <div style={styles.fineInfo}>
                                        <div style={styles.fineHeader}>
                                            <h3 style={styles.fineAmount}>${fine.amount.toFixed(2)}</h3>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: fine.paid ? '#27ae60' : '#e74c3c'
                                            }}>
                                                {fine.paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>

                                        <div style={styles.fineDetails}>
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Reason:</span>
                                                <span>{fine.reason}</span>
                                            </div>
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Borrow Record:</span>
                                                <span>{fine.borrowRecordID}</span>
                                            </div>
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Created:</span>
                                                <span>{new Date(fine.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {fine.paid && fine.paidAt && (
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Paid On:</span>
                                                    <span>{new Date(fine.paidAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!fine.paid && (
                                        <button
                                            onClick={() => handlePayFine(fine.id)}
                                            style={styles.btnPay}
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Payment Information */}
                    {fines.some(f => !f.paid) && (
                        <div style={styles.infoBox}>
                            <h3 style={styles.infoTitle}>Payment Information</h3>
                            <ul style={styles.infoList}>
                                <li>Fines must be paid before borrowing new books</li>
                                <li>Late return fines are calculated based on the number of days overdue</li>
                                <li>Contact the librarian if you have questions about your fines</li>
                                <li>Payment can be made online or at the library counter</li>
                            </ul>
                        </div>
                    )}
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
    message: {
        padding: '1rem',
        color: 'white',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    summaryCard: {
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
    },
    summaryContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    summaryTitle: {
        color: '#856404',
        margin: 0,
        fontSize: '1.2rem'
    },
    summaryAmount: {
        color: '#e74c3c',
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: 0
    },
    summaryNote: {
        color: '#856404',
        margin: 0,
        fontSize: '0.9rem'
    },
    filterBar: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    filterBtn: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        border: '2px solid #3498db',
        color: '#3498db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'all 0.3s'
    },
    filterBtnActive: {
        backgroundColor: '#3498db',
        color: 'white'
    },
    finesList: {
        display: 'grid',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    fineCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
    },
    fineInfo: {
        flex: 1
    },
    fineHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #ecf0f1'
    },
    fineAmount: {
        color: '#e74c3c',
        margin: 0,
        fontSize: '1.8rem',
        fontWeight: 'bold'
    },
    statusBadge: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    fineDetails: {
        display: 'grid',
        gap: '0.5rem'
    },
    detailItem: {
        display: 'flex',
        gap: '0.5rem'
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#34495e',
        minWidth: '120px'
    },
    btnPay: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.3s'
    },
    infoBox: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    infoTitle: {
        color: '#2c3e50',
        marginTop: 0,
        marginBottom: '1rem'
    },
    infoList: {
        color: '#34495e',
        lineHeight: '1.8',
        paddingLeft: '1.5rem'
    },
    noData: {
        textAlign: 'center',
        padding: '3rem',
        color: '#7f8c8d',
        fontSize: '1.1rem'
    }
};
