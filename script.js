const users = {
  "admin": { name: "Воспитатель", role: "admin", password: "Admin2025" },
  "alpha": { name: "Альфа", dob: "01.01.2020", role: "parent", password: "Aa123456" },
  "beta": { name: "Бета", dob: "02.02.2020", role: "parent", password: "Bb123456" },
  "omega": { name: "Омега", dob: "03.03.2020", role: "parent", password: "Oo123456" }
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
  const isAdmin = user.role === "admin";
  document.getElementById("userTitle").textContent = isAdmin ? "Добро пожаловать, воспитатель" : `Дневник: ${user.name}`;

  if (isAdmin) {
    const selector = document.getElementById("selectChild");
    selector.innerHTML = "";
    for (let key in users) {
      if (users[key].role === "parent") {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = users[key].name;
        selector.appendChild(opt);
      }
    }
    document.getElementById("childSelector").classList.remove("hidden");
    selector.onchange = () => renderChild(selector.value, true);
    selector.dispatchEvent(new Event("change"));
  } else {
    document.getElementById("childSelector").classList.add("hidden");
    renderChild(login, false);
  }
}

function renderChild(login, editable) {
  const user = users[login];
  document.getElementById("childCard").classList.remove("hidden");
  document.getElementById("childName").textContent = user.name;
  document.getElementById("childDOB").textContent = user.dob;
  document.getElementById("adminForm").classList.toggle("hidden", !editable);

  const visitForm = document.getElementById("visitForm");
  const visitTable = document.querySelector("#visitsTable tbody");

  visitForm.onsubmit = function(e) {
    e.preventDefault();
    const date = document.getElementById("visitDate").value;
    const grades =
      "посещение: " + (document.getElementById("gradeVisit").checked ? 1 : 0) +
      ", активность: " + (document.getElementById("gradeActivity").checked ? 1 : 0) +
      ", поведение: " + (document.getElementById("gradeBehavior").checked ? 1 : 0) +
      ", стих: " + (document.getElementById("gradePoem").checked ? 1 : 0);
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

  let total = 0;

  visits.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${v.date}</td><td>${v.grades}</td>`;
    visitTable.appendChild(row);

    const numbers = v.grades.match(/\d+/g);
    if (numbers) {
      total += numbers.reduce((sum, val) => sum + parseInt(val), 0);
    }
  });

  const summary = document.createElement("tr");
  summary.innerHTML = `<td colspan="2"><strong>Сумма всех баллов: ${total}</strong></td>`;
  visitTable.appendChild(summary);
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

window.onload = function() {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser && users[currentUser]) {
    showApp(currentUser);
  }
};
