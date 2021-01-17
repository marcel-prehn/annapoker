import React, {useEffect, useReducer, useRef, useState} from 'react';
import {Box, Heading} from "grommet/es6";
import {Client} from '@stomp/stompjs';
import {v4 as uuid} from 'uuid';
import {ResultList} from "../components/ResultList";
import {GoBroadcast, GoCommand, User} from "../models/models";
import {LoginLayer} from "../components/LoginLayer";
import {useParams} from 'react-router-dom'
import {NavHeader} from "../components/NavHeader";
import {PokerCard} from "../components/PokerCard";

const client = new Client({
    brokerURL: process.env["REACT_APP_WEBSOCKET_HOST"],
    connectHeaders: {
        login: process.env["REACT_APP_RABBITMQ_USER"]!,
        passcode: process.env["REACT_APP_RABBITMQ_PASS"]!,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 1000,
    heartbeatOutgoing: 1000,
})

const topicCommand = "/topic/go_stomp_command"
const topicBroadcast = "/topic/go_stomp_broadcast"
const pokerCards = ["1", "2", "3", "5", "8", "13", "20", "40", "100", "what", "break"]
let userUuid = uuid()

export const PokerPage = () => {
    const sessionConfig = {
        loginLayerVisible: false,
        loginDisabled: true,
        logoutDisabled: true,
        revealDisabled: true,
        resetVotingsDisabled: true,
        votingDisabled: true,
        forceReveal: false,
        removePlayerDisabled: true,
    }
    const {sessionId} = useParams()
    const [message, setMessage] = useState("Hi! Login to Vote")
    const [username, setUsername] = useState("")
    const [sessionState, setSessionState] = useState(sessionConfig)
    const role = useRef("player")

    const [users, dispatchUsers] = useReducer((current: User[], broadcast: GoBroadcast) => {
        if (broadcast.type === "GET_USERS") {
            return broadcast.data
        }
        if (broadcast.type === "VOTINGS_RESET") {
            return broadcast.data
        }
        if (broadcast.type === "UPDATE_USERS") {
            return broadcast.data
        }
        return current
    }, [])

    useEffect(() => {
        client.onConnect = () => {
            checkRejoin()
            client.subscribe(topicBroadcast + "." + sessionId, message => {
                let broadcast: GoBroadcast = JSON.parse(message.body)
                console.log("<<< received", broadcast.type)
                dispatchUsers(broadcast)
                handleBroadcast(broadcast)
            })
            client.publish({
                destination: topicCommand,
                body: JSON.stringify({cmd: "GET_USERS", user: username, sessionId: sessionId})
            })
        }
        client.activate()
    }, [])

    const handleBroadcast = (broadcast: GoBroadcast) => {
        if (broadcast.type === "VOTINGS_REVEALED") {
            setSessionState({
                ...sessionState,
                forceReveal: true,
                revealDisabled: true,
                votingDisabled: true,
                resetVotingsDisabled: false,
            })
        }
        if (broadcast.type === "UPDATE_USERS") {
            setSessionState({...sessionState, votingDisabled: false, forceReveal: false})
        }
        if (broadcast.type === "VOTINGS_RESET") {
            setSessionState({...sessionState, forceReveal: false, revealDisabled: false})
            role.current === "player"
                ? setSessionState({...sessionState, votingDisabled: false})
                : setSessionState({...sessionState, votingDisabled: true})
        }
        if (broadcast.type === "PLAYER_REMOVED") {
            const removedUser: User = broadcast.data
            if (removedUser.uuid === userUuid) {
                sessionStorage.clear()
                setUsername("")
                setSessionState({
                    ...sessionState,
                    loginDisabled: false,
                    logoutDisabled: true,
                    revealDisabled: true,
                    resetVotingsDisabled: true,
                    votingDisabled: true,
                    removePlayerDisabled: true
                })
            }
        }
        if (broadcast.type === "NO_SESSION_FOUND") {
            sessionStorage.clear()
            setUsername("")
            setMessage("Session not found!")
            setSessionState({
                ...sessionState,
                loginLayerVisible: false,
                loginDisabled: true,
                votingDisabled: true,
                resetVotingsDisabled: true,
                revealDisabled: true,
            })
        }
    }

    const checkRejoin = () => {
        const lastSession = sessionStorage.getItem("sessionId")
        const lastUsername = sessionStorage.getItem("username")
        const lastUserUuid = sessionStorage.getItem("userUuid")
        const lastRole = sessionStorage.getItem("role")

        if (lastSession === sessionId && lastUsername !== null && lastUserUuid !== null && lastRole !== null) {
            setUsername(lastUsername)
            setMessage(`Hi ${lastUsername}`)
            userUuid = lastUserUuid
            role.current = lastRole
            setSessionState({
                ...sessionState,
                loginLayerVisible: false,
                revealDisabled: false,
                resetVotingsDisabled: false,
                loginDisabled: true,
                logoutDisabled: false,
                removePlayerDisabled: false
            })
            role.current === "player"
                ? setSessionState({...sessionState, votingDisabled: false})
                : setSessionState({...sessionState, votingDisabled: true})
        } else {
            setSessionState({...sessionState, loginLayerVisible: true})
        }
    }

    const onVote = (value: string) => {
        let updateVoteCmd: GoCommand = {
            cmd: "UPDATE_VOTING",
            user: {uuid: userUuid, username: username, voting: value},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(updateVoteCmd)})
        setSessionState({...sessionState, votingDisabled: true})
    }

    const onResetVotings = () => {
        let resetCmd: GoCommand = {
            cmd: "RESET_VOTINGS",
            user: {username: username, uuid: userUuid},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(resetCmd)})
    }

    const onRevealVotings = () => {
        let revealCmd: GoCommand = {
            cmd: "REVEAL_VOTINGS",
            user: {username: username, uuid: userUuid},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(revealCmd)})
    }

    const onLogout = () => {
        let logoutCmd: GoCommand = {
            cmd: "REMOVE_PLAYER",
            user: {username: username, uuid: userUuid},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(logoutCmd)})
        console.log(">>> sent", logoutCmd.cmd)
        sessionStorage.clear()
        setUsername("")
        setMessage("Hi! Login to Vote")
        setSessionState({
            ...sessionState,
            loginDisabled: false,
            logoutDisabled: true,
            revealDisabled: true,
            resetVotingsDisabled: true,
            votingDisabled: true,
            removePlayerDisabled: true
        })
    }

    const onJoinToVote = (username: string) => {
        let saveUserCmd: GoCommand = {
            cmd: "SAVE_USER",
            user: {uuid: userUuid, username: username, voting: "0"},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(saveUserCmd)})
        console.log(">>> sent", saveUserCmd.cmd)
        sessionStorage.setItem("sessionId", sessionId)
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("userUuid", userUuid)
        sessionStorage.setItem("role", role.current)
        setUsername(username)
        setMessage(`Hi ${username}`)

        setSessionState({
            ...sessionState,
            loginLayerVisible: false,
            revealDisabled: false,
            resetVotingsDisabled: false,
            loginDisabled: true,
            logoutDisabled: false,
            votingDisabled: false,
            removePlayerDisabled: false
        })
    }

    const onJoinToWatch = (username: string) => {
        role.current = "watcher"
        sessionStorage.setItem("sessionId", sessionId)
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("userUuid", userUuid)
        sessionStorage.setItem("role", role.current)
        setUsername(username)
        setMessage(`Hi ${username}`)
        setSessionState({
            ...sessionState,
            loginLayerVisible: false,
            votingDisabled: true,
            revealDisabled: false,
            resetVotingsDisabled: false,
            forceReveal: true,
            loginDisabled: true,
            logoutDisabled: false,
            removePlayerDisabled: false
        })
    }

    const onRemovePlayer = (uuid: string) => {
        let removePlayerCmd: GoCommand = {
            cmd: "REMOVE_PLAYER",
            user: {uuid: uuid, username: username},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(removePlayerCmd)})
        setSessionState({...sessionState, votingDisabled: true})
    }

    return (
        <Box>
            <NavHeader
                loginDisabled={sessionState.loginDisabled}
                revealDisabled={sessionState.revealDisabled}
                resetVotingsDisabled={sessionState.resetVotingsDisabled}
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
                <Heading>Users</Heading>
                <Box align={"center"} direction={"row"}>
                    <ResultList userUuid={userUuid} data={users} reveal={sessionState.forceReveal}
                                removePlayerDisabled={sessionState.removePlayerDisabled}
                                onRemovePlayer={onRemovePlayer}/>
                </Box>
            </Box>
        </Box>
    );
}

export default PokerPage;