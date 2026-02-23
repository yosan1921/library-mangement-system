import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
    getMostBorrowedBooks,
    getLeastBorrowedBooks,
    getBookStatistics,
    getMostActiveMembers,
    getMemberStatistics,
    getOverdueReport,
    getOverdueStatistics,
    getFineReport,
    getRecentPayments
} from '../../services/reportService';

export default function ReportsAnalytics() {
    const [activeTab, setActiveTab] = useState('books');
    const [loading, setLoading] = useState(true);

    // Book Reports
    const [mostBorrowedBooks, setMostBorrowedBooks] = useState([]);
    const [leastBorrowedBooks, setLeastBorrowedBooks] = useState([]);
    const [bookStats, setBookStats] = useState(null);

    // User Reports
    const [mostActiveMembers, setMostActiveMembers] = useState([]);
    const [memberStats, setMemberStats] = useState(null);

    // Inventory Reports
    const [inventoryData, setInventoryData] = useState(null);

    // Overdue Reports
    const [overdueReport, setOverdueReport] = useState([]);
    const [overdueStats, setOverdueStats] = useState(null);

    // Fine Reports
    const [fineReport, setFineReport] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);

    useEffect(() => {
        loadAllReports();
    }, []);

    const loadAllReports = async () => {
        setLoading(true);
        try {
            const [
                mostBorrowed,
                leastBorrowed,
                bookStatistics,
                activeMembers,
                memberStatistics,
                overdue,
                overdueStatistics,
                fines,
                payments
            ] = await Promise.all([
                getMostBorrowedBooks(10),
                getLeastBorrowedBooks(10),
                getBookStatistics(),
                getMostActiveMembers(10),
                getMemberStatistics(),
                getOverdueReport(),
                getOverdueStatistics(),
                getFineReport(),
                getRecentPayments(10)
            ]);

            setMostBorrowedBooks(mostBorrowed);
            setLeastBorrowedBooks(leastBorrowed);
            setBookStats(bookStatistics);
            setMostActiveMembers(activeMembers);
            setMemberStats(memberStatistics);
            setOverdueReport(overdue);
            setOverdueStats(overdueStatistics);
            setFineReport(fines);
            setRecentPayments(payments);

            // Calculate inventory data
            if (bookStatistics) {
                const utilizationRate = bookStatistics.totalCopies > 0
                    ? ((bookStatistics.borrowedCopies / bookStatistics.totalCopies) * 100).toFixed(1)
                    : 0;
                setInventoryData({
                    ...bookStatistics,
                    utilizationRate
                });
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return `$${amount.toFixed(2)}`;
    };

    /* ─── Reusable Stat Card ─── */
    const StatCard = ({ title, value, subtitle, icon, gradient, accent }) => (
        <div className="rpt-stat-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #f0f0f5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            transition: 'all 0.3s ease',
            cursor: 'default',
        }}>
            <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: '4px 0 0', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{value}</h3>
                {subtitle && <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '6px', fontWeight: 600 }}>{subtitle}</p>}
            </div>
            <div style={{
                width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', background: gradient || 'linear-gradient(135deg, #eef2ff, #e0e7ff)', flexShrink: 0,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            }}>
                {icon}
            </div>
        </div>
    );

    /* ─── Section Wrapper ─── */
    const SectionCard = ({ children, style: extraStyle }) => (
        <div style={{
            background: 'white', borderRadius: '18px', border: '1px solid #f0f0f5',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', ...extraStyle
        }}>
            {children}
        </div>
    );

    /* ─── Section Header ─── */
    const SectionHeader = ({ icon, iconBg, title }) => (
        <div style={{
            padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(180deg, #fafbfc 0%, #ffffff 100%)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
            <span style={{
                width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', background: iconBg || '#eef2ff',
            }}>
                {icon}
            </span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h2>
        </div>
    );

    /* ─── Empty State ─── */
    const EmptyState = ({ emoji, title, subtitle }) => (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem', opacity: 0.6 }}>{emoji || '📭'}</span>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#374151', margin: 0 }}>{title || 'No data available'}</p>
            {subtitle && <p style={{ color: '#9ca3af', marginTop: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>{subtitle}</p>}
        </div>
    );

    /* ─── Rank Badge ─── */
    const RankBadge = ({ index }) => {
        const colors = [
            { bg: '#fef3c7', color: '#92400e' }, // gold
            { bg: '#e5e7eb', color: '#374151' }, // silver
            { bg: '#ffedd5', color: '#9a3412' }, // bronze
        ];
        const c = colors[index] || { bg: '#eef2ff', color: '#4338ca' };
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '10px', fontWeight: 900, fontSize: '0.75rem',
                backgroundColor: c.bg, color: c.color,
            }}>
                #{index + 1}
            </span>
        );
    };

    /* ─── Count Badge ─── */
    const CountBadge = ({ value, color }) => {
        const colors = {
            green: { bg: '#d1fae5', text: '#065f46' },
            gray: { bg: '#f3f4f6', text: '#374151' },
            red: { bg: '#fee2e2', text: '#991b1b' },
            blue: { bg: '#dbeafe', text: '#1e40af' },
            cyan: { bg: '#cffafe', text: '#155e75' },
        };
        const c = colors[color] || colors.green;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRadius: '8px',
                fontWeight: 700, fontSize: '0.8rem', backgroundColor: c.bg, color: c.text,
            }}>
                {value}
            </span>
        );
    };

    /* ═══════════════ TABS CONTENT ═══════════════ */

    const renderBookReports = () => (
        <div className="rpt-tab-content">
            {bookStats && (
                <SectionCard>
                    <SectionHeader icon="📊" iconBg="linear-gradient(135deg, #dbeafe, #c7d2fe)" title="Book Statistics" />
                    <div style={{ padding: '1.5rem' }}>
                        <div className="rpt-stats-grid rpt-stats-5">
                            <StatCard title="Total Books" value={bookStats.totalBooks} icon="📚" gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)" />
                            <StatCard title="Total Copies" value={bookStats.totalCopies} icon="📑" gradient="linear-gradient(135deg, #e0e7ff, #c7d2fe)" />
                            <StatCard title="Available" value={bookStats.availableCopies} icon="✅" gradient="linear-gradient(135deg, #d1fae5, #a7f3d0)" />
                            <StatCard title="Borrowed" value={bookStats.borrowedCopies} icon="⏳" gradient="linear-gradient(135deg, #fef3c7, #fde68a)" />
                            <StatCard title="Total Borrows" value={bookStats.totalBorrows} icon="🔄" gradient="linear-gradient(135deg, #ede9fe, #ddd6fe)" />
                        </div>
                    </div>
                </SectionCard>
            )}

            <div className="rpt-grid-2">
                {/* Most Borrowed */}
                <SectionCard style={{ display: 'flex', flexDirection: 'column' }}>
                    <SectionHeader icon="📈" iconBg="linear-gradient(135deg, #d1fae5, #a7f3d0)" title="Most Borrowed" />
                    {mostBorrowedBooks.length === 0 ? (
                        <EmptyState emoji="👻" title="No data available" />
                    ) : (
                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table className="rpt-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th style={{ textAlign: 'right' }}>Borrows</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mostBorrowedBooks.map((book, index) => (
                                        <tr key={book.bookID}>
                                            <td><RankBadge index={index} /></td>
                                            <td style={{ fontWeight: 700, color: '#111827' }}>{book.bookTitle}</td>
                                            <td style={{ color: '#6b7280' }}>{book.author}</td>
                                            <td style={{ textAlign: 'right' }}><CountBadge value={book.borrowCount} color="green" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                {/* Least Borrowed */}
                <SectionCard style={{ display: 'flex', flexDirection: 'column' }}>
                    <SectionHeader icon="📉" iconBg="linear-gradient(135deg, #fee2e2, #fecaca)" title="Least Borrowed" />
                    {leastBorrowedBooks.length === 0 ? (
                        <EmptyState emoji="👻" title="No data available" />
                    ) : (
                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table className="rpt-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th style={{ textAlign: 'right' }}>Borrows</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leastBorrowedBooks.map((book) => (
                                        <tr key={book.bookID}>
                                            <td style={{ fontWeight: 700, color: '#111827' }}>{book.bookTitle}</td>
                                            <td style={{ color: '#6b7280' }}>{book.author}</td>
                                            <td style={{ textAlign: 'right' }}><CountBadge value={book.borrowCount} color="gray" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );

    const renderUserReports = () => (
        <div className="rpt-tab-content">
            {memberStats && (
                <SectionCard>
                    <SectionHeader icon="👥" iconBg="linear-gradient(135deg, #ede9fe, #ddd6fe)" title="Member Statistics" />
                    <div style={{ padding: '1.5rem' }}>
                        <div className="rpt-stats-grid rpt-stats-2">
                            <StatCard title="Total Members" value={memberStats.totalMembers} icon="👫" gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)" />
                            <StatCard title="Active Members" value={memberStats.activeMembers} subtitle="Currently borrowing books" icon="🔥" gradient="linear-gradient(135deg, #d1fae5, #a7f3d0)" />
                        </div>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                <SectionHeader icon="⭐" iconBg="linear-gradient(135deg, #ffedd5, #fed7aa)" title="Most Active Members" />
                {mostActiveMembers.length === 0 ? (
                    <EmptyState emoji="👻" title="No data available" />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="rpt-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th style={{ textAlign: 'right' }}>Total Borrows</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mostActiveMembers.map((member, index) => (
                                    <tr key={member.memberID}>
                                        <td><RankBadge index={index} /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: '10px',
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                                                }}>
                                                    {member.memberName.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 700, color: '#111827' }}>{member.memberName}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{member.email}</td>
                                        <td style={{ textAlign: 'right' }}><CountBadge value={member.borrowCount} color="green" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );

    const renderOverdueReports = () => (
        <div className="rpt-tab-content">
            {overdueStats && (
                <SectionCard>
                    <SectionHeader icon="⚠️" iconBg="linear-gradient(135deg, #fee2e2, #fecaca)" title="Overdue Statistics" />
                    <div style={{ padding: '1.5rem' }}>
                        <div className="rpt-stats-grid rpt-stats-3">
                            <StatCard title="Total Overdue" value={overdueStats.totalOverdue} icon="⏰" gradient="linear-gradient(135deg, #fee2e2, #fecaca)" />
                            <StatCard title="Unique Members" value={overdueStats.uniqueMembers} icon="👤" gradient="linear-gradient(135deg, #ffedd5, #fed7aa)" />
                            <StatCard title="Unique Books" value={overdueStats.uniqueBooks} icon="📕" gradient="linear-gradient(135deg, #ffe4e6, #fecdd3)" />
                        </div>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                <SectionHeader icon="📅" iconBg="linear-gradient(135deg, #ffe4e6, #fecdd3)" title="Overdue Books & Users" />
                {overdueReport.length === 0 ? (
                    <EmptyState emoji="🎉" title="No overdue books!" subtitle="Everyone returned their books on time. Amazing!" />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="rpt-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Email</th>
                                    <th>Book</th>
                                    <th>Due Date</th>
                                    <th style={{ textAlign: 'right' }}>Days Overdue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdueReport.map((record) => (
                                    <tr key={record.recordID}>
                                        <td style={{ fontWeight: 700, color: '#111827' }}>{record.memberName}</td>
                                        <td style={{ color: '#6b7280' }}>{record.memberEmail}</td>
                                        <td style={{ fontWeight: 600, color: '#374151' }}>{record.bookTitle}</td>
                                        <td style={{ color: '#6b7280' }}>{formatDate(record.dueDate)}</td>
                                        <td style={{ textAlign: 'right' }}><CountBadge value={`${record.daysOverdue} days`} color="red" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );

    const renderFineReports = () => (
        <div className="rpt-tab-content">
            {fineReport && (
                <SectionCard>
                    <SectionHeader icon="💰" iconBg="linear-gradient(135deg, #d1fae5, #a7f3d0)" title="Fine Statistics" />
                    <div style={{ padding: '1.5rem' }}>
                        <div className="rpt-stats-grid rpt-stats-4">
                            <StatCard title="Total Fines Issued" value={formatCurrency(fineReport.totalFines)} subtitle={`${fineReport.totalCount} fines`} icon="🧾" gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)" />
                            <StatCard title="Total Collected" value={formatCurrency(fineReport.totalCollected)} subtitle={`${fineReport.paidCount} paid`} icon="💵" gradient="linear-gradient(135deg, #d1fae5, #a7f3d0)" />
                            <StatCard title="Total Outstanding" value={formatCurrency(fineReport.totalOutstanding)} subtitle={`${fineReport.unpaidCount} unpaid`} icon="💳" gradient="linear-gradient(135deg, #fee2e2, #fecaca)" />
                            <StatCard title="Waived" value={fineReport.waivedCount} subtitle="fines waived" icon="🤝" gradient="linear-gradient(135deg, #f3f4f6, #e5e7eb)" />
                        </div>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                <SectionHeader icon="💸" iconBg="linear-gradient(135deg, #dbeafe, #bfdbfe)" title="Recent Payments" />
                {recentPayments.length === 0 ? (
                    <EmptyState emoji="💤" title="No recent payments" />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="rpt-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Member</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.map((payment) => (
                                    <tr key={payment.paymentID}>
                                        <td style={{ color: '#6b7280' }}>{formatDate(payment.paymentDate)}</td>
                                        <td style={{ fontWeight: 700, color: '#111827' }}>{payment.memberName}</td>
                                        <td><strong style={{ color: '#059669', fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(payment.amount)}</strong></td>
                                        <td><CountBadge value={payment.paymentMethod} color="cyan" /></td>
                                        <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{payment.fineReason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );

    /* ═══════════════ TAB CONFIG ═══════════════ */
    const tabs = [
        { id: 'books', label: 'Books', icon: '📚' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'overdue', label: 'Overdue', icon: '⚠️' },
        { id: 'fines', label: 'Fines', icon: '💰' },
    ];

    /* ═══════════════ LOADING STATE ═══════════════ */
    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ display: 'flex' }}>
                    <Sidebar role="admin" />
                    <main className="reports-main" style={{ flex: 1, marginLeft: '260px', padding: '2rem', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '1.5rem' }}>
                            <div className="rpt-spinner" />
                            <p style={{ color: '#6b7280', fontWeight: 700, fontSize: '1.1rem' }}>Crunching the numbers…</p>
                        </div>
                    </main>
                </div>
                <style jsx global>{reportStyles}</style>
            </>
        );
    }

    /* ═══════════════ MAIN RENDER ═══════════════ */
    return (
        <>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <Sidebar role="admin" />
                <main className="reports-main" style={{ flex: 1, marginLeft: '260px', padding: '2rem', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

                        {/* ── Header ── */}
                        <div className="rpt-page-header">
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.03em' }}>
                                    Reports & Analytics
                                </h1>
                                <p style={{ color: '#6b7280', marginTop: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Deep dive into your library's performance metrics
                                </p>
                            </div>
                            <button onClick={loadAllReports} className="rpt-refresh-btn">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Refresh
                            </button>
                        </div>

                        {/* ── Tabs ── */}
                        <div className="rpt-tabs-wrapper">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rpt-tab ${activeTab === tab.id ? 'rpt-tab--active' : ''}`}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Content ── */}
                        {activeTab === 'books' && renderBookReports()}
                        {activeTab === 'users' && renderUserReports()}
                        {activeTab === 'overdue' && renderOverdueReports()}
                        {activeTab === 'fines' && renderFineReports()}
                    </div>
                </main>
            </div>
            <style jsx global>{reportStyles}</style>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   STYLES — used via styled-jsx global
   ═══════════════════════════════════════════════════ */
const reportStyles = `
/* ── Spinner ── */
@keyframes rptSpin { to { transform: rotate(360deg); } }
.rpt-spinner {
    width: 52px; height: 52px;
    border: 4px solid #e0e7ff;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: rptSpin 0.8s linear infinite;
}

/* ── Page Header ── */
.rpt-page-header {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 1rem; padding: 1.5rem 1.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
    border: 1px solid #e5e7eb; border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    margin-bottom: 1.25rem; position: relative; overflow: hidden;
}

/* ── Refresh Button ── */
.rpt-refresh-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    color: white; font-weight: 700; font-size: 0.85rem;
    border: none; border-radius: 10px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(79,70,229,0.25);
    transition: all 0.25s ease;
}
.rpt-refresh-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79,70,229,0.35);
}

/* ── Tabs ── */
.rpt-tabs-wrapper {
    display: flex; gap: 0.35rem; padding: 5px;
    background: #f1f5f9; border-radius: 14px;
    margin-bottom: 1.5rem; overflow-x: auto;
    -ms-overflow-style: none; scrollbar-width: none;
}
.rpt-tabs-wrapper::-webkit-scrollbar { display: none; }
.rpt-tab {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.6rem 1.2rem; border-radius: 10px;
    font-weight: 700; font-size: 0.82rem;
    border: none; cursor: pointer; white-space: nowrap;
    background: transparent; color: #6b7280;
    transition: all 0.25s ease;
}
.rpt-tab:hover { background: #e2e8f0; color: #374151; }
.rpt-tab--active {
    background: white !important; color: #4f46e5 !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Tab Content ── */
.rpt-tab-content {
    display: flex; flex-direction: column; gap: 1.25rem;
    animation: rptFadeIn 0.35s ease;
}
@keyframes rptFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Stat Card Hover ── */
.rpt-stat-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.07) !important;
    transform: translateY(-2px);
}

/* ── Stats Grid ── */
.rpt-stats-grid {
    display: grid; gap: 1rem;
}
.rpt-stats-5 { grid-template-columns: repeat(5, 1fr); }
.rpt-stats-4 { grid-template-columns: repeat(4, 1fr); }
.rpt-stats-3 { grid-template-columns: repeat(3, 1fr); }
.rpt-stats-2 { grid-template-columns: repeat(2, 1fr); max-width: 640px; }

/* ── Two Column Grid ── */
.rpt-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
}

/* ── Table ── */
.rpt-table {
    width: 100%; border-collapse: separate; border-spacing: 0;
    font-size: 0.85rem;
}
.rpt-table thead th {
    padding: 0.75rem 1.25rem; text-align: left;
    font-size: 0.7rem; font-weight: 800; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.06em;
    border-bottom: 1px solid #f3f4f6;
    position: sticky; top: 0; background: white; z-index: 2;
}
.rpt-table tbody td {
    padding: 0.7rem 1.25rem; font-size: 0.85rem; font-weight: 500;
    border-bottom: 1px solid #f9fafb; color: #374151;
    vertical-align: middle;
}
.rpt-table tbody tr { transition: background 0.15s ease; }
.rpt-table tbody tr:hover { background: #f8fafc; }
.rpt-table tbody tr:last-child td { border-bottom: none; }

/* ═══ RESPONSIVE ═══ */

/* ── Tablet (≤1200px) ── */
@media (max-width: 1200px) {
    .rpt-stats-5 { grid-template-columns: repeat(3, 1fr); }
    .rpt-stats-4 { grid-template-columns: repeat(2, 1fr); }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
    .reports-main {
        margin-left: 0 !important;
        padding: 1rem !important;
    }
    .rpt-page-header {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.25rem;
    }
    .rpt-refresh-btn { width: 100%; justify-content: center; }
    .rpt-tabs-wrapper { width: 100%; }
    .rpt-stats-5,
    .rpt-stats-4,
    .rpt-stats-3 { grid-template-columns: repeat(2, 1fr); }
    .rpt-stats-2 { max-width: 100%; }
    .rpt-grid-2 { grid-template-columns: 1fr; }
    .rpt-table { font-size: 0.8rem; }
    .rpt-table thead th { padding: 0.6rem 0.75rem; font-size: 0.65rem; }
    .rpt-table tbody td { padding: 0.55rem 0.75rem; }
}

/* ── Small Mobile (≤480px) ── */
@media (max-width: 480px) {
    .rpt-stats-5,
    .rpt-stats-4,
    .rpt-stats-3,
    .rpt-stats-2 { grid-template-columns: 1fr; }
    .rpt-page-header h1 { font-size: 1.35rem !important; }
    .rpt-tab { padding: 0.5rem 0.85rem; font-size: 0.75rem; }
}
`;
