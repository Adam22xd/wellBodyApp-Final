type UserRecord = {
  name: string;
  surname: string;
  password: string;
};

class RegisterStats {
  private users: UserRecord[];

  constructor() {
    const savedUsers = localStorage.getItem("users");
    this.users = savedUsers ? (JSON.parse(savedUsers) as UserRecord[]) : [];
  }

  private saveUsers() {
    localStorage.setItem("users", JSON.stringify(this.users));
  }

  addUser(name: string, surname: string, password: string) {
    const newUser: UserRecord = { name, surname, password };
    this.users.push(newUser);
    this.saveUsers();
  }

  checkLogin(login: string, password: string) {
    return this.users.some(
      (user) =>
        user.name.toLowerCase() === login.toLowerCase() &&
        user.password === password,
    );
  }

  showUsersData() {
    console.log(this.users);
  }
}

const stats = new RegisterStats();
export default stats;
