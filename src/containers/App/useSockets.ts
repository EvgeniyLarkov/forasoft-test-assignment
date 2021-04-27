import { useEffect } from "react";
import socket from "../../socket";
import {
  EventTypes,
  JoinRoomEventRequest,
  JoinRoomEventResponse,
  MessageEventRequest,
  MessageEventResponse,
  MessageInterface,
  NewUserEventRequest,
  UsersClientInterface,
} from "../../../server/types";


const useSockets = (
  setUsers: React.Dispatch<React.SetStateAction<UsersClientInterface[]>>,
  setMessages: React.Dispatch<React.SetStateAction<MessageInterface[]>>,
  setRoomId: (x: string) => void
) => {
  useEffect(() => {
    socket.on("connection", () => {
    });

    socket.on(EventTypes.join, (payload: JoinRoomEventResponse) => {
      setUsers(payload.users);
      setRoomId(payload.roomId);
      setMessages(payload.messages);
      console.log('Join_USEr');
    });

    socket.on(EventTypes.NEW_USER, (payload: NewUserEventRequest) => {
      setUsers(prev => [...prev, payload]);
    });

    socket.on(EventTypes.message, (payload: MessageEventResponse) => {
      setMessages(prev => [...prev, payload]);
    });

    socket.on(EventTypes.leave, (payload: UsersClientInterface[]) => {
      setUsers(payload);
      console.log('User_leave');
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

  return [sendMessage, joinRoom] as const;
};

export default useSockets;
