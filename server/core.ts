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

      socket.join(userData.roomId);
      state.addUser(userData.roomId, userData);

      const { userIds, messages } = state.getRoom(userData.roomId);

      const response: JoinRoomEventResponse = {
        messages,
        users: userIds.map((id) => state.getUser(id).username),
        roomId: userData.roomId,
      };

      app.io.sockets.in(userData.roomId).emit(EventTypes.join, response);
    });

    socket.on(EventTypes.message, (payload: MessageEventRequest) => {
      const { message, username, roomId } = payload;

      state.addMessage(roomId, username, message);

      const response: MessageEventResponse = state.getRoom(roomId).messages;

      app.io.sockets.in(roomId).emit(EventTypes.message, response);
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
            .userIds.map((id) => state.getUser(id).username);

          app.io.sockets.in(roomId).emit(EventTypes.leave, response);
        }
      }
    });
  });
};

export default core;
