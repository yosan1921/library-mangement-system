import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/authService';

export default function Navbar() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            authService.logout();
            setUser(null);
            router.push('/');
        }
    };

    return (
        <nav className="bg-[#2c3e50] py-4 shadow-md relative z-50">
            <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center relative">
                <Link href="/" className="text-white text-xl md:text-2xl font-bold no-underline shrink-0">
                    Library Management System
                </Link>

                {/* Hamburger Menu Button */}
                <button
                    className="md:hidden flex flex-col gap-1 bg-transparent border-none cursor-pointer p-2 z-[1000]"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="w-6 h-[3px] bg-white rounded-sm block"></span>
                    <span className="w-6 h-[3px] bg-white rounded-sm block"></span>
                    <span className="w-6 h-[3px] bg-white rounded-sm block"></span>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-6 items-center">
                    <Link href="/" className="text-white no-underline text-base transition-colors hover:text-gray-300">Home</Link>
                    <Link href="/about" className="text-white no-underline text-base transition-colors hover:text-gray-300">About</Link>

                    {user ? (
                        <>
                            <Link href="/librarian/dashboard" className="text-white no-underline text-base transition-colors hover:text-gray-300">Librarian</Link>
                            <Link href="/member/dashboard" className="text-white no-underline text-base transition-colors hover:text-gray-300">Member</Link>
                            <div className="flex items-center gap-4 pl-4 border-l border-white/30">
                                <span className="text-white text-sm font-medium">{user.fullName || user.username}</span>
                                <button onClick={handleLogout} className="text-white text-sm bg-[#e74c3c] hover:bg-[#c0392b] px-4 py-2 rounded transition-colors font-medium cursor-pointer border-none">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/librarian" className="text-white no-underline text-base transition-colors hover:text-gray-300">Librarian</Link>
                            <Link href="/member" className="text-white no-underline text-base transition-colors hover:text-gray-300">Member</Link>
                            <Link href="/login" className="text-white no-underline text-base bg-[#3498db] hover:bg-[#2980b9] px-4 py-2 rounded transition-colors">Login</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-[100%] left-0 right-0 bg-[#34495e] flex flex-col p-4 gap-3 shadow-lg z-[999] mt-4">
                        <Link href="/" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>Home</Link>
                        <Link href="/about" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>About</Link>
                        {user ? (
                            <>
                                <Link href="/librarian/dashboard" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>Librarian</Link>
                                <Link href="/member/dashboard" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>Member</Link>
                                <div className="flex flex-col p-3 bg-[#2c3e50] rounded gap-1 mt-2">
                                    <span className="text-white text-base font-semibold">👤 {user.fullName || user.username}</span>
                                    <span className="text-[#95a5a6] text-sm capitalize">{user.role}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        toggleMenu();
                                    }}
                                    className="text-white text-base bg-[#e74c3c] hover:bg-[#c0392b] p-3 rounded border-none cursor-pointer font-medium text-center mt-2 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/librarian" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>Librarian</Link>
                                <Link href="/member" className="text-white no-underline text-base p-3 rounded transition-colors hover:bg-white/10" onClick={toggleMenu}>Member</Link>
                                <Link href="/login" className="text-white no-underline text-base bg-[#3498db] hover:bg-[#2980b9] p-3 rounded text-center block mt-2 transition-colors" onClick={toggleMenu}>Login</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
