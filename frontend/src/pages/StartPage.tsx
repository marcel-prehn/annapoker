import React from "react";
import {Box, Button, Heading, Main} from "grommet/es6";
import {NavHeader} from "../components/NavHeader";
import {Text} from "grommet";
import {Login, Logout, Refresh, View} from "grommet-icons";
import {AddCircle} from "grommet-icons/es6";

export const StartPage = () => {
  return (
    <Box>
      <NavHeader loginDisabled={true} revealDisabled={true} resetVotingsDisabled={true} resetUsersDisabled={true}
                 logoutDisabled={true}/>
      <Main pad="large" align={"center"}>
        <Box align={"center"}>
          <Heading>Welcome to Annapoker!</Heading>
          <Box direction={"row"} align={"center"}>
            <Text margin={"medium"} size={"xxlarge"} className={"intro"}>
              Click <Button primary
                            size={"small"}
                            icon={<AddCircle/>}
                            margin={"xxsmall"}/> to generate a new Annapoker session.<br/>
              After that, open the new session and share the link.<br/><br/>
              Following actions are possible during your Annapoker session<br/>
              <ul className="actions-list">
                <li><Login/><Text margin={"small"} size={"xlarge"}>Login again</Text></li>
                <li><Logout/><Text margin={"small"} size={"xlarge"}>Leave session</Text></li>
                <li><View/><Text margin={"small"} size={"xlarge"}>Reveal all votings for everyone</Text></li>
                <li><Refresh/><Text margin={"small"} size={"xlarge"}>Reset current votings</Text></li>
              </ul>
            </Text>
          </Box>
        </Box>
      </Main>
    </Box>
  )
}