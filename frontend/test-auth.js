// Simple test script to verify authentication
const fetch = require('node-fetch');

async function testAuth() {
    try {
        console.log('Testing admin login...');
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Login failed:', error);
            return;
        }

        const data = await response.json();
        console.log('Admin login successful:', data);

        // Test librarian login
        console.log('\nTesting librarian login...');
        const libResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'librarian',
                password: 'lib123'
            }),
        });

        if (!libResponse.ok) {
            const error = await libResponse.json();
            console.error('Librarian login failed:', error);
            return;
        }

        const libData = await libResponse.json();
        console.log('Librarian login successful:', libData);

    } catch (error) {
        console.error('Network error:', error.message);
    }
}

testAuth();