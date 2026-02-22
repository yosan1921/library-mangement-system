import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardLayout({ children, role }) {
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
        <div className="min-h-screen bg-[#f5f6fa] flex flex-col">
            <Navbar />

            <div className="flex flex-1 relative">
                <Sidebar role={role} />

                {/* Main Content - no fixed left margin on mobile, margin left on desktop to account for sidebar */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in w-full lg:ml-[260px] overflow-x-hidden min-h-[calc(100vh-60px)]">
                    {/* User Info Bar with Logout */}
                    <div className="bg-white/80 backdrop-blur border border-white/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-slide-down">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-lg m-0">Welcome, {userName}!</p>
                                <p className="text-sm text-gray-600 capitalize flex items-center gap-1 m-0 mt-1">
                                    <span className="text-lg">
                                        {role === 'admin' ? '👨‍💼' : role === 'librarian' ? '📖' : '👤'}
                                    </span>
                                    {role} Dashboard
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg transition-all hover:scale-105 font-semibold shadow-sm flex items-center gap-2 border-none cursor-pointer"
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
