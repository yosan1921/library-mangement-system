import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Sidebar({ role = 'admin' }) {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const adminMenuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Manage Books', path: '/admin/books', icon: '📚' },
        { name: 'Manage Members', path: '/admin/members', icon: '👥' },
        { name: 'Borrowing & Returns', path: '/admin/borrows', icon: '🔄' },
        { name: 'Reservations', path: '/admin/reservations', icon: '📅' },
        { name: 'Fines & Payments', path: '/admin/fines', icon: '💰' },
        { name: 'Reports & Analytics', path: '/admin/reports', icon: '📈' },
        { name: 'System Settings', path: '/admin/settings', icon: '⚙️' },
        { name: 'Admin Accounts', path: '/admin/admins', icon: '👨‍💼' },
    ];

    const librarianMenuItems = [
        { name: 'Dashboard', path: '/librarian/dashboard', icon: '📊' },
        { name: 'Manage Books', path: '/librarian/books', icon: '📚' },
        { name: 'Issue Book', path: '/librarian/issueBook', icon: '📤' },
        { name: 'Return Book', path: '/librarian/returnBook', icon: '📥' },
        { name: 'Members', path: '/librarian/members', icon: '👥' },
        { name: 'Manage Fines', path: '/librarian/fines', icon: '💰' },
    ];

    const memberMenuItems = [
        { name: 'Dashboard', path: '/member/dashboard', icon: '📊' },
        { name: 'Browse Books', path: '/member/books', icon: '📚' },
        { name: 'My Borrows', path: '/member/borrows', icon: '📖' },
        { name: 'My Reservations', path: '/member/reservations', icon: '📅' },
        { name: 'My Fines', path: '/member/fines', icon: '💰' },
    ];

    const menuItems = role === 'librarian' ? librarianMenuItems :
        role === 'member' ? memberMenuItems :
            adminMenuItems;

    const panelTitle = role === 'librarian' ? 'Librarian Panel' :
        role === 'member' ? 'Member Portal' :
            'Admin Panel';

    const isActive = (path) => router.pathname === path;

    return (
        <>
            {/* Mobile hamburger toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle sidebar"
            >
                <span>{mobileOpen ? '✕' : '☰'}</span>
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">{panelTitle}</h2>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`sidebar-link ${isActive(item.path) ? 'sidebar-link--active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-link-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <style jsx global>{`
                /* ── Sidebar Core ── */
                .admin-sidebar {
                    width: 260px;
                    background-color: #2c3e50;
                    min-height: 100vh;
                    color: white;
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    overflow-y: auto;
                    box-shadow: 2px 0 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    background-color: #1a252f;
                }
                .sidebar-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                    color: #3498db;
                }
                .sidebar-nav {
                    padding: 1rem 0;
                }
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    padding: 0.85rem 1.5rem;
                    color: #ecf0f1;
                    text-decoration: none;
                    transition: all 0.25s ease;
                    border-left: 3px solid transparent;
                    font-size: 0.95rem;
                }
                .sidebar-link:hover {
                    background-color: #34495e;
                    padding-left: 2rem;
                }
                .sidebar-link--active {
                    background-color: #34495e;
                    border-left: 3px solid #3498db;
                    color: white;
                }
                .sidebar-icon {
                    font-size: 1.25rem;
                    margin-right: 1rem;
                    min-width: 24px;
                }
                .sidebar-link-text {
                    font-size: 0.95rem;
                }

                /* ── Scrollbar ── */
                .admin-sidebar {
                    scrollbar-width: thin;
                    scrollbar-color: #34495e #2c3e50;
                }
                .admin-sidebar::-webkit-scrollbar { width: 6px; }
                .admin-sidebar::-webkit-scrollbar-track { background: #2c3e50; }
                .admin-sidebar::-webkit-scrollbar-thumb { background: #34495e; border-radius: 3px; }

                /* ── Mobile Toggle Button ── */
                .sidebar-toggle {
                    display: none;
                    position: fixed;
                    top: 0.75rem;
                    left: 0.75rem;
                    z-index: 1100;
                    background: #2c3e50;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    width: 42px;
                    height: 42px;
                    font-size: 1.3rem;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    transition: background-color 0.2s;
                }
                .sidebar-toggle:hover {
                    background: #34495e;
                }

                /* ── Mobile Overlay ── */
                .sidebar-overlay {
                    display: none;
                }

                /* ── Mobile Responsive ── */
                @media (max-width: 768px) {
                    .admin-sidebar {
                        transform: translateX(-100%);
                    }
                    .admin-sidebar.admin-sidebar--open {
                        transform: translateX(0);
                    }
                    .sidebar-toggle {
                        display: flex;
                    }
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 999;
                        backdrop-filter: blur(2px);
                    }
                }
            `}</style>
        </>
    );
}
