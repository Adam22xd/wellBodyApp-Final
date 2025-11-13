export default class RegisterStats {
  constructor() {
    const savedUsers = JSON.parse(localStorage.getItem("usersData")) || [];
    this.users = savedUsers;
  }

  addUser(name, surname, password) {
    const newUser = { name, surname, password };
    this.users.push(newUser);
    localStorage.setItem("usersData", JSON.stringify(this.users));
  }

  getAllUsers() {
    return this.users;
  }

  showUsersData() {
    console.log("Zarejestrowani użytkownicy:");
    this.users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} ${u.surname} | ${u.password}`);
    });
  }

  checkLogin(name, password) {
    const user = this.users.find(
      (u) => u.name === name && u.password === password
    );

    if (user) {
      alert(`✅ Witaj ponownie, ${user.name}!`);
      return true;
    } else {
      alert("❌ Błędne imię lub hasło!");
      return false;
    }
  }
}
