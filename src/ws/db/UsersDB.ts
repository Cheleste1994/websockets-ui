export interface User {
  name: string;
  password: string;
}

export interface UserState extends User {
  wins: number;
  id: number;
}

export type UserDBType = InstanceType<typeof UsersDB>;

export default class UsersDB {
  private initialState: UserState[];

  constructor() {
    this.initialState = [];
  }

  authUser(user: User) {
    if (this.getPlayerByLogin(user.name)) {
      const index = this.indexPlayerByLoginAndPassword(user);

      if (index === -1) {
        return {
          name: user.name,
          index: index,
          error: true,
          errorText: "Invalid user login or password!",
        };
      }

      return {
        name: user.name,
        index: index,
        error: false,
        errorText: "",
      };
    }

    this.initialState.push({
      name: user.name,
      password: user.password,
      id: this.generateUniqueId(user.name || ""),
      wins: 0,
    });
    return {
      name: user.name,
      index: this.initialState.length - 1,
      error: false,
      errorText: "",
    };
  }

  getPlayerByLogin(name: string) {
    return this.initialState.find((userState) => userState.name === name);
  }

  indexPlayerByLoginAndPassword(user: User) {
    return this.initialState.findIndex(
      (userState) =>
        userState.name === user.name && userState.password === user.password
    );
  }

  updateWinsUser(user: User) {
    const index = this.indexPlayerByLoginAndPassword(user);

    if (index !== -1) {
      return "Invalid user login or password";
    }

    this.initialState[index] = { ...this.initialState[index], ...user };
    return "User update!";
  }

  getAllUsers() {
    return this.initialState;
  }

  private generateUniqueId(value: string) {
    const uniqueId =
      Date.now() + Math.trunc(Math.random() * 1000000) * value.length;
    return uniqueId;
  }
}
