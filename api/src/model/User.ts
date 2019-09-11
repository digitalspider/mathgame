import { Setting } from "./Setting";

class User {
  constructor(public username: string, public password: string, public email: string, public settings: Setting) {
  }
}

export { User };