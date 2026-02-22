import axios from 'axios';

const API_URL = 'http://localhost:8081/api/books';

export const getAllBooks = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getBookById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const addBook = async (book) => {
    const response = await axios.post(API_URL, book);
    return response.data;
};

export const updateBook = async (id, book) => {
    const response = await axios.put(`${API_URL}/${id}`, book);
    return response.data;
};

export const deleteBook = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export const searchBooks = async (query) => {
    const response = await axios.get(`${API_URL}/search`, { params: query });
    return response.data;
};

export const getAvailableBooks = async () => {
    const response = await axios.get(`${API_URL}/available`);
    return response.data;
};
