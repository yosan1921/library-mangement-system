// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },

    // Admin Management
    ADMINS: {
        BASE: `${API_BASE_URL}/admins`,
        BY_ID: (id) => `${API_BASE_URL}/admins/${id}`,
        ACTIVE: `${API_BASE_URL}/admins/active`,
        BY_USERNAME: (username) => `${API_BASE_URL}/admins/username/${username}`,
        UPDATE_PASSWORD: (id) => `${API_BASE_URL}/admins/${id}/password`,
        UPDATE_PROFILE: (id) => `${API_BASE_URL}/admins/${id}/profile`,
        ACTIVATE: (id) => `${API_BASE_URL}/admins/${id}/activate`,
        DEACTIVATE: (id) => `${API_BASE_URL}/admins/${id}/deactivate`,
        PERMISSIONS: `${API_BASE_URL}/admins/permissions`,
        PERMISSIONS_BY_ROLE: (role) => `${API_BASE_URL}/admins/permissions/role/${role}`,
        INITIALIZE: `${API_BASE_URL}/admins/initialize`,
    },

    // Books
    BOOKS: {
        BASE: `${API_BASE_URL}/books`,
        BY_ID: (id) => `${API_BASE_URL}/books/${id}`,
        SEARCH: `${API_BASE_URL}/books/search`,
        AVAILABLE: `${API_BASE_URL}/books/available`,
    },

    // Members
    MEMBERS: {
        BASE: `${API_BASE_URL}/members`,
        BY_ID: (id) => `${API_BASE_URL}/members/${id}`,
        ACTIVE: `${API_BASE_URL}/members/active`,
    },

    // Borrows
    BORROWS: {
        BASE: `${API_BASE_URL}/borrows`,
        BY_ID: (id) => `${API_BASE_URL}/borrows/${id}`,
        ACTIVE: `${API_BASE_URL}/borrows/active`,
        OVERDUE: `${API_BASE_URL}/borrows/overdue`,
        RETURN: (id) => `${API_BASE_URL}/borrows/${id}/return`,
    },

    // Reservations
    RESERVATIONS: {
        BASE: `${API_BASE_URL}/reservations`,
        BY_ID: (id) => `${API_BASE_URL}/reservations/${id}`,
        PENDING: `${API_BASE_URL}/reservations/pending`,
        APPROVE: (id) => `${API_BASE_URL}/reservations/${id}/approve`,
        REJECT: (id) => `${API_BASE_URL}/reservations/${id}/reject`,
    },

    // Fines
    FINES: {
        BASE: `${API_BASE_URL}/fines`,
        BY_ID: (id) => `${API_BASE_URL}/fines/${id}`,
        UNPAID: `${API_BASE_URL}/fines/unpaid`,
        PAY: (id) => `${API_BASE_URL}/fines/${id}/pay`,
    },

    // Reports
    REPORTS: {
        DASHBOARD: `${API_BASE_URL}/reports/dashboard`,
        BOOKS: `${API_BASE_URL}/reports/books`,
        MEMBERS: `${API_BASE_URL}/reports/members`,
        FINES: `${API_BASE_URL}/reports/fines`,
    },

    // System Settings
    SETTINGS: {
        BASE: `${API_BASE_URL}/settings`,
        BY_KEY: (key) => `${API_BASE_URL}/settings/${key}`,
    },

    // Initialization
    INIT: {
        TEST_DATA: `${API_BASE_URL}/init/test-data`,
        CHECK_USERS: `${API_BASE_URL}/init/check-users`,
    },
};

export default API_BASE_URL;
