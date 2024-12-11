import axios from "axios";

const BASE_URL = "https://sih-chat-app-rho.vercel.app/api";

export const getUserList = async (userId) =>
  axios.get(`${BASE_URL}/conversation/chats/${userId}`);
export const getMessages = async (senderId, receiverId) =>
  axios.get(`${BASE_URL}/conversation/${senderId}/${receiverId}`);
export const getUserById = async (userId) =>
  axios.get(`${BASE_URL}/conversation/${userId}`);
