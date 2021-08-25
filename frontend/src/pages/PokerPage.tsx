import React, {useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {Box, Heading} from "grommet/es6";
import {v4 as uuid} from 'uuid';
import {ResultList} from "../components/ResultList";
import {GoBroadcast, SessionState, User} from "../models/models";
import {LoginLayer} from "../components/LoginLayer";
import {useParams} from 'react-router-dom'
import {NavHeader} from "../components/NavHeader";
import {PokerCard} from "../components/PokerCard";
import {SessionService} from "../service/SessionService";
import {StompService} from "../service/StompService";
import {Broadcast, Message, UserRole} from "../models/types";
import {SessionStateProvider} from "../service/SessionStateProvider";

const sessionService = new SessionService()
const pokerCards = ["1", "2", "3", "5", "8", "13", "20", "40", "100", "what", "break"]
let userUuid = uuid()

export const PokerPage = () => {
  const stompService = useMemo(() => new StompService(), [])
  const sessionStateProvider = useMemo(() => new SessionStateProvider(), [])
  const {sessionId} = useParams()
  const [message, setMessage] = useState<string>(Message.Hi)
  const [username, setUsername] = useState("")
  const [sessionState, setSessionState] = useState<SessionState>(sessionStateProvider.sessionCreated)
  const role = useRef(UserRole.Player)
  const [users, dispatchUsers] = useReducer((current: User[], broadcast: GoBroadcast) => {
    if (broadcast.type === Broadcast.GetUsers) {
      return broadcast.data
    }
    if (broadcast.type === Broadcast.VotingsReset) {
      return broadcast.data
    }
    if (broadcast.type === Broadcast.UpdateUsers) {
      return broadcast.data
    }
    return current
  }, [])

  useEffect(() => {
    checkRejoin()
    stompService.listen(sessionId, dispatchUsers, handleBroadcast)
  }, [])

  const handleBroadcast = (broadcast: GoBroadcast) => {
    if (broadcast.type === Broadcast.VotingsRevealed) {
      setSessionState(sessionStateProvider.votingsRevealed)
    }
    if (broadcast.type === Broadcast.UpdateUsers) {
      setSessionState(sessionStateProvider.userVoted)
    }
    if (broadcast.type === Broadcast.VotingsReset) {
      role.current === UserRole.Player
        ? setSessionState(sessionStateProvider.votingsResetPlayer)
        : setSessionState(sessionStateProvider.votingsResetWatcher)
    }
    if (broadcast.type === Broadcast.PlayerRemoved) {
      const removedUser: User = broadcast.data
      if (removedUser.uuid === userUuid) {
        logoutCurrentUser()
      }
    }
    if (broadcast.type === Broadcast.SessionNotFound) {
      setUsername("")
      setMessage(Message.SessionNotFound)
      setSessionState(sessionStateProvider.sessionNotFound(sessionState))
    }
  }

  const onVote = (value: string) => {
    stompService.vote(sessionId, userUuid, username, value)
    setSessionState(sessionStateProvider.userVoted)
  }

  const onResetVotings = () => {
    stompService.resetVotings(sessionId, userUuid, username)
  }

  const onRevealVotings = () => {
    stompService.revealVotings(sessionId, userUuid, username)
  }

  const onLogout = () => {
    stompService.removeUser(sessionId, userUuid, username)
    logoutCurrentUser()
  }

  const onJoinToVote = (username: string) => {
    stompService.saveUser(sessionId, userUuid, username)
    setUsername(username)
    setMessage(`Hi ${username}!`)
    setSessionState(sessionStateProvider.userJoined)
    sessionService.persistSessionContext({
      sessionId: sessionId,
      username: username,
      userUuid: userUuid,
      role: role.current
    })
  }

  const onJoinToWatch = (username: string) => {
    role.current = UserRole.Watcher
    setUsername(username)
    setMessage(`Hi ${username}!`)
    setSessionState(sessionStateProvider.watcherJoined)
    sessionService.persistSessionContext({
      sessionId: sessionId,
      username: username,
      userUuid: userUuid,
      role: role.current
    })
  }

  const onRemovePlayer = (uuid: string) => {
    stompService.removeUser(sessionId, uuid, username)
    setSessionState(sessionStateProvider.userRemoved)
  }

  const checkRejoin = () => {
    const context = sessionService.getSessionContext(sessionId)
    if (context !== null) {
      setUsername(context.username)
      setMessage(`Hi ${context.username}!`)
      userUuid = context.userUuid
      role.current = context.role
      role.current === UserRole.Player
        ? setSessionState(sessionStateProvider.userJoined)
        : setSessionState(sessionStateProvider.watcherJoined)
    }
  }

  const logoutCurrentUser = () => {
    sessionService.removeSessionContext(sessionId)
    setUsername("")
    setMessage(Message.Hi)
    setSessionState(sessionStateProvider.sessionCreated)
  }

  return (
    <Box>
      <NavHeader
        loginDisabled={sessionState.buttonLoginDisabled}
        logoutDisabled={sessionState.buttonLogoutDisabled}
        revealDisabled={sessionState.buttonRevealVotingsDisabled}
        resetVotingsDisabled={sessionState.buttonResetVotingsDisabled}
        resetUsersDisabled={true}
        loginHandler={() => setSessionState({...sessionState, loginLayerVisible: true})}
        revealHandler={onRevealVotings}
        logoutHandler={onLogout}
        resetVotingsHandler={onResetVotings}
      />
      {sessionState.loginLayerVisible ? <LoginLayer
        onVoteHandler={onJoinToVote}
        onWatchHandler={onJoinToWatch}
        onEscHandler={() => setSessionState({...sessionState, loginLayerVisible: false})}
        onOutsideClickHandler={() => setSessionState({...sessionState, loginLayerVisible: false})}
      /> : ""}
      <Box align={"center"} pad={"small"}>
        <Heading>{message}</Heading>
        <Box align={"center"} direction={"row"}>
          {pokerCards.map(c => <PokerCard key={c} onClickHandler={() => onVote(c)} value={c}
                                          disabled={sessionState.votingDisabled}/>)}
        </Box>
      </Box>
      <Box align={"center"} pad={"small"}>
        <Heading>Users:</Heading>
        <Box align={"center"} direction={"row"}>
          <ResultList userUuid={userUuid} data={users} sessionState={sessionState} onRemovePlayer={onRemovePlayer}/>
        </Box>
      </Box>
    </Box>
  );
}

export default PokerPage;