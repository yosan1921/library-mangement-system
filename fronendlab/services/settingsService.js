import axios from 'axios';

const API_URL = 'http://localhost:8081/api/settings';

export const getSettings = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const updateSettings = async (settings, updatedBy = 'admin') => {
    const response = await axios.put(`${API_URL}?updatedBy=${updatedBy}`, settings);
    return response.data;
};

export const resetToDefaults = async (updatedBy = 'admin') => {
    const response = await axios.post(`${API_URL}/reset?updatedBy=${updatedBy}`);
    return response.data;
};

export const getBackupStatistics = async () => {
    const response = await axios.get(`${API_URL}/backup/statistics`);
    return response.data;
};

export const exportBackup = async () => {
    const response = await axios.get(`${API_URL}/backup/export`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `library_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
};

export const restoreBackup = async (backupData) => {
    const response = await axios.post(`${API_URL}/backup/restore`, backupData);
    return response.data;
};
