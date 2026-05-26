const state = {
  user: null,
  activities: [],
  unavailableDates: [],
  myBookings: [],
  admin: null,
  calendarOffset: 0,
  selectedMemberId: null,
  memberActiveTab: "memberProfilePanel",
  adminActiveTab: "adminMembersPanel",
  profileEditing: false,
  memberEditing: false,
  activeModal: null,
  lastTrigger: null,
};

const slotLabels = {
  matin: "Matin",
  "apres-midi": "Après-midi",
  journee: "Journée complète",
  soir: "Soirée",
};

const statusLabels = {
  pending: "En attente",
  approved: "Confirmée",
  rejected: "Refusée",
  cancelled: "Annulée",
};

const statusChoices = [
  ["pending", "En attente"],
  ["approved", "Confirmée"],
  ["rejected", "Refusée"],
  ["cancelled", "Annulée"],
];

const animalLabels = {
  chien: "Chien",
  chat: "Chat",
};

const serviceTypeLabels = {
  garde: "Garde à domicile",
  "garde-chien": "Garde à domicile chien",
  "visite-chat": "Garde à domicile chat",
  "garde-chien-chat": "Garde à domicile chien et chat",
};

const roleLabels = {
  client: "Espace personnel",
  admin: "Gestion",
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  bindDom();
  bindEvents();
  setMinBookingDates();
  loadBootstrap();
});

function bindDom() {
  [
    "globalMessage",
    "headerActions",
    "userSummary",
    "userSummaryRole",
    "userSummaryName",
    "openAccountBtn",
    "activitiesGrid",
    "calendarMonthLabel",
    "calendarGrid",
    "nextAvailableDateCard",
    "bookingModal",
    "memberModal",
    "adminModal",
    "bookingForm",
    "bookingIntroText",
    "bookingMessage",
    "bookingSubmitBtn",
    "bookingAuthActions",
    "bookingAdminNotice",
    "bookingAnimalHint",
    "profileForm",
    "profileView",
    "editProfileBtn",
    "cancelProfileEditBtn",
    "profileMessage",
    "profileFirstNameView",
    "profileLastNameView",
    "profileEmailView",
    "profilePhoneView",
    "profileAnimalTypeView",
    "profileAnimalNameView",
    "myBookingsList",
    "adminStats",
    "membersTableBody",
    "memberSearchInput",
    "memberForm",
    "memberId",
    "memberFirstName",
    "memberLastName",
    "memberEmail",
    "memberRole",
    "memberPhone",
    "memberAnimalType",
    "memberAnimalName",
    "memberMessage",
    "selectedMemberView",
    "editMemberBtn",
    "cancelMemberEditBtn",
    "memberFirstNameView",
    "memberLastNameView",
    "memberEmailView",
    "memberRoleView",
    "memberPhoneView",
    "memberAnimalTypeView",
    "memberAnimalNameView",
    "adminBookingsList",
    "blockedDateForm",
    "blockedDateInput",
    "blockedDateReason",
    "blockedDateMessage",
    "blockedDatesList",
    "activityForm",
    "activityId",
    "activityTitle",
    "activityCategory",
    "activitySortOrder",
    "activityDescription",
    "activityMessage",
    "activityAdminList",
    "contactsList",
    "loginModal",
    "registerModal",
    "contactModal",
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
    "contactForm",
    "contactFullName",
    "contactEmail",
    "contactPhone",
    "contactMessage",
    "contactMessageBox",
    "profileFirstName",
    "profileLastName",
    "profileEmail",
    "profilePhone",
    "profileAnimalType",
    "profileAnimalName",
    "bookingAnimalType",
    "bookingAnimalName",
    "bookingStartDate",
    "bookingEndDate",
    "bookingTimeSlot",
    "bookingNotes",
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });

  dom.bookingTriggers = Array.from(
    document.querySelectorAll(".client-booking-cta, #dashboardBookingBtn")
  );
}

