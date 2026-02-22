import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MemberReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [books, setBooks] = useState({});

    // Mock member ID - in production, get from auth context
    const memberId = 'member123';

    useEffect(() => {
        loadReservations();
        loadBooks();
    }, []);

    const loadReservations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/reservations/member/${memberId}`);
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error('Error loading reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/books');
            const data = await response.json();

            const bookMap = {};
            data.forEach(book => {
                bookMap[book.id] = book;
            });
            setBooks(bookMap);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            const response = await fetch(`http://localhost:8081/api/reservations/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage('Reservation cancelled successfully!');
                loadReservations();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error cancelling reservation');
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setMessage('Error cancelling reservation');
        }
    };

    const getBookDetails = (bookId) => {
        return books[bookId] || { title: 'Loading...', author: 'Loading...' };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f39c12';
            case 'APPROVED': return '#3498db';
            case 'FULFILLED': return '#27ae60';
            case 'CANCELLED': return '#95a5a6';
            case 'EXPIRED': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>My Reservations</h1>

                    {message && (
                        <div style={{
                            ...styles.message,
                            backgroundColor: message.includes('Error') ? '#e74c3c' : '#27ae60'
                        }}>
                            {message}
                        </div>
                    )}

                    <div style={styles.reservationsList}>
                        {reservations.length === 0 ? (
                            <p style={styles.noData}>No reservations found</p>
                        ) : (
                            reservations.map((reservation) => {
                                const book = getBookDetails(reservation.bookID);
                                const canCancel = reservation.status === 'PENDING' || reservation.status === 'APPROVED';

                                return (
                                    <div key={reservation.id} style={styles.reservationCard}>
                                        <div style={styles.reservationInfo}>
                                            <h3 style={styles.bookTitle}>{book.title}</h3>
                                            <p style={styles.bookAuthor}>by {book.author}</p>

                                            <div style={styles.detailsGrid}>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Reservation Date:</span>
                                                    <span>{new Date(reservation.reservationDate).toLocaleDateString()}</span>
                                                </div>
                                                {reservation.expiryDate && (
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Expiry Date:</span>
                                                        <span>{new Date(reservation.expiryDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {reservation.notificationSent && (
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Notified:</span>
                                                        <span>✓ Yes</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={styles.statusContainer}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: getStatusColor(reservation.status)
                                                }}>
                                                    {reservation.status}
                                                </span>
                                            </div>
                                        </div>

                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(reservation.id)}
                                                style={styles.btnCancel}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                );
                            })
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
        marginBottom: '1rem'
    },
    reservationsList: {
        display: 'grid',
        gap: '1.5rem'
    },
    reservationCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
    },
    reservationInfo: {
        flex: 1
    },
    bookTitle: {
        color: '#2c3e50',
        marginTop: 0,
        marginBottom: '0.5rem',
        fontSize: '1.3rem'
    },
    bookAuthor: {
        color: '#7f8c8d',
        fontStyle: 'italic',
        marginBottom: '1rem'
    },
    detailsGrid: {
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    detailItem: {
        display: 'flex',
        gap: '0.5rem'
    },
    detailLabel: {
        fontWeight: 'bold',
        color: '#34495e',
        minWidth: '140px'
    },
    statusContainer: {
        marginTop: '1rem'
    },
    statusBadge: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    btnCancel: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
    },
    noData: {
        textAlign: 'center',
        padding: '3rem',
        color: '#7f8c8d',
        fontSize: '1.1rem'
    }
};
