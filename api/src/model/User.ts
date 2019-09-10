import { Setting } from "./Setting";

class User {
  constructor(public username: string, public password: string, public settings: Setting) {
  }
}

export { User };