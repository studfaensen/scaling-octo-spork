// frontend/src/services/proteinService.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Muss mit Ihrem Backend-Port übereinstimmen

const getProteins = (page = 1, per_page = 10, search = '') => {
    return axios.get(`${API_URL}/proteins`, {
        params: { page, per_page, search }
    });
};

const getProtein = (id) => {
    return axios.get(`${API_URL}/proteins/${id}`);
};

const createProtein = (proteinData) => {
    return axios.post(`${API_URL}/proteins`, proteinData);
};

const updateProtein = (id, proteinData) => {
    return axios.put(`${API_URL}/proteins/${id}`, proteinData);
};

const deleteProtein = (id) => {
    return axios.delete(`${API_URL}/proteins/${id}`);
};

export default {
    getProteins,
    getProtein,
    createProtein,
    updateProtein,
    deleteProtein
};
