import axios from 'axios';

const API_URL = 'http://localhost:8081/api/reports';

// Book Reports
export const getMostBorrowedBooks = async (limit = 10) => {
    const response = await axios.get(`${API_URL}/books/most-borrowed?limit=${limit}`);
    return response.data;
};

export const getLeastBorrowedBooks = async (limit = 10) => {
    const response = await axios.get(`${API_URL}/books/least-borrowed?limit=${limit}`);
    return response.data;
};

export const getBookStatistics = async () => {
    const response = await axios.get(`${API_URL}/books/statistics`);
    return response.data;
};

// User Reports
export const getMostActiveMembers = async (limit = 10) => {
    const response = await axios.get(`${API_URL}/members/most-active?limit=${limit}`);
    return response.data;
};

export const getMemberActivityReport = async (memberID) => {
    const response = await axios.get(`${API_URL}/members/${memberID}/activity`);
    return response.data;
};

export const getMemberStatistics = async () => {
    const response = await axios.get(`${API_URL}/members/statistics`);
    return response.data;
};

// Overdue Reports
export const getOverdueReport = async () => {
    const response = await axios.get(`${API_URL}/overdue`);
    return response.data;
};

export const getOverdueStatistics = async () => {
    const response = await axios.get(`${API_URL}/overdue/statistics`);
    return response.data;
};

// Fine Reports
export const getFineReport = async () => {
    const response = await axios.get(`${API_URL}/fines`);
    return response.data;
};

export const getRecentPayments = async (limit = 10) => {
    const response = await axios.get(`${API_URL}/payments/recent?limit=${limit}`);
    return response.data;
};

// Dashboard Summary
export const getDashboardSummary = async () => {
    const response = await axios.get(`${API_URL}/dashboard-summary`);
    return response.data;
};
