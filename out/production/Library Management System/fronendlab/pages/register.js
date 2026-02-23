import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [membershipID, setMembershipID] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8081/api/members/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    contact: formData.contact
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setMembershipID(data.membershipID);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✓</div>
                    <h1 style={styles.successTitle}>Registration Successful!</h1>
                    <p style={styles.successText}>
                        Your membership ID is: <strong>{membershipID}</strong>
                    </p>
                    <p style={styles.successSubtext}>
                        Please save this ID for your records. You will be redirected to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Member Registration</h1>
                <p style={styles.subtitle}>Create your library account</p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Contact Number</label>
                        <input
                            type="tel"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            style={styles.input}
                            placeholder="(123) 456-7890"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength="6"
                            style={styles.input}
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="Re-enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div style={styles.footer}>
                    Already have an account? <Link href="/login" style={styles.link}>Login here</Link>
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
        backgroundColor: '#ecf0f1',
        padding: '2rem'
    },
    card: {
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
    },
    title: {
        color: '#2c3e50',
        marginBottom: '0.5rem',
        textAlign: 'center'
    },
    subtitle: {
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: '2rem'
    },
    error: {
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        textAlign: 'center'
    },
    form: {
        display: 'grid',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'grid',
        gap: '0.5rem'
    },
    label: {
        color: '#2c3e50',
        fontWeight: '500',
        fontSize: '0.95rem'
    },
    input: {
        padding: '0.75rem',
        border: '2px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
        outline: 'none'
    },
    button: {
        padding: '1rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '1rem'
    },
    footer: {
        textAlign: 'center',
        marginTop: '2rem',
        color: '#7f8c8d'
    },
    link: {
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: 'bold'
    },
    successCard: {
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
    },
    successIcon: {
        fontSize: '4rem',
        color: '#27ae60',
        marginBottom: '1rem'
    },
    successTitle: {
        color: '#27ae60',
        marginBottom: '1rem'
    },
    successText: {
        fontSize: '1.2rem',
        color: '#2c3e50',
        marginBottom: '1rem'
    },
    successSubtext: {
        color: '#7f8c8d'
    }
};
