import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import {
  EventTypes,
  JoinRoomEventRequest,
  JoinRoomEventResponse,
  MessageEventRequest,
  MessageEventResponse,
  MessageInterface,
  UsersClientInterface,
} from "../../../server/types";


const useSockets = (
  setUsers: (x: UsersClientInterface[]) => void,
  setMessages: (x: MessageInterface[]) => void,
  setRoomId: (x: string) => void
) => {
  const socket = useMemo(() => io("http://localhost:8040/"), []);

  useEffect(() => {
    socket.on("connection", () => {
    });

    socket.on(EventTypes.join, (payload: JoinRoomEventResponse) => {
      setUsers(payload.users);
      setRoomId(payload.roomId);
      setMessages(payload.messages);
      console.log()
    });

    socket.on(EventTypes.message, (payload: MessageEventResponse) => {
      setMessages(payload);
    });

    socket.on(EventTypes.leave, (payload: UsersClientInterface[]) => {
      setUsers(payload);
    });
  }, []);

  

  const sendMessage = (username: string, roomId: string) => (msg: string) => {
    const request: MessageEventRequest = {
      message: msg,
      roomId,
      username,
    };
    socket.emit(EventTypes.message, request);
  };

  const joinRoom = (username: string, id: string) => {
    const request: JoinRoomEventRequest = {
      roomId: id,
      username,
    };
    socket.emit(EventTypes.join, request);
  };

  return [sendMessage, joinRoom, socket] as const;
};

export default useSockets;
