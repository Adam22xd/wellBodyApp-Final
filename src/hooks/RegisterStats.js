class RegisterStats {
  constructor() {
    const savedUsers = localStorage.getItem("users");
    this.users = savedUsers ? JSON.parse(savedUsers) : [];
  }

  saveUsers() {
    localStorage.setItem("users", JSON.stringify(this.users));
  }

  

  addUser(name, surname, password) {
    const newUser = { name, surname, password };
    this.users.push(newUser);
    this.saveUsers();
  }

  checkLogin(login, password) {
    return this.users.some(
      (user) => user.name.toLowerCase() === login.toLowerCase() && user.password === password
      )
  }

  showUsersData() {
    console.log(this.users);
  }
}


const stats = new RegisterStats();
export default stats;
