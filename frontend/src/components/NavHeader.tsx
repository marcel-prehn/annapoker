import React from 'react';
import {Box, Button, Header, Heading, Text} from "grommet/es6";
import {AddCircle, Login, Refresh, View} from "grommet-icons/es6";
import {Link} from "react-router-dom";
import {Logout} from "grommet-icons";

interface NavHeaderProps {
    loginHandler?: () => void,
    revealHandler?: () => void,
    resetVotingsHandler?: () => void,
    logoutHandler?: () => void,
    loginDisabled: boolean,
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
        resetVotingsDisabled,
    } = props
    return (
        <Header background={"brand"} justify={"start"}>
            <Heading margin={"small"}>Annapoker</Heading>
            <Link to={"/new"}><Button icon={<AddCircle/>} hoverIndicator/></Link>
            <Button icon={<Login/>} disabled={loginDisabled} onClick={loginHandler} hoverIndicator/>
            <Button icon={<Logout/>} disabled={!loginDisabled} onClick={logoutHandler}
                    hoverIndicator/>
            <Box direction={"row"} align={"center"}>
                <span>|</span>
                <Button icon={<View/>} disabled={revealDisabled} onClick={revealHandler}
                        hoverIndicator margin={"xsmall"}/>
                <Button icon={<Refresh/>} disabled={resetVotingsDisabled} onClick={resetVotingsHandler}
                        hoverIndicator/>
                <Box width={"xxsmall"}/>
            </Box>
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