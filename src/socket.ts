import { io } from "socket.io-client";

const host = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080' : 'https://socketschat.herokuapp.com';

const socket = io(host);

export default socket;