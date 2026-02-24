import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginSelection() {
    const router = useRouter();

    // If someone lands on /login, redirect to admin login by default
    useEffect(() => {
        router.push('/admin-login');
    }, [router]);

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h1 style={styles.title}>Select Login Type</h1>
                <p style={styles.subtitle}>Choose your role to continue</p>

                <div style={styles.grid}>
                    <Link href="/admin-login" style={styles.card}>
                        <div style={styles.icon}>👨‍💼</div>
                        <h2 style={styles.cardTitle}>Admin</h2>
                        <p style={styles.cardText}>System administrators</p>
                    </Link>

                    <Link href="/librarian-login" style={styles.card}>
                        <div style={styles.icon}>📚</div>
                        <h2 style={styles.cardTitle}>Librarian</h2>
                        <p style={styles.cardText}>Library staff</p>
                    </Link>

                    <Link href="/member-login" style={styles.card}>
                        <div style={styles.icon}>👤</div>
                        <h2 style={styles.cardTitle}>Member</h2>
                        <p style={styles.cardText}>Library members</p>
                    </Link>
                </div>

                <Link href="/" style={styles.backLink}>
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
    },
    box: {
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '800px',
        textAlign: 'center',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1rem',
        marginBottom: '2.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    card: {
        backgroundColor: '#f8f9fa',
        padding: '2rem 1.5rem',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s',
        border: '2px solid transparent',
        cursor: 'pointer',
    },
    icon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '0.5rem',
    },
    cardText: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
    },
    backLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
};
