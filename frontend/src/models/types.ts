export enum Command {
  GetUsers = "GET_USERS",
  SaveUser = "SAVE_USER",
  RemoveUser = "REMOVE_PLAYER",
  UpdateVotings = "UPDATE_VOTING",
  ResetVotings = "RESET_VOTINGS",
  RevealVotings = "REVEAL_VOTINGS",
  CreateSession = "CREATE_SESSION",
}

export enum Broadcast {
  GetUsers = "GET_USERS",
  VotingsReset = "VOTINGS_RESET",
  UpdateUsers = "UPDATE_USERS",
  VotingsRevealed = "VOTINGS_REVEALED",
  PlayerRemoved = "PLAYER_REMOVED",
  SessionNotFound = "NO_SESSION_FOUND",
}

export enum UserRole {
  Player = "player",
  Watcher = "watcher,"
}

export enum Message {
  Hi = "Hi! Please join to vote",
  SessionNotFound = "Session not found :(",
}

export enum Topic {
  Broadcast = "/topic/go_stomp_broadcast",
  Command = "/topic/go_stomp_command",
}