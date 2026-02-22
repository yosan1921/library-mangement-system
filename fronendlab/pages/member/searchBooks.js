import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BookCard from '../../components/BookCard';
import { getAllBooks, searchBooks } from '../../services/bookService';
import { createReservation } from '../../services/borrowService';

export default function SearchBooks() {
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [message, setMessage] = useState('');
    const memberID = 'MEMBER_ID_PLACEHOLDER'; // In real app, get from auth

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(data);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const query = { [searchType]: searchQuery };
            const data = await searchBooks(query);
            setBooks(data);
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    const handleReserve = async (bookID) => {
        try {
            await createReservation(memberID, bookID);
            setMessage('Book reserved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error reserving book: ' + error.message);
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="member" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Search Books</h1>

                    {message && <div style={styles.message}>{message}</div>}

                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            style={styles.select}
                        >
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                            <option value="category">Category</option>
                        </select>
                        <input
                            type="text"
                            placeholder={`Search by ${searchType}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.btnSearch}>Search</button>
                        <button type="button" onClick={loadBooks} style={styles.btnReset}>
                            Show All
                        </button>
                    </form>

                    <div style={styles.booksList}>
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onReserve={handleReserve}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}

const styles = {
    layout: { display: 'flex' },
    main: { flex: 1, padding: '2rem', backgroundColor: '#ecf0f1', minHeight: 'calc(100vh - 60px)' },
    title: { color: '#2c3e50', marginBottom: '2rem' },
    message: { padding: '1rem', backgroundColor: '#27ae60', color: 'white', borderRadius: '4px', marginBottom: '1rem' },
    searchForm: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem' },
    select: { padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
    input: { flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
    btnSearch: { padding: '0.75rem 1.5rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnReset: { padding: '0.75rem 1.5rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    booksList: { display: 'grid', gap: '1rem' },
};
