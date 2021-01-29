import { Socket } from "socket.io"

//add custom fields to socket
export interface CustomSocket extends Socket {
  username: string;
  cookie: string
  serverID: string
}