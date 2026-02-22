import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import MemberCard from '../../components/MemberCard';

export default function LibrarianMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [borrowHistory, setBorrowHistory] = useState([]);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/members');
            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMemberHistory = async (memberId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/borrow/member/${memberId}`);
            const data = await response.json();
            setBorrowHistory(data);
            setSelectedMember(memberId);
        } catch (error) {
            console.error('Error loading member history:', error);
        }
    };

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.membershipID?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div style={styles.layout}>
                <Sidebar role="librarian" />
                <main style={styles.main}>
                    <h1 style={styles.title}>Members</h1>

                    <input
                        type="text"
                        placeholder="Search members by name, email, or membership ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                    />

                    <div style={styles.membersGrid}>
                        {filteredMembers.length === 0 ? (
                            <p style={styles.noData}>No members found</p>
                        ) : (
                            filteredMembers.map((member) => (
                                <div key={member.id} style={styles.memberCard}>
                                    <MemberCard member={member} />
                                    <button
                                        onClick={() => loadMemberHistory(member.id)}
                                        style={styles.btnHistory}
                                    >
                                        View History
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedMember && (
                        <div style={styles.modal} onClick={() => setSelectedMember(null)}>
                            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h2 style={styles.modalTitle}>Borrow History</h2>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    style={styles.closeBtn}
                                >
                                    ×
                                </button>
                                <div style={styles.historyList}>
                                    {borrowHistory.length === 0 ? (
                                        <p>No borrow history</p>
                                    ) : (
                                        borrowHistory.map((record) => (
                                            <div key={record.id} style={styles.historyCard}>
                                                <p><strong>Book ID:</strong> {record.bookID}</p>
                                                <p><strong>Issue Date:</strong> {new Date(record.issueDate).toLocaleDateString()}</p>
                                                <p><strong>Due Date:</strong> {new Date(record.dueDate).toLocaleDateString()}</p>
                                                {record.returnDate && (
                                                    <p><strong>Return Date:</strong> {new Date(record.returnDate).toLocaleDateString()}</p>
                                                )}
                                                <p><strong>Status:</strong>
                                                    <span style={{
                                                        ...styles.status,
                                                        backgroundColor: record.returned ? '#27ae60' : '#e74c3c'
                                                    }}>
                                                        {record.returned ? 'Returned' : 'Active'}
                                                    </span>
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
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
    searchInput: {
        width: '100%',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        marginBottom: '2rem'
    },
    membersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
    },
    memberCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    btnHistory: {
        width: '100%',
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
    },
    modalTitle: {
        marginBottom: '1.5rem',
        color: '#2c3e50'
    },
    closeBtn: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        cursor: 'pointer',
        color: '#7f8c8d'
    },
    historyList: {
        display: 'grid',
        gap: '1rem'
    },
    historyCard: {
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    status: {
        marginLeft: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d',
        fontSize: '1.1rem',
        gridColumn: '1 / -1'
    }
};
