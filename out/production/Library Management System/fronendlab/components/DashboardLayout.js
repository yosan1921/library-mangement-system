import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardLayout({ children, role }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(userData.username || userData.name || 'User');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('loginStatusChanged'));
        router.push('/login');
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex pt-16">
                {/* Sidebar - Hidden on mobile, slide in when open */}
                <div className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-50 lg:z-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
                    <Sidebar role={role} />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in w-full lg:w-auto overflow-x-hidden">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden fixed bottom-6 right-6 z-30 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                        aria-label="Toggle sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* User Info Bar with Logout */}
                    <div className="glass-card p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md animate-slide-down">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-lg">Welcome, {userName}!</p>
                                <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                                    <span className="text-lg">
                                        {role === 'admin' ? '👨‍💼' : role === 'librarian' ? '📖' : '👤'}
                                    </span>
                                    {role} Dashboard
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg transition-all hover:scale-105 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}
