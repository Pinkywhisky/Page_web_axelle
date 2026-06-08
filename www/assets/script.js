const state = {
  user: window.CDP_CURRENT_USER || null,
  users: [],
  bookings: [],
  myBookings: [],
  pets: [],
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
    "openBookingBtn",
    "logoutBtn",
    "homeLink",
    "heroRegisterBtn",
    "heroLoginBtn",
    "heroBookingBtn",
    "heroManageBtn",
    "contactRegisterBtn",
    "contactButton",
    "contactBookingBtn",
    "homeView",
    "manageView",
    "backHomeBtn",
    "loginModal",
    "registerModal",
    "profileModal",
    "bookingModal",
    "contactModal",
    "manageEditModal",
    "closeLoginBtn",
    "closeRegisterBtn",
    "closeProfileBtn",
    "closeBookingBtn",
    "closeContactBtn",
    "closeManageEditBtn",
    "loginForm",
    "loginEmail",
    "loginPassword",
    "loginMessage",
    "registerForm",
    "registerFirstName",
    "registerLastName",
    "registerEmail",
    "registerPassword",
    "registerPhone",
    "registerAnimalType",
    "registerAnimalName",
    "registerMessage",
    "registerSuccess",
    "registerSuccessPanel",
    "closeRegisterSuccessBtn",
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
    "petForm",
    "petId",
    "petName",
    "petSpecies",
    "petNotes",
    "petMessage",
    "petResetBtn",
    "petsList",
    "profileBookingBtn",
    "profileBookingsMessage",
    "profileBookingsList",
    "bookingForm",
    "bookingPetsWrap",
    "bookingPetsList",
    "bookingManualAnimalFields",
    "bookingAnimalType",
    "bookingAnimalName",
    "bookingStartDateTime",
    "bookingEndDateTime",
    "bookingTime",
    "bookingNotes",
    "bookingMessage",
    "bookingSuccessPanel",
    "closeBookingSuccessBtn",
    "contactForm",
    "contactFirstName",
    "contactLastName",
    "contactEmail",
    "contactPhone",
    "contactMessage",
    "contactMessageBox",
    "contactSuccessPanel",
    "closeContactSuccessBtn",
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
    "manageBookingsMessage",
    "manageBookingsList",
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function bindEvents() {
  onClick(dom.openLoginBtn, () => openModal(dom.loginModal));
  onClick(dom.openRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.heroLoginBtn, () => openModal(dom.loginModal));
  onClick(dom.heroRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.heroBookingBtn, openBooking);
  onClick(dom.heroManageBtn, openManage);
  onClick(dom.contactRegisterBtn, () => openModal(dom.registerModal));
  onClick(dom.contactButton, openContact);
  onClick(dom.contactBookingBtn, openBooking);
  onClick(dom.switchToRegisterBtn, () => switchModal(dom.loginModal, dom.registerModal));
  onClick(dom.switchToLoginBtn, () => switchModal(dom.registerModal, dom.loginModal));
  onClick(dom.closeLoginBtn, () => closeModal(dom.loginModal));
  onClick(dom.closeRegisterBtn, () => closeModal(dom.registerModal));
  onClick(dom.closeRegisterSuccessBtn, () => closeModal(dom.registerModal));
  onClick(dom.closeProfileBtn, () => closeModal(dom.profileModal));
  onClick(dom.closeBookingBtn, () => closeModal(dom.bookingModal));
  onClick(dom.closeBookingSuccessBtn, () => closeModal(dom.bookingModal));
  onClick(dom.closeContactBtn, () => closeModal(dom.contactModal));
  onClick(dom.closeContactSuccessBtn, () => closeModal(dom.contactModal));
  onClick(dom.closeManageEditBtn, () => closeModal(dom.manageEditModal));
  onClick(dom.openProfileBtn, openProfile);
  onClick(dom.openBookingBtn, openBooking);
  onClick(dom.profileBookingBtn, openBooking);
  onClick(dom.openManageBtn, openManage);
  onClick(dom.backHomeBtn, showHome);
  onClick(dom.homeLink, showHome);
  onClick(dom.manageResetBtn, resetManageForm);
  onClick(dom.petResetBtn, resetPetForm);

  [dom.loginModal, dom.registerModal, dom.profileModal, dom.bookingModal, dom.contactModal, dom.manageEditModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  onSubmit(dom.loginForm, handleLogin);
  onSubmit(dom.registerForm, handleRegister);
  onSubmit(dom.profileForm, handleProfileSave);
  onSubmit(dom.petForm, handlePetSave);
  onSubmit(dom.bookingForm, handleBookingSubmit);
  onSubmit(dom.contactForm, handleContactSubmit);
  onSubmit(dom.manageEditForm, handleManageSave);
  onEvent(dom.manageSearch, "input", renderUsersTable);
  onEvent(dom.manageTableBody, "click", handleManageTableClick);
  onEvent(dom.petsList, "click", handlePetsListClick);
  onEvent(dom.profileBookingsList, "click", handleProfileBookingsClick);
  onEvent(dom.manageBookingsList, "click", handleManageBookingsClick);

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
  dom.heroRegisterBtn.hidden = loggedIn;
  dom.heroLoginBtn.hidden = loggedIn;

  if (!loggedIn) {
    dom.openManageBtn.hidden = true;
    dom.heroBookingBtn.hidden = false;
    dom.heroManageBtn.hidden = true;
    showHome();
    return;
  }

  dom.userInfoText.textContent = state.user.fullName || state.user.full_name || state.user.email;
  dom.userRoleText.textContent = state.user.role === "admin" ? "Admin" : "Client";
  dom.openManageBtn.hidden = state.user.role !== "admin";
  dom.openBookingBtn.hidden = state.user.role === "admin";
  dom.heroBookingBtn.hidden = state.user.role === "admin";
  dom.heroManageBtn.hidden = state.user.role !== "admin";
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
        full_name: `${dom.registerFirstName.value} ${dom.registerLastName.value}`.trim(),
        email: dom.registerEmail.value,
        password: dom.registerPassword.value,
        phone: dom.registerPhone.value,
        animal_type: dom.registerAnimalType.value,
        animal_name: dom.registerAnimalName.value,
      },
    });

    dom.registerForm.reset();
    dom.registerForm.hidden = true;
    dom.registerSuccessPanel.hidden = false;
    const switchLine = dom.switchToLoginBtn?.closest(".modal-switch");
    if (switchLine) switchLine.hidden = true;
  } catch (error) {
    setMessage(dom.registerMessage, error.message, "error");
  }
}

