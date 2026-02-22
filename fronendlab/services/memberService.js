import axios from 'axios';

const API_URL = 'http://localhost:8081/api/members';

export const getAllMembers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getMemberById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const addMember = async (member) => {
    const response = await axios.post(API_URL, member);
    return response.data;
};

export const updateMember = async (id, member) => {
    const response = await axios.put(`${API_URL}/${id}`, member);
    return response.data;
};

export const deleteMember = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export const getActiveMembers = async () => {
    const response = await axios.get(`${API_URL}/active`);
    return response.data;
};
