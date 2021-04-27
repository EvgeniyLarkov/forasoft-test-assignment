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
  RelayIceRequest,
  RelayIceResponse,
} from "./types";

const core = (app: FastifySocketInstance) => {
  const state = new State();

  app.io.on("connection", (socket: Socket) => {

    socket.on(EventTypes.join, (message: JoinRoomEventRequest, acknowledge) => {
      const { username, roomId } = message;
      const userData = { username, id: socket.id, roomId };
      console.log(roomId);
      if (roomId === undefined || !state.hasRoom(roomId)) {
        userData.roomId = socket.id;
        state.createRoom(userData.roomId);
      }

      if (!state.hasUser(userData.id)) {
        socket.join(userData.roomId);
        state.addUser(userData.roomId, userData);
      }

      const { messages, userIds } = state.getRoom(userData.roomId);
      const newUsers = userIds.map(id => {
        const data = state.getUser(id);
        return { id: data.id, username: data.username };
      });

      const response: JoinRoomEventResponse = {
        messages,
        users: newUsers,
        roomId: userData.roomId,
      };

      app.io.to(userData.id).emit(EventTypes.join, response);
      userIds.forEach(user => {
        if (user !== userData.id) {
          app.io.to(user).emit(EventTypes.NEW_USER, { id: userData.id, username: userData.username });
        }
      })
    });

    socket.on(EventTypes.message, (payload: MessageEventRequest) => {
      const { message, username, roomId } = payload;

      const response: MessageEventResponse = {
        username,
        message,
        date: new Date().toString()
      };

      state.addMessage(roomId, username, message, response.date);

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
            .userIds.map(id => {
              const data = state.getUser(id);
              return { id: data.id, username: data.username };
            });

          app.io.sockets.in(roomId).emit(EventTypes.leave, response);
        }
      }
    });

    socket.on(EventTypes.RELAY_SDP, ({ peerID, sessionDescription }) => {
      const roomId = state.getUserRoom(socket.id);
      console.log("NEW_DSC: ", peerID)
      app.io.sockets.in(roomId).emit(EventTypes.SESSION_DESCRIPTION, {
        peerID: peerID,
        sessionDescription,
      });
    });

    socket.on(EventTypes.START_TRANSMISSION, () => {
      console.log('start transmission', socket.id);
    });

    socket.on(EventTypes.STOP_TRANSMISSION, () => {
      console.log('stop transmission', socket.id);
    });

    socket.on(
      EventTypes.RELAY_ICE,
      ({ peerId, iceCandidate }: RelayIceRequest) => {
        console.log("NEW_ICE: ", peerId)
        const roomId = state.getUserRoom(socket.id);
        const response: RelayIceResponse = {
          peerId,
          iceCandidate,
        };
        app.io.sockets.in(roomId).emit(EventTypes.ICE_CANDIDATE, response);
      }
    );
  });
};

export default core;
