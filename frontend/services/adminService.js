import axios from 'axios';

const API_URL = 'http://localhost:8081/api/admins';

export const getAllAdmins = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getActiveAdmins = async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
};

export const getAdminById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const getAdminByUsername = async (username) => {
    const response = await axios.get(`${API_URL}/username/${username}`);
    return response.data;
};

export const createAdmin = async (admin, createdBy = 'admin') => {
    const response = await axios.post(`${API_URL}?createdBy=${createdBy}`, admin);
    return response.data;
};

export const updateAdmin = async (id, admin) => {
    const response = await axios.put(`${API_URL}/${id}`, admin);
    return response.data;
};

export const updatePassword = async (id, oldPassword, newPassword) => {
    const response = await axios.put(`${API_URL}/${id}/password`, {
        oldPassword,
        newPassword
    });
    return response.data;
};

export const updateProfile = async (id, profileData) => {
    const response = await axios.put(`${API_URL}/${id}/profile`, profileData);
    return response.data;
};

export const deleteAdmin = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export const deactivateAdmin = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/deactivate`);
    return response.data;
};

export const activateAdmin = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/activate`);
    return response.data;
};

export const getAllPermissions = async () => {
    const response = await axios.get(`${API_URL}/permissions`);
    return response.data;
};

export const getDefaultPermissionsForRole = async (role) => {
    const response = await axios.get(`${API_URL}/permissions/role/${role}`);
    return response.data;
};

export const initializeDefaultAdmin = async () => {
    const response = await axios.post(`${API_URL}/initialize`);
    return response.data;
};
