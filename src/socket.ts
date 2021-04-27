import { io } from "socket.io-client";

const socket = io("http://localhost:8040/");

export default socket;