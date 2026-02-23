import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MemberBorrows() {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, returned
    const [books, setBooks] = useState({});

    // Mock member ID - in production, get from auth context
    const memberId = 'member123';

    useEffect(() => {
        loadBorrows();
        loadBooks();
    }, []);

    const loadBorrows = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/borrow/member/${memberId}`);
            const data = await response.json();
            setBorrows(data);
        } catch (error) {
            console.error('Error loading borrows:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/books');
            const data = await response.json();

            // Create a map of book ID to book details
            const bookMap = {};
            data.forEach(book => {
                bookMap[book.id] = book;
            });
            setBooks(bookMap);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const filteredBorrows = borrows.filter(borrow => {
        if (filter === 'active') return !borrow.returned;
        if (filter === 'returned') return borrow.returned;
        return true;
    });

    const getBookDetails = (bookId) => {
        return books[bookId] || { title: 'Loading...', author: 'Loading...' };
    };

    const isOverdue = (borrow) => {
        return !borrow.returned && new Date(borrow.dueDate) < new Date();
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>My Borrows</h1>

                    {/* Filter Buttons */}
                    <div style={styles.filterBar}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'all' ? styles.filterBtnActive : {})
                            }}
                        >
                            All ({borrows.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'active' ? styles.filterBtnActive : {})
                            }}
                        >
                            Active ({borrows.filter(b => !b.returned).length})
                        </button>
                        <button
                            onClick={() => setFilter('returned')}
                            style={{
                                ...styles.filterBtn,
                                ...(filter === 'returned' ? styles.filterBtnActive : {})
                            }}
                        >
                            Returned ({borrows.filter(b => b.returned).length})
                        </button>
                    </div>

                    {/* Borrows List */}
                    <div style={styles.borrowsList}>
                        {filteredBorrows.length === 0 ? (
                            <p style={styles.noData}>No borrows found</p>
                        ) : (
                            filteredBorrows.map((borrow) => {
                                const book = getBookDetails(borrow.bookID);
                                const overdue = isOverdue(borrow);
                                const daysUntilDue = getDaysUntilDue(borrow.dueDate);

                                return (
                                    <div key={borrow.id} style={styles.borrowCard}>
                                        <div style={styles.borrowInfo}>
                                            <h3 style={styles.bookTitle}>{book.title}</h3>
                                            <p style={styles.bookAuthor}>by {book.author}</p>

                                            <div style={styles.dateInfo}>
                                                <div style={styles.dateItem}>
                                                    <span style={styles.dateLabel}>Issue Date:</span>
                                                    <span>{new Date(borrow.issueDate).toLocaleDateString()}</span>
                                                </div>
                                                <div style={styles.dateItem}>
                                                    <span style={styles.dateLabel}>Due Date:</span>
                                                    <span>{new Date(borrow.dueDate).toLocaleDateString()}</span>
                                                </div>
                                                {borrow.returnDate && (
                                                    <div style={styles.dateItem}>
                                                        <span style={styles.dateLabel}>Return Date:</span>
                                                        <span>{new Date(borrow.returnDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {!borrow.returned && (
                                                <div style={styles.dueWarning}>
                                                    {overdue ? (
                                                        <span style={styles.overdueText}>
                                                            ⚠️ Overdue by {Math.abs(daysUntilDue)} days
                                                        </span>
                                                    ) : daysUntilDue <= 3 ? (
                                                        <span style={styles.dueSoonText}>
                                                            ⏰ Due in {daysUntilDue} days
                                                        </span>
                                                    ) : (
                                                        <span style={styles.normalText}>
                                                            ✓ Due in {daysUntilDue} days
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.statusBadge}>
                                            <span style={{
                                                ...styles.status,
                                                backgroundColor: borrow.returned ? '#27ae60' :
                                                    overdue ? '#e74c3c' : '#3498db'
                                            }}>
                                                {borrow.returned ? 'Returned' :
                                                    overdue ? 'Overdue' : 'Active'}
                                            </span>
                                        </div>
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
    borrowsList: {
        display: 'grid',
        gap: '1.5rem'
    },
    borrowCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
    },
    borrowInfo: {
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
    dateInfo: {
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    dateItem: {
        display: 'flex',
        gap: '0.5rem'
    },
    dateLabel: {
        fontWeight: 'bold',
        color: '#34495e',
        minWidth: '100px'
    },
    dueWarning: {
        marginTop: '1rem',
        padding: '0.75rem',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa'
    },
    overdueText: {
        color: '#e74c3c',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    },
    dueSoonText: {
        color: '#f39c12',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    },
    normalText: {
        color: '#27ae60',
        fontWeight: 'bold',
        fontSize: '0.95rem'
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'flex-start'
    },
    status: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
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
