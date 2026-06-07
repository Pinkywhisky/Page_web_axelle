const state = {
  user: window.CDP_CURRENT_USER || null,
  users: [],
  selectedUserId: null,
  activeModal: null,
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  bindDom();
  bindEvents();
  renderSession();
});

function bindDom() {
  [
    "publicActions",
    "userArea",
    "userInfoText",
    "userRoleText",
    "openLoginBtn",
    "openRegisterBtn",
    "openProfileBtn",
    "openManageBtn",
    "logoutBtn",
    "homeLink",
    "heroRegisterBtn",
    "heroLoginBtn",
    "contactRegisterBtn",
    "homeView",
    "manageView",
    "backHomeBtn",
    "loginModal",
    "registerModal",
    "profileModal",
    "closeLoginBtn",
    "closeRegisterBtn",
    "closeProfileBtn",
    "loginForm",
    "loginEmail",
    "loginPassword",
    "loginMessage",
    "registerForm",
    "registerFullName",
    "registerEmail",
    "registerPassword",
    "registerPhone",
    "registerAnimalType",
    "registerAnimalName",
    "registerMessage",
    "registerSuccess",
    "switchToRegisterBtn",
    "switchToLoginBtn",
    "profileForm",
    "profileId",
    "profileFullName",
    "profileEmail",
    "profilePhone",
    "profileAnimalType",
    "profileAnimalName",
    "profileModalMessage",
    "manageSearch",
    "manageTableBody",
    "manageListMessage",
    "manageEditForm",
    "manageId",
    "manageFullName",
    "manageEmail",
    "managePhone",
    "manageRole",
    "manageAnimalType",
    "manageAnimalName",
    "manageEditMessage",
    "manageResetBtn",
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function bindEvents() {
  onClick(dom.openLoginBtn, () => openModal(dom.loginModal));
  onClick(dom.openRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.heroLoginBtn, () => openModal(dom.loginModal));
  onClick(dom.heroRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.contactRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.switchToRegisterBtn, () => switchModal(dom.loginModal, dom.registerModal));
  onClick(dom.switchToLoginBtn, () => switchModal(dom.registerModal, dom.loginModal));
  onClick(dom.closeLoginBtn, () => closeModal(dom.loginModal));
  onClick(dom.closeRegisterBtn, () => closeModal(dom.registerModal));
  onClick(dom.closeProfileBtn, () => closeModal(dom.profileModal));
  onClick(dom.openProfileBtn, openProfile);
  onClick(dom.openManageBtn, openManage);
  onClick(dom.backHomeBtn, showHome);
  onClick(dom.homeLink, showHome);
  onClick(dom.manageResetBtn, resetManageForm);

  [dom.loginModal, dom.registerModal, dom.profileModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  onSubmit(dom.loginForm, handleLogin);
  onSubmit(dom.registerForm, handleRegister);
  onSubmit(dom.profileForm, handleProfileSave);
  onSubmit(dom.manageEditForm, handleManageSave);
  onEvent(dom.manageSearch, "input", renderUsersTable);
  onEvent(dom.manageTableBody, "click", handleManageTableClick);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeModal) closeModal(state.activeModal);
  });
}

function onClick(node, handler) {
  if (node) node.addEventListener("click", handler);
}

function onSubmit(node, handler) {
  if (node) node.addEventListener("submit", handler);
}

function onEvent(node, eventName, handler) {
  if (node) node.addEventListener(eventName, handler);
}

