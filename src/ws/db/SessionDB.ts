import { WebSocket } from "ws";

export interface CurrentUser {
  ws: WebSocket;
  sessionId: string;
  name: string;
  isLogin: boolean;
  id: number;
}

interface SessionUsers {
  [key: string]: CurrentUser;
}
export type SessionDBType = InstanceType<typeof SessionDB>;

export default class SessionDB {
  private initialState: SessionUsers;

  constructor() {
    this.initialState = {};
  }

  setUserSession(ws: WebSocket, sessionId: string) {
    this.initialState[sessionId] = {
      ws,
      sessionId,
      name: "",
      isLogin: false,
      id: 0,
    };
    return this.initialState[sessionId];
  }

  getUserSession(sessionId: string) {
    return this.initialState[sessionId];
  }

  setAuthUser(
    sessionId: string,
    { name, isLogin, id }: { name: string; isLogin: boolean; id: number }
  ) {
    this.initialState[sessionId].name = name;
    this.initialState[sessionId].isLogin = isLogin;
    this.initialState[sessionId].id = id;

    return this.initialState[sessionId];
  }

  getAllSessions() {
    return this.initialState;
  }

  deleteUserSession(sessionId: string) {
    try {
      delete this.initialState[sessionId];
      return "disconnect";
    } catch (error) {
      return (error as Error)?.message || "disconnect error";
    }
  }
}
