import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authService } from '../services/authService';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(formData.username, formData.password);

            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect based on role from backend response
            switch (data.role) {
                case 'ADMIN':
                case 'admin':
                    router.push('/admin/dashboard');
                    break;
                case 'LIBRARIAN':
                case 'librarian':
                    router.push('/librarian/dashboard');
                    break;
                case 'MEMBER':
                case 'member':
                    router.push('/member/dashboard');
                    break;
                default:
                    router.push('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <h1 style={styles.title}>Login</h1>
                <p style={styles.subtitle}>Library Management System</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <div style={styles.testCredentials}>
                        <p style={styles.credentialsTitle}>Test Credentials:</p>
                        <p style={styles.hint}>Admin: admin / admin123</p>
                        <p style={styles.hint}>Librarian: librarian / lib123</p>
                        <p style={styles.hint}>Member: member / mem123</p>
                    </div>
                    <Link href="/" style={styles.link}>
                        Back to Home
                    </Link>
                </div>
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
        backgroundColor: '#f5f5f5',
        padding: '1rem',
    },
    loginBox: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    subtitle: {
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#2c3e50',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    button: {
        padding: '0.875rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '0.5rem',
    },
    footer: {
        marginTop: '1.5rem',
        textAlign: 'center',
    },
    testCredentials: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    credentialsTitle: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '0.5rem'
    },
    hint: {
        fontSize: '0.85rem',
        color: '#7f8c8d',
        margin: '0.25rem 0',
    },
    link: {
        color: '#3498db',
        textDecoration: 'none',
        fontSize: '0.9rem',
    },
};
