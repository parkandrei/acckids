const users = {
  "super": { name: "Супер Админ", role: "superadmin", password: "Super2025" },
  "admin": { name: "Воспитатель", role: "admin", password: "Admin2025" },
  "alpha": { name: "Альфа", surname: "Один", patronymic: "Первая", dob: "2020-01-01", role: "parent", password: "Aa123456" },
  "beta": { name: "Бета", surname: "Два", patronymic: "Вторая", dob: "2020-02-02", role: "parent", password: "Bb123456" },
  "omega": { name: "Омега", surname: "Ласт", patronymic: "Последняя", dob: "2020-03-03", role: "parent", password: "Oo123456" }
};

const storedUsers = localStorage.getItem("users");
if (storedUsers) {
  Object.assign(users, JSON.parse(storedUsers));
}

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

let currentUser = "";
let currentRole = "";

function showApp(login) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  currentUser = login;
  const user = users[login];
  currentRole = user.role;
  const isAdmin = user.role === "admin";
  const isSuper = user.role === "superadmin";

  document.getElementById("userTitle").textContent =
    isSuper ? "Добро пожаловать, Супер-админ" :
    isAdmin ? "Добро пожаловать, Воспитатель" :
    `Дневник: ${user.name}`;

  if (isAdmin || isSuper) {
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

    if (isSuper) {
      document.getElementById("userManagement").classList.remove("hidden");
      renderUserList();
    }
  } else {
    document.getElementById("childSelector").classList.add("hidden");
    renderChild(login, false);
  }
}

function renderUserList() {
  const list = document.getElementById("userList");
  list.innerHTML = "";
  for (const [login, u] of Object.entries(users)) {
    const line = document.createElement("div");
    line.innerHTML = `${login} (${u.role}) — ${u.password} `;

    // Кнопка смены пароля
    const editPass = document.createElement("button");
    editPass.textContent = "Изменить пароль";
    editPass.onclick = () => showPasswordEditor(login);
    line.appendChild(editPass);

    // Кнопка редактирования
    const editUser = document.createElement("button");
    editUser.textContent = "Редактировать";
    editUser.onclick = () => showEditForm(login);
    line.appendChild(editUser);

    // Кнопка удаления
    if (login !== "super") { // супер-админа нельзя удалить
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Удалить";
      deleteBtn.onclick = () => deleteUser(login);
      line.appendChild(deleteBtn);
    }

    list.appendChild(line);
  }
}

function deleteUser(login) {
  if (!confirm(`Удалить пользователя ${login}?`)) return;

  // Удаляем пользователя
  delete users[login];

  // Удаляем данные посещений
  localStorage.removeItem(login + "_visits");

  // Сохраняем
  localStorage.setItem("users", JSON.stringify(users));

  // Обновляем список
  renderUserList();
}


function showPasswordEditor(login) {
  document.getElementById("editUserId").textContent = login;
  document.getElementById("newPassword").value = "";
  document.getElementById("passwordEdit").classList.remove("hidden");
}

function saveNewPassword() {
  const login = document.getElementById("editUserId").textContent;
  const newPass = document.getElementById("newPassword").value;
  if (newPass) {
    users[login].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Пароль обновлён");
    renderUserList();
    document.getElementById("passwordEdit").classList.add("hidden");
  }
}

