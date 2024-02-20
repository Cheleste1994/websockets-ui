import { SessionDBType } from "../../db/SessionDB";
import { UserDBType } from "../../db/UsersDB";
import { DataMessage } from "../messageHandlers";

type PropsReg = {
  dbUser: UserDBType;
  dbSession: SessionDBType;
  parsedMessage: DataMessage;
  sessionId: string;
};

export default function reg(props: PropsReg) {
  const { dbUser, parsedMessage, dbSession, sessionId } = props;

  const { data, id, type } = parsedMessage;

  const result = dbUser.authUser({
    name: data.name,
    password: data.password,
  });

  const responseReg = JSON.stringify({
    type,
    data: JSON.stringify(result),
    id,
  });

  dbSession.getUserSession(sessionId).ws.send(responseReg, (error) => {
    if (error || result.error) {
      dbSession.setAuthUser(sessionId, { name: "", isLogin: false, id: 0 });
      return;
    }

    const user = dbUser.getPlayerByLogin(result.name);

    if (user) {
      dbSession.setAuthUser(sessionId, {
        name: result.name,
        isLogin: true,
        id: user.id,
      });

      console.log(`User ${result.name} login!`);
    }
  });
}
