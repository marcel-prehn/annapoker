import React from "react";
import {User} from "../models/models";
import {Table, TableBody, TableCell, TableRow, Text} from "grommet/es6";

interface ResultListProps {
  userUuid: string,
  data: User[],
  reveal: boolean,
}

export const ResultList = (props: ResultListProps) => {
  const {userUuid, data, reveal} = props
  if (data !== null && data !== undefined) {
    const list = data.map((user: User) => (
        <TableRow key={user.uuid}>
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
    return <span>No Users connected</span>
  }
}