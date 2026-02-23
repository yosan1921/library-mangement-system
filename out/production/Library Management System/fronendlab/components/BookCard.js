export default function BookCard({ book, onEdit, onDelete, onReserve }) {
    const availPercent = book.totalCopies > 0
        ? Math.round((book.copiesAvailable / book.totalCopies) * 100)
        : 0;

    const barColor = availPercent > 50
        ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
        : availPercent > 0
            ? 'linear-gradient(90deg, #f39c12, #e67e22)'
            : 'linear-gradient(90deg, #e74c3c, #c0392b)';

    return (
        <div style={styles.card} className="book-card">
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleWrap}>
                    <h3 style={styles.title}>{book.title}</h3>
                    <p style={styles.author}>
                        <span style={styles.authorIcon}>✍️</span> {book.author}
                    </p>
                </div>
                <span style={book.copiesAvailable > 0 ? styles.badgeAvail : styles.badgeOut}>
                    {book.copiesAvailable > 0 ? 'Available' : 'Out of Stock'}
                </span>
            </div>

            {/* Details */}
            <div style={styles.details}>
                <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>📂</span>
                    <span style={styles.detailLabel}>Category:</span>
                    <span style={styles.detailValue}>{book.category || '—'}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>🔢</span>
                    <span style={styles.detailLabel}>ISBN:</span>
                    <span style={{ ...styles.detailValue, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {book.isbn}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressWrap}>
                <div style={styles.progressTrack}>
                    <div style={{
                        ...styles.progressBar,
                        width: `${availPercent}%`,
                        background: barColor,
                    }}></div>
                </div>
                <span style={styles.progressLabel}>
                    {book.copiesAvailable} / {book.totalCopies} copies
                </span>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
                {onEdit && (
                    <button onClick={() => onEdit(book)} style={styles.btnEdit}>
                        ✏️ Edit
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(book.id)} style={styles.btnDelete}>
                        🗑️ Delete
                    </button>
                )}
                {onReserve && book.copiesAvailable === 0 && (
                    <button onClick={() => onReserve(book.id)} style={styles.btnReserve}>
                        🔖 Reserve
                    </button>
                )}
            </div>

            {/* Hover animation via global CSS */}
            <style>{`
                .book-card {
                    transition: transform 0.25s ease, box-shadow 0.25s ease !important;
                }
                .book-card:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
                }
            `}</style>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderTop: '3px solid #3498db',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.75rem',
    },
    titleWrap: { flex: 1, minWidth: 0 },
    title: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#2c3e50',
        margin: '0 0 0.3rem 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    author: {
        color: '#7f8c8d',
        fontSize: '0.88rem',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
    },
    authorIcon: { fontSize: '0.95rem' },
    badgeAvail: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    badgeOut: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fdecea',
        color: '#e74c3c',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.9rem',
    },
    detailIcon: { fontSize: '1rem', flexShrink: 0 },
    detailLabel: { fontWeight: '600', color: '#34495e', flexShrink: 0 },
    detailValue: { color: '#636e72' },
    progressWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    progressTrack: {
        flex: 1,
        height: '6px',
        backgroundColor: '#ecf0f1',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    progressLabel: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#7f8c8d',
        whiteSpace: 'nowrap',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    btnEdit: {
        flex: 1,
        padding: '0.55rem 0.75rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'opacity 0.2s',
        textAlign: 'center',
    },
    btnDelete: {
        flex: 1,
        padding: '0.55rem 0.75rem',
        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'opacity 0.2s',
        textAlign: 'center',
    },
    btnReserve: {
        flex: 1,
        padding: '0.55rem 0.75rem',
        background: 'linear-gradient(135deg, #f39c12, #e67e22)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'opacity 0.2s',
        textAlign: 'center',
    },
};
