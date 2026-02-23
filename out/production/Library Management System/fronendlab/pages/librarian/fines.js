import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LibrarianFines() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [filter, setFilter] = useState('all'); // all, unpaid, paid

    useEffect(() => {
        loadFines();
    }, [filter]);

    const loadFines = async () => {
        setLoading(true);
        setMessage(''); // Clear previous messages at start
        try {
            let url = 'http://localhost:8081/api/fines';
            if (filter === 'unpaid') {
                url = 'http://localhost:8081/api/fines/unpaid';
            } else if (filter === 'paid') {
                url = 'http://localhost:8081/api/fines/paid';
            }

            console.log('Fetching fines from:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data);

            if (!Array.isArray(data)) {
                console.error('Data is not an array:', data);
                setFines([]);
                setMessage('Received invalid data format from server');
            } else {
                setFines(data);
                setMessage(''); // Clear error message on success
                console.log('Fines loaded successfully:', data.length, 'fines');
            }
        } catch (error) {
            console.error('Error loading fines:', error);
            console.error('Error details:', error.message);
            const errorMsg = 'Error loading fines. Please check if the backend is running on port 8081.';
            setMessage(errorMsg);
            setFines([]);

            // Auto-clear error message after 5 seconds
            setTimeout(() => {
                setMessage('');
            }, 5000);
        } finally {
            setLoading(false);
        }
    };


    const handlePayFine = async (fineId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/fines/${fineId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setMessage('Fine marked as paid successfully!');
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

    const handleWaiveFine = async (fineId) => {
        if (!confirm('Are you sure you want to waive this fine?')) return;

        try {
            const response = await fetch(`http://localhost:8081/api/fines/${fineId}/waive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Waived by librarian' })
            });

            if (response.ok) {
                setMessage('Fine waived successfully!');
                loadFines();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error waiving fine');
            }
        } catch (error) {
            console.error('Error waiving fine:', error);
            setMessage('Error waiving fine');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Manage Fines</h1>

                    {message && (
                        <div style={{
                            ...styles.message,
                            backgroundColor: message.includes('Error') ? '#e74c3c' : '#27ae60'
                        }}>
                            {message}
                        </div>
                    )}

                    <div style={styles.filterBar}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'all' ? styles.filterBtnActive : {})
                            }}
                        >
                            All Fines
                        </button>
                        <button
                            onClick={() => setFilter('unpaid')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'unpaid' ? styles.filterBtnActive : {})
                            }}
                        >
                            Unpaid
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'paid' ? styles.filterBtnActive : {})
                            }}
                        >
                            Paid
                        </button>
                    </div>

                    <div style={styles.finesList}>
                        {fines.length === 0 ? (
                            <p style={styles.noData}>No fines found</p>
                        ) : (
                            fines.map((fine) => (
                                <div key={fine.id} style={styles.fineCard}>
                                    <div style={styles.fineInfo}>
                                        <p><strong>Member ID:</strong> {fine.memberID}</p>
                                        {fine.borrowRecordID && (
                                            <p><strong>Borrow Record ID:</strong> {fine.borrowRecordID}</p>
                                        )}
                                        <p><strong>Amount:</strong> ${fine.amount ? fine.amount.toFixed(2) : '0.00'}</p>
                                        {fine.amountPaid > 0 && (
                                            <p><strong>Amount Paid:</strong> ${fine.amountPaid ? fine.amountPaid.toFixed(2) : '0.00'}</p>
                                        )}
                                        <p><strong>Reason:</strong> {fine.reason}</p>
                                        <p><strong>Status:</strong>
                                            <span style={{
                                                ...styles.status,
                                                backgroundColor: fine.status === 'PAID' ? '#27ae60' :
                                                    fine.status === 'WAIVED' ? '#95a5a6' :
                                                        fine.status === 'PARTIALLY_PAID' ? '#f39c12' : '#e74c3c'
                                            }}>
                                                {fine.status}
                                            </span>
                                        </p>
                                        <p><strong>Created:</strong> {fine.issueDate ? new Date(fine.issueDate).toLocaleDateString() : 'N/A'}</p>
                                        {fine.paidDate && (
                                            <p><strong>Paid At:</strong> {new Date(fine.paidDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                    {(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => handlePayFine(fine.id)}
                                                style={styles.btnPay}
                                            >
                                                Mark as Paid
                                            </button>
                                            <button
                                                onClick={() => handleWaiveFine(fine.id)}
                                                style={styles.btnWaive}
                                            >
                                                Waive Fine
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
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
    title: {
        color: '#2c3e50',
        marginBottom: '2rem'
    },
    message: {
        padding: '1rem',
        color: 'white',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontWeight: 'bold'
    },
    filterBar: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
    },
    filterBtn: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        border: '2px solid #3498db',
        color: '#3498db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.3s'
    },
    filterBtnActive: {
        backgroundColor: '#3498db',
        color: 'white'
    },
    finesList: {
        display: 'grid',
        gap: '1rem'
    },
    fineCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    fineInfo: {
        flex: 1,
        minWidth: '300px'
    },
    status: {
        marginLeft: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
        flexDirection: 'column'
    },
    btnPay: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap'
    },
    btnWaive: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap'
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d',
        fontSize: '1.1rem'
    }
};
