import axios from 'axios';

const API_URL = 'http://localhost:8081/api/notifications';

export const getAllNotifications = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getNotificationsByMember = async (memberId) => {
    const response = await axios.get(`${API_URL}/member/${memberId}`);
    return response.data;
};

export const getNotificationsByStatus = async (status) => {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
};

export const getNotificationsByCategory = async (category) => {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
};

export const createCustomNotification = async (memberId, subject, message, category = 'GENERAL') => {
    const response = await axios.post(`${API_URL}/custom`, {
        memberId,
        subject,
        message,
        category
    });
    return response.data;
};

export const sendNotification = async (notificationId) => {
    const response = await axios.post(`${API_URL}/send/${notificationId}`);
    return response.data;
};

export const sendBulkNotifications = async (notificationIds) => {
    const response = await axios.post(`${API_URL}/send/bulk`, notificationIds);
    return response.data;
};

export const getNotificationStatistics = async () => {
    const response = await axios.get(`${API_URL}/statistics`);
    return response.data;
};

export const deleteNotification = async (notificationId) => {
    const response = await axios.delete(`${API_URL}/${notificationId}`);
    return response.data;
};

export const deleteOldNotifications = async () => {
    const response = await axios.delete(`${API_URL}/cleanup`);
    return response.data;
};

export const testNotificationConfiguration = async (email, phone) => {
    const response = await axios.post(`${API_URL}/test`, { email, phone });
    return response.data;
};

export const triggerAutomaticNotifications = async () => {
    const response = await axios.post(`${API_URL}/trigger-automatic`);
    return response.data;
};
