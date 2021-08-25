import React from 'react';
import {Box, Button, Header, Heading, Text} from "grommet/es6";
import {Login, Refresh, View} from "grommet-icons/es6";
import {Link} from "react-router-dom";
import {Logout} from "grommet-icons";

interface NavHeaderProps {
  loginHandler?: () => void,
  revealHandler?: () => void,
  resetVotingsHandler?: () => void,
  logoutHandler?: () => void,
  loginDisabled: boolean,
  logoutDisabled: boolean,
  revealDisabled: boolean,
  resetVotingsDisabled: boolean,
  resetUsersDisabled: boolean,
}

export const NavHeader = (props: NavHeaderProps) => {
  const {
    loginHandler,
    resetVotingsHandler,
    revealHandler,
    logoutHandler,
    revealDisabled,
    loginDisabled,
    logoutDisabled,
    resetVotingsDisabled,
  } = props

  return (
    <Header background={"brand"} justify={"start"}>
      <Heading margin={"small"} color={"white"}><Link to={"/"}>Annapoker</Link></Heading>
      <Button primary icon={<Login/>} label={"Join"} disabled={loginDisabled} onClick={loginHandler}/>
      <Button primary icon={<Logout/>} label={"Leave"} disabled={logoutDisabled} onClick={logoutHandler}/>
      <Box direction={"row"} align={"center"}>
        <span>|</span>
      </Box>
      <Button primary icon={<View/>} label={"Reveal"} disabled={revealDisabled} onClick={revealHandler}/>
      <Button primary icon={<Refresh/>} label={"Reset"} disabled={resetVotingsDisabled} onClick={resetVotingsHandler}/>
      <Box fill={true} direction={"row"} align={"center"}>
        <Box flex={"grow"} direction={"column"} margin={"medium"}>
          <Text textAlign={"end"}><Link to={"/impressum"} target={"_blank"}>Impressum</Link></Text>
        </Box>
        <Box direction={"column"} margin={"small"}>
          <a href="https://www.buymeacoffee.com/MarcelPrehn" target="_new">
            <img src="https://cdn.buymeacoffee.com/buttons/default-white.png" alt="Buy Me A Coffee"
                 className={"coffee"}/>
          </a>
        </Box>
      </Box>
    </Header>
  )
}