import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API_ENDPOINTS } from '../config/api';

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

    const testConnectivity = async () => {
        console.log('=== CONNECTIVITY TEST ===');
        try {
            const testUrl = 'http://localhost:8080/api/test/credentials';
            console.log('Testing connectivity to:', testUrl);

            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Test response status:', response.status);
            console.log('Test response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('✓ Backend is accessible:', data);
                alert('✓ Backend connection successful!\nCheck console for details.');
            } else {
                console.log('✗ Backend returned error:', response.status);
                alert(`✗ Backend error: ${response.status}\nCheck console for details.`);
            }
        } catch (err) {
            console.error('✗ Connection test failed:', err);
            alert(`✗ Cannot connect to backend!\nError: ${err.message}\n\nMake sure backend is running on http://localhost:8080`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('=== AUTHENTICATION DEBUG ===');
        console.log('Attempting to authenticate with:', {
            username: formData.username,
            password: formData.password
        });

        try {
            const requestBody = {
                username: formData.username,
                password: formData.password
            };

            console.log('API Endpoint:', API_ENDPOINTS.MEMBERS.AUTHENTICATE);
            console.log('Request body:', requestBody);

            const response = await fetch(API_ENDPOINTS.MEMBERS.AUTHENTICATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // Get response text first to see what we're actually receiving
            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            if (!response.ok) {
                let errorMessage = 'Login failed';
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('Parsed error response:', errorData);
                    errorMessage = errorData.error || errorData.message || 'Login failed';
                } catch (parseError) {
                    console.log('Could not parse error response as JSON:', parseError);
                    errorMessage = `Server error (${response.status}): ${responseText}`;
                }
                throw new Error(errorMessage);
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed success response:', data);
            } catch (parseError) {
                console.log('Could not parse success response as JSON:', parseError);
                throw new Error('Invalid response format from server');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data));
            console.log('User data stored in localStorage');

            // Redirect to member dashboard
            console.log('Redirecting to member dashboard...');
            router.push('/member/dashboard');
        } catch (err) {
            console.error('=== AUTHENTICATION ERROR ===');
            console.error('Error type:', err.constructor.name);
            console.error('Error message:', err.message);
            console.error('Full error:', err);

            let displayError = err.message;
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                displayError = 'Cannot connect to server. Make sure the backend is running on http://localhost:8080';
            }

            setError(displayError);
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
                        <label style={styles.label}>Username or Email</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Enter username or email"
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
                            placeholder="Enter password"
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
                    <div style={styles.debugSection}>
                        <button
                            type="button"
                            onClick={testConnectivity}
                            style={styles.testButton}
                        >
                            Test Backend Connection
                        </button>
                    </div>

                    <div style={styles.registerSection}>
                        <p style={styles.registerText}>Don't have an account?</p>
                        <Link href="/member-register" style={styles.registerLink}>
                            Register Here
                        </Link>
                    </div>

                    <div style={styles.testCredentials}>
                        <p style={styles.credentialsTitle}>Test Credentials:</p>
                        <p style={styles.hint}>Username: testmember</p>
                        <p style={styles.hint}>Password: password123</p>
                    </div>

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
    debugSection: {
        backgroundColor: '#fff3cd',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #ffeaa7'
    },
    testButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        fontWeight: '500'
    },
    registerSection: {
        backgroundColor: '#e8f5e8',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #10b981'
    },
    registerText: {
        fontSize: '0.9rem',
        color: '#065f46',
        margin: '0 0 0.5rem 0',
        fontWeight: '500'
    },
    registerLink: {
        color: '#10b981',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: 'bold',
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        borderRadius: '4px',
        border: '2px solid #10b981',
        display: 'inline-block',
        transition: 'all 0.3s'
    },
    testCredentials: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
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
        color: '#10b981',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
};