function bindEvents() {
  onClick("openLoginBtn", () => openModal(dom.loginModal));
  onClick("openRegisterBtn", () => openModal(dom.registerModal));
  onClick("openAccountBtn", openAccountModal);
  onClick("heroContactBtn", openContactModal);
  onClick("contactSectionBtn", openContactModal);
  onClick("footerContactBtn", openContactModal);
  onClick("switchToRegisterBtn", () => switchModal(dom.loginModal, dom.registerModal));
  onClick("switchToLoginBtn", () => switchModal(dom.registerModal, dom.loginModal));
  onClick("closeLoginBtn", () => closeModal(dom.loginModal));
  onClick("closeRegisterBtn", () => closeModal(dom.registerModal));
  onClick("closeContactBtn", () => closeModal(dom.contactModal));
  onClick("closeBookingBtn", () => closeModal(dom.bookingModal));
  onClick("closeMemberBtn", () => closeModal(dom.memberModal));
  onClick("closeAdminBtn", () => closeModal(dom.adminModal));
  onClick("logoutBtn", logout);
  onClick("deleteAccountBtn", deleteAccount);
  onClick("editProfileBtn", () => setProfileEditing(true));
  onClick("cancelProfileEditBtn", () => setProfileEditing(false));
  onClick("editMemberBtn", () => setMemberEditing(true));
  onClick("cancelMemberEditBtn", () => setMemberEditing(false));
  onClick("calendarPrevBtn", () => {
    state.calendarOffset -= 1;
    renderCalendar();
  });
  onClick("calendarNextBtn", () => {
    state.calendarOffset += 1;
    renderCalendar();
  });
  onClick("activityResetBtn", resetActivityForm);
  onClick("bookingLoginPromptBtn", () => openNestedAuthModal(dom.loginModal));
  onClick("bookingRegisterPromptBtn", () => openNestedAuthModal(dom.registerModal));

  dom.bookingTriggers.forEach((button) => {
    button.addEventListener("click", openBookingModal);
  });

  document.querySelectorAll("[data-tab-scope][data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tabScope, button.dataset.tabTarget);
    });
  });

  [
    dom.loginModal,
    dom.registerModal,
    dom.contactModal,
    dom.bookingModal,
    dom.memberModal,
    dom.adminModal,
  ].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  onEvent(dom.loginForm, "submit", handleLogin);
  onEvent(dom.registerForm, "submit", handleRegister);
  onEvent(dom.contactForm, "submit", handleContact);
  onEvent(dom.bookingForm, "submit", handleBookingSubmit);
  onEvent(dom.profileForm, "submit", handleProfileSave);
  onEvent(dom.memberForm, "submit", handleMemberSave);
  onEvent(dom.blockedDateForm, "submit", handleBlockedDateCreate);
  onEvent(dom.activityForm, "submit", handleActivitySave);
  onEvent(dom.memberSearchInput, "input", renderMembersTable);

  onEvent(dom.membersTableBody, "click", handleMemberTableClick);
  onEvent(dom.adminBookingsList, "click", handleAdminBookingsClick);
  onEvent(dom.blockedDatesList, "click", handleBlockedDatesClick);
  onEvent(dom.activityAdminList, "click", handleActivityListClick);
  onEvent(dom.contactsList, "click", handleContactsClick);
  onEvent(dom.myBookingsList, "click", handleMyBookingsClick);
  onEvent(dom.activitiesGrid, "click", handleActivitiesGridClick);
  document.addEventListener("keydown", handleGlobalKeydown);
}

function onClick(id, handler) {
  const node = document.getElementById(id);
  onEvent(node, "click", handler);
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

  let response;

  try {
    response = await fetch(url, config);
  } catch (_error) {
    throw new Error("Connexion impossible. Vérifie ta connexion puis réessaie.");
  }

  let data = {};
  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(data.error || "Session expirée. Merci de vous reconnecter.");
    }

    throw new Error(data.error || data.message || `Erreur serveur (${response.status}).`);
  }

  return data;
}

