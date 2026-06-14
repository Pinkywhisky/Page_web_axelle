const state = {
  user: window.CDP_CURRENT_USER || null,
  users: [],
  bookings: [],
  contacts: [],
  myBookings: [],
  myContacts: [],
  pets: [],
  selectedUserId: null,
  activeModal: null,
  bookingTimeTarget: null,
  editingBookingId: null,
  editingProfile: false,
  profileTab: "pets",
  adminTab: "dashboard",
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
    "contactButton",
    "contactBookingBtn",
    "homeView",
    "manageView",
    "manageTabs",
    "adminDashboardTab",
    "adminBookingsTab",
    "adminUsersTab",
    "adminContactsTab",
    "adminArchivesTab",
    "adminDashboardPanel",
    "adminBookingsPanel",
    "adminUsersPanel",
    "adminContactsPanel",
    "adminArchivesPanel",
    "adminBookingsBadge",
    "adminUsersBadge",
    "adminContactsBadge",
    "adminArchivesBadge",
    "statClients",
    "statPets",
    "statPendingBookings",
    "statApprovedBookings",
    "statNewMessages",
    "adminCalendarList",
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
    "profileModalMessage",
    "profileReadonly",
    "profileDetailsPanel",
    "editProfileBtn",
    "cancelProfileEditBtn",
    "profileTabs",
    "profilePetsTab",
    "profileBookingsTab",
    "profileContactsTab",
    "profileDetailsTab",
    "profilePetsPanel",
    "profileBookingsPanel",
    "profileContactsPanel",
    "petForm",
    "petId",
    "petName",
    "petSpecies",
    "petNotes",
    "petMessage",
    "petResetBtn",
    "openPetFormBtn",
    "petsList",
    "profileBookingBtn",
    "profileBookingsMessage",
    "profileBookingsList",
    "profileContactsMessage",
    "profileContactsList",
    "bookingForm",
    "bookingPetsWrap",
    "bookingPetsList",
    "bookingManualAnimalFields",
    "bookingAnimalType",
    "bookingAnimalName",
    "bookingStartDate",
    "bookingStartDateTime",
    "bookingStartTimeBtn",
    "bookingStartSummary",
    "bookingEndDate",
    "bookingEndDateTime",
    "bookingEndTimeBtn",
    "bookingEndSummary",
    "bookingNotes",
    "bookingMessage",
    "bookingSubmitBtn",
    "bookingSuccessPanel",
    "closeBookingSuccessBtn",
    "bookingTimeModal",
    "bookingTimeForm",
    "bookingTimeInput",
    "bookingTimeMessage",
    "bookingTimeModalTitle",
    "bookingTimeModalText",
    "closeBookingTimeBtn",
    "cancelBookingTimeBtn",
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
    "manageContactsMessage",
    "manageContactsList",
    "manageArchivesMessage",
    "manageArchivesList",
    "toastRegion",
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function bindEvents() {
  onClick(dom.openLoginBtn, () => openModal(dom.loginModal));
  onClick(dom.openRegisterBtn, () => openModal(dom.registerModal));
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
  onClick(dom.closeBookingTimeBtn, closeBookingTimeModal);
  onClick(dom.cancelBookingTimeBtn, closeBookingTimeModal);
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
  onClick(dom.openPetFormBtn, () => openPetForm());
  onClick(dom.editProfileBtn, () => setProfileEditMode(true));
  onClick(dom.cancelProfileEditBtn, () => setProfileEditMode(false));

  [dom.loginModal, dom.registerModal, dom.profileModal, dom.bookingModal, dom.contactModal, dom.manageEditModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  if (dom.bookingTimeModal) {
    dom.bookingTimeModal.addEventListener("click", (event) => {
      if (event.target === dom.bookingTimeModal) closeBookingTimeModal();
    });
  }

  onSubmit(dom.loginForm, handleLogin);
  onSubmit(dom.registerForm, handleRegister);
  onSubmit(dom.profileForm, handleProfileSave);
  onSubmit(dom.petForm, handlePetSave);
  onSubmit(dom.bookingForm, handleBookingSubmit);
  onSubmit(dom.bookingTimeForm, handleBookingTimeSubmit);
  onSubmit(dom.contactForm, handleContactSubmit);
  onSubmit(dom.manageEditForm, handleManageSave);
  onEvent(dom.manageSearch, "input", renderUsersTable);
  onEvent(dom.manageTabs, "click", handleManageTabsClick);
  onEvent(dom.profileTabs, "click", handleProfileTabsClick);
  onEvent(dom.manageTableBody, "click", handleManageTableClick);
  onEvent(dom.manageContactsList, "click", handleManageContactsClick);
  onEvent(dom.manageArchivesList, "click", handleManageContactsClick);
  onEvent(dom.petsList, "click", handlePetsListClick);
  onEvent(dom.profileBookingsList, "click", handleProfileBookingsClick);
  onEvent(dom.profileContactsList, "click", handleProfileContactsClick);
  onEvent(dom.manageBookingsList, "click", handleManageBookingsClick);
  onEvent(dom.bookingStartDate, "change", () => handleBookingDateChange("start"));
  onEvent(dom.bookingEndDate, "change", () => handleBookingDateChange("end"));
  onClick(dom.bookingStartTimeBtn, () => openBookingTimeModal("start"));
  onClick(dom.bookingEndTimeBtn, () => openBookingTimeModal("end"));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (dom.bookingTimeModal && !dom.bookingTimeModal.hidden) {
      closeBookingTimeModal();
      return;
    }
    if (state.activeModal) closeModal(state.activeModal);
  });

  window.addEventListener("error", () => {
    showToast("Une erreur inattendue est survenue.", "error");
  });

  window.addEventListener("unhandledrejection", () => {
    showToast("Une erreur inattendue est survenue.", "error");
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
  const method = String(config.method || "GET").toUpperCase();

  if (method !== "GET" && window.CDP_CSRF_TOKEN) {
    config.headers["X-CSRF-Token"] = window.CDP_CSRF_TOKEN;
  }

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
  const adminUser = loggedIn && state.user?.role === "admin";
  dom.publicActions.hidden = loggedIn;
  dom.userArea.hidden = !loggedIn;
  dom.contactBookingBtn.hidden = !loggedIn || adminUser;

  if (!loggedIn) {
    dom.openManageBtn.hidden = true;
    showHome();
    return;
  }

  dom.userInfoText.textContent = state.user.fullName || state.user.full_name || state.user.email;
  dom.userRoleText.textContent = adminUser ? "Admin" : "Client";
  dom.openManageBtn.hidden = !adminUser;
  dom.openBookingBtn.hidden = adminUser;

  if (adminUser) {
    openManage();
  }
}

function showToast(message, type = "info") {
  if (!dom.toastRegion || !message) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  dom.toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-hiding");
    window.setTimeout(() => toast.remove(), 220);
  }, 3600);
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

  if (!isValidPhoneInput(dom.registerPhone.value)) {
    setMessage(dom.registerMessage, "Numéro de téléphone invalide.", "error");
    return;
  }

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
  renderProfileReadonly();
  setProfileEditMode(false);
  resetPetForm();
  setMessage(dom.profileModalMessage, "");
  setProfileTab(state.profileTab || "pets");
  openModal(dom.profileModal);
  await Promise.all([loadPets(), loadMyBookings(), loadMyContacts()]);
}

