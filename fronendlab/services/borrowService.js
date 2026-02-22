import axios from 'axios';

const API_URL = 'http://localhost:8081/api/borrow';
const RESERVATION_URL = 'http://localhost:8081/api/reservations';

export const issueBook = async (memberID, bookID) => {
    const response = await axios.post(`${API_URL}/issue`, { memberID, bookID });
    return response.data;
};

export const returnBook = async (recordId) => {
    const response = await axios.post(`${API_URL}/return/${recordId}`);
    return response.data;
};

export const getMemberBorrowHistory = async (memberID) => {
    const response = await axios.get(`${API_URL}/member/${memberID}`);
    return response.data;
};

export const getActiveBorrows = async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
};

export const getOverdueBooks = async () => {
    const response = await axios.get(`${API_URL}/overdue`);
    return response.data;
};

export const getPendingRequests = async () => {
    const response = await axios.get(`${API_URL}/pending`);
    return response.data;
};

export const approveBorrowRequest = async (recordId) => {
    const response = await axios.post(`${API_URL}/approve/${recordId}`);
    return response.data;
};

export const rejectBorrowRequest = async (recordId) => {
    const response = await axios.post(`${API_URL}/reject/${recordId}`);
    return response.data;
};

export const createReservation = async (memberID, bookID) => {
    const response = await axios.post(RESERVATION_URL, { memberID, bookID });
    return response.data;
};

export const getMemberReservations = async (memberID) => {
    const response = await axios.get(`${RESERVATION_URL}/member/${memberID}`);
    return response.data;
};

export const cancelReservation = async (id) => {
    await axios.delete(`${RESERVATION_URL}/${id}`);
};

export const approveReservation = async (id) => {
    const response = await axios.post(`${RESERVATION_URL}/${id}/approve`);
    return response.data;
};

export const notifyMember = async (id) => {
    const response = await axios.post(`${RESERVATION_URL}/${id}/notify`);
    return response.data;
};

export const fulfillReservation = async (id) => {
    const response = await axios.post(`${RESERVATION_URL}/${id}/fulfill`);
    return response.data;
};

export const cancelReservationByAdmin = async (id) => {
    const response = await axios.post(`${RESERVATION_URL}/${id}/cancel-admin`);
    return response.data;
};

export const getApprovedReservations = async () => {
    const response = await axios.get(`${RESERVATION_URL}/approved`);
    return response.data;
};

export const getExpiredReservations = async () => {
    const response = await axios.get(`${RESERVATION_URL}/expired`);
    return response.data;
};

export const getPendingReservations = async () => {
    const response = await axios.get(`${RESERVATION_URL}/pending`);
    return response.data;
};

export const getReservationsByBook = async (bookID) => {
    const response = await axios.get(`${RESERVATION_URL}/book/${bookID}`);
    return response.data;
};

export const getInvalidBorrowRecords = async () => {
    const response = await axios.get(`${API_URL}/invalid`);
    return response.data;
};

export const deleteInvalidBorrowRecord = async (recordId) => {
    const response = await axios.delete(`${API_URL}/invalid/${recordId}`);
    return response.data;
};

export const cleanupAllInvalidRecords = async () => {
    const response = await axios.post(`${API_URL}/cleanup-invalid`);
    return response.data;
};
