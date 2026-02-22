import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getAvailableBooks } from '../../services/bookService';
import { getActiveMembers } from '../../services/memberService';
import { issueBook } from '../../services/borrowService';

export default function IssueBook() {
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [booksData, membersData] = await Promise.all([
                getAvailableBooks(),
                getActiveMembers(),
            ]);
            setBooks(booksData);
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await issueBook(selectedMember, selectedBook);
            setMessage('Book issued successfully!');
            setSelectedBook('');
            setSelectedMember('');
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error issuing book: ' + error.message);
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Issue Book</h1>

                    {message && <div style={styles.message}>{message}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div>
                            <label style={styles.label}>Select Member</label>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                required
                                style={styles.select}
                            >
                                <option value="">-- Select Member --</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} ({member.membershipID})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Select Book</label>
                            <select
                                value={selectedBook}
                                onChange={(e) => setSelectedBook(e.target.value)}
                                required
                                style={styles.select}
                            >
                                <option value="">-- Select Book --</option>
                                {books.map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title} by {book.author} (Available: {book.copiesAvailable})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" style={styles.btnSubmit}>
                            Issue Book
                        </button>
                    </form>
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
    form: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', display: 'grid', gap: '1.5rem', maxWidth: '600px' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2c3e50' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
    btnSubmit: { padding: '0.75rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
};
