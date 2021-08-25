import {SessionState} from "../models/models";

export class SessionStateProvider {

  sessionCreated = () => {
    console.log("current session config: sessionCreated")
    return {
      loginLayerVisible: true,
      buttonLoginDisabled: false,
      buttonLogoutDisabled: true,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: true,
      votingDisabled: true,
      removingPlayerDisabled: true,
      revealingForced: false,
    }
  }

  userVoted = () => {
    console.log("current session config: userVoted")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: false,
      votingDisabled: true,
      removingPlayerDisabled: true,
      revealingForced: false,
    }
  }

  votingsRevealed = () => {
    console.log("current session config: votingsRevealed")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: false,
      votingDisabled: true,
      removingPlayerDisabled: false,
      revealingForced: true,
    }
  }

  votingsResetPlayer = () => {
    console.log("current session config: votingsResetPlayer")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: true,
      votingDisabled: false,
      removingPlayerDisabled: false,
      revealingForced: false,
    }
  }

  votingsResetWatcher = () => {
    console.log("current session config: votingsResetWatcher")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: false,
      buttonResetVotingsDisabled: false,
      votingDisabled: true,
      removingPlayerDisabled: false,
      revealingForced: true,
    }
  }

  sessionNotFound = (current: SessionState) => {
    console.log("current session config: sessionNotFound")
    return {
      ...current,
      loginLayerVisible: false,
      buttonLoginDisabled: false,
      buttonLogoutDisabled: true,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: true,
      votingDisabled: true,
      removingPlayerDisabled: true,
      revealingForced: true,
    }
  }

  userJoined = () => {
    console.log("current session config: userJoined")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: true,
      votingDisabled: false,
      removingPlayerDisabled: false,
      revealingForced: false,
    }
  }

  watcherJoined = () => {
    console.log("current session config: watcherJoined")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: true,
      buttonLogoutDisabled: false,
      buttonRevealVotingsDisabled: false,
      buttonResetVotingsDisabled: false,
      votingDisabled: true,
      removingPlayerDisabled: false,
      revealingForced: true,
    }
  }

  userRemoved = () => {
    console.log("current session config: userRemoved")
    return {
      loginLayerVisible: false,
      buttonLoginDisabled: false,
      buttonLogoutDisabled: true,
      buttonRevealVotingsDisabled: true,
      buttonResetVotingsDisabled: true,
      votingDisabled: true,
      removingPlayerDisabled: true,
      revealingForced: true,
    }
  }
}