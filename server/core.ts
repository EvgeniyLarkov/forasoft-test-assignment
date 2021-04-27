import { Socket } from "socket.io";
import type { FastifySocketInstance } from "./app";
import State from "./state";
import {
  DisconnectResponse,
  EventTypes,
  JoinRoomEventRequest,
  JoinRoomEventResponse,
  MessageEventRequest,
  MessageEventResponse,
} from "./types";

const core = (app: FastifySocketInstance) => {
  const state = new State();

  app.io.on("connection", (socket: Socket) => {
    socket.on(EventTypes.join, (message: JoinRoomEventRequest, acknowledge) => {
      const { username, roomId } = message;
      const userData = { username, id: socket.id, roomId };

      if (roomId === undefined || !state.hasRoom(roomId)) {
        userData.roomId = socket.id;
        state.createRoom(userData.roomId);
      }

      if (!state.hasUser(userData.id)) {
        socket.join(userData.roomId);
        state.addUser(userData.roomId, userData);
      }

      const { messages, userIds } = state.getRoom(userData.roomId);
      const newUsers = userIds.map((id) => {
        const data = state.getUser(id);
        return { id: data.id, username: data.username };
      });

      const response: JoinRoomEventResponse = {
        messages,
        users: newUsers,
        roomId: userData.roomId,
      };

      socket.emit(EventTypes.join, response);
      socket.to(userData.roomId).emit(EventTypes.new_user, {
        id: userData.id,
        username: userData.username,
      });
    });

    socket.on(EventTypes.message, (payload: MessageEventRequest) => {
      const { message, username, roomId } = payload;

      const response: MessageEventResponse = {
        username,
        message,
        date: new Date().toString(),
      };

      state.addMessage(roomId, username, message, response.date);

      app.io.in(roomId).emit(EventTypes.message, response);
    });

    socket.on("disconnect", () => {
      const id = socket.id;
      if (state.hasUser(id)) {
        const { roomId } = state.getUser(id);
        state.removeUser(id);

        if (state.getRoom(roomId).userIds.length === 0) {
          // Удаление комнаты если в ней никого нет
          state.removeRoom(roomId);
        } else {
          const response: DisconnectResponse = state
            .getRoom(roomId)
            .userIds.map((id) => {
              const data = state.getUser(id);
              return { id: data.id, username: data.username };
            });

          app.io.in(roomId).emit(EventTypes.leave, response);
        }
      }
    });
  });
};

export default core;
