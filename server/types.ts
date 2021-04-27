export enum EventTypes {
  join = "join",
  message = "message",
  leave = "leave",
  new_user = 'new_user', 
}

export interface UsersInterface {
  id: string;
  username: string;
  roomId: string;
}

export type UsersClientInterface = Pick<UsersInterface, 'id' | 'username'>

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

export type NewUserEventRequest = UsersClientInterface

export interface JoinRoomEventRequest {
  roomId: string;
  username: string;
}

export interface JoinRoomEventResponse {
  roomId: string;
  users: UsersClientInterface[];
  messages: MessageInterface[];
}

export type MessageEventRequest = Pick<
  MessageInterface,
  "message" | "username"
> & {
  roomId: string;
};

export type MessageEventResponse = MessageInterface;

export type DisconnectResponse = UsersClientInterface[];
