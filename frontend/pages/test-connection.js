import { useState, useEffect } from 'react';

export default function TestConnection() {
    const [results, setResults] = useState({
        backend: 'Testing...',
        auth: 'Testing...',
        admin: 'Testing...',
        librarian: 'Testing...'
    });

    useEffect(() => {
        testConnections();
    }, []);

    const testConnections = async () => {
        // Test backend health
        try {
            const response = await fetch('http://localhost:8080/api/admins');
            if (response.ok) {
                setResults(prev => ({ ...prev, backend: '✅ Backend Connected' }));
            } else {
                setResults(prev => ({ ...prev, backend: `❌ Backend Error: ${response.status}` }));
            }
        } catch (error) {
            setResults(prev => ({ ...prev, backend: `❌ Backend Error: ${error.message}` }));
        }

        // Test admin auth
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'admin123' })
            });
            if (response.ok) {
                const data = await response.json();
                setResults(prev => ({ ...prev, admin: `✅ Admin Auth: ${data.role}` }));
            } else {
                setResults(prev => ({ ...prev, admin: `❌ Admin Auth Failed: ${response.status}` }));
            }
        } catch (error) {
            setResults(prev => ({ ...prev, admin: `❌ Admin Auth Error: ${error.message}` }));
        }

        // Test librarian auth
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'librarian', password: 'lib123' })
            });
            if (response.ok) {
                const data = await response.json();
                setResults(prev => ({ ...prev, librarian: `✅ Librarian Auth: ${data.role}` }));
            } else {
                setResults(prev => ({ ...prev, librarian: `❌ Librarian Auth Failed: ${response.status}` }));
            }
        } catch (error) {
            setResults(prev => ({ ...prev, librarian: `❌ Librarian Auth Error: ${error.message}` }));
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Connection Test Results</h1>
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                <p><strong>Backend Connection:</strong> {results.backend}</p>
                <p><strong>Admin Authentication:</strong> {results.admin}</p>
                <p><strong>Librarian Authentication:</strong> {results.librarian}</p>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2>Test Credentials:</h2>
                <div style={{ background: '#e8f4fd', padding: '1rem', borderRadius: '8px' }}>
                    <p><strong>Admin:</strong> username: admin, password: admin123</p>
                    <p><strong>Librarian:</strong> username: librarian, password: lib123</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <button onClick={testConnections} style={{
                    padding: '0.5rem 1rem',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Retest Connections
                </button>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h2>Quick Links:</h2>
                <ul>
                    <li><a href="/admin-login">Admin Login</a></li>
                    <li><a href="/librarian-login">Librarian Login</a></li>
                    <li><a href="/member-login">Member Login</a></li>
                </ul>
            </div>
        </div>
    );
}