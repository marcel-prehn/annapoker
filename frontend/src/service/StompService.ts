import {Client} from "@stomp/stompjs";
import {v4 as uuid} from "uuid";
import {GoBroadcast, GoCommand} from "../models/models";
import {Command, Topic} from "../models/types";

export class StompService {
  client: Client | undefined

  constructor() {
    this.connect()
  }

  connect = () => {
    this.client = new Client({
      brokerURL: process.env["REACT_APP_WEBSOCKET_HOST"]!,
      connectHeaders: {
        login: process.env["REACT_APP_RABBITMQ_USER"]!,
        passcode: process.env["REACT_APP_RABBITMQ_PASS"]!,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: () => console.log("STOMP :: client trying to connect"),
    })
    this.client.activate()
  }

  disconnect = () => {
    if (this.client === undefined) {
      console.log("cannot disconnect: client undefined")
      return
    }
    this.client.forceDisconnect()
    this.client.deactivate()
    console.log("new client disconnected")
  }

  newSession = (): string => {
    if (this.client === undefined) {
      console.log("cannot create new session: client undefined")
      return ""
    }
    const sessionId = uuid()
    this.client.publish({
      destination: Topic.Command,
      body: JSON.stringify({cmd: Command.CreateSession, sessionId: sessionId})
    })
    console.log(">>> published CREATE_SESSION", sessionId)
    return sessionId
  }

  listen = (sessionId: string, dispatchUsers: Function, handleBroadcast: Function) => {
    this.client!.onConnect = () => {
      this.client!.subscribe(Topic.Broadcast + "." + sessionId, message => {
        let broadcast: GoBroadcast = JSON.parse(message.body)
        console.log("<<< received", broadcast.type)
        dispatchUsers(broadcast)
        handleBroadcast(broadcast)
      })
      const getUserCommand: GoCommand = {
        cmd: Command.GetUsers,
        sessionId: sessionId
      }
      this.client!.publish({destination: Topic.Command, body: JSON.stringify(getUserCommand)})
      console.log(">>> published", Command.GetUsers)
    }
  }

  vote = (sessionId: string, userUuid: string, username: string, value: string) => {
    const command: GoCommand = {
      cmd: Command.UpdateVotings,
      user: {uuid: userUuid, username: username, voting: value},
      sessionId: sessionId
    }
    this.publish(command)
  }

  resetVotings = (sessionId: string, userUuid: string, username: string) => {
    let command: GoCommand = {
      cmd: Command.ResetVotings,
      user: {username: username, uuid: userUuid},
      sessionId: sessionId
    }
    this.publish(command)
  }

  revealVotings = (sessionId: string, userUuid: string, username: string) => {
    let command: GoCommand = {
      cmd: Command.RevealVotings,
      user: {username: username, uuid: userUuid},
      sessionId: sessionId
    }
    this.publish(command)
  }

  saveUser = (sessionId: string, userUuid: string, username: string) => {
    let command: GoCommand = {
      cmd: Command.SaveUser,
      user: {uuid: userUuid, username: username, voting: "0"},
      sessionId: sessionId
    }
    this.publish(command)
  }

  removeUser = (sessionId: string, userUuid: string, username: string) => {
    let command: GoCommand = {
      cmd: Command.RemoveUser,
      user: {username: username, uuid: userUuid},
      sessionId: sessionId
    }
    this.publish(command)
  }

  private publish = (command: GoCommand) => {
    if (this.client === undefined) {
      console.log("cannot publish: client undefined")
      return
    }
    this.client!.publish({destination: Topic.Command, body: JSON.stringify(command)})
    console.log(">>> published", command.cmd)
  }

}