async function requestJson(url, options = {}) {
  const config = { ...options };
  config.headers = { ...(config.headers || {}) };

  if (config.body && typeof config.body !== "string") {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erreur serveur (${response.status}).`);
  }

  return data;
}

function renderSession() {
  const loggedIn = Boolean(state.user);
  dom.publicActions.hidden = loggedIn;
  dom.userArea.hidden = !loggedIn;

  if (!loggedIn) {
    dom.openManageBtn.hidden = true;
    showHome();
    return;
  }

  dom.userInfoText.textContent = state.user.fullName || state.user.full_name || state.user.email;
  dom.userRoleText.textContent = state.user.role === "admin" ? "Admin" : "Client";
  dom.openManageBtn.hidden = state.user.role !== "admin";
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage(dom.loginMessage, "");

  try {
    const data = await requestJson("/api/login.php", {
      method: "POST",
      body: {
        email: dom.loginEmail.value,
        password: dom.loginPassword.value,
      },
    });

    state.user = data.user;
    dom.loginForm.reset();
    closeModal(dom.loginModal);
    renderSession();
  } catch (error) {
    setMessage(dom.loginMessage, error.message, "error");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setMessage(dom.registerMessage, "");
  setMessage(dom.registerSuccess, "");

  try {
    await requestJson("/api/users.php", {
      method: "POST",
      body: {
        full_name: dom.registerFullName.value,
        email: dom.registerEmail.value,
        password: dom.registerPassword.value,
        phone: dom.registerPhone.value,
        animal_type: dom.registerAnimalType.value,
        animal_name: dom.registerAnimalName.value,
      },
    });

    dom.registerForm.reset();
    setMessage(dom.registerSuccess, "Votre espace a bien été créé. Vous pouvez vous connecter.", "success");
  } catch (error) {
    setMessage(dom.registerMessage, error.message, "error");
  }
}

function openProfile() {
  if (!state.user) {
    openModal(dom.loginModal);
    return;
  }

  fillProfileForm(state.user);
  setMessage(dom.profileModalMessage, "");
  openModal(dom.profileModal);
}

function fillProfileForm(user) {
  dom.profileId.value = user.id || "";
  dom.profileFullName.value = user.fullName || user.full_name || "";
  dom.profileEmail.value = user.email || "";
  dom.profilePhone.value = user.phone || "";
  dom.profileAnimalType.value = user.animalType || user.animal_type || "";
  dom.profileAnimalName.value = user.animalName || user.animal_name || "";
}

async function handleProfileSave(event) {
  event.preventDefault();
  setMessage(dom.profileModalMessage, "");

  try {
    const data = await requestJson("/api/users.php", {
      method: "PUT",
      body: {
        id: Number(dom.profileId.value),
        full_name: dom.profileFullName.value,
        email: dom.profileEmail.value,
        phone: dom.profilePhone.value,
        animal_type: dom.profileAnimalType.value,
        animal_name: dom.profileAnimalName.value,
        role: state.user.role,
      },
    });

    state.user = data.user;
    renderSession();
    setMessage(dom.profileModalMessage, "Profil mis à jour.", "success");
  } catch (error) {
    setMessage(dom.profileModalMessage, error.message, "error");
  }
}

async function openManage() {
  if (!state.user || state.user.role !== "admin") return;
  dom.homeView.hidden = true;
  dom.manageView.hidden = false;
  await loadUsers();
}

function showHome() {
  if (dom.homeView) dom.homeView.hidden = false;
  if (dom.manageView) dom.manageView.hidden = true;
}

async function loadUsers() {
  setMessage(dom.manageListMessage, "Chargement...");

  try {
    const data = await requestJson("/api/users.php");
    state.users = data.users || [];
    setMessage(dom.manageListMessage, "");
    renderUsersTable();
  } catch (error) {
    state.users = [];
    renderUsersTable();
    setMessage(dom.manageListMessage, error.message, "error");
  }
}

function renderUsersTable() {
  const search = (dom.manageSearch.value || "").trim().toLowerCase();
  const users = state.users.filter((user) => {
    const text = `${user.fullName || user.full_name} ${user.email} ${user.role}`.toLowerCase();
    return text.includes(search);
  });

  if (!users.length) {
    dom.manageTableBody.innerHTML = "<tr><td colspan='4'>Aucun membre trouvé.</td></tr>";
    return;
  }

  dom.manageTableBody.innerHTML = users
    .map(
      (user) => `
        <tr class="${state.selectedUserId === user.id ? "is-selected" : ""}">
          <td>${escapeHtml(user.fullName || user.full_name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${user.id}" type="button">Modifier</button>
              <button class="btn btn-danger btn-sm" data-action="delete" data-id="${user.id}" type="button">Supprimer</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function handleManageTableClick(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (button.dataset.action === "edit") {
    selectManagedUser(id);
    return;
  }

  if (button.dataset.action === "delete") {
    deleteManagedUser(id);
  }
}

function selectManagedUser(id) {
  const user = state.users.find((item) => item.id === id);
  if (!user) return;

  state.selectedUserId = id;
  dom.manageId.value = user.id;
  dom.manageFullName.value = user.fullName || user.full_name || "";
  dom.manageEmail.value = user.email || "";
  dom.managePhone.value = user.phone || "";
  dom.manageRole.value = user.role || "client";
  dom.manageAnimalType.value = user.animalType || user.animal_type || "";
  dom.manageAnimalName.value = user.animalName || user.animal_name || "";
  setMessage(dom.manageEditMessage, "");
  renderUsersTable();
}

async function handleManageSave(event) {
  event.preventDefault();
  setMessage(dom.manageEditMessage, "");

  if (!dom.manageId.value) {
    setMessage(dom.manageEditMessage, "Sélectionnez un membre.", "error");
    return;
  }

  try {
    await requestJson("/api/users.php", {
      method: "PUT",
      body: {
        id: Number(dom.manageId.value),
        full_name: dom.manageFullName.value,
        email: dom.manageEmail.value,
        phone: dom.managePhone.value,
        role: dom.manageRole.value,
        animal_type: dom.manageAnimalType.value,
        animal_name: dom.manageAnimalName.value,
      },
    });

    setMessage(dom.manageEditMessage, "Membre mis à jour.", "success");
    await loadUsers();
  } catch (error) {
    setMessage(dom.manageEditMessage, error.message, "error");
  }
}

async function deleteManagedUser(id) {
  if (!window.confirm("Supprimer ce membre ?")) return;

  try {
    await requestJson("/api/users.php", {
      method: "DELETE",
      body: { id },
    });

    if (state.selectedUserId === id) resetManageForm();
    await loadUsers();
  } catch (error) {
    setMessage(dom.manageEditMessage, error.message, "error");
  }
}

function resetManageForm() {
  state.selectedUserId = null;
  dom.manageEditForm.reset();
  dom.manageId.value = "";
  setMessage(dom.manageEditMessage, "");
  renderUsersTable();
}

function openModal(node) {
  if (!node) return;
  if (state.activeModal && state.activeModal !== node) state.activeModal.hidden = true;
  state.activeModal = node;
  node.hidden = false;
  document.body.classList.add("modal-open");
  const focusTarget = node.querySelector("input, select, textarea, button");
  if (focusTarget) window.setTimeout(() => focusTarget.focus(), 0);
}

function closeModal(node) {
  if (!node) return;
  node.hidden = true;
  if (state.activeModal === node) state.activeModal = null;
  if (!document.querySelector(".modal-backdrop:not([hidden])")) {
    document.body.classList.remove("modal-open");
  }
}

function switchModal(currentModal, nextModal) {
  closeModal(currentModal);
  openModal(nextModal);
}

function setMessage(node, message, kind = "") {
  if (!node) return;
  node.textContent = message || "";
  node.classList.toggle("is-error", kind === "error");
  node.classList.toggle("is-success", kind === "success");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