function handleProfileTabsClick(event) {
  const tabButton = event.target.closest("button[data-profile-tab]");
  if (!tabButton) return;
  setProfileTab(tabButton.dataset.profileTab);
}

function setProfileTab(tabName) {
  const nextTab = ["pets", "bookings", "contacts", "details"].includes(tabName) ? tabName : "pets";
  state.profileTab = nextTab;

  const panels = {
    pets: dom.profilePetsPanel,
    bookings: dom.profileBookingsPanel,
    contacts: dom.profileContactsPanel,
    details: dom.profileDetailsPanel,
  };

  const tabs = {
    pets: dom.profilePetsTab,
    bookings: dom.profileBookingsTab,
    contacts: dom.profileContactsTab,
    details: dom.profileDetailsTab,
  };

  Object.entries(panels).forEach(([name, panel]) => {
    if (panel) panel.hidden = name !== nextTab;
  });

  Object.entries(tabs).forEach(([name, button]) => {
    updateAdminTabButton(button, name === nextTab);
  });
}

function fillProfileForm(user) {
  dom.profileId.value = user.id || "";
  dom.profileFullName.value = user.fullName || user.full_name || "";
  dom.profileEmail.value = user.email || "";
  dom.profilePhone.value = user.phone || "";
}

function renderProfileReadonly() {
  if (!dom.profileReadonly || !state.user) return;

  const user = state.user;
  const rows = [
    ["Nom complet", user.fullName || user.full_name || "Non renseigné"],
    ["E-mail", user.email || "Non renseigné"],
    ["Téléphone", user.phone || "Non renseigné"],
  ];

  dom.profileReadonly.innerHTML = rows
    .map(
      ([label, value]) => `
        <div class="readonly-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function setProfileEditMode(active) {
  state.editingProfile = active;
  if (dom.profileForm) dom.profileForm.hidden = !active;
  if (dom.profileReadonly) dom.profileReadonly.hidden = active;
  if (dom.editProfileBtn) dom.editProfileBtn.hidden = active;

  if (active) {
    fillProfileForm(state.user);
    setMessage(dom.profileModalMessage, "");
  }
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

  openPetForm();
  dom.petId.value = pet.id;
  dom.petName.value = pet.name || "";
  dom.petSpecies.value = pet.species || "";
  dom.petNotes.value = pet.notes || "";
  setMessage(dom.petMessage, "");
}

function openPetForm() {
  dom.petForm.hidden = false;
  if (dom.openPetFormBtn) dom.openPetFormBtn.hidden = true;
  window.setTimeout(() => dom.petName?.focus(), 0);
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
  dom.petForm.hidden = true;
  if (dom.openPetFormBtn) dom.openPetFormBtn.hidden = false;
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
  state.editingBookingId = null;
  if (dom.bookingSubmitBtn) dom.bookingSubmitBtn.textContent = "Envoyer la demande";
  setMessage(dom.bookingMessage, "");
  setMinBookingDateTimes();
  updateBookingDateTimeSummary("start");
  updateBookingDateTimeSummary("end");
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
  if (!dom.bookingStartDate || !dom.bookingEndDate) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minValue = now.toISOString().slice(0, 10);
  dom.bookingStartDate.min = minValue;
  dom.bookingEndDate.min = minValue;
  updateEndDateMinimum();
}

function bookingDateTimeNodes(target) {
  const isStart = target === "start";

  return {
    dateInput: isStart ? dom.bookingStartDate : dom.bookingEndDate,
    dateTimeInput: isStart ? dom.bookingStartDateTime : dom.bookingEndDateTime,
    timeButton: isStart ? dom.bookingStartTimeBtn : dom.bookingEndTimeBtn,
    summary: isStart ? dom.bookingStartSummary : dom.bookingEndSummary,
    title: isStart ? "Début de garde" : "Fin de garde",
    defaultTime: isStart ? "09:00" : "18:00",
  };
}

function handleBookingDateChange(target) {
  const nodes = bookingDateTimeNodes(target);
  if (!nodes.dateInput || !nodes.dateTimeInput) return;

  nodes.dateTimeInput.value = "";

  if (target === "start") {
    updateEndDateMinimum();
  }

  updateBookingDateTimeSummary(target);

  if (nodes.dateInput.value) {
    openBookingTimeModal(target);
  }
}

function updateEndDateMinimum() {
  if (!dom.bookingStartDate || !dom.bookingEndDate) return;

  const minDate = dom.bookingStartDate.value || dom.bookingStartDate.min;
  dom.bookingEndDate.min = minDate;

  if (dom.bookingEndDate.value && dom.bookingEndDate.value < minDate) {
    dom.bookingEndDate.value = "";
    dom.bookingEndDateTime.value = "";
    updateBookingDateTimeSummary("end");
  }
}

function openBookingTimeModal(target) {
  const nodes = bookingDateTimeNodes(target);
  if (!nodes.dateInput?.value) {
    setMessage(dom.bookingMessage, "Choisissez d’abord une date.", "error");
    nodes.dateInput?.focus();
    return;
  }

  state.bookingTimeTarget = target;
  setMessage(dom.bookingTimeMessage, "");
  dom.bookingTimeModalTitle.textContent = nodes.title;
  dom.bookingTimeModalText.textContent = `Choisissez l’heure pour le ${formatDateOnly(nodes.dateInput.value)}.`;
  dom.bookingTimeInput.value = extractTime(nodes.dateTimeInput.value) || nodes.defaultTime;
  dom.bookingTimeModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => dom.bookingTimeInput.focus(), 0);
}

function closeBookingTimeModal() {
  if (!dom.bookingTimeModal) return;

  dom.bookingTimeModal.hidden = true;
  state.bookingTimeTarget = null;

  if (!document.querySelector(".modal-backdrop:not([hidden])")) {
    document.body.classList.remove("modal-open");
  }
}

function handleBookingTimeSubmit(event) {
  event.preventDefault();
  const target = state.bookingTimeTarget;
  const nodes = bookingDateTimeNodes(target);
  const time = dom.bookingTimeInput.value;

  if (!target || !nodes.dateInput?.value) {
    closeBookingTimeModal();
    return;
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    setMessage(dom.bookingTimeMessage, "Merci de choisir une heure valide.", "error");
    return;
  }

  nodes.dateTimeInput.value = `${nodes.dateInput.value}T${time}`;
  updateBookingDateTimeSummary(target);
  closeBookingTimeModal();
}

function updateBookingDateTimeSummary(target) {
  const nodes = bookingDateTimeNodes(target);
  if (!nodes.summary || !nodes.timeButton) return;

  if (nodes.dateTimeInput.value) {
    nodes.summary.textContent = formatDateTime(nodes.dateTimeInput.value);
    nodes.timeButton.textContent = "Modifier l’heure";
    nodes.timeButton.classList.add("is-complete");
    return;
  }

  nodes.timeButton.classList.remove("is-complete");
  nodes.timeButton.textContent = "Choisir l’heure";

  if (nodes.dateInput.value) {
    nodes.summary.textContent = `${formatDateOnly(nodes.dateInput.value)} - heure à choisir.`;
    return;
  }

  nodes.summary.textContent = "Date et heure non renseignées.";
}

function bookingDateTimesAreComplete() {
  if (!dom.bookingStartDateTime.value) {
    setMessage(dom.bookingMessage, "Merci de choisir une date et une heure de début.", "error");
    openBookingTimeModal("start");
    return false;
  }

  if (!dom.bookingEndDateTime.value) {
    setMessage(dom.bookingMessage, "Merci de choisir une date et une heure de fin.", "error");
    openBookingTimeModal("end");
    return false;
  }

  const start = new Date(dom.bookingStartDateTime.value);
  const end = new Date(dom.bookingEndDateTime.value);

  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
    setMessage(dom.bookingMessage, "La fin de garde doit être après le début.", "error");
    return false;
  }

  return true;
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  setMessage(dom.bookingMessage, "");

  if (!bookingDateTimesAreComplete()) {
    return;
  }

  try {
    const editingBookingId = state.editingBookingId;
    await requestJson("/api/bookings.php", {
      method: editingBookingId ? "PUT" : "POST",
      body: {
        id: editingBookingId || undefined,
        pet_ids: selectedBookingPetIds(),
        animal_type: dom.bookingAnimalType.value,
        animal_name: dom.bookingAnimalName.value,
        start_datetime: dom.bookingStartDateTime.value,
        end_datetime: dom.bookingEndDateTime.value,
        notes: dom.bookingNotes.value,
      },
    });

    if (editingBookingId) {
      closeModal(dom.bookingModal);
      setMessage(dom.profileBookingsMessage, "Garde mise à jour.", "success");
    } else {
      dom.bookingForm.hidden = true;
      dom.bookingSuccessPanel.hidden = false;
    }
    state.editingBookingId = null;
    await loadMyBookings();
  } catch (error) {
    setMessage(dom.bookingMessage, error.message, "error");
  }
}

async function editBooking(bookingId) {
  const booking = state.myBookings.find((item) => Number(item.id) === Number(bookingId));
  if (!booking) return;

  resetBookingModal();
  await loadPets();
  state.editingBookingId = Number(booking.id);
  if (dom.bookingSubmitBtn) dom.bookingSubmitBtn.textContent = "Enregistrer les modifications";
  fillBookingFormFromBooking(booking);
  openModal(dom.bookingModal);
}

function fillBookingFormFromBooking(booking) {
  syncBookingAnimalFields();

  const bookingPets = booking.pets || [];
  const petIds = bookingPets.map((pet) => Number(pet.id));

  if (petIds.length) {
    dom.bookingPetsList
      ?.querySelectorAll("input[data-role='booking-pet']")
      .forEach((input) => {
        input.checked = petIds.includes(Number(input.value));
      });
  } else {
    dom.bookingAnimalType.value = booking.animalType || booking.animal_type || "";
    dom.bookingAnimalName.value = booking.animalName || booking.animal_name || "";
  }

  const startValue = booking.startDateTime || booking.start_datetime || "";
  const endValue = booking.endDateTime || booking.end_datetime || "";
  dom.bookingStartDateTime.value = normalizeDateTimeInput(startValue);
  dom.bookingEndDateTime.value = normalizeDateTimeInput(endValue);
  dom.bookingStartDate.value = dom.bookingStartDateTime.value.slice(0, 10);
  dom.bookingEndDate.value = dom.bookingEndDateTime.value.slice(0, 10);
  dom.bookingNotes.value = booking.notes || "";
  updateBookingDateTimeSummary("start");
  updateBookingDateTimeSummary("end");
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

  if (!isValidPhoneInput(dom.contactPhone.value)) {
    setMessage(dom.contactMessageBox, "Numéro de téléphone invalide.", "error");
    return;
  }

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

async function loadMyContacts() {
  if (!state.user || state.user.role === "admin") return;
  setMessage(dom.profileContactsMessage, "Chargement...");

  try {
    const data = await requestJson("/api/contact.php");
    state.myContacts = data.contacts || [];
    setMessage(dom.profileContactsMessage, "");
    renderProfileContacts();
  } catch (error) {
    state.myContacts = [];
    renderProfileContacts();
    setMessage(dom.profileContactsMessage, error.message, "error");
  }
}

function renderProfileContacts() {
  if (!dom.profileContactsList) return;

  if (!state.myContacts.length) {
    dom.profileContactsList.innerHTML =
      "<div class='booking-item'><p>Aucune réponse à afficher pour le moment.</p></div>";
    return;
  }

  dom.profileContactsList.innerHTML = state.myContacts
    .map(
      (contact) => `
        <article class="booking-item">
          <div class="booking-item-head">
            <div>
              <h5>Votre message</h5>
              <p>${escapeHtml(formatDateTime(contact.createdAt || contact.created_at))}</p>
            </div>
            <span class="status-pill status-${escapeHtml(contact.status)}">${escapeHtml(contactStatusLabel(contact.status))}</span>
          </div>
          ${renderContactThread(contact)}
          ${
            contact.status === "waiting"
              ? `<div class="contact-reply-form" data-role="client-contact-reply-form" data-id="${contact.id}" hidden>
                  <label for="clientReply${contact.id}">Votre réponse</label>
                  <textarea id="clientReply${contact.id}" data-role="client-contact-reply" data-id="${contact.id}" rows="3" placeholder="Votre message retour."></textarea>
                  <div class="form-actions">
                    <button class="btn btn-primary btn-sm" data-action="reply-contact-client" data-id="${contact.id}" type="button">Répondre</button>
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-secondary btn-sm" data-action="open-contact-client-reply" data-id="${contact.id}" type="button">Répondre</button>
                </div>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

async function handleProfileContactsClick(event) {
  const button = event.target.closest("button[data-action='reply-contact-client'][data-id]");
  const opener = event.target.closest("button[data-action='open-contact-client-reply'][data-id]");
  if (!button && !opener) return;

  if (opener) {
    const id = Number(opener.dataset.id);
    const replyForm = dom.profileContactsList.querySelector(`[data-role="client-contact-reply-form"][data-id="${id}"]`);
    const replyInput = dom.profileContactsList.querySelector(`[data-role="client-contact-reply"][data-id="${id}"]`);
    if (replyForm) replyForm.hidden = !replyForm.hidden;
    if (replyForm && !replyForm.hidden) replyInput?.focus();
    return;
  }

  const id = Number(button.dataset.id);
  const replyInput = dom.profileContactsList.querySelector(`[data-role="client-contact-reply"][data-id="${id}"]`);

  try {
    await requestJson("/api/contact.php", {
      method: "PUT",
      body: {
        id,
        client_reply: replyInput?.value || "",
      },
    });
    await loadMyContacts();
  } catch (error) {
    setMessage(dom.profileContactsMessage, error.message, "error");
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
              ? `<div class="table-actions">
                  <button class="btn btn-secondary btn-sm" data-action="edit-booking" data-id="${booking.id}" type="button">Modifier</button>
                  <button class="btn btn-danger btn-sm" data-action="cancel-booking" data-id="${booking.id}" type="button">Annuler</button>
                </div>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

async function handleProfileBookingsClick(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;

  if (button.dataset.action === "edit-booking") {
    await editBooking(Number(button.dataset.id));
    return;
  }

  if (button.dataset.action !== "cancel-booking") return;
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

  if (!isValidPhoneInput(dom.profilePhone.value)) {
    setMessage(dom.profileModalMessage, "Numéro de téléphone invalide.", "error");
    return;
  }

  try {
    const data = await requestJson("/api/users.php", {
      method: "PUT",
      body: {
        id: Number(dom.profileId.value),
        full_name: dom.profileFullName.value,
        email: dom.profileEmail.value,
        phone: dom.profilePhone.value,
        animal_type: state.user.animalType || state.user.animal_type || "",
        animal_name: state.user.animalName || state.user.animal_name || "",
        role: state.user.role,
      },
    });

    state.user = data.user;
    renderSession();
    renderProfileReadonly();
    setProfileEditMode(false);
    setMessage(dom.profileModalMessage, "Profil mis à jour.", "success");
  } catch (error) {
    setMessage(dom.profileModalMessage, error.message, "error");
  }
}

async function openManage() {
  if (!state.user || state.user.role !== "admin") return;
  dom.homeView.hidden = true;
  dom.manageView.hidden = false;
  setAdminTab(state.adminTab || "dashboard");
  await Promise.all([loadUsers(), loadAdminBookings(), loadAdminContacts()]);
  updateAdminBadges();
  renderAdminDashboard();
}

function showHome() {
  if (dom.homeView) dom.homeView.hidden = false;
  if (dom.manageView) dom.manageView.hidden = true;
}

function handleManageTabsClick(event) {
  const tabButton = event.target.closest("button[data-admin-tab]");
  if (!tabButton) return;
  setAdminTab(tabButton.dataset.adminTab);
}

function setAdminTab(tabName) {
  const nextTab = ["dashboard", "bookings", "users", "contacts", "archives"].includes(tabName) ? tabName : "dashboard";
  state.adminTab = nextTab;

  const isDashboard = nextTab === "dashboard";
  const isBookings = nextTab === "bookings";
  const isUsers = nextTab === "users";
  const isContacts = nextTab === "contacts";
  const isArchives = nextTab === "archives";
  if (dom.adminDashboardPanel) dom.adminDashboardPanel.hidden = !isDashboard;
  if (dom.adminBookingsPanel) dom.adminBookingsPanel.hidden = !isBookings;
  if (dom.adminUsersPanel) dom.adminUsersPanel.hidden = !isUsers;
  if (dom.adminContactsPanel) dom.adminContactsPanel.hidden = !isContacts;
  if (dom.adminArchivesPanel) dom.adminArchivesPanel.hidden = !isArchives;

  updateAdminTabButton(dom.adminDashboardTab, isDashboard);
  updateAdminTabButton(dom.adminBookingsTab, isBookings);
  updateAdminTabButton(dom.adminUsersTab, isUsers);
  updateAdminTabButton(dom.adminContactsTab, isContacts);
  updateAdminTabButton(dom.adminArchivesTab, isArchives);
}

function updateAdminTabButton(button, active) {
  if (!button) return;
  button.classList.toggle("is-active", active);
  button.setAttribute("aria-selected", active ? "true" : "false");
}

function updateAdminBadges() {
  const pendingBookings = state.bookings.filter((booking) => booking.status === "pending").length;
  const newContacts = state.contacts.filter((contact) => contact.status === "new").length;
  const closedContacts = state.contacts.filter((contact) => contact.status === "closed").length;
  setBadge(dom.adminBookingsBadge, pendingBookings);
  setBadge(dom.adminUsersBadge, state.users.length);
  setBadge(dom.adminContactsBadge, newContacts);
  setBadge(dom.adminArchivesBadge, closedContacts);
  renderAdminDashboard();
}

function renderAdminDashboard() {
  const clients = state.users.filter((user) => user.role === "client").length;
  const pets = state.users.reduce((total, user) => total + (Array.isArray(user.pets) ? user.pets.length : 0), 0);
  const pendingBookings = state.bookings.filter((booking) => booking.status === "pending").length;
  const approvedBookings = state.bookings.filter((booking) => booking.status === "approved").length;
  const newContacts = state.contacts.filter((contact) => contact.status === "new").length;

  setStat(dom.statClients, clients);
  setStat(dom.statPets, pets);
  setStat(dom.statPendingBookings, pendingBookings);
  setStat(dom.statApprovedBookings, approvedBookings);
  setStat(dom.statNewMessages, newContacts);
  renderAdminCalendar();
}

function setStat(node, value) {
  if (node) node.textContent = String(value);
}

function renderAdminCalendar() {
  if (!dom.adminCalendarList) return;

  const items = state.bookings
    .filter((booking) => ["pending", "approved"].includes(booking.status))
    .slice()
    .sort(
      (a, b) =>
        new Date(normalizeDateTimeInput(a.startDateTime || a.start_datetime)) -
        new Date(normalizeDateTimeInput(b.startDateTime || b.start_datetime))
    )
    .slice(0, 8);

  if (!items.length) {
    dom.adminCalendarList.innerHTML = "<div class='calendar-empty'>Aucune garde à venir.</div>";
    return;
  }

  dom.adminCalendarList.innerHTML = items
    .map(
      (booking) => `
        <article class="calendar-item">
          <time datetime="${escapeHtml(normalizeDateTimeInput(booking.startDateTime || booking.start_datetime))}">
            <strong>${escapeHtml(formatCalendarDay(booking.startDateTime || booking.start_datetime))}</strong>
            <span>${escapeHtml(formatCalendarMonth(booking.startDateTime || booking.start_datetime))}</span>
          </time>
          <div>
            <h5>${escapeHtml(booking.fullName || booking.full_name)}</h5>
            <p>${escapeHtml(bookingPetSummary(booking))}</p>
            <p>${escapeHtml(formatBookingPeriod(booking))}</p>
          </div>
          <span class="status-pill status-${escapeHtml(booking.status)}">${escapeHtml(statusLabel(booking.status))}</span>
        </article>
      `
    )
    .join("");
}

function setBadge(node, count) {
  if (!node) return;
  node.textContent = String(count);
  node.hidden = count <= 0;
}

async function loadUsers() {
  setMessage(dom.manageListMessage, "Chargement...");

  try {
    const data = await requestJson("/api/users.php");
    state.users = data.users || [];
    setMessage(dom.manageListMessage, "");
    renderUsersTable();
    updateAdminBadges();
  } catch (error) {
    state.users = [];
    renderUsersTable();
    updateAdminBadges();
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
    updateAdminBadges();
  } catch (error) {
    state.bookings = [];
    renderAdminBookings();
    updateAdminBadges();
    setMessage(dom.manageBookingsMessage, error.message, "error");
  }
}

async function loadAdminContacts() {
  if (!state.user || state.user.role !== "admin") return;
  setMessage(dom.manageContactsMessage, "Chargement...");

  try {
    const data = await requestJson("/api/contact.php");
    state.contacts = data.contacts || [];
    setMessage(dom.manageContactsMessage, "");
    renderAdminContacts();
    renderAdminArchives();
    updateAdminBadges();
  } catch (error) {
    state.contacts = [];
    renderAdminContacts();
    renderAdminArchives();
    updateAdminBadges();
    setMessage(dom.manageContactsMessage, error.message, "error");
  }
}

function renderAdminContacts() {
  if (!dom.manageContactsList) return;

  const contacts = state.contacts.filter((contact) => contact.status !== "closed");

  if (!contacts.length) {
    dom.manageContactsList.innerHTML = "<div class='booking-item'><p>Aucun message pour le moment.</p></div>";
    return;
  }

  dom.manageContactsList.innerHTML = contacts.map((contact) => renderAdminContactItem(contact, false)).join("");
}

function renderAdminArchives() {
  if (!dom.manageArchivesList) return;

  const contacts = state.contacts.filter((contact) => contact.status === "closed");

  if (!contacts.length) {
    dom.manageArchivesList.innerHTML = "<div class='booking-item'><p>Aucune discussion archivée.</p></div>";
    return;
  }

  dom.manageArchivesList.innerHTML = contacts.map((contact) => renderAdminContactItem(contact, true)).join("");
}

function renderAdminContactItem(contact, archived) {
  const canReply = Boolean(contact.isRegisteredUser ?? contact.is_registered_user);

  return `
    <article class="booking-item contact-item">
      <div class="booking-item-head">
        <div>
          <h5>${escapeHtml(contact.fullName || contact.full_name)}</h5>
          <p>${escapeHtml(contact.email)}${contact.phone ? ` - ${escapeHtml(contact.phone)}` : ""}</p>
        </div>
        <span class="status-pill status-${escapeHtml(contact.status)}">${escapeHtml(contactStatusLabel(contact.status))}</span>
      </div>
      ${renderContactThread(contact)}
      <p class="panel-text">${escapeHtml(formatDateTime(contact.createdAt || contact.created_at))}</p>
      ${
        canReply
          ? `<div class="contact-reply-form" data-role="contact-reply-form" data-id="${contact.id}" hidden>
              <label for="contactReply${contact.id}">Réponse</label>
              <textarea id="contactReply${contact.id}" data-role="contact-reply" data-id="${contact.id}" rows="3" placeholder="Message retour visible dans l'espace client.">${escapeHtml(contact.adminReply || contact.admin_reply || "")}</textarea>
              <div class="form-actions">
                <button class="btn btn-primary btn-sm" data-action="send-contact-reply" data-id="${contact.id}" type="button">Répondre</button>
              </div>
            </div>`
          : ""
      }
      <div class="table-actions">
        ${
          archived
            ? `<button class="btn btn-primary btn-sm" data-action="reopen-contact" data-id="${contact.id}" type="button">Rouvrir</button>`
            : `${canReply
                ? `<button class="btn btn-primary btn-sm" data-action="open-contact-reply" data-id="${contact.id}" type="button">Répondre</button>`
                : `<span class="tooltip-wrap" data-tooltip="Réponse impossible : cette adresse e-mail n'est pas associée à un compte.">
                    <button class="btn btn-secondary btn-sm" type="button" disabled>Répondre</button>
                  </span>`
              }
               <button class="btn btn-secondary btn-sm" data-action="close-contact" data-id="${contact.id}" type="button">Fermer</button>`
        }
      </div>
    </article>
  `;
}

function renderContactThread(contact) {
  const adminReply = contact.adminReply || contact.admin_reply || "";
  const clientReply = contact.clientReply || contact.client_reply || "";

  return `
    <div class="message-thread">
      <div class="thread-message thread-client">
        <span>Client</span>
        <p>${escapeHtml(contact.message)}</p>
      </div>
      ${
        adminReply
          ? `<div class="thread-message thread-admin">
              <span>Réponse</span>
              <p>${escapeHtml(adminReply)}</p>
            </div>`
          : ""
      }
      ${
        clientReply
          ? `<div class="thread-message thread-client">
              <span>Retour client</span>
              <p>${escapeHtml(clientReply)}</p>
            </div>`
          : ""
      }
    </div>
  `;
}


async function handleManageContactsClick(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const replyInput = dom.manageContactsList.querySelector(`[data-role="contact-reply"][data-id="${id}"]`);
  const action = button.dataset.action;

  if (action === "open-contact-reply") {
    const replyForm = dom.manageContactsList.querySelector(`[data-role="contact-reply-form"][data-id="${id}"]`);
    if (!replyForm) {
      setMessage(
        dom.manageContactsMessage,
        "Réponse impossible : cette adresse e-mail n'est pas associée à un compte.",
        "error"
      );
      return;
    }
    if (replyForm) replyForm.hidden = !replyForm.hidden;
    if (replyForm && !replyForm.hidden) replyInput?.focus();
    return;
  }

  try {
    await requestJson("/api/contact.php", {
      method: "PUT",
      body: {
        id,
        status:
          action === "send-contact-reply"
            ? "waiting"
            : action === "close-contact"
              ? "closed"
              : "new",
        admin_reply: action === "send-contact-reply" ? replyInput?.value || "" : "",
      },
    });
    await loadAdminContacts();
  } catch (error) {
    setMessage(dom.manageContactsMessage, error.message, "error");
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
          ${booking.adminNote || booking.admin_note ? `<p class="admin-note">Note admin : ${escapeHtml(booking.adminNote || booking.admin_note)}</p>` : ""}
          <div class="table-actions" data-role="admin-booking-readonly" data-id="${booking.id}">
            <button class="btn btn-secondary btn-sm" data-action="edit-admin-booking" data-id="${booking.id}" type="button">Modifier</button>
            <button class="btn btn-danger btn-sm" data-action="delete-booking" data-id="${booking.id}" type="button">Supprimer</button>
          </div>
          <div class="booking-admin-controls" data-role="admin-booking-edit" data-id="${booking.id}" hidden>
            <select data-role="booking-status" data-id="${booking.id}">
              ${["pending", "approved", "rejected", "cancelled"]
                .map((status) => `<option value="${status}" ${booking.status === status ? "selected" : ""}>${statusLabel(status)}</option>`)
                .join("")}
            </select>
            <input data-role="booking-note" data-id="${booking.id}" type="text" value="${escapeHtml(booking.adminNote || booking.admin_note || "")}" placeholder="Note admin" />
            <button class="btn btn-primary btn-sm" data-action="save-booking" data-id="${booking.id}" type="button">Enregistrer</button>
            <button class="btn btn-secondary btn-sm" data-action="cancel-admin-booking-edit" data-id="${booking.id}" type="button">Annuler</button>
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
  const action = button.dataset.action;

  if (action === "edit-admin-booking") {
    toggleAdminBookingEdit(id, true);
    return;
  }

  if (action === "cancel-admin-booking-edit") {
    toggleAdminBookingEdit(id, false);
    return;
  }

  if (action === "delete-booking") {
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

  if (action === "save-booking") {
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
      setMessage(dom.manageBookingsMessage, "Garde mise à jour.", "success");
      await loadAdminBookings();
    } catch (error) {
      setMessage(dom.manageBookingsMessage, error.message, "error");
    }
  }
}

function toggleAdminBookingEdit(id, editing) {
  const readonly = dom.manageBookingsList.querySelector(`[data-role="admin-booking-readonly"][data-id="${id}"]`);
  const edit = dom.manageBookingsList.querySelector(`[data-role="admin-booking-edit"][data-id="${id}"]`);
  if (readonly) readonly.hidden = editing;
  if (edit) edit.hidden = !editing;
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

  if (!isValidPhoneInput(dom.managePhone.value)) {
    setMessage(dom.manageEditMessage, "Numéro de téléphone invalide.", "error");
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

  if (message && (kind === "error" || kind === "success")) {
    showToast(message, kind);
  }
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

function contactStatusLabel(status) {
  return {
    new: "Nouveau",
    waiting: "En attente",
    closed: "Fermé",
    handled: "Fermé",
  }[status] || status;
}

function animalLabel(value) {
  return {
    chien: "Chien",
    chat: "Chat",
    plusieurs: "Plusieurs animaux",
  }[value] || value || "Animal";
}

function normalizeDateTimeInput(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

function isValidPhoneInput(value) {
  const phone = String(value || "").trim();

  if (!phone) return true;
  if (phone.length > 20 || !/^\+?[0-9 ]+$/.test(phone)) return false;

  const compact = phone.replace(/\s+/g, "");
  return /^0[67][0-9]{8}$/.test(compact) || /^\+33[67][0-9]{8}$/.test(compact);
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
  return `Début : ${formatDateTime(start)} - Fin : ${formatDateTime(end)}`;
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

function formatDateOnly(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCalendarDay(value) {
  const normalized = normalizeDateTimeInput(value);
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
  }).format(date);
}

function formatCalendarMonth(value) {
  const normalized = normalizeDateTimeInput(value);
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
  }).format(date);
}

function extractTime(value) {
  const match = String(value || "").match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
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