async function openProfile() {
  if (!state.user) {
    openModal(dom.loginModal);
    return;
  }

  fillProfileForm(state.user);
  setMessage(dom.profileModalMessage, "");
  openModal(dom.profileModal);
  await Promise.all([loadPets(), loadMyBookings()]);
}

function fillProfileForm(user) {
  dom.profileId.value = user.id || "";
  dom.profileFullName.value = user.fullName || user.full_name || "";
  dom.profileEmail.value = user.email || "";
  dom.profilePhone.value = user.phone || "";
  dom.profileAnimalType.value = user.animalType || user.animal_type || "";
  dom.profileAnimalName.value = user.animalName || user.animal_name || "";
}

async function loadPets() {
  if (!state.user || state.user.role === "admin") return;

  try {
    const data = await requestJson("/api/pets.php");
    state.pets = data.pets || [];
    renderPets();
    syncBookingAnimalFields();
  } catch (error) {
    state.pets = [];
    renderPets();
    setMessage(dom.petMessage, error.message, "error");
  }
}

function renderPets() {
  if (!dom.petsList) return;

  if (!state.pets.length) {
    dom.petsList.innerHTML = "<div class='pet-item'><p>Aucun animal enregistré pour le moment.</p></div>";
    return;
  }

  dom.petsList.innerHTML = state.pets
    .map(
      (pet) => `
        <article class="pet-item">
          <div>
            <h5>${escapeHtml(pet.name)}</h5>
            <p>${escapeHtml(animalLabel(pet.species))}${pet.notes ? ` - ${escapeHtml(pet.notes)}` : ""}</p>
          </div>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" data-action="edit-pet" data-id="${pet.id}" type="button">Modifier</button>
            <button class="btn btn-danger btn-sm" data-action="delete-pet" data-id="${pet.id}" type="button">Supprimer</button>
          </div>
        </article>
      `
    )
    .join("");
}

