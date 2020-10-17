import React, {useState} from "react";
import {Box, Button, Heading, Layer, Main, TextInput} from "grommet/es6";
import {Checkmark, Inspect, User} from "grommet-icons/es6";

interface LoginLayerProps {
  onVoteHandler: (username: string) => void,
  onWatchHandler: any,
  onEscHandler: any,
  onOutsideClickHandler: any,
}

export const LoginLayer = (props: LoginLayerProps) => {
  const {onVoteHandler, onWatchHandler, onOutsideClickHandler, onEscHandler} = props
  const [username, setUsername] = useState("")
  const [buttonsDisabled, setButtonsDisabled] = useState(true)
  const usernameHandler = (username: string) => {
    setUsername(username)
    username.length > 0 ? setButtonsDisabled(false) : setButtonsDisabled(true)
  }

  return (
    <Layer className={"displaynone"} onEsc={onEscHandler} onClickOutside={onOutsideClickHandler}>
      <Main pad="large" align={"center"}>
        <Box align={"center"}>
          <Heading>Who are you?</Heading>
          <TextInput icon={<User/>} placeholder="Username" autoFocus={true} disabled={false}
                     onChange={e => usernameHandler(e.target.value)}
          />
          <Box direction={"row"} margin={"small"}>
            <Button size={"medium"} onClick={() => onVoteHandler(username)} disabled={buttonsDisabled}
                    margin={"xsmall"}
                    primary={true}
                    icon={<Checkmark/>}
                    label={"Vote"}/>
            <Button onClick={() => onWatchHandler(username)} disabled={buttonsDisabled} margin={"xsmall"}
                    primary={true}
                    icon={<Inspect/>}
                    label={"Watch"}/>
          </Box>
        </Box>
      </Main>
    </Layer>
  )
}