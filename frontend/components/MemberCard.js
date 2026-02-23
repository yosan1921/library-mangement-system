export default function MemberCard({ member, onEdit, onDelete }) {
    return (
        <div style={styles.card} className="member-card">
            {/* Header with Avatar */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatar}>
                        {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.nameWrap}>
                        <h3 style={styles.name}>{member.name}</h3>
                        <p style={styles.memberId}>ID: {member.membershipID}</p>
                    </div>
                </div>
                <span style={member.active ? styles.badgeActive : styles.badgeInactive}>
                    {member.active ? '✓ Active' : '✗ Inactive'}
                </span>
            </div>

            {/* Details */}
            <div style={styles.details}>
                <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>📞</span>
                    <span style={styles.detailLabel}>Contact:</span>
                    <span style={styles.detailValue}>{member.contact}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailIcon}>👤</span>
                    <span style={styles.detailLabel}>Role:</span>
                    <span style={styles.roleBadge}>{member.role}</span>
                </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
                {onEdit && (
                    <button onClick={() => onEdit(member)} style={styles.btnEdit}>
                        ✏️ Edit
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(member.id)} style={styles.btnDelete}>
                        🗑️ Delete
                    </button>
                )}
            </div>

            <style>{`
                .member-card {
                    transition: transform 0.25s ease, box-shadow 0.25s ease !important;
                }
                .member-card:hover {
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
        borderTop: '3px solid #9b59b6',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.75rem',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flex: 1,
        minWidth: 0,
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: '700',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(52,152,219,0.3)',
    },
    nameWrap: { flex: 1, minWidth: 0 },
    name: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#2c3e50',
        margin: '0 0 0.15rem 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    memberId: {
        fontSize: '0.8rem',
        color: '#95a5a6',
        margin: 0,
        fontFamily: 'monospace',
    },
    badgeActive: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#e8f8f0',
        color: '#27ae60',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    badgeInactive: {
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f1f3f5',
        color: '#7f8c8d',
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
    roleBadge: {
        display: 'inline-block',
        padding: '0.15rem 0.6rem',
        backgroundColor: '#f3e8ff',
        color: '#7c3aed',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginTop: '0.25rem',
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
};
