export enum EventTypes {
  join = "join",
  conn = "connection",
  message = "message",
  leave = "leave",
}

export interface UsersInterface {
  id: string;
  username: string;
  roomId: string;
}

export interface MessageInterface {
  username: string;
  message: string;
  date: string;
}

export interface ChatRoomInterface {
  messages: MessageInterface[];
  userIds: string[];
}

export interface StateInterface {
  [x: string]: ChatRoomInterface;
}

export interface JoinRoomEventRequest {
  roomId: string;
  username: string;
}

export interface JoinRoomEventResponse {
  roomId: string;
  users: string[];
  messages: MessageInterface[];
}

export type MessageEventRequest = Pick<
  MessageInterface,
  "message" | "username"
> & {
  roomId: string;
};

export type MessageEventResponse = MessageInterface[];

export type DisconnectResponse = string[];
