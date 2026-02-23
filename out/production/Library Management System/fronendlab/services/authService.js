const API_URL = 'http://localhost:8081/api/auth';

export const authService = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
            });
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    },
};
