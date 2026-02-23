import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MemberBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);

    // Mock member ID - in production, get from auth context
    const memberId = 'member123';

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/books');
            const data = await response.json();
            setBooks(data);

            // Extract unique categories
            const uniqueCategories = [...new Set(data.map(book => book.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading books:', error);
            setMessage('Error loading books');
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (bookId) => {
        try {
            const response = await fetch('http://localhost:8081/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberID: memberId, bookID: bookId })
            });

            if (response.ok) {
                setMessage('Book reserved successfully! Check your reservations.');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await response.text();
                setMessage('Error: ' + error);
            }
        } catch (error) {
            console.error('Error reserving book:', error);
            setMessage('Error reserving book');
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;

        const matchesAvailability = !showAvailableOnly || book.copiesAvailable > 0;

        return matchesSearch && matchesCategory && matchesAvailability;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Browse Books</h1>

                    {message && (
                        <div style={{
                            ...styles.message,
                            backgroundColor: message.includes('Error') ? '#e74c3c' : '#27ae60'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Filters */}
                    <div style={styles.filtersBar}>
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={showAvailableOnly}
                                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                                style={styles.checkbox}
                            />
                            Available Only
                        </label>
                    </div>

                    {/* Results Count */}
                    <p style={styles.resultsCount}>
                        Showing {filteredBooks.length} of {books.length} books
                    </p>

                    {/* Books Grid */}
                    <div style={styles.booksGrid}>
                        {filteredBooks.length === 0 ? (
                            <p style={styles.noData}>No books found matching your criteria</p>
                        ) : (
                            filteredBooks.map((book) => (
                                <div key={book.id} style={styles.bookCardWrapper}>
                                    <div style={styles.bookDetails}>
                                        <h3 style={styles.bookTitle}>{book.title}</h3>
                                        <p style={styles.bookAuthor}>by {book.author}</p>
                                        <p style={styles.bookInfo}>
                                            <span>📚 {book.category}</span>
                                        </p>
                                        <p style={styles.bookInfo}>
                                            <span>📖 ISBN: {book.isbn}</span>
                                        </p>
                                        {book.publisher && (
                                            <p style={styles.bookInfo}>
                                                <span>🏢 {book.publisher}</span>
                                            </p>
                                        )}
                                        {book.description && (
                                            <p style={styles.bookDescription}>{book.description}</p>
                                        )}
                                        <div style={styles.availability}>
                                            <span style={{
                                                ...styles.availabilityBadge,
                                                backgroundColor: book.copiesAvailable > 0 ? '#27ae60' : '#e74c3c'
                                            }}>
                                                {book.copiesAvailable > 0
                                                    ? `${book.copiesAvailable} Available`
                                                    : 'Not Available'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleReserve(book.id)}
                                        disabled={book.copiesAvailable === 0}
                                        style={{
                                            ...styles.btnReserve,
                                            ...(book.copiesAvailable === 0 ? styles.btnDisabled : {})
                                        }}
                                    >
                                        {book.copiesAvailable > 0 ? 'Reserve Book' : 'Unavailable'}
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
    filtersBar: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    searchInput: {
        flex: 1,
        minWidth: '250px',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    select: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        minWidth: '150px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
    },
    resultsCount: {
        color: '#7f8c8d',
        marginBottom: '1rem',
        fontSize: '0.95rem'
    },
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
    },
    bookCardWrapper: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    bookDetails: {
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
    bookInfo: {
        color: '#34495e',
        fontSize: '0.9rem',
        marginBottom: '0.5rem'
    },
    bookDescription: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
        marginTop: '1rem',
        lineHeight: '1.5'
    },
    availability: {
        marginTop: '1rem'
    },
    availabilityBadge: {
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    btnReserve: {
        padding: '0.75rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    },
    btnDisabled: {
        backgroundColor: '#95a5a6',
        cursor: 'not-allowed'
    },
    noData: {
        textAlign: 'center',
        padding: '3rem',
        color: '#7f8c8d',
        fontSize: '1.1rem',
        gridColumn: '1 / -1'
    }
};
