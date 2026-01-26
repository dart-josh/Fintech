import axios from "axios";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

client.interceptors.response.use(
  (res) => res.data.data,
  (err) => Promise.reject(err.response?.data ?? err)
);

export default client;
