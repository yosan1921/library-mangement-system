import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={styles.container}>
            <Sidebar />
            <main style={{
                ...styles.main,
                marginLeft: (sidebarOpen && !isMobile) ? '220px' : '0',
            }}>
                {children}
            </main>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        backgroundColor: '#f5f6fa',
        minHeight: '100vh',
    },
    main: {
        flex: 1,
        padding: '2rem',
        transition: 'margin-left 0.3s ease-in-out',
        width: '100%',
    },
};

// Add responsive styles
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            main {
                margin-left: 0 !important;
                padding: 1rem !important;
            }
        }
    `;
    if (!document.querySelector('style[data-admin-layout]')) {
        style.setAttribute('data-admin-layout', 'true');
        document.head.appendChild(style);
    }
}
