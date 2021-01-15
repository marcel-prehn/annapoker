export interface GoCommand {
  cmd: string,
  user?: User,
  sessionId: string,
}

export interface GoBroadcast {
  type: string,
  data: any,
  timestamp?: string
}

export interface User {
  uuid: string,
  username: string,
  voting?: string,
}