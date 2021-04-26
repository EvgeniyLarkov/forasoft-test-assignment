export enum EventTypes {
  join = "join",
  conn = "connection",
  message = "message",
  leave = "leave", // REMOVE_PEER

  START_TRANSMISSION = 'start-transmission',
  STOP_TRANSMISSION = 'start-transmission',
  ADD_PEER = 'add-peer',
  REMOVE_PEER = 'remove-peer',
  RELAY_SDP = 'relay-sdp',
  RELAY_ICE = 'relay-ice',
  ICE_CANDIDATE = 'ice-candidate',
  SESSION_DESCRIPTION = 'session-description'
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

export type MessageEventResponse = MessageInterface[];

export type DisconnectResponse = string[];

export interface RelaySdpRequest {
  peerId: string,
  sessionDescription: RTCSessionDescription 
}

export interface RelayIceRequest {
  peerId: string,
  iceCandidate: RTCIceCandidate 
}

export type RelaySdpResponse = RelaySdpRequest;

export type RelayIceResponse = RelayIceRequest;