async function handlePetSave(event) {
  event.preventDefault();
  setMessage(dom.petMessage, "");

  const petId = Number(dom.petId.value || 0);

  try {
    await requestJson("/api/pets.php", {
      method: petId ? "PUT" : "POST",
      body: {
        id: petId,
        name: dom.petName.value,
        species: dom.petSpecies.value,
        notes: dom.petNotes.value,
      },
    });

    resetPetForm();
    await loadPets();
    setMessage(dom.petMessage, petId ? "Animal mis à jour." : "Animal ajouté.", "success");
  } catch (error) {
    setMessage(dom.petMessage, error.message, "error");
  }
}

function handlePetsListClick(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;

  const petId = Number(button.dataset.id);

  if (button.dataset.action === "edit-pet") {
    editPet(petId);
    return;
  }

  if (button.dataset.action === "delete-pet") {
    deletePet(petId);
  }
}

function editPet(petId) {
  const pet = state.pets.find((item) => Number(item.id) === Number(petId));
  if (!pet) return;

  dom.petId.value = pet.id;
  dom.petName.value = pet.name || "";
  dom.petSpecies.value = pet.species || "";
  dom.petNotes.value = pet.notes || "";
  setMessage(dom.petMessage, "");
}

async function deletePet(petId) {
  if (!window.confirm("Supprimer cet animal ?")) return;

  try {
    await requestJson("/api/pets.php", {
      method: "DELETE",
      body: { id: petId },
    });
    resetPetForm();
    await loadPets();
  } catch (error) {
    setMessage(dom.petMessage, error.message, "error");
  }
}

function resetPetForm() {
  dom.petForm.reset();
  dom.petId.value = "";
  setMessage(dom.petMessage, "");
}

async function openBooking() {
  if (!state.user) {
    openModal(dom.loginModal);
    return;
  }

  if (state.user.role === "admin") {
    openManage();
    return;
  }

  resetBookingModal();
  await loadPets();
  prefillBookingForm();
  openModal(dom.bookingModal);
}

function resetBookingModal() {
  dom.bookingForm.hidden = false;
  dom.bookingSuccessPanel.hidden = true;
  dom.bookingForm.reset();
  setMessage(dom.bookingMessage, "");
  setMinBookingDateTimes();
}

function prefillBookingForm() {
  syncBookingAnimalFields();

  if (state.pets.length) {
    return;
  }

  const animalType = state.user.animalType || state.user.animal_type || "";
  const animalName = state.user.animalName || state.user.animal_name || "";

  if (animalType) dom.bookingAnimalType.value = animalType;
  if (animalName) dom.bookingAnimalName.value = animalName;
}

function syncBookingAnimalFields() {
  if (!dom.bookingPetsWrap || !dom.bookingManualAnimalFields) return;

  const hasPets = state.pets.length > 0;
  dom.bookingPetsWrap.hidden = !hasPets;
  dom.bookingManualAnimalFields.hidden = hasPets;
  dom.bookingAnimalType.required = !hasPets;
  dom.bookingAnimalName.required = !hasPets;

  if (!hasPets) {
    dom.bookingPetsList.innerHTML = "";
    return;
  }

  dom.bookingPetsList.innerHTML = state.pets
    .map(
      (pet) => `
        <label class="pet-choice">
          <input type="checkbox" value="${pet.id}" data-role="booking-pet" />
          <span>
            <strong>${escapeHtml(pet.name)}</strong>
            <small>${escapeHtml(animalLabel(pet.species))}${pet.notes ? ` - ${escapeHtml(pet.notes)}` : ""}</small>
          </span>
        </label>
      `
    )
    .join("");
}

