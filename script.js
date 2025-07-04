const users = {
  "alpha": { name: "Альфа", dob: "01.01.2020", password: "Aa123456" },
  "beta": { name: "Бета", dob: "02.02.2020", password: "Bb123456" },
  "omega": { name: "Омега", dob: "03.03.2020", password: "Oo123456" }
};

function login() {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;
  const user = users[login];
  const errorBox = document.getElementById("loginError");

  if (!user || user.password !== password) {
    errorBox.textContent = "Неверный логин или пароль";
    return;
  }

  localStorage.setItem("currentUser", login);
  showApp(login);
}

function showApp(login) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  const user = users[login];
  document.getElementById("childName").textContent = user.name;
  document.getElementById("childDOB").textContent = user.dob;

  const visitForm = document.getElementById("visitForm");
  const visitTable = document.querySelector("#visitsTable tbody");

  visitForm.onsubmit = function(e) {
    e.preventDefault();
    const date = document.getElementById("visitDate").value;
    const grades = document.getElementById("grades").value;
    const key = login + "_visits";

    const visits = JSON.parse(localStorage.getItem(key) || "[]");
    visits.push({ date, grades });
    localStorage.setItem(key, JSON.stringify(visits));
    renderVisits(visits);
    visitForm.reset();
  };

  const savedVisits = JSON.parse(localStorage.getItem(login + "_visits") || "[]");
  renderVisits(savedVisits);
}

function renderVisits(visits) {
  const visitTable = document.querySelector("#visitsTable tbody");
  visitTable.innerHTML = "";
  visits.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${v.date}</td><td>${v.grades}</td>`;
    visitTable.appendChild(row);
  });
}

window.onload = function() {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser && users[currentUser]) {
    showApp(currentUser);
  }
};
