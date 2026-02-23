import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import withAuth from '../../components/authGuard';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        borrowedToday: 0,
        overdueBooks: 0,
        totalMembers: 0,
        pendingReservations: 0,
        totalFines: 0,
    });

    useEffect(() => {
        // TODO: Fetch real data from API
        setStats({
            totalBooks: 1250,
            borrowedToday: 23,
            overdueBooks: 8,
            totalMembers: 456,
            pendingReservations: 12,
            totalFines: 3450,
        });
    }, []);

    const quickActions = [
        { name: 'Add New Book', icon: '📚', path: '/admin/books', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', shadow: 'rgba(59,130,246,0.35)' },
        { name: 'Add Member', icon: '👤', path: '/admin/members', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', shadow: 'rgba(139,92,246,0.35)' },
        { name: 'Process Return', icon: '↩️', path: '/admin/borrows', gradient: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,0.35)' },
        { name: 'View Reports', icon: '📊', path: '/admin/reports', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,0.35)' },
    ];

    const statCards = [
        { label: 'Total Books', value: stats.totalBooks, icon: '📚', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadow: 'rgba(59,130,246,0.2)', badge: '+12 this week' },
        { label: 'Borrowed Today', value: stats.borrowedToday, icon: '📖', gradient: 'linear-gradient(135deg,#10b981,#047857)', shadow: 'rgba(16,185,129,0.2)', badge: 'Active' },
        { label: 'Overdue Books', value: stats.overdueBooks, icon: '⚠️', gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)', shadow: 'rgba(239,68,68,0.2)', badge: 'Action needed' },
        { label: 'Total Members', value: stats.totalMembers, icon: '👥', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', shadow: 'rgba(139,92,246,0.2)', badge: '+5 new' },
        { label: 'Pending Reservations', value: stats.pendingReservations, icon: '📅', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)', shadow: 'rgba(245,158,11,0.2)', badge: 'Review' },
        { label: 'Total Fines Collected', value: `₱${stats.totalFines}`, icon: '💰', gradient: 'linear-gradient(135deg,#14b8a6,#0f766e)', shadow: 'rgba(20,184,166,0.2)', badge: 'This month' },
    ];

    const recentActivity = [
        { icon: '📚', text: 'New book "The Great Gatsby" added to catalog', time: '2 hours ago', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', shadow: 'rgba(59,130,246,0.2)' },
        { icon: '👤', text: 'New member John Doe registered', time: '3 hours ago', gradient: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,0.2)' },
        { icon: '↩️', text: 'Book "1984" returned by Jane Smith', time: '5 hours ago', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', shadow: 'rgba(139,92,246,0.2)' },
        { icon: '💰', text: 'Fine payment of ₱150 received', time: '6 hours ago', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,0.2)' },
    ];

    return (
        <>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <Sidebar role="admin" />
                <main className="db-main">
                    <div className="db-container">

                        {/* ── Page Header ── */}
                        <div className="db-header-card">
                            {/* Decorative blobs */}
                            <div className="db-blob db-blob-1" />
                            <div className="db-blob db-blob-2" />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h1 className="db-title">Dashboard Overview</h1>
                                <p className="db-subtitle">Welcome back! Here's what's happening today.</p>
                            </div>

                            <div className="db-admin-badge">
                                <div className="db-admin-avatar">👨‍💼</div>
                                <div>
                                    <p style={{ fontWeight: 800, color: '#111827', fontSize: '0.9rem', margin: 0 }}>Admin User</p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '3px 0 0', fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                                        <span className="db-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Stats Grid ── */}
                        <div className="db-stats-grid">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="db-stat-card" style={{ '--shadow-color': stat.shadow }}>
                                    <div className="db-stat-icon" style={{ background: stat.gradient, boxShadow: `0 6px 16px ${stat.shadow}` }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p className="db-stat-label">{stat.label}</p>
                                        <h3 className="db-stat-value">{stat.value}</h3>
                                        <span className="db-stat-badge" style={{ background: stat.gradient }}>{stat.badge}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Bottom Row ── */}
                        <div className="db-bottom-row">

                            {/* Quick Actions */}
                            <div className="db-card">
                                <h2 className="db-card-title">
                                    <span className="db-card-title-icon" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>⚡</span>
                                    Quick Actions
                                </h2>
                                <div className="db-actions-grid">
                                    {quickActions.map((action) => (
                                        <a key={action.name} href={action.path} className="db-action-btn"
                                            style={{ '--action-shadow': action.shadow }}>
                                            <div className="db-action-icon" style={{ background: action.gradient, boxShadow: `0 6px 16px ${action.shadow}` }}>
                                                {action.icon}
                                            </div>
                                            <span className="db-action-label">{action.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="db-card db-activity-card">
                                <h2 className="db-card-title">
                                    <span className="db-card-title-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>🔥</span>
                                    Recent Activity
                                </h2>
                                <div className="db-activity-list">
                                    {recentActivity.map((a, idx) => (
                                        <div key={idx} className="db-activity-item">
                                            <div className="db-activity-icon" style={{ background: a.gradient, boxShadow: `0 4px 10px ${a.shadow}` }}>
                                                {a.icon}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p className="db-activity-text">{a.text}</p>
                                                <p className="db-activity-time">{a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="db-view-all-btn">View All Activity →</button>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                /* ── Layout ── */
                .db-main {
                    flex: 1;
                    margin-left: 260px;
                    padding: 2rem;
                    background: linear-gradient(160deg, #f0f4ff 0%, #fafbff 60%, #fff0fb 100%);
                    min-height: calc(100vh - 60px);
                }
                .db-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                }

                /* ── Header Card ── */
                .db-header-card {
                    position: relative;
                    overflow: hidden;
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #e5e7eb;
                    padding: 1.75rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
                }
                .db-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    opacity: 0.35;
                    pointer-events: none;
                }
                .db-blob-1 {
                    width: 220px; height: 220px;
                    top: -80px; right: -60px;
                    background: linear-gradient(135deg, #a5b4fc, #818cf8);
                }
                .db-blob-2 {
                    width: 160px; height: 160px;
                    bottom: -60px; left: 30%;
                    background: linear-gradient(135deg, #fbcfe8, #f9a8d4);
                }
                .db-title {
                    font-size: 1.9rem;
                    font-weight: 900;
                    color: #111827;
                    margin: 0;
                    letter-spacing: -0.04em;
                }
                .db-subtitle {
                    color: #6b7280;
                    margin: 0.35rem 0 0;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .db-admin-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #f8fafc;
                    padding: 0.75rem 1.1rem;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    position: relative;
                    z-index: 1;
                    flex-shrink: 0;
                }
                .db-admin-avatar {
                    width: 44px; height: 44px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.4rem;
                    box-shadow: 0 4px 12px rgba(79,70,229,0.3);
                    border: 2px solid white;
                }
                .db-pulse {
                    display: inline-block;
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    animation: dbPulse 2s infinite;
                }
                @keyframes dbPulse {
                    0%,100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.6; transform: scale(0.85); }
                }

                /* ── Stats Grid ── */
                .db-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                }
                .db-stat-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #f0f0f5;
                    padding: 1.4rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                    cursor: default;
                    animation: dbFadeUp 0.5s ease both;
                }
                .db-stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px var(--shadow-color, rgba(0,0,0,0.1));
                }
                .db-stat-icon {
                    width: 58px; height: 58px;
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.6rem;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                .db-stat-card:hover .db-stat-icon { transform: scale(1.1) rotate(-4deg); }
                .db-stat-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin: 0 0 0.2rem;
                }
                .db-stat-value {
                    font-size: 2.1rem;
                    font-weight: 900;
                    color: #111827;
                    margin: 0 0 0.4rem;
                    letter-spacing: -0.04em;
                    line-height: 1;
                }
                .db-stat-badge {
                    display: inline-block;
                    padding: 0.18rem 0.6rem;
                    border-radius: 8px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: white;
                    opacity: 0.9;
                }

                /* ── Bottom Row ── */
                .db-bottom-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .db-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #f0f0f5;
                    padding: 1.75rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    animation: dbFadeUp 0.55s ease both;
                }
                .db-card-title {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #111827;
                    margin: 0 0 1.5rem;
                }
                .db-card-title-icon {
                    width: 34px; height: 34px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem;
                }

                /* Quick Actions */
                .db-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .db-action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.4rem 1rem;
                    border-radius: 18px;
                    text-decoration: none;
                    background: #fafbfc;
                    border: 1.5px solid #f0f0f5;
                    transition: all 0.3s ease;
                    gap: 0.75rem;
                }
                .db-action-btn:hover {
                    background: white;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 24px var(--action-shadow, rgba(0,0,0,0.1));
                    border-color: transparent;
                }
                .db-action-icon {
                    width: 56px; height: 56px;
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.6rem;
                    color: white;
                    transition: transform 0.3s ease;
                }
                .db-action-btn:hover .db-action-icon { transform: scale(1.12) rotate(-5deg); }
                .db-action-label {
                    font-weight: 800;
                    font-size: 0.82rem;
                    color: #374151;
                    text-align: center;
                }

                /* Activity */
                .db-activity-card { display: flex; flex-direction: column; }
                .db-activity-list { display: flex; flex-direction: column; gap: 0.7rem; flex: 1; }
                .db-activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 0.9rem;
                    border-radius: 14px;
                    border: 1px solid transparent;
                    transition: all 0.25s ease;
                    cursor: default;
                }
                .db-activity-item:hover { background: #f9fafb; border-color: #f0f0f5; }
                .db-activity-icon {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.15rem;
                    flex-shrink: 0;
                    color: white;
                }
                .db-activity-text {
                    font-weight: 700;
                    color: #1f2937;
                    font-size: 0.85rem;
                    margin: 0 0 0.25rem;
                    line-height: 1.4;
                }
                .db-activity-time {
                    color: #9ca3af;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin: 0;
                }
                .db-view-all-btn {
                    margin-top: 1.25rem;
                    width: 100%;
                    padding: 0.85rem;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    font-weight: 800;
                    font-size: 0.85rem;
                    background: linear-gradient(135deg, #ede9fe, #dbeafe);
                    color: #4f46e5;
                    transition: all 0.3s ease;
                    letter-spacing: 0.01em;
                }
                .db-view-all-btn:hover {
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                    color: white;
                    box-shadow: 0 6px 16px rgba(79,70,229,0.3);
                    transform: translateY(-1px);
                }

                @keyframes dbFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .db-bottom-row { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .db-main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                    }
                    .db-stats-grid { grid-template-columns: 1fr 1fr; gap: 0.85rem; }
                    .db-header-card { padding: 1.25rem 1.25rem; }
                    .db-title { font-size: 1.45rem; }
                    .db-stat-value { font-size: 1.7rem; }
                    .db-card { padding: 1.25rem; border-radius: 18px; }
                }
                @media (max-width: 480px) {
                    .db-stats-grid { grid-template-columns: 1fr; }
                    .db-actions-grid { grid-template-columns: 1fr 1fr; }
                    .db-stat-card { padding: 1rem; }
                }
            `}</style>
        </>
    );
}

export default withAuth(AdminDashboard);
