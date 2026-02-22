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
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link href="/" style={styles.logo}>
                    Library Management System
                </Link>

                {/* Hamburger Menu Button */}
                <button
                    style={styles.hamburger}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span style={styles.hamburgerLine}></span>
                    <span style={styles.hamburgerLine}></span>
                    <span style={styles.hamburgerLine}></span>
                </button>

                {/* Desktop Menu */}
                <div style={styles.desktopLinks}>
                    <Link href="/" style={styles.link}>Home</Link>
                    <Link href="/about" style={styles.link}>About</Link>

                    {user ? (
                        <>
                            <Link href="/librarian/dashboard" style={styles.link}>Librarian</Link>
                            <Link href="/member/dashboard" style={styles.link}>Member</Link>
                            <div style={styles.userInfo}>
                                <span style={styles.userName}>{user.fullName || user.username}</span>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/librarian" style={styles.link}>Librarian</Link>
                            <Link href="/member" style={styles.link}>Member</Link>
                            <Link href="/login" style={styles.loginButton}>Login</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div style={styles.mobileMenu}>
                        <Link href="/" style={styles.mobileLink} onClick={toggleMenu}>Home</Link>
                        <Link href="/about" style={styles.mobileLink} onClick={toggleMenu}>About</Link>
                        {user ? (
                            <>
                                <Link href="/librarian/dashboard" style={styles.mobileLink} onClick={toggleMenu}>Librarian</Link>
                                <Link href="/member/dashboard" style={styles.mobileLink} onClick={toggleMenu}>Member</Link>
                                <div style={styles.mobileUserInfo}>
                                    <span style={styles.mobileUserName}>👤 {user.fullName || user.username}</span>
                                    <span style={styles.mobileUserRole}>{user.role}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        toggleMenu();
                                    }}
                                    style={styles.mobileLogoutButton}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/librarian" style={styles.mobileLink} onClick={toggleMenu}>Librarian</Link>
                                <Link href="/member" style={styles.mobileLink} onClick={toggleMenu}>Member</Link>
                                <Link href="/login" style={styles.mobileLoginButton} onClick={toggleMenu}>Login</Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    nav {
                        padding: 0.75rem 0;
                    }
                }
            `}</style>
        </nav>
    );
}

const styles = {
    navbar: {
        backgroundColor: '#2c3e50',
        padding: '1rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textDecoration: 'none',
        flexShrink: 0,
    },
    hamburger: {
        display: 'none',
        flexDirection: 'column',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        zIndex: 1000,
    },
    hamburgerLine: {
        width: '25px',
        height: '3px',
        backgroundColor: 'white',
        borderRadius: '2px',
        display: 'block',
    },
    desktopLinks: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        transition: 'color 0.3s',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingLeft: '1rem',
        borderLeft: '1px solid rgba(255,255,255,0.3)',
    },
    userName: {
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    loginButton: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        backgroundColor: '#3498db',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    },
    logoutButton: {
        color: 'white',
        fontSize: '0.9rem',
        backgroundColor: '#e74c3c',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        fontWeight: '500',
    },
    mobileMenu: {
        display: 'none',
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#34495e',
        flexDirection: 'column',
        padding: '1rem',
        gap: '0.75rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 999,
    },
    mobileLink: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        padding: '0.75rem',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
        display: 'block',
    },
    mobileUserInfo: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem',
        backgroundColor: '#2c3e50',
        borderRadius: '4px',
        gap: '0.25rem',
    },
    mobileUserName: {
        color: 'white',
        fontSize: '1rem',
        fontWeight: '600',
    },
    mobileUserRole: {
        color: '#95a5a6',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
    },
    mobileLoginButton: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        backgroundColor: '#3498db',
        padding: '0.75rem',
        borderRadius: '4px',
        textAlign: 'center',
        display: 'block',
    },
    mobileLogoutButton: {
        color: 'white',
        fontSize: '1rem',
        backgroundColor: '#e74c3c',
        padding: '0.75rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
        textAlign: 'center',
    },
};

// Add media query styles
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            nav div[style*="display: flex"] > a:not(:first-child),
            nav div[style*="display: flex"] > div {
                display: none !important;
            }
            nav button {
                display: flex !important;
            }
            nav > div > div:last-child {
                display: flex !important;
            }
        }
        @media (max-width: 480px) {
            nav a:first-child {
                font-size: 1.1rem !important;
            }
        }
        button[style*="backgroundColor: #3498db"]:hover {
            background-color: #2980b9 !important;
        }
        button[style*="backgroundColor: #e74c3c"]:hover {
            background-color: #c0392b !important;
        }
        a[style*="mobileLink"]:hover {
            background-color: rgba(255,255,255,0.1) !important;
        }
    `;
    if (!document.querySelector('style[data-navbar]')) {
        style.setAttribute('data-navbar', 'true');
        document.head.appendChild(style);
    }
}