async function loadBootstrap() {
  try {
    const data = await requestJson("/api/bootstrap");
    state.user = data.user;
    state.activities = data.activities || [];
    state.unavailableDates = data.unavailableDates || [];
    state.myBookings = data.myBookings || [];
    state.admin = data.admin;
    renderAll();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function renderAll() {
  renderHeader();
  syncTabs();
  renderActivities();
  renderCalendar();
  renderNextAvailableDate();
  renderMemberArea();
  renderAdminArea();
  syncBookingAnimalFields();
  prefillContactForm();
}

function renderHeader() {
  const loggedIn = Boolean(state.user);
  const isAdmin = loggedIn && state.user.role === "admin";

  dom.headerActions.hidden = loggedIn;
  dom.userSummary.hidden = !loggedIn;
  dom.userSummaryRole.textContent = loggedIn
    ? isAdmin
      ? roleLabels.admin
      : roleLabels.client
    : "";
  dom.userSummaryName.textContent = loggedIn ? state.user.firstName || "" : "";
  dom.openAccountBtn.textContent = isAdmin ? "Gérer" : "Mon suivi";

  dom.bookingTriggers.forEach((button) => {
    if (!button) return;
    button.hidden = isAdmin;
  });

  if (isAdmin && state.activeModal === dom.bookingModal) {
    closeModal(dom.bookingModal);
  }

  updateBookingAccessState(loggedIn, isAdmin);
}

function updateBookingAccessState(loggedIn, isAdmin) {
  const bookingAllowed = loggedIn && !isAdmin;

  setFormDisabled(dom.bookingForm, !bookingAllowed);
  dom.bookingForm.hidden = !bookingAllowed;
  dom.bookingAuthActions.classList.toggle("is-hidden", loggedIn || isAdmin);
  dom.bookingAdminNotice.classList.toggle("is-hidden", !isAdmin);

  if (bookingAllowed) {
    dom.bookingIntroText.textContent =
      "Choisissez vos dates et partagez les informations utiles pour organiser une présence à domicile. La demande reste en attente jusqu’à validation.";
  } else if (isAdmin) {
    dom.bookingIntroText.textContent =
      "Le calendrier reste consultable, mais l’envoi de demandes est réservé aux espaces personnels.";
  } else {
    dom.bookingIntroText.textContent =
      "Consultez les disponibilités puis connectez-vous ou créez un espace pour envoyer une demande de garde.";
  }
}

function renderActivities() {
  if (!state.activities.length) {
    dom.activitiesGrid.innerHTML =
      "<p class='panel-text'>Aucun accompagnement n’est mis en avant pour le moment.</p>";
    return;
  }

  dom.activitiesGrid.innerHTML = state.activities
    .map(
      (activity) => `
        <article class="activity-card">
          <p class="service-kicker">${escapeHtml(activity.category || "Accompagnement")}</p>
          <h3>${escapeHtml(activity.title)}</h3>
          <p>${escapeHtml(activity.description)}</p>
          <button class="text-button activity-link" data-action="contact-activity" type="button">
            En savoir plus
          </button>
        </article>
      `
    )
    .join("");
}

function renderCalendar() {
  const baseDate = new Date();
  baseDate.setHours(12, 0, 0, 0);
  const target = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + state.calendarOffset,
    1
  );
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const unavailableMap = new Map(state.unavailableDates.map((item) => [item.date, item]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = formatIsoDate(today);

  dom.calendarMonthLabel.textContent = capitalize(formatter.format(target));
  dom.calendarGrid.innerHTML = "";

  const firstDay = new Date(target.getFullYear(), target.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

  for (let index = 0; index < firstWeekday; index += 1) {
    dom.calendarGrid.appendChild(buildCalendarCell(null, null, false));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDate = new Date(target.getFullYear(), target.getMonth(), day);
    currentDate.setHours(12, 0, 0, 0);
    const isoDate = formatIsoDate(currentDate);
    const unavailable = unavailableMap.get(isoDate);
    dom.calendarGrid.appendChild(
      buildCalendarCell(day, unavailable, isoDate === todayIso, isoDate < todayIso)
    );
  }
}

function buildCalendarCell(day, unavailable, isToday, isPast) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";

  if (!day) {
    cell.classList.add("is-empty");
    return cell;
  }

  if (isToday) cell.classList.add("is-today");
  if (isPast) cell.classList.add("is-past");
  if (unavailable && !isPast) cell.classList.add("is-blocked");
  cell.title = isPast ? "Date passée" : unavailable ? unavailable.reason : "Disponible";

  const title = document.createElement("strong");
  title.textContent = String(day);
  cell.appendChild(title);

  if (isPast) {
    const detail = document.createElement("small");
    detail.textContent = "Passé";
    cell.appendChild(detail);
  } else if (unavailable) {
    const detail = document.createElement("small");
    detail.textContent = "Indisponible";
    cell.appendChild(detail);
  }

  return cell;
}

function renderNextAvailableDate() {
  if (!dom.nextAvailableDateCard) return;

  const blockedDates = new Set(state.unavailableDates.map((item) => item.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextAvailable = null;

  for (let offset = 0; offset < 365; offset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    const isoDate = formatIsoDate(candidate);

    if (!blockedDates.has(isoDate)) {
      nextAvailable = isoDate;
      break;
    }
  }

  if (!nextAvailable) {
    dom.nextAvailableDateCard.innerHTML = `
      <p class="panel-text">Aucune date libre n’a été trouvée sur les 12 prochains mois.</p>
    `;
    return;
  }

  const isToday = nextAvailable === formatIsoDate(today);
  dom.nextAvailableDateCard.innerHTML = `
    <strong>${escapeHtml(formatLongDate(nextAvailable))}</strong>
    <p class="panel-text">
      ${
        isToday
          ? "Une demande peut être déposée dès aujourd’hui."
          : "C’est la première date actuellement libre."
      }
    </p>
  `;
}

function syncBookingAnimalFields() {
  const isClient = Boolean(state.user) && state.user.role !== "admin";
  if (!dom.bookingAnimalType || !dom.bookingAnimalName || !dom.bookingAnimalHint) return;

  if (!isClient) {
    dom.bookingAnimalHint.classList.add("is-hidden");
    return;
  }

  if (state.user.animalType) {
    dom.bookingAnimalType.value = state.user.animalType;
  }

  if (state.user.animalName) {
    dom.bookingAnimalName.value = state.user.animalName;
  }

  const hasAnimalInfo = Boolean(state.user.animalType || state.user.animalName);
  dom.bookingAnimalHint.classList.toggle("is-hidden", !hasAnimalInfo);

  if (hasAnimalInfo) {
    dom.bookingAnimalHint.textContent =
      "Les informations de votre animal sont reprises depuis votre profil. Modifiez-les dans votre espace personnel si besoin.";
  } else {
    dom.bookingAnimalHint.textContent = "";
  }
}

function renderMemberArea() {
  const isClient = Boolean(state.user) && state.user.role !== "admin";

  if (!isClient) {
    if (state.activeModal === dom.memberModal) {
      closeModal(dom.memberModal);
    }
    dom.myBookingsList.innerHTML = "";
    state.profileEditing = false;
    return;
  }

  renderProfileView();
  dom.profileFirstName.value = state.user.firstName || "";
  dom.profileLastName.value = state.user.lastName || "";
  dom.profileEmail.value = state.user.email || "";
  dom.profilePhone.value = state.user.phone || "";
  dom.profileAnimalType.value = state.user.animalType || "";
  dom.profileAnimalName.value = state.user.animalName || "";
  setProfileEditing(state.profileEditing);

  if (!state.myBookings.length) {
    dom.myBookingsList.innerHTML =
      "<div class='simple-item'><h4>Aucune demande pour le moment</h4><p class='panel-text'>Les demandes envoyées depuis le calendrier apparaîtront ici.</p></div>";
    return;
  }

  dom.myBookingsList.innerHTML = state.myBookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-header">
            <div>
              <h4>${escapeHtml(serviceTypeLabels[booking.serviceType] || booking.serviceType)}</h4>
              <p class="booking-meta">
                ${escapeHtml(formatLongDate(booking.startDate))} au ${escapeHtml(
                  formatLongDate(booking.endDate)
                )}
                - ${escapeHtml(slotLabels[booking.timeSlot] || booking.timeSlot)}
              </p>
            </div>
            <span class="booking-status ${escapeHtml(booking.status)}">
              ${escapeHtml(statusLabels[booking.status] || booking.status)}
            </span>
          </div>
          <p class="booking-meta">
            Animal : ${escapeHtml(booking.animalName || "Non précisé")} (${escapeHtml(
              animalLabels[booking.animalType] || booking.animalType
            )})
          </p>
          <p class="booking-meta">Réponse : ${escapeHtml(booking.adminNote || "Aucune réponse pour le moment.")}</p>
          ${
            booking.status === "pending" || booking.status === "approved"
              ? `<div class="booking-actions">
                   <button class="btn btn-secondary btn-sm" data-action="cancel-booking" data-booking-id="${booking.id}" type="button">
                     Annuler cette demande
                   </button>
                 </div>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

function renderProfileView() {
  if (!state.user) return;

  dom.profileFirstNameView.textContent = displayValue(state.user.firstName);
  dom.profileLastNameView.textContent = displayValue(state.user.lastName);
  dom.profileEmailView.textContent = displayValue(state.user.email);
  dom.profilePhoneView.textContent = displayValue(state.user.phone);
  dom.profileAnimalTypeView.textContent = displayValue(
    animalLabels[state.user.animalType] || state.user.animalType
  );
  dom.profileAnimalNameView.textContent = displayValue(state.user.animalName);
}

function setProfileEditing(isEditing) {
  state.profileEditing = Boolean(isEditing);
  dom.profileView.hidden = state.profileEditing;
  dom.profileForm.hidden = !state.profileEditing;
  dom.editProfileBtn.hidden = state.profileEditing;
  setInlineMessage(dom.profileMessage, "");

  if (state.profileEditing) {
    dom.profileFirstName.value = state.user.firstName || "";
    dom.profileLastName.value = state.user.lastName || "";
    dom.profileEmail.value = state.user.email || "";
    dom.profilePhone.value = state.user.phone || "";
    dom.profileAnimalType.value = state.user.animalType || "";
    dom.profileAnimalName.value = state.user.animalName || "";
    dom.profileFirstName.focus();
  }
}

function renderAdminArea() {
  const isAdmin = Boolean(state.user) && state.user.role === "admin" && state.admin;
  if (!isAdmin) {
    if (state.activeModal === dom.adminModal) {
      closeModal(dom.adminModal);
    }
    state.memberEditing = false;
    return;
  }

  renderAdminStats();
  renderMembersTable();
  renderAdminBookings();
  renderBlockedDates();
  renderActivitiesAdmin();
  renderContacts();
}

function renderAdminStats() {
  const { stats } = state.admin;
  const cards = [
    ["Comptes", stats.memberCount],
    ["Demandes de garde", stats.bookingCount],
    ["En attente", stats.pendingBookingCount],
    ["Messages reçus", stats.newContactCount],
  ];

  dom.adminStats.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <h3>${label}</h3>
          <strong>${value}</strong>
          <span class="panel-text">Vue de gestion à jour</span>
        </article>
      `
    )
    .join("");
}

function renderMembersTable() {
  if (!state.admin) return;

  const term = (dom.memberSearchInput.value || "").trim().toLowerCase();
  const members = state.admin.members.filter((member) => {
    if (!term) return true;
    return `${member.fullName} ${member.email} ${member.role}`.toLowerCase().includes(term);
  });

  if (!members.length) {
    dom.membersTableBody.innerHTML = "<tr><td colspan='4'>Aucun compte trouvé.</td></tr>";
    return;
  }

  dom.membersTableBody.innerHTML = members
    .map(
      (member) => `
        <tr class="${member.id === state.selectedMemberId ? "is-selected" : ""}">
          <td>${escapeHtml(member.fullName)}</td>
          <td>${escapeHtml(member.email)}</td>
          <td>${escapeHtml(roleLabels[member.role] || member.role)}</td>
          <td>
            <div class="booking-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit-member" data-member-id="${member.id}" type="button">Voir</button>
              <button class="btn btn-danger btn-sm" data-action="delete-member" data-member-id="${member.id}" type="button">Supprimer</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  if (state.selectedMemberId) {
    selectMember(state.selectedMemberId, state.memberEditing);
  } else if (members.length) {
    selectMember(members[0].id);
  }
}

function selectMember(memberId, keepEditing = false) {
  state.selectedMemberId = Number(memberId);
  const member = state.admin.members.find((item) => item.id === state.selectedMemberId);
  if (!member) return;

  dom.memberId.value = member.id;
  dom.memberFirstName.value = member.firstName || "";
  dom.memberLastName.value = member.lastName || "";
  dom.memberEmail.value = member.email || "";
  dom.memberRole.value = member.role || "client";
  dom.memberPhone.value = member.phone || "";
  dom.memberAnimalType.value = member.animalType || "";
  dom.memberAnimalName.value = member.animalName || "";
  renderSelectedMember(member);
  setMemberEditing(keepEditing);
  setInlineMessage(dom.memberMessage, "");
}

function renderSelectedMember(member) {
  dom.memberFirstNameView.textContent = displayValue(member.firstName);
  dom.memberLastNameView.textContent = displayValue(member.lastName);
  dom.memberEmailView.textContent = displayValue(member.email);
  dom.memberRoleView.textContent = roleLabels[member.role] || displayValue(member.role);
  dom.memberPhoneView.textContent = displayValue(member.phone);
  dom.memberAnimalTypeView.textContent = displayValue(
    animalLabels[member.animalType] || member.animalType
  );
  dom.memberAnimalNameView.textContent = displayValue(member.animalName);
}

function setMemberEditing(isEditing) {
  const hasMember = Boolean(state.selectedMemberId);
  state.memberEditing = Boolean(isEditing && hasMember);
  dom.selectedMemberView.hidden = state.memberEditing;
  dom.memberForm.hidden = !state.memberEditing;
  dom.editMemberBtn.hidden = state.memberEditing || !hasMember;
  setInlineMessage(dom.memberMessage, "");

  if (state.memberEditing) {
    dom.memberFirstName.focus();
  }
}

function renderAdminBookings() {
  if (!state.admin.bookings.length) {
    dom.adminBookingsList.innerHTML =
      "<div class='simple-item'><h4>Aucune demande</h4><p class='panel-text'>Les demandes de garde envoyées depuis les espaces personnels apparaîtront ici.</p></div>";
    return;
  }

  dom.adminBookingsList.innerHTML = state.admin.bookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-header">
            <div>
              <h4>${escapeHtml(booking.fullName)}</h4>
              <p class="booking-meta">
                ${escapeHtml(booking.email)} - ${escapeHtml(
                  serviceTypeLabels[booking.serviceType] || booking.serviceType
                )}
              </p>
              <p class="booking-meta">
                ${escapeHtml(formatLongDate(booking.startDate))} au ${escapeHtml(
                  formatLongDate(booking.endDate)
                )}
                - ${escapeHtml(slotLabels[booking.timeSlot] || booking.timeSlot)}
              </p>
            </div>
            <span class="booking-status ${escapeHtml(booking.status)}">
              ${escapeHtml(statusLabels[booking.status] || booking.status)}
            </span>
          </div>

          <p class="booking-meta">
            Animal : ${escapeHtml(booking.animalName || "Non précisé")} (${escapeHtml(
              animalLabels[booking.animalType] || booking.animalType
            )})
          </p>
          <p class="booking-meta">Informations transmises : ${escapeHtml(booking.notes || "Aucune précision.")}</p>

          <label for="booking-status-${booking.id}">Statut</label>
          <select
            id="booking-status-${booking.id}"
            data-role="booking-status"
            data-booking-id="${booking.id}"
          >
            ${statusChoices
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${booking.status === value ? "selected" : ""}>${label}</option>`
              )
              .join("")}
          </select>

          <label for="booking-note-${booking.id}">Réponse de suivi</label>
          <textarea
            id="booking-note-${booking.id}"
            rows="3"
            data-role="booking-note"
            data-booking-id="${booking.id}"
          >${escapeHtml(booking.adminNote || "")}</textarea>

          <div class="booking-actions">
            <button
              class="btn btn-primary btn-sm"
              data-action="save-booking"
              data-booking-id="${booking.id}"
              type="button"
            >
              Enregistrer
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderBlockedDates() {
  if (!state.admin.blockedDates.length) {
    dom.blockedDatesList.innerHTML =
      "<div class='simple-item'><h4>Aucune indisponibilité</h4><p class='panel-text'>Ajoutez une date pour la rendre indisponible.</p></div>";
    return;
  }

  dom.blockedDatesList.innerHTML = state.admin.blockedDates
    .map(
      (item) => `
        <div class="simple-item">
          <div class="simple-item-header">
            <div>
              <h4>${escapeHtml(formatLongDate(item.date))}</h4>
              <p class="panel-text">${escapeHtml(item.reason || "Aucune raison précisée")}</p>
            </div>
            <div class="simple-item-actions">
              <button class="btn btn-danger btn-sm" data-action="delete-blocked-date" data-blocked-date-id="${item.id}" type="button">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderActivitiesAdmin() {
  if (!state.activities.length) {
    dom.activityAdminList.innerHTML =
      "<div class='simple-item'><h4>Aucun service présenté</h4><p class='panel-text'>Utilisez le formulaire pour ajouter un service.</p></div>";
    return;
  }

  dom.activityAdminList.innerHTML = state.activities
    .map(
      (activity) => `
        <div class="simple-item">
          <div class="simple-item-header">
            <div>
              <h4>${escapeHtml(activity.title)}</h4>
              <p class="panel-text">${escapeHtml(activity.category)} - position ${activity.sortOrder}</p>
              <p class="panel-text">${escapeHtml(activity.description)}</p>
            </div>
            <div class="simple-item-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit-activity" data-activity-id="${activity.id}" type="button">Éditer</button>
              <button class="btn btn-danger btn-sm" data-action="delete-activity" data-activity-id="${activity.id}" type="button">Supprimer</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderContacts() {
  if (!state.admin.contacts.length) {
    dom.contactsList.innerHTML =
      "<div class='simple-item'><h4>Aucun message</h4><p class='panel-text'>Les demandes reçues depuis le site apparaîtront ici.</p></div>";
    return;
  }

  dom.contactsList.innerHTML = state.admin.contacts
    .map(
      (contact) => `
        <div class="simple-item">
          <div class="contact-item-header">
            <div>
              <h4>${escapeHtml(contact.fullName)}</h4>
              <p class="panel-text">${escapeHtml(contact.email)}${
                contact.phone ? ` - ${escapeHtml(contact.phone)}` : ""
              }</p>
              <p class="contact-message">${escapeHtml(contact.message)}</p>
            </div>
            <div class="simple-item-actions">
              <span class="mini-tag">${escapeHtml(contact.status === "handled" ? "Traité" : "Nouveau")}</span>
              <button
                class="btn btn-secondary btn-sm"
                data-action="toggle-contact"
                data-contact-id="${contact.id}"
                data-current-status="${contact.status}"
                type="button"
              >
                ${contact.status === "handled" ? "Remettre en nouveau" : "Marquer traité"}
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

async function handleLogin(event) {
  event.preventDefault();
  setInlineMessage(dom.loginMessage, "");

  try {
    await withBusyButton(event.submitter, "Connexion...", () =>
      requestJson("/api/login", {
        method: "POST",
        body: {
          email: dom.loginEmail.value,
          password: dom.loginPassword.value,
        },
      })
    );

    closeModal(dom.loginModal);
    dom.loginForm.reset();
    showGlobalMessage("Connexion réussie.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.loginMessage, error.message, "error");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setInlineMessage(dom.registerMessage, "");

  try {
    await withBusyButton(event.submitter, "Création...", () =>
      requestJson("/api/register", {
        method: "POST",
        body: {
          firstName: dom.registerFirstName.value,
          lastName: dom.registerLastName.value,
          email: dom.registerEmail.value,
          password: dom.registerPassword.value,
          phone: dom.registerPhone.value,
          animalType: dom.registerAnimalType.value,
          animalName: dom.registerAnimalName.value,
        },
      })
    );

    closeModal(dom.registerModal);
    dom.registerForm.reset();
    showGlobalMessage("Compte créé et connexion active.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.registerMessage, error.message, "error");
  }
}

async function handleContact(event) {
  event.preventDefault();
  setInlineMessage(dom.contactMessageBox, "");

  try {
    await withBusyButton(event.submitter, "Envoi...", () =>
      requestJson("/api/contact", {
        method: "POST",
        body: {
          fullName: dom.contactFullName.value,
          email: dom.contactEmail.value,
          phone: dom.contactPhone.value,
          message: dom.contactMessage.value,
        },
      })
    );

    closeModal(dom.contactModal);
    dom.contactForm.reset();
    prefillContactForm();
    showGlobalMessage("Demande envoyée.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.contactMessageBox, error.message, "error");
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  setInlineMessage(dom.bookingMessage, "");

  if (!state.user) {
    openNestedAuthModal(dom.loginModal);
    return;
  }

  if (state.user.role === "admin") {
    setInlineMessage(
      dom.bookingMessage,
      "L’espace de gestion ne peut pas envoyer de demande de garde.",
      "error"
    );
    return;
  }

  try {
    await withBusyButton(event.submitter, "Envoi...", () =>
      requestJson("/api/bookings", {
        method: "POST",
        body: {
          serviceType: "garde",
          animalType: dom.bookingAnimalType.value,
          animalName: dom.bookingAnimalName.value,
          startDate: dom.bookingStartDate.value,
          endDate: dom.bookingEndDate.value,
          timeSlot: dom.bookingTimeSlot.value,
          notes: dom.bookingNotes.value,
        },
      })
    );

    dom.bookingForm.reset();
    syncBookingAnimalFields();
    setMinBookingDates();
    closeModal(dom.bookingModal);
    showGlobalMessage("Demande de garde envoyée.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.bookingMessage, error.message, "error");
  }
}

async function handleProfileSave(event) {
  event.preventDefault();
  setInlineMessage(dom.profileMessage, "");

  try {
    await withBusyButton(event.submitter, "Enregistrement...", () =>
      requestJson("/api/account", {
        method: "PUT",
        body: {
          firstName: dom.profileFirstName.value,
          lastName: dom.profileLastName.value,
          email: dom.profileEmail.value,
          phone: dom.profilePhone.value,
          animalType: dom.profileAnimalType.value,
          animalName: dom.profileAnimalName.value,
        },
      })
    );

    state.profileEditing = false;
    activateTab("member", "memberProfilePanel");
    showGlobalMessage("Profil mis à jour.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.profileMessage, error.message, "error");
  }
}

async function deleteAccount() {
  if (!state.user) return;
  if (!confirmAction("Supprimer votre espace et toutes vos demandes ?")) return;

  try {
    await requestJson("/api/account", { method: "DELETE" });
    showGlobalMessage("Compte supprimé.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.profileMessage, error.message, "error");
  }
}

async function logout() {
  try {
    await requestJson("/api/logout", { method: "POST" });
    showGlobalMessage("Déconnexion réussie.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function handleMemberTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const memberId = Number(button.dataset.memberId);
  if (!memberId) return;

  if (button.dataset.action === "edit-member") {
    selectMember(memberId);
    activateTab("admin", "adminMembersPanel");
    dom.selectedMemberView?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  if (button.dataset.action === "delete-member") {
    deleteMember(memberId);
  }
}

async function handleMemberSave(event) {
  event.preventDefault();
  setInlineMessage(dom.memberMessage, "");

  const memberId = Number(dom.memberId.value);
  if (!memberId) {
    setInlineMessage(dom.memberMessage, "Sélectionnez un compte.", "error");
    return;
  }

  try {
    await withBusyButton(event.submitter, "Sauvegarde...", () =>
      requestJson(`/api/admin/members/${memberId}`, {
        method: "PUT",
        body: {
          firstName: dom.memberFirstName.value,
          lastName: dom.memberLastName.value,
          email: dom.memberEmail.value,
          role: dom.memberRole.value,
          phone: dom.memberPhone.value,
          animalType: dom.memberAnimalType.value,
          animalName: dom.memberAnimalName.value,
        },
      })
    );

    state.memberEditing = false;
    showGlobalMessage("Compte mis à jour.", "success");
    await loadBootstrap();
    selectMember(memberId);
  } catch (error) {
    setInlineMessage(dom.memberMessage, error.message, "error");
  }
}

async function deleteMember(memberId) {
  if (!confirmAction("Supprimer ce compte et ses données associées ?")) return;

  try {
    await requestJson(`/api/admin/members/${memberId}`, { method: "DELETE" });
    showGlobalMessage("Compte supprimé.", "success");
    state.selectedMemberId = null;
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.memberMessage, error.message, "error");
  }
}

function handleAdminBookingsClick(event) {
  const button = event.target.closest("button[data-action='save-booking']");
  if (!button) return;
  saveAdminBooking(readNumericDataset(button, "bookingId"));
}

async function saveAdminBooking(bookingId) {
  if (!bookingId) {
    showGlobalMessage("Demande introuvable.", "error");
    return;
  }

  const statusSelect = dom.adminBookingsList.querySelector(
    `[data-role="booking-status"][data-booking-id="${bookingId}"]`
  );
  const noteInput = dom.adminBookingsList.querySelector(
    `[data-role="booking-note"][data-booking-id="${bookingId}"]`
  );

  if (!statusSelect || !noteInput) {
    showGlobalMessage("Impossible de retrouver les champs de cette demande.", "error");
    return;
  }

  try {
    await requestJson(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      body: {
        status: statusSelect.value,
        adminNote: noteInput.value,
      },
    });

    showGlobalMessage("Demande de garde mise à jour.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

async function handleBlockedDateCreate(event) {
  event.preventDefault();
  setInlineMessage(dom.blockedDateMessage, "");

  try {
    await withBusyButton(event.submitter, "Blocage...", () =>
      requestJson("/api/admin/blocked-dates", {
        method: "POST",
        body: {
          date: dom.blockedDateInput.value,
          reason: dom.blockedDateReason.value,
        },
      })
    );

    dom.blockedDateForm.reset();
    setInlineMessage(dom.blockedDateMessage, "Indisponibilité ajoutée.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.blockedDateMessage, error.message, "error");
  }
}

function handleBlockedDatesClick(event) {
  const button = event.target.closest("button[data-action='delete-blocked-date']");
  if (!button) return;
  deleteBlockedDate(readNumericDataset(button, "blockedDateId"));
}

async function deleteBlockedDate(blockedDateId) {
  if (!blockedDateId) {
    showGlobalMessage("Indisponibilité introuvable.", "error");
    return;
  }

  if (!confirmAction("Rendre cette date à nouveau disponible ?")) return;

  try {
    await requestJson(`/api/admin/blocked-dates/${blockedDateId}`, { method: "DELETE" });
    showGlobalMessage("Indisponibilité retirée.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

async function handleActivitySave(event) {
  event.preventDefault();
  setInlineMessage(dom.activityMessage, "");

  const activityId = Number(dom.activityId.value);
  const payload = {
    title: dom.activityTitle.value,
    category: dom.activityCategory.value,
    sortOrder: Number(dom.activitySortOrder.value || 0),
    description: dom.activityDescription.value,
  };

  try {
    await withBusyButton(event.submitter, "Sauvegarde...", () =>
      requestJson(
        activityId ? `/api/admin/activities/${activityId}` : "/api/admin/activities",
        {
          method: activityId ? "PUT" : "POST",
          body: payload,
        }
      )
    );

    resetActivityForm();
    showGlobalMessage(
      activityId ? "Service mis à jour." : "Service ajouté.",
      "success"
    );
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.activityMessage, error.message, "error");
  }
}

function handleActivityListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const activityId = readNumericDataset(button, "activityId");
  if (!activityId) {
    showGlobalMessage("Service introuvable.", "error");
    return;
  }

  if (button.dataset.action === "edit-activity") {
    editActivity(activityId);
    return;
  }

  if (button.dataset.action === "delete-activity") {
    deleteActivity(activityId);
  }
}

function editActivity(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  if (!activity) return;

  dom.activityId.value = activity.id;
  dom.activityTitle.value = activity.title || "";
  dom.activityCategory.value = activity.category || "";
  dom.activitySortOrder.value = activity.sortOrder ?? 0;
  dom.activityDescription.value = activity.description || "";
  setInlineMessage(dom.activityMessage, "");
  dom.activityForm?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function resetActivityForm() {
  dom.activityForm.reset();
  dom.activityId.value = "";
  dom.activitySortOrder.value = "0";
  setInlineMessage(dom.activityMessage, "");
}

async function deleteActivity(activityId) {
  if (!activityId) {
    showGlobalMessage("Service introuvable.", "error");
    return;
  }

  if (!confirmAction("Supprimer ce service présenté ?")) return;

  try {
    await requestJson(`/api/admin/activities/${activityId}`, { method: "DELETE" });
    showGlobalMessage("Service supprimé.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function handleContactsClick(event) {
  const button = event.target.closest("button[data-action='toggle-contact']");
  if (!button) return;

  const nextStatus = button.dataset.currentStatus === "handled" ? "new" : "handled";
  updateContactStatus(readNumericDataset(button, "contactId"), nextStatus);
}

async function updateContactStatus(contactId, status) {
  if (!contactId) {
    showGlobalMessage("Contact introuvable.", "error");
    return;
  }

  try {
    await requestJson(`/api/admin/contacts/${contactId}`, {
      method: "PUT",
      body: { status },
    });

    showGlobalMessage("Contact mis à jour.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function handleActivitiesGridClick(event) {
  const button = event.target.closest("button[data-action='contact-activity']");
  if (!button) return;
  openContactModal();
}

function handleMyBookingsClick(event) {
  const button = event.target.closest("button[data-action='cancel-booking']");
  if (!button) return;
  cancelMyBooking(readNumericDataset(button, "bookingId"));
}

async function cancelMyBooking(bookingId) {
  if (!bookingId) {
    showGlobalMessage("Demande introuvable.", "error");
    return;
  }

  if (!confirmAction("Annuler cette demande de garde ?")) return;

  try {
    await requestJson(`/api/bookings/${bookingId}`, { method: "DELETE" });
    showGlobalMessage("Demande annulée.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function openBookingModal() {
  setInlineMessage(dom.bookingMessage, "");
  openModal(dom.bookingModal);
}

function openAccountModal() {
  if (!state.user) {
    openModal(dom.loginModal);
    return;
  }

  if (state.user.role === "admin") {
    activateTab("admin", state.adminActiveTab);
    openModal(dom.adminModal);
    return;
  }

  activateTab("member", state.memberActiveTab);
  openModal(dom.memberModal);
}

function openContactModal() {
  prefillContactForm();
  openModal(dom.contactModal);
}

function openNestedAuthModal(targetModal) {
  closeModal(dom.bookingModal);
  openModal(targetModal);
}

function switchModal(currentModal, targetModal) {
  closeModal(currentModal);
  openModal(targetModal);
}

function openModal(node) {
  if (!node) return;

  if (state.activeModal && state.activeModal !== node) {
    state.activeModal.hidden = true;
  }

  state.activeModal = node;
  state.lastTrigger = document.activeElement;
  node.hidden = false;
  document.body.classList.add("modal-open");

  const focusTarget = node.querySelector("input, select, textarea, button");
  if (focusTarget) {
    window.setTimeout(() => focusTarget.focus(), 0);
  }
}

function activateTab(scope, targetId) {
  if (!targetId) return;

  if (scope === "member") {
    state.memberActiveTab = targetId;
  } else if (scope === "admin") {
    state.adminActiveTab = targetId;
  }

  syncTabs(scope);
}

function syncTabs(scopeFilter) {
  ["member", "admin"].forEach((scope) => {
    if (scopeFilter && scopeFilter !== scope) return;

    const activeTarget =
      scope === "member" ? state.memberActiveTab : state.adminActiveTab;

    document.querySelectorAll(`[data-tab-scope="${scope}"]`).forEach((button) => {
      const isActive = button.dataset.tabTarget === activeTarget;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    document.querySelectorAll(`[id^="${scope === "member" ? "member" : "admin"}"][role="tabpanel"]`).forEach((panel) => {
      panel.hidden = panel.id !== activeTarget;
    });
  });
}

function closeModal(node) {
  if (!node) return;

  node.hidden = true;

  if (state.activeModal === node) {
    state.activeModal = null;
  }

  if (!document.querySelector(".modal-backdrop:not([hidden])")) {
    document.body.classList.remove("modal-open");
  }

  if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
    state.lastTrigger.focus();
    state.lastTrigger = null;
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && state.activeModal) {
    closeModal(state.activeModal);
  }
}

function setFormDisabled(form, disabled) {
  if (!form) return;

  Array.from(form.elements).forEach((element) => {
    element.disabled = disabled;
  });
}

function prefillContactForm() {
  if (!state.user) return;
  dom.contactFullName.value = state.user.fullName || "";
  dom.contactEmail.value = state.user.email || "";
  dom.contactPhone.value = state.user.phone || "";
}

function showGlobalMessage(message, kind = "success") {
  if (!message) {
    dom.globalMessage.hidden = true;
    dom.globalMessage.textContent = "";
    dom.globalMessage.classList.remove("is-success", "is-error");
    return;
  }

  dom.globalMessage.hidden = false;
  dom.globalMessage.textContent = message;
  dom.globalMessage.classList.toggle("is-success", kind === "success");
  dom.globalMessage.classList.toggle("is-error", kind === "error");
}

function setInlineMessage(node, message, kind = "error") {
  if (!node) return;
  node.textContent = message || "";
  node.style.color =
    kind === "success"
      ? "var(--success)"
      : kind === "error"
        ? "var(--danger)"
        : "var(--text-soft)";
}

async function withBusyButton(button, busyLabel, task) {
  if (!button) return task();

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = busyLabel;

  try {
    return await task();
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

function confirmAction(message) {
  return window.confirm(message);
}

function readNumericDataset(node, key) {
  const value = Number(node?.dataset?.[key]);
  return Number.isFinite(value) ? value : 0;
}

function displayValue(value) {
  return value ? String(value) : "Non renseigné";
}

function formatLongDate(value) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return formatter.format(new Date(`${value}T12:00:00`));
}

function formatIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setMinBookingDates() {
  const today = formatIsoDate(new Date());
  dom.bookingStartDate.min = today;
  dom.bookingEndDate.min = today;
  dom.blockedDateInput.min = today;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
