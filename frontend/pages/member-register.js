import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MemberRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [membershipID, setMembershipID] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Phone number validation function
    const validatePhoneNumber = (phone) => {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if it's a valid length (10-15 digits)
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    };

    // Format phone number as user types
    const formatPhoneNumber = (value) => {
        // Remove all non-digit characters
        const phoneNumber = value.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX for US numbers
        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 6) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format phone number as user types
        if (name === 'contact') {
            formattedValue = formatPhoneNumber(value);
        }

        setFormData({
            ...formData,
            [name]: formattedValue
        });

        // Clear validation errors when user starts typing
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
        setError('');
    };

    const validateForm = () => {
        const errors = {};

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address (e.g., example@gmail.com)';
        }

        // Phone validation
        if (formData.contact.trim() && !validatePhoneNumber(formData.contact)) {
            errors.contact = 'Please enter a valid phone number (10-15 digits)';
        }

        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/members/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    username: formData.username.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    contact: formData.contact.replace(/\D/g, '') // Send only digits for phone
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setMembershipID(data.membershipID);
                setTimeout(() => {
                    router.push('/member-login');
                }, 4000);
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
                    <div style={styles.successDetails}>
                        <p style={styles.successText}>
                            <strong>Username:</strong> {formData.username}
                        </p>
                        <p style={styles.successText}>
                            <strong>Membership ID:</strong> {membershipID}
                        </p>
                    </div>
                    <p style={styles.successSubtext}>
                        Please save these details for your records. You will be redirected to login...
                    </p>
                    <Link href="/member-login" style={styles.loginNowButton}>
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.iconCircle}>📝</div>
                    <h1 style={styles.title}>Member Registration</h1>
                    <p style={styles.subtitle}>Create your library account</p>
                </div>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    ...styles.input,
                                    borderColor: validationErrors.name ? '#ef4444' : '#e2e8f0'
                                }}
                                placeholder="Enter your full name"
                            />
                            {validationErrors.name && (
                                <span style={styles.errorText}>{validationErrors.name}</span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    ...styles.input,
                                    borderColor: validationErrors.username ? '#ef4444' : '#e2e8f0'
                                }}
                                placeholder="Choose a username (min 3 chars)"
                            />
                            {validationErrors.username && (
                                <span style={styles.errorText}>{validationErrors.username}</span>
                            )}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                ...styles.input,
                                borderColor: validationErrors.email ? '#ef4444' : '#e2e8f0'
                            }}
                            placeholder="example@gmail.com"
                        />
                        {validationErrors.email && (
                            <span style={styles.errorText}>{validationErrors.email}</span>
                        )}
                        <span style={styles.helpText}>
                            📧 Notifications will be sent to this email address
                        </span>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Contact Number</label>
                        <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            style={{
                                ...styles.input,
                                borderColor: validationErrors.contact ? '#ef4444' : '#e2e8f0'
                            }}
                            placeholder="(123) 456-7890"
                            maxLength="14"
                        />
                        {validationErrors.contact && (
                            <span style={styles.errorText}>{validationErrors.contact}</span>
                        )}
                        <span style={styles.helpText}>
                            📱 SMS notifications will be sent to this number (optional)
                        </span>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                style={{
                                    ...styles.input,
                                    borderColor: validationErrors.password ? '#ef4444' : '#e2e8f0'
                                }}
                                placeholder="At least 6 characters"
                            />
                            {validationErrors.password && (
                                <span style={styles.errorText}>{validationErrors.password}</span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={{
                                    ...styles.input,
                                    borderColor: validationErrors.confirmPassword ? '#ef4444' : '#e2e8f0'
                                }}
                                placeholder="Re-enter password"
                            />
                            {validationErrors.confirmPassword && (
                                <span style={styles.errorText}>{validationErrors.confirmPassword}</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already have an account?
                        <Link href="/member-login" style={styles.loginLink}> Login here</Link>
                    </p>
                    <Link href="/member" style={styles.backLink}>
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
        padding: '2rem'
    },
    card: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%'
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
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        textAlign: 'center',
        border: '1px solid #fcc'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50'
    },
    input: {
        padding: '0.875rem',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s'
    },
    errorText: {
        color: '#ef4444',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        display: 'block'
    },
    helpText: {
        color: '#6b7280',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        display: 'block',
        fontStyle: 'italic'
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
        marginTop: '0.5rem'
    },
    footer: {
        marginTop: '2rem',
        textAlign: 'center'
    },
    footerText: {
        color: '#7f8c8d',
        marginBottom: '1rem'
    },
    loginLink: {
        color: '#10b981',
        textDecoration: 'none',
        fontWeight: 'bold'
    },
    backLink: {
        color: '#10b981',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500'
    },

    // Success page styles
    successCard: {
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
    },
    successIcon: {
        fontSize: '4rem',
        color: '#10b981',
        marginBottom: '1rem'
    },
    successTitle: {
        color: '#10b981',
        marginBottom: '1.5rem',
        fontSize: '1.75rem',
        fontWeight: 'bold'
    },
    successDetails: {
        backgroundColor: '#f0fdf4',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #10b981'
    },
    successText: {
        fontSize: '1.1rem',
        color: '#065f46',
        margin: '0.5rem 0',
        fontWeight: '500'
    },
    successSubtext: {
        color: '#7f8c8d',
        marginBottom: '2rem'
    },
    loginNowButton: {
        display: 'inline-block',
        padding: '0.875rem 2rem',
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        transition: 'transform 0.2s'
    }
};

// Add responsive styles
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr !important;
            }
        }
        input:focus {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px) !important;
        }
        a:hover {
            text-decoration: underline !important;
        }
    `;
    if (!document.querySelector('style[data-member-register]')) {
        style.setAttribute('data-member-register', 'true');
        document.head.appendChild(style);
    }
}