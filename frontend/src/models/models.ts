import {UserRole} from "./types";

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

export interface SessionState {
  loginLayerVisible: boolean,
  buttonLoginDisabled: boolean,
  buttonLogoutDisabled: boolean,
  buttonRevealVotingsDisabled: boolean,
  buttonResetVotingsDisabled: boolean,
  votingDisabled: boolean,
  removingPlayerDisabled: boolean,
  revealingForced: boolean,
}

export interface SessionContext {
  sessionId: string,
  userUuid: string,
  username: string,
  role: UserRole,
}