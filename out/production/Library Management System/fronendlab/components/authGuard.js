import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * withAuth – wraps a page component so it is only accessible when a user
 * is logged in (i.e. a "user" key exists in localStorage).
 * Unauthenticated visitors are redirected to /login.
 */
export default function withAuth(WrappedComponent) {
    const AuthGuard = (props) => {
        const router = useRouter();
        const [checking, setChecking] = useState(true);

        useEffect(() => {
            try {
                const user = localStorage.getItem('user');
                if (!user) {
                    router.replace('/login');
                } else {
                    setChecking(false);
                }
            } catch {
                router.replace('/login');
            }
        }, [router]);

        if (checking) {
            return (
                <div style={styles.loader}>
                    <div style={styles.spinner} />
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };

    AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return AuthGuard;
}

const styles = {
    loader: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
    },
    spinner: {
        width: '44px',
        height: '44px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};

// Inject spin keyframe once
if (typeof window !== 'undefined') {
    if (!document.querySelector('style[data-auth-guard]')) {
        const s = document.createElement('style');
        s.setAttribute('data-auth-guard', 'true');
        s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(s);
    }
}
