import React, {useEffect, useState} from "react";
import {v4 as uuid} from "uuid";
import {Box, Button, Heading} from "grommet/es6";
import {Client} from "@stomp/stompjs";
import {NavHeader} from "../components/NavHeader";
import {AddCircle, Share} from "grommet-icons/es6";

export const NewSessionPage = () => {
  const [link, setLink] = useState("")
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(true)
  const topicCommand = "/topic/go_stomp_command"
  const client = new Client({
    brokerURL: process.env["REACT_APP_WEBSOCKET_HOST"]!,
    connectHeaders: {
      login: process.env["REACT_APP_RABBITMQ_USER"]!,
      passcode: process.env["REACT_APP_RABBITMQ_PASS"]!,
    },
    debug: function (str) {
      //console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  useEffect(() => {
    client.activate()
  }, [])

  const newSession = () => {
    setButtonDisabled(true)
    const sessionId = uuid()
    client.publish({
      destination: topicCommand,
      body: JSON.stringify({cmd: "CREATE_SESSION", sessionId: sessionId, user: ""})
    })
    console.log("send command NEW_SESSION with sessionId", sessionId)
    setLink(`/poker/${sessionId}`)
    setButtonVisible(false)
    window.location.href=link
  }

  return (
    <Box>
      <NavHeader
        loginDisabled={true}
        resetVotingsDisabled={true}
        revealDisabled={true}
        resetUsersDisabled={true}/>
      <Box align={"center"} pad={"large"} className={"newsession-body"}>
        <Heading>Click Create to generate a new Annapoker Session</Heading>
        <Button primary
                className={"newsession-button"}
                size={"medium"}
                icon={<AddCircle/>}
                label={"Create"}
                onClick={newSession}
                margin={"large"}
                disabled={buttonDisabled}/>
      </Box>
    </Box>
  )
}