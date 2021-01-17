import React from "react";
import {User} from "../models/models";
import {Table, TableBody, TableCell, TableRow, Text} from "grommet/es6";
import {Checkmark, StatusGood} from "grommet-icons";

interface ResultListProps {
  userUuid: string,
  data: User[],
  reveal: boolean,
  removePlayerDisabled: boolean,
  onRemovePlayer: (userUuid: string) => void,
}

export const ResultList = (props: ResultListProps) => {
  const {userUuid, data, reveal, removePlayerDisabled, onRemovePlayer} = props
  if (data !== null && data !== undefined) {
    const list = data.map((user: User) => (
        <TableRow key={user.uuid}>
          {/*<TableCell size={"xxsmall"}>*/}
          {/*    {user.uuid !== userUuid ?*/}
          {/*        <Button icon={<FormClose/>} onClick={() => onRemovePlayer(user.uuid)} disabled={removePlayerDisabled}/>*/}
          {/*        : ""}*/}
          {/*</TableCell>*/}
          <TableCell size={"xxsmall"} alignContent={"stretch"}>
            {user.voting !== "0"? <Checkmark color={"green"}/>: ""}
          </TableCell>
          <TableCell size={"medium"}>
            <Text size={"xlarge"} margin={"large"}>{user.username}</Text>
          </TableCell>
          <TableCell width={"small"}>
            <Text size={"xlarge"} textAlign={"start"}
                  className={`${user.uuid === userUuid || reveal ? "" : "conceil"}`}>{user.voting}</Text>
          </TableCell>
        </TableRow>
      )
    )
    return (<Table><TableBody>{list}</TableBody></Table>)
  } else {
    return <span>No Players Connected</span>
  }
}