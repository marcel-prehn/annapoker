import React from "react";
import {SessionState, User} from "../models/models";
import {Table, TableBody, TableCell, TableRow, Text} from "grommet/es6";
import {Checkmark, FormClose} from "grommet-icons";
import {Button} from "grommet";

interface ResultListProps {
  userUuid: string,
  data: User[],
  sessionState: SessionState,
  onRemovePlayer: (userUuid: string) => void,
}

export const ResultList = (props: ResultListProps) => {
  const {userUuid, data, sessionState, onRemovePlayer} = props
  if (data !== null && data !== undefined && data.length > 0) {
    const list = data.map((user: User) => (
        <TableRow key={user.uuid}>
          <TableCell size={"xxsmall"}>
            {user.uuid !== userUuid ?
              <Button icon={<FormClose/>} onClick={() => onRemovePlayer(user.uuid)}
                      disabled={sessionState.removingPlayerDisabled}/>
              : ""}
          </TableCell>
          <TableCell size={"xxsmall"} alignContent={"stretch"}>
            {user.voting !== "0" ? <Checkmark color={"green"}/> : ""}
          </TableCell>
          <TableCell size={"medium"}>
            <Text size={"xlarge"} margin={"large"}>{user.username}</Text>
          </TableCell>
          <TableCell width={"small"}>
            {
              user.uuid === userUuid || sessionState.revealingForced
                ? <Text size={"xlarge"} textAlign={"start"} className={""}>{user.voting}</Text>
                : <Text size={"xlarge"} textAlign={"start"} className={"conceil"}>123</Text>
            }
          </TableCell>
        </TableRow>
      )
    )
    return (<Table><TableBody>{list}</TableBody></Table>)
  } else {
    return <span>No Players Connected</span>
  }
}