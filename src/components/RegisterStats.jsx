import RegisterForm from "./RegisterForm";

export default class RegisterStats {
  constructor(name, surname, password) {
    this.name = name;
    this.surname = surname;
    this.password = password;

    const saveUsers = JSON.parse(localStorage.getItem("usersData")) || [];
    this.users = saveUsers;
  }

  addUser(name, surname, password) {
    const newUser = { name, surname, password };
    this.users.push(newUser);

    localStorage.setItem("usersData", JSON.stringify(this.users));
  }

  // zwróć w formie tablicy wszystkich zarejestrowanych
  getAllUsers() {
    return this.users;
  }

  showUsersData() {
    console.log("Zarejsetrowani uzytkownicy");
    this.users.forEach((u, i) => {
      console.log(`${i + 1} ${u.name} | ${u.surname} | ${u.password}`);
    });
  }

  checkLogin(email, password) {
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      alert(`✅ Witaj ponownie, ${user.name}!`);
      return true;
    } else {
      alert("❌ Błędny email lub hasło!");
      return false;
    }
  }



  
}
