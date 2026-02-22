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
            {/* Mobile hamburger toggle (floats when closed on mobile) */}
            <button
                className="lg:hidden fixed top-[4.5rem] left-4 z-[900] bg-[#2c3e50] hover:bg-[#34495e] text-white border-none rounded-lg w-10 h-10 flex items-center justify-center text-xl cursor-pointer shadow-md transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle sidebar"
            >
                <span>{mobileOpen ? '✕' : '☰'}</span>
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-[990] backdrop-blur-[2px]"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`fixed top-0 bottom-0 left-0 w-[260px] bg-[#2c3e50] text-white z-[995] overflow-y-auto shadow-lg transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/10 bg-[#1a252f]">
                    <h2 className="text-2xl font-bold m-0 text-[#3498db]">{panelTitle}</h2>
                </div>
                <nav className="py-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-6 py-3 text-[#ecf0f1] no-underline transition-all duration-250 border-l-[3px] border-transparent text-[0.95rem] hover:bg-[#34495e] hover:pl-8 ${isActive(item.path) ? 'bg-[#34495e] !border-[#3498db] text-white' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="text-xl mr-4 min-w-[24px]">{item.icon}</span>
                            <span className="text-[0.95rem]">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <style jsx global>{`
                /* ── Scrollbar ── */
                aside {
                    scrollbar-width: thin;
                    scrollbar-color: #34495e #2c3e50;
                }
                aside::-webkit-scrollbar { width: 6px; }
                aside::-webkit-scrollbar-track { background: #2c3e50; }
                aside::-webkit-scrollbar-thumb { background: #34495e; border-radius: 3px; }
            `}</style>
        </>
    );
}
