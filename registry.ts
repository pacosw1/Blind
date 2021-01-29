import { Socket, Server } from "socket.io";
import { CustomSocket } from "./socket"


export class Registry {


  constructor(serv: Server) {
    this.io = serv
  }

  public io: Server
  public usernameList: Set<string> = new Set()
  public clients: { [cookie: string]: CustomSocket } = {}


  Disconnect(authCookie: string, username: string) {

    this.usernameList.delete(username)
    delete this.clients[authCookie]

  }


  UpdateID(s: CustomSocket): Boolean {

    if (!this.clients[s.cookie]) {
      return false
    }

    this.clients[s.cookie] = s
    return true
  }


  CheckCookie(authCookie: string): Boolean {

    if (authCookie in this.clients) return true
    return false

  }



  AddUser(s: CustomSocket) {

    this.usernameList.add(s.username)
    this.clients[s.cookie] = s

  }






}