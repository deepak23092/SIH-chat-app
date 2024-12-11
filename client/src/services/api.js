import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const login = async (credentials) =>
  axios.post(`${BASE_URL}/auth/login`, credentials);
export const register = async (userData) =>
  axios.post(`${BASE_URL}/auth/register`, userData);
export const getUserList = async (userId) =>
  axios.get(`${BASE_URL}/conversation/chats/${userId}`);
export const getMessages = async (senderId, receiverId) =>
  axios.get(`${BASE_URL}/conversation/${senderId}/${receiverId}`);
export const getUserById = async (userId) =>
  axios.get(`${BASE_URL}/conversation/${userId}`);
