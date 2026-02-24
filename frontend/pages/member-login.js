import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authService } from '../services/authService';

export default function MemberLogin() {
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

            // Only allow member role
            if (data.role === 'member' || data.role === 'MEMBER') {
                localStorage.setItem('user', JSON.stringify(data));
                router.push('/member/dashboard');
            } else {
                setError('Access denied. This login is for members only.');
            }
        } catch (err) {
            setError(err.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <div style={styles.header}>
                    <div style={styles.iconCircle}>👤</div>
                    <h1 style={styles.title}>Member Login</h1>
                    <p style={styles.subtitle}>Library Management System</p>
                </div>

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
                            placeholder="Enter member username"
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
                            placeholder="Enter member password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login as Member'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link href="/member" style={styles.link}>
                        ← Back to Member Page
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
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        padding: '1rem',
    },
    loginBox: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    iconCircle: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        margin: '0 auto 1rem',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '0.95rem',
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        textAlign: 'center',
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
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '0.875rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s',
    },
    button: {
        padding: '1rem',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        marginTop: '0.5rem',
    },
    footer: {
        marginTop: '1.5rem',
        textAlign: 'center',
    },
    link: {
        color: '#10b981',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
};
