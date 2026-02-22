import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getActiveBorrows, returnBook } from '../../services/borrowService';

export default function ReturnBook() {
    const [borrows, setBorrows] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadBorrows();
    }, []);

    const loadBorrows = async () => {
        try {
            const data = await getActiveBorrows();
            setBorrows(data);
        } catch (error) {
            console.error('Error loading borrows:', error);
        }
    };

    const handleReturn = async (recordId) => {
        try {
            await returnBook(recordId);
            setMessage('Book returned successfully!');
            loadBorrows();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
            setMessage('Error returning book: ' + errorMessage);
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Return Book</h1>

                    {message && <div style={styles.message}>{message}</div>}

                    <div style={styles.borrowsList}>
                        {borrows.length === 0 ? (
                            <p>No active borrows</p>
                        ) : (
                            borrows.map((borrow) => (
                                <div key={borrow.id} style={styles.borrowCard}>
                                    <div>
                                        <p><strong>Member ID:</strong> {borrow.memberID}</p>
                                        <p><strong>Book ID:</strong> {borrow.bookID}</p>
                                        <p><strong>Issue Date:</strong> {new Date(borrow.issueDate).toLocaleDateString()}</p>
                                        <p><strong>Due Date:</strong> {new Date(borrow.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleReturn(borrow.id)}
                                        style={styles.btnReturn}
                                    >
                                        Return Book
                                    </button>
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
    title: { color: '#2c3e50', marginBottom: '2rem' },
    message: { padding: '1rem', backgroundColor: '#27ae60', color: 'white', borderRadius: '4px', marginBottom: '1rem' },
    borrowsList: { display: 'grid', gap: '1rem' },
    borrowCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    btnReturn: { padding: '0.75rem 1.5rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
