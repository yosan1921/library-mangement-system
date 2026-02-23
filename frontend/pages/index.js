import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
    return (
        <>
            <Navbar />
            <div style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.title}>Welcome to Library Management System</h1>
                    <p style={styles.description}>
                        A modern digital solution for efficient library management. Organize, track, and manage
                        your library resources with ease. Whether you're a librarian managing collections or a
                        member searching for books, our system provides a seamless experience for everyone.
                    </p>
                    <div style={styles.ctaButtons}>
                        <Link href="/login" style={styles.primaryButton}>
                            Get Started
                        </Link>
                        <Link href="/about" style={styles.secondaryButton}>
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <h2 style={styles.sectionTitle}>Quick Access</h2>
                <p style={styles.subtitle}>Select your role to continue</p>

                <div style={styles.cards}>
                    <Link href="/admin/dashboard" style={styles.card}>
                        <div style={styles.cardIcon}>👨‍💼</div>
                        <h3 style={styles.cardTitle}>Admin</h3>
                        <p style={styles.cardText}>Manage books, members, and system settings</p>
                    </Link>

                    <Link href="/librarian/dashboard" style={styles.card}>
                        <div style={styles.cardIcon}>📖</div>
                        <h3 style={styles.cardTitle}>Librarian</h3>
                        <p style={styles.cardText}>Issue and return books, manage borrowing</p>
                    </Link>

                    <Link href="/member/dashboard" style={styles.card}>
                        <div style={styles.cardIcon}>👤</div>
                        <h3 style={styles.cardTitle}>Member</h3>
                        <p style={styles.cardText}>Search books and manage your reservations</p>
                    </Link>
                </div>

                <div style={styles.features}>
                    <h2 style={styles.sectionTitle}>Why Choose Our System?</h2>
                    <div style={styles.featureGrid}>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>⚡</div>
                            <h4 style={styles.featureTitle}>Fast & Efficient</h4>
                            <p style={styles.featureText}>Quick book searches and instant borrowing process</p>
                        </div>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>🔒</div>
                            <h4 style={styles.featureTitle}>Secure</h4>
                            <p style={styles.featureText}>Protected data with role-based access control</p>
                        </div>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>📱</div>
                            <h4 style={styles.featureTitle}>Responsive</h4>
                            <p style={styles.featureText}>Access from any device, anywhere, anytime</p>
                        </div>
                        <div style={styles.feature}>
                            <div style={styles.featureIcon}>📊</div>
                            <h4 style={styles.featureTitle}>Analytics</h4>
                            <p style={styles.featureText}>Comprehensive reports and insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    hero: {
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: 'clamp(3rem, 8vw, 5rem) 1rem',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '900px',
        margin: '0 auto',
    },
    title: {
        fontSize: 'clamp(2rem, 6vw, 3rem)',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        lineHeight: '1.2',
    },
    description: {
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        lineHeight: '1.8',
        marginBottom: '2rem',
        color: '#ecf0f1',
    },
    ctaButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    primaryButton: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '1.1rem',
        fontWeight: '500',
        transition: 'background-color 0.3s',
        display: 'inline-block',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '1.1rem',
        fontWeight: '500',
        border: '2px solid white',
        transition: 'background-color 0.3s',
        display: 'inline-block',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 4rem) 1rem',
    },
    sectionTitle: {
        fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
        color: '#2c3e50',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        color: '#7f8c8d',
        marginBottom: '3rem',
        textAlign: 'center',
    },
    cards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: '#2c3e50',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
        textAlign: 'center',
    },
    cardIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#2c3e50',
    },
    cardText: {
        fontSize: '1rem',
        color: '#7f8c8d',
        lineHeight: '1.6',
    },
    features: {
        marginTop: '4rem',
        padding: '3rem 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '3rem 2rem',
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
    },
    feature: {
        textAlign: 'center',
    },
    featureIcon: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
    },
    featureTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '0.5rem',
    },
    featureText: {
        fontSize: '0.95rem',
        color: '#7f8c8d',
        lineHeight: '1.6',
    },
};

// Add hover effects
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        a[style*="cursor: pointer"]:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
        }
        a[style*="backgroundColor: #3498db"]:hover {
            background-color: #2980b9 !important;
        }
        a[style*="border: 2px solid white"]:hover {
            background-color: rgba(255,255,255,0.1) !important;
        }
        @media (max-width: 768px) {
            div[style*="gap: 1rem"] {
                flex-direction: column;
            }
        }
    `;
    if (!document.querySelector('style[data-home]')) {
        style.setAttribute('data-home', 'true');
        document.head.appendChild(style);
    }
}