function renderChild(login, editable) {
  const user = users[login];
  document.getElementById("childCard").classList.remove("hidden");
  
  // Установка фото если есть
  const photoKey = `${login}_photo`;
  const photoUrl = localStorage.getItem(photoKey);
  const photoElement = document.getElementById("childPhoto");
  photoElement.src = photoUrl || "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EНет фото%3C/text%3E%3C/svg%3E";
  
  // Показываем кнопку загрузки только для супер-админа
  document.getElementById("photoUpload").classList.toggle("hidden", currentRole !== "superadmin");
  
  // Обработчик загрузки фото
  document.getElementById("photoInput").onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        photoElement.src = event.target.result;
        localStorage.setItem(photoKey, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  document.getElementById("childCard").classList.remove("hidden");
  document.getElementById("childName").textContent = user.name;
  document.getElementById("childSurname").textContent = user.surname || "-";
  document.getElementById("childPatronymic").textContent = user.patronymic || "-";
  document.getElementById("childDOB").textContent = user.dob || "-";
  document.getElementById("adminForm").classList.toggle("hidden", !editable);
  document.getElementById("editChildBtn").classList.toggle("hidden", !editable);

  const visitForm = document.getElementById("visitForm");
visitForm.onsubmit = function(e) {
  e.preventDefault();
  const date = document.getElementById("visitDate").value;

  const gradeValues = [
    document.getElementById("gradeVisit").checked ? 1 : 0,
    document.getElementById("gradeActivity").checked ? 1 : 0,
    document.getElementById("gradeBehavior").checked ? 1 : 0,
    document.getElementById("gradePoem").checked ? 1 : 0
  ];

  const sum = gradeValues.reduce((a, b) => a + b, 0);

  const gradesText =
    `x${sum}: посещение: ${gradeValues[0]}, активность: ${gradeValues[1]}, поведение: ${gradeValues[2]}, стих: ${gradeValues[3]}`;

  const key = login + "_visits";
  const visits = JSON.parse(localStorage.getItem(key) || "[]");
  const now = new Date().toLocaleString();
visits.push({ date, grades: gradesText, timestamp: now });
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

  visits.forEach((v, i) => {
    const row = document.createElement("tr");
    const del = (currentRole === "superadmin") ? `<td><button onclick="deleteVisit(${i})">✖</button></td>` : "<td></td>";

    // Подсчёт суммы
    const numbers = v.grades.match(/\d+/g)?.map(Number) || [];
    const sum = numbers.slice(-4).reduce((s, n) => s + n, 0); // берём только последние 4 оценки
    total += sum;

    row.innerHTML = `<td>${v.date}</td><td>${v.grades}<br><small>Внесено: ${v.timestamp || "—"}</small></td>${del}`;
    visitTable.appendChild(row);
  });

  const summary = document.createElement("tr");
  summary.innerHTML = `<td colspan="3"><strong>Сумма всех баллов: ${total}</strong></td>`;
  visitTable.appendChild(summary);
  document.getElementById("childScore").textContent = total;
}

function deleteVisit(index) {
  if (!confirm("Удалить эту запись?")) return;
  const login = document.getElementById("selectChild")?.value || currentUser;
  const key = login + "_visits";
  const visits = JSON.parse(localStorage.getItem(key) || "[]");
  visits.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(visits));
  renderVisits(visits);
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function showEditForm(login = currentUser) {
  const u = users[login];
  document.getElementById("editName").value = u.name;
  document.getElementById("editSurname").value = u.surname || "";
  document.getElementById("editPatronymic").value = u.patronymic || "";
  document.getElementById("editDOB").value = u.dob || "";
  document.getElementById("editRole").value = u.role;
  document.getElementById("editChildForm").classList.remove("hidden");
  document.getElementById("editChildForm").dataset.login = login; // сохранить логин
}

function saveChildEdit() {
  const login = document.getElementById("editChildForm").dataset.login || currentUser;
  users[login].name = document.getElementById("editName").value;
  users[login].surname = document.getElementById("editSurname").value;
  users[login].patronymic = document.getElementById("editPatronymic").value;
  users[login].dob = document.getElementById("editDOB").value;
  users[login].role = document.getElementById("editRole").value;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Пользователь обновлён");
  document.getElementById("editChildForm").classList.add("hidden");
  renderUserList();
}

function cancelChildEdit() {
  document.getElementById("editChildForm").classList.add("hidden");
}

window.onload = function() {
  const current = localStorage.getItem("currentUser");
  if (current && users[current]) {
    showApp(current);
  }
  const roleSelect = document.getElementById("newUserRole");
  if (roleSelect) {
    roleSelect.onchange = () => {
      document.getElementById("parentExtraFields").classList.toggle("hidden", roleSelect.value !== "parent");
    };
  }
  const createUserForm = document.getElementById("createUserForm");
  if (createUserForm) {
    createUserForm.onsubmit = function(e) {
      e.preventDefault();
      const login = document.getElementById("newLogin").value;
      if (users[login]) return alert("Такой логин уже существует");
      const role = document.getElementById("newUserRole").value;
      const u = {
        name: document.getElementById("newUserName").value,
        password: document.getElementById("newUserPassword").value,
        role: role
      };
      if (role === "parent") {
        u.surname = document.getElementById("newUserSurname").value;
        u.patronymic = document.getElementById("newUserPatronymic").value;
        u.dob = document.getElementById("newUserDOB").value;
      }
      users[login] = u;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Пользователь создан");
      renderUserList();
      createUserForm.reset();
    };
  }
};