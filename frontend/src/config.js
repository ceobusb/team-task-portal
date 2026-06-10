const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const API_BASE_URL =
  apiBaseUrl !== undefined ? apiBaseUrl : "http://127.0.0.1:5052";

export const SOCKET_URL =
  socketUrl !== undefined ? socketUrl : "http://127.0.0.1:5052";
