import { SessionDBType } from "../../db/SessionDB";
import { UserDBType } from "../../db/UsersDB";
import { responseMessage } from "../../helpers/responseMessage";

type PropsUpdateWinners = {
  dbUser: UserDBType;
  dbSession: SessionDBType;
};

export const updateWinners = (props: PropsUpdateWinners) => {
  const { dbUser, dbSession } = props;

  const users = dbUser.getAllUsers();

  const data = users.map(({ name, wins }) => ({ name, wins }));

  const responseWinners = responseMessage({
    type: "update_winners",
    data,
  });

  Object.values(dbSession.getAllSessions()).forEach((session) => {
    session?.ws.send(responseWinners);
  });

  console.log(`Winners update!`);
};
