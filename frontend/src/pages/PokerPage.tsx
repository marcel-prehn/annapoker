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
const pokerCards = [1, 2, 3, 5, 8, 13, 20, 40, 100]
let userUuid = uuid()

export const PokerPage = () => {
    const {sessionId} = useParams()
    const [loginLayerVisible, setLoginLayerVisible] = useState(true)
    const [loginDisabled, setLoginDisabled] = useState(false)
    const [logoutDisabled, setLogoutDisabled] = useState(true)
    const [revealDisabled, setRevealDisabled] = useState(true)
    const [resetVotingsDisabled, setResetVotingsDisabled] = useState(true)
    const [votingDisabled, setVotingDisabled] = useState(true)
    const [forceReveal, setForceReveal] = useState(false)
    const [username, setUsername] = useState("")
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
            setForceReveal(true)
            setRevealDisabled(true)
            setVotingDisabled(true)
        }
        if (broadcast.type === "UPDATE_USERS") {
            setVotingDisabled(false)
            setForceReveal(false)
        }
        if (broadcast.type === "VOTINGS_RESET") {
            role.current === "player" ? setVotingDisabled(false) : setVotingDisabled(true)
            setForceReveal(false)
            setRevealDisabled(false)
        }
        if (broadcast.type === "NO_SESSION_FOUND") {
            sessionStorage.clear()
            setUsername("")
            setLoginLayerVisible(false)
            setLoginDisabled(true)
            setVotingDisabled(true)
            setResetVotingsDisabled(true)
            setRevealDisabled(true)
        }
    }

    const checkRejoin = () => {
        const lastSession = sessionStorage.getItem("sessionId")
        const lastUsername = sessionStorage.getItem("username")
        const lastUserUuid = sessionStorage.getItem("userUuid")
        const lastRole = sessionStorage.getItem("role")
        if (lastSession === sessionId && lastUsername !== null && lastUserUuid !== null && lastRole !== null) {
            setUsername(lastUsername)
            userUuid = lastUserUuid
            role.current = lastRole
            setLoginLayerVisible(false)
            setRevealDisabled(false)
            setResetVotingsDisabled(false)
            setLoginDisabled(true)
            setLogoutDisabled(false)
            role.current === "player" ? setVotingDisabled(false) : setVotingDisabled(true)
        }
    }

    const onVote = (value: number) => {
        let updateVoteCmd: GoCommand = {
            cmd: "UPDATE_VOTING",
            user: {uuid: userUuid, username: username, voting: value},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(updateVoteCmd)})
        setVotingDisabled(true)
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
            cmd: "REMOVE_USER",
            user: {username: username, uuid: userUuid},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(logoutCmd)})
        console.log(">>> sent", logoutCmd.cmd)
        sessionStorage.clear()
        setUsername("")

        setLoginDisabled(false)
        setLogoutDisabled(true)
        setRevealDisabled(true)
        setResetVotingsDisabled(true)
        setVotingDisabled(true)
    }

    const onJoinToVote = (username: string) => {
        let saveUserCmd: GoCommand = {
            cmd: "SAVE_USER",
            user: {uuid: userUuid, username: username, voting: 0},
            sessionId: sessionId
        }
        client.publish({destination: topicCommand, body: JSON.stringify(saveUserCmd)})
        console.log(">>> sent", saveUserCmd.cmd)

        sessionStorage.setItem("sessionId", sessionId)
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("userUuid", userUuid)
        sessionStorage.setItem("role", role.current)

        setUsername(username)
        setLoginLayerVisible(false)
        setRevealDisabled(false)
        setResetVotingsDisabled(false)
        setLoginDisabled(true)
        setLogoutDisabled(false)
        setVotingDisabled(false)
    }

    const onJoinToWatch = (username: string) => {
        role.current = "watcher"

        sessionStorage.setItem("sessionId", sessionId)
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("userUuid", userUuid)
        sessionStorage.setItem("role", role.current)

        setUsername(username)
        setLoginLayerVisible(false)
        setVotingDisabled(true)
        setRevealDisabled(false)
        setResetVotingsDisabled(false)
        setForceReveal(true)
        setLoginDisabled(true)
        setLogoutDisabled(false)
    }

    return (
        <Box>
            <NavHeader
                loginDisabled={loginDisabled}
                logoutDisabled={logoutDisabled}
                revealDisabled={revealDisabled}
                resetVotingsDisabled={resetVotingsDisabled}
                resetUsersDisabled={true}
                loginHandler={() => setLoginLayerVisible(true)}
                revealHandler={onRevealVotings}
                logoutHandler={onLogout}
                resetVotingsHandler={onResetVotings}
            />
            {loginLayerVisible ? <LoginLayer
                onVoteHandler={onJoinToVote}
                onWatchHandler={onJoinToWatch}
                onEscHandler={() => setLoginLayerVisible(false)}
                onOutsideClickHandler={() => setLoginLayerVisible(false)}
            /> : ""}
            <Box align={"center"} pad={"small"}>
                <Heading>{`Hi ${username}!`}</Heading>
                <Box align={"center"} direction={"row"}>
                    {pokerCards.map(c => <PokerCard key={c} onClickHandler={() => onVote(c)} value={c}
                                                    disabled={votingDisabled}/>)}
                </Box>
            </Box>
            <Box align={"center"} pad={"small"}>
                <Heading>Users</Heading>
                <Box align={"center"} direction={"row"}>
                    <ResultList userUuid={userUuid} data={users} reveal={forceReveal}/>
                </Box>
            </Box>
        </Box>
    );
}

export default PokerPage;