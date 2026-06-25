import { io } from "socket.io-client";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const defaultSocketUrl = isLocalhost ? "http://localhost:5000" : "https://codelab-526i.vercel.app";

const socket = io(import.meta.env.VITE_SOCKET_URL || defaultSocketUrl, {
  autoConnect: false,
});

export default socket;
