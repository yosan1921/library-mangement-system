import axios from 'axios';

const API_URL = 'http://localhost:8081/api/fines';

export const getAllFines = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getMemberFines = async (memberID) => {
    const response = await axios.get(`${API_URL}/member/${memberID}`);
    return response.data;
};

export const getMemberOutstanding = async (memberID) => {
    const response = await axios.get(`${API_URL}/member/${memberID}/outstanding`);
    return response.data;
};

export const getUnpaidFines = async () => {
    const response = await axios.get(`${API_URL}/unpaid`);
    return response.data;
};

export const getPartiallyPaidFines = async () => {
    const response = await axios.get(`${API_URL}/partially-paid`);
    return response.data;
};

export const calculateFine = async (borrowRecordID) => {
    const response = await axios.post(`${API_URL}/calculate/${borrowRecordID}`);
    return response.data;
};

export const createManualFine = async (memberID, amount, reason) => {
    const response = await axios.post(`${API_URL}/manual`, { memberID, amount, reason });
    return response.data;
};

export const recordPayment = async (fineID, amount, paymentMethod, notes = '') => {
    const response = await axios.post(`${API_URL}/${fineID}/payment`, {
        amount,
        paymentMethod,
        notes
    });
    return response.data;
};

export const waiveFine = async (fineID, reason) => {
    const response = await axios.post(`${API_URL}/${fineID}/waive`, { reason });
    return response.data;
};

export const getAllPayments = async () => {
    const response = await axios.get(`${API_URL}/payments`);
    return response.data;
};

export const getMemberPayments = async (memberID) => {
    const response = await axios.get(`${API_URL}/payments/member/${memberID}`);
    return response.data;
};

export const generateFineReport = async () => {
    const response = await axios.get(`${API_URL}/report`);
    return response.data;
};