function setMinBookingDateTimes() {
  if (!dom.bookingStartDateTime || !dom.bookingEndDateTime) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minValue = now.toISOString().slice(0, 16);
  dom.bookingStartDateTime.min = minValue;
  dom.bookingEndDateTime.min = minValue;
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  setMessage(dom.bookingMessage, "");

  try {
    await requestJson("/api/bookings.php", {
      method: "POST",
      body: {
        pet_ids: selectedBookingPetIds(),
        animal_type: dom.bookingAnimalType.value,
        animal_name: dom.bookingAnimalName.value,
        start_datetime: dom.bookingStartDateTime.value,
        end_datetime: dom.bookingEndDateTime.value,
        booking_time: dom.bookingTime.value,
        notes: dom.bookingNotes.value,
      },
    });

    dom.bookingForm.hidden = true;
    dom.bookingSuccessPanel.hidden = false;
    await loadMyBookings();
  } catch (error) {
    setMessage(dom.bookingMessage, error.message, "error");
  }
}

function selectedBookingPetIds() {
  return Array.from(dom.bookingPetsList?.querySelectorAll("input[data-role='booking-pet']:checked") || [])
    .map((input) => Number(input.value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function openContact() {
  resetContactModal();
  prefillContactForm();
  openModal(dom.contactModal);
}

function resetContactModal() {
  dom.contactForm.hidden = false;
  dom.contactSuccessPanel.hidden = true;
  dom.contactForm.reset();
  setMessage(dom.contactMessageBox, "");
}

function prefillContactForm() {
  if (!state.user) return;

  const fullName = state.user.fullName || state.user.full_name || "";
  const nameParts = splitFullName(fullName);
  dom.contactFirstName.value = nameParts.firstName;
  dom.contactLastName.value = nameParts.lastName;
  dom.contactEmail.value = state.user.email || "";
  dom.contactPhone.value = state.user.phone || "";
}

async function handleContactSubmit(event) {
  event.preventDefault();
  setMessage(dom.contactMessageBox, "");

  try {
    await requestJson("/api/contact.php", {
      method: "POST",
      body: {
        full_name: `${dom.contactFirstName.value} ${dom.contactLastName.value}`.trim(),
        email: dom.contactEmail.value,
        phone: dom.contactPhone.value,
        message: dom.contactMessage.value,
      },
    });

    dom.contactForm.hidden = true;
    dom.contactSuccessPanel.hidden = false;
  } catch (error) {
    setMessage(dom.contactMessageBox, error.message, "error");
  }
}

async function loadMyBookings() {
  if (!state.user || state.user.role === "admin") return;
  setMessage(dom.profileBookingsMessage, "Chargement...");

  try {
    const data = await requestJson("/api/bookings.php");
    state.myBookings = data.bookings || [];
    setMessage(dom.profileBookingsMessage, "");
    renderProfileBookings();
  } catch (error) {
    state.myBookings = [];
    renderProfileBookings();
    setMessage(dom.profileBookingsMessage, error.message, "error");
  }
}

function renderProfileBookings() {
  if (!dom.profileBookingsList) return;

  if (!state.myBookings.length) {
    dom.profileBookingsList.innerHTML =
      "<div class='booking-item'><p>Aucune demande de garde pour le moment.</p></div>";
    return;
  }

  dom.profileBookingsList.innerHTML = state.myBookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-head">
            <div>
              <h5>${escapeHtml(bookingPetSummary(booking))}</h5>
              <p>${escapeHtml(formatBookingPeriod(booking))}</p>
            </div>
            <span class="status-pill status-${escapeHtml(booking.status)}">${escapeHtml(statusLabel(booking.status))}</span>
          </div>
          ${booking.notes ? `<p>${escapeHtml(booking.notes)}</p>` : ""}
          ${booking.adminNote || booking.admin_note ? `<p class="admin-note">Réponse : ${escapeHtml(booking.adminNote || booking.admin_note)}</p>` : ""}
          ${
            ["pending", "approved"].includes(booking.status)
              ? `<button class="text-button" data-action="cancel-booking" data-id="${booking.id}" type="button">Annuler cette demande</button>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

async function handleProfileBookingsClick(event) {
  const button = event.target.closest("button[data-action='cancel-booking'][data-id]");
  if (!button) return;

  if (!window.confirm("Annuler cette demande de garde ?")) return;

  try {
    await requestJson("/api/bookings.php", {
      method: "DELETE",
      body: { id: Number(button.dataset.id) },
    });
    await loadMyBookings();
  } catch (error) {
    setMessage(dom.profileBookingsMessage, error.message, "error");
  }
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
  await Promise.all([loadUsers(), loadAdminBookings()]);
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

async function loadAdminBookings() {
  if (!state.user || state.user.role !== "admin") return;
  setMessage(dom.manageBookingsMessage, "Chargement...");

  try {
    const data = await requestJson("/api/bookings.php");
    state.bookings = data.bookings || [];
    setMessage(dom.manageBookingsMessage, "");
    renderAdminBookings();
  } catch (error) {
    state.bookings = [];
    renderAdminBookings();
    setMessage(dom.manageBookingsMessage, error.message, "error");
  }
}

function renderAdminBookings() {
  if (!dom.manageBookingsList) return;

  if (!state.bookings.length) {
    dom.manageBookingsList.innerHTML =
      "<div class='booking-item'><p>Aucune demande de garde pour le moment.</p></div>";
    return;
  }

  dom.manageBookingsList.innerHTML = state.bookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-head">
            <div>
              <h5>${escapeHtml(booking.fullName || booking.full_name)}</h5>
              <p>${escapeHtml(booking.email)}</p>
            </div>
            <span class="status-pill status-${escapeHtml(booking.status)}">${escapeHtml(statusLabel(booking.status))}</span>
          </div>
          <p><strong>${escapeHtml(bookingPetSummary(booking))}</strong></p>
          <p>${escapeHtml(formatBookingPeriod(booking))}</p>
          ${booking.notes ? `<p>${escapeHtml(booking.notes)}</p>` : ""}
          <div class="booking-admin-controls">
            <select data-role="booking-status" data-id="${booking.id}">
              ${["pending", "approved", "rejected", "cancelled"]
                .map((status) => `<option value="${status}" ${booking.status === status ? "selected" : ""}>${statusLabel(status)}</option>`)
                .join("")}
            </select>
            <input data-role="booking-note" data-id="${booking.id}" type="text" value="${escapeHtml(booking.adminNote || booking.admin_note || "")}" placeholder="Note admin" />
            <button class="btn btn-primary btn-sm" data-action="save-booking" data-id="${booking.id}" type="button">Mettre à jour</button>
            <button class="btn btn-danger btn-sm" data-action="delete-booking" data-id="${booking.id}" type="button">Supprimer</button>
          </div>
        </article>
      `
    )
    .join("");
}

async function handleManageBookingsClick(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.action === "delete-booking") {
    if (!window.confirm("Supprimer cette demande de garde ?")) return;
    try {
      await requestJson("/api/bookings.php", {
        method: "DELETE",
        body: { id },
      });
      await loadAdminBookings();
    } catch (error) {
      setMessage(dom.manageBookingsMessage, error.message, "error");
    }
    return;
  }

  if (button.dataset.action === "save-booking") {
    const statusInput = dom.manageBookingsList.querySelector(`[data-role="booking-status"][data-id="${id}"]`);
    const noteInput = dom.manageBookingsList.querySelector(`[data-role="booking-note"][data-id="${id}"]`);

    try {
      await requestJson("/api/bookings.php", {
        method: "PUT",
        body: {
          id,
          status: statusInput?.value || "pending",
          admin_note: noteInput?.value || "",
        },
      });
      await loadAdminBookings();
    } catch (error) {
      setMessage(dom.manageBookingsMessage, error.message, "error");
    }
  }
}

function renderUsersTable() {
  const search = (dom.manageSearch.value || "").trim().toLowerCase();
  const users = state.users.filter((user) => {
    const text = `${user.fullName || user.full_name} ${user.email} ${user.role}`.toLowerCase();
    return text.includes(search);
  });

  if (!users.length) {
    dom.manageTableBody.innerHTML = "<tr><td colspan='6'>Aucun membre trouvé.</td></tr>";
    return;
  }

  dom.manageTableBody.innerHTML = users
    .map((user) => {
      const isCurrentUser = state.user && Number(state.user.id) === Number(user.id);

      return `
        <tr class="${state.selectedUserId === user.id ? "is-selected" : ""}">
          <td>${escapeHtml(user.fullName || user.full_name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(animalLabel(user.animalType || user.animal_type) || "Non renseigné")}</td>
          <td>${escapeHtml(user.animalName || user.animal_name || "Non renseigné")}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${user.id}" type="button">Modifier</button>
              ${
                isCurrentUser
                  ? ""
                  : `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${user.id}" type="button">Supprimer</button>`
              }
            </div>
          </td>
        </tr>
      `;
    })
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
  openModal(dom.manageEditModal);
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
    closeModal(dom.manageEditModal);
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
  if (node === dom.registerModal) resetRegisterModal();
  if (state.activeModal && state.activeModal !== node) state.activeModal.hidden = true;
  state.activeModal = node;
  node.hidden = false;
  document.body.classList.add("modal-open");
  const focusTarget = node.querySelector("input, select, textarea, button");
  if (focusTarget) window.setTimeout(() => focusTarget.focus(), 0);
}

function resetRegisterModal() {
  dom.registerForm.hidden = false;
  dom.registerSuccessPanel.hidden = true;
  const switchLine = dom.switchToLoginBtn?.closest(".modal-switch");
  if (switchLine) switchLine.hidden = false;
  setMessage(dom.registerMessage, "");
  setMessage(dom.registerSuccess, "");
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

function statusLabel(status) {
  return {
    pending: "En attente",
    approved: "Confirmée",
    rejected: "Refusée",
    cancelled: "Annulée",
  }[status] || status;
}

function animalLabel(value) {
  return {
    chien: "Chien",
    chat: "Chat",
    plusieurs: "Plusieurs animaux",
  }[value] || value || "Animal";
}

function bookingPetSummary(booking) {
  const pets = booking.pets || [];

  if (pets.length) {
    return pets
      .map((pet) => `${pet.name} (${animalLabel(pet.species)})`)
      .join(", ");
  }

  const name = booking.animalName || booking.animal_name || "";
  const type = booking.animalType || booking.animal_type || "";
  return `${name}${type ? ` (${animalLabel(type)})` : ""}`.trim() || "Animal";
}

function formatBookingPeriod(booking) {
  const start = booking.startDateTime || booking.start_datetime || "";
  const end = booking.endDateTime || booking.end_datetime || "";
  const time = booking.bookingTime || booking.booking_time || "";
  const period = `${formatDateTime(start)} - ${formatDateTime(end)}`;

  return time ? `${period} - Horaire souhaité : ${formatTimeOnly(time)}` : period;
}

function formatDateTime(value) {
  if (!value) return "";
  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTimeOnly(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : String(value || "");
}

function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
