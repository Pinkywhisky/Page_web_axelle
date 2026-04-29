const state = {
  user: null,
  activities: [],
  unavailableDates: [],
  myBookings: [],
  admin: null,
  calendarOffset: 0,
  selectedMemberId: null,
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
    "profileMessage",
    "myBookingsList",
    "adminStats",
    "membersTableBody",
    "memberSearchInput",
    "memberForm",
    "memberId",
    "memberFullName",
    "memberEmail",
    "memberRole",
    "memberPhone",
    "memberAnimalType",
    "memberAnimalName",
    "memberMessage",
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
    "profileFullName",
    "profileEmail",
    "profilePhone",
    "profileAnimalType",
    "profileAnimalName",
    "bookingServiceType",
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
  onClick("closeLoginBtn", () => closeModal(dom.loginModal));
  onClick("closeRegisterBtn", () => closeModal(dom.registerModal));
  onClick("closeContactBtn", () => closeModal(dom.contactModal));
  onClick("closeBookingBtn", () => closeModal(dom.bookingModal));
  onClick("closeMemberBtn", () => closeModal(dom.memberModal));
  onClick("closeAdminBtn", () => closeModal(dom.adminModal));
  onClick("logoutBtn", logout);
  onClick("deleteAccountBtn", deleteAccount);
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

  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  dom.contactForm.addEventListener("submit", handleContact);
  dom.bookingForm.addEventListener("submit", handleBookingSubmit);
  dom.profileForm.addEventListener("submit", handleProfileSave);
  dom.memberForm.addEventListener("submit", handleMemberSave);
  dom.blockedDateForm.addEventListener("submit", handleBlockedDateCreate);
  dom.activityForm.addEventListener("submit", handleActivitySave);
  dom.memberSearchInput.addEventListener("input", renderMembersTable);

  dom.membersTableBody.addEventListener("click", handleMemberTableClick);
  dom.adminBookingsList.addEventListener("click", handleAdminBookingsClick);
  dom.blockedDatesList.addEventListener("click", handleBlockedDatesClick);
  dom.activityAdminList.addEventListener("click", handleActivityListClick);
  dom.contactsList.addEventListener("click", handleContactsClick);
  dom.myBookingsList.addEventListener("click", handleMyBookingsClick);
  document.addEventListener("keydown", handleGlobalKeydown);
}

function onClick(id, handler) {
  const node = document.getElementById(id);
  if (node) node.addEventListener("click", handler);
}

async function requestJson(url, options = {}) {
  const config = { ...options };
  config.headers = { ...(config.headers || {}) };

  if (config.body && typeof config.body !== "string") {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data = {};

  try {
    data = await response.json();
  } catch (_error) {}

  if (!response.ok) {
    throw new Error(data.error || data.message || "Erreur serveur.");
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
      ? "Administration"
      : "Espace client"
    : "";
  dom.userSummaryName.textContent = loggedIn
    ? getPreferredName(state.user.fullName)
    : "";
  dom.openAccountBtn.textContent = isAdmin ? "Piloter" : "Mon suivi";

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
      "Choisissez vos dates, le type de garde et quelques informations utiles. La demande restera en attente jusqu’à validation.";
  } else if (isAdmin) {
    dom.bookingIntroText.textContent =
      "Le calendrier reste consultable, mais l’envoi de demandes est réservé aux clients connectés.";
  } else {
    dom.bookingIntroText.textContent =
      "Consultez les disponibilités puis connectez-vous ou créez un compte pour envoyer une demande.";
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
        </article>
      `
    )
    .join("");
}

function renderCalendar() {
  const baseDate = new Date();
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
  const todayIso = new Date().toISOString().slice(0, 10);

  dom.calendarMonthLabel.textContent = capitalize(formatter.format(target));
  dom.calendarGrid.innerHTML = "";

  const firstDay = new Date(target.getFullYear(), target.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

  for (let index = 0; index < firstWeekday; index += 1) {
    dom.calendarGrid.appendChild(buildCalendarCell(null, null, false));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = formatIsoDate(new Date(target.getFullYear(), target.getMonth(), day));
    const unavailable = unavailableMap.get(isoDate);
    dom.calendarGrid.appendChild(buildCalendarCell(day, unavailable, isoDate === todayIso));
  }
}

function buildCalendarCell(day, unavailable, isToday) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";

  if (!day) {
    cell.classList.add("is-empty");
    return cell;
  }

  if (isToday) cell.classList.add("is-today");
  if (unavailable) cell.classList.add("is-blocked");

  const title = document.createElement("strong");
  title.textContent = String(day);
  cell.appendChild(title);

  const detail = document.createElement("small");
  detail.textContent = unavailable ? unavailable.reason : "Disponible";
  cell.appendChild(detail);

  return cell;
}

function renderNextAvailableDate() {
  if (!dom.nextAvailableDateCard) return;

  const blockedDates = new Set(state.unavailableDates.map((item) => item.date));
  const today = new Date();
  today.setHours(12, 0, 0, 0);
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
          : "C’est la première date actuellement libre au calendrier."
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
      "Les informations de votre animal sont reprises depuis votre profil. Modifiez-les dans votre espace membre si besoin.";
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
    return;
  }

  dom.profileFullName.value = state.user.fullName || "";
  dom.profileEmail.value = state.user.email || "";
  dom.profilePhone.value = state.user.phone || "";
  dom.profileAnimalType.value = state.user.animalType || "";
  dom.profileAnimalName.value = state.user.animalName || "";

  if (!state.myBookings.length) {
    dom.myBookingsList.innerHTML =
      "<div class='simple-item'><h4>Aucune demande pour le moment</h4><p class='panel-text'>Votre prochaine demande de garde apparaîtra ici.</p></div>";
    return;
  }

  dom.myBookingsList.innerHTML = state.myBookings
    .map(
      (booking) => `
        <article class="booking-item">
          <div class="booking-item-header">
            <div>
              <h4>${escapeHtml(booking.serviceType)}</h4>
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
          <p class="booking-meta">Note admin : ${escapeHtml(booking.adminNote || "Aucune réponse pour le moment.")}</p>
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

function renderAdminArea() {
  const isAdmin = Boolean(state.user) && state.user.role === "admin" && state.admin;
  if (!isAdmin) {
    if (state.activeModal === dom.adminModal) {
      closeModal(dom.adminModal);
    }
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
    ["Membres", stats.memberCount],
    ["Demandes", stats.bookingCount],
    ["En attente", stats.pendingBookingCount],
    ["Premiers contacts", stats.newContactCount],
  ];

  dom.adminStats.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <h3>${label}</h3>
          <strong>${value}</strong>
          <span class="panel-text">Vue admin en direct</span>
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
    dom.membersTableBody.innerHTML = "<tr><td colspan='4'>Aucun membre trouvé.</td></tr>";
    return;
  }

  dom.membersTableBody.innerHTML = members
    .map(
      (member) => `
        <tr>
          <td>${escapeHtml(member.fullName)}</td>
          <td>${escapeHtml(member.email)}</td>
          <td>${escapeHtml(member.role)}</td>
          <td>
            <div class="booking-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit-member" data-member-id="${member.id}" type="button">Éditer</button>
              <button class="btn btn-secondary btn-sm" data-action="delete-member" data-member-id="${member.id}" type="button">Supprimer</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  if (!state.selectedMemberId && members.length) {
    selectMember(members[0].id);
  }
}

function selectMember(memberId) {
  state.selectedMemberId = Number(memberId);
  const member = state.admin.members.find((item) => item.id === state.selectedMemberId);
  if (!member) return;

  dom.memberId.value = member.id;
  dom.memberFullName.value = member.fullName || "";
  dom.memberEmail.value = member.email || "";
  dom.memberRole.value = member.role || "client";
  dom.memberPhone.value = member.phone || "";
  dom.memberAnimalType.value = member.animalType || "";
  dom.memberAnimalName.value = member.animalName || "";
  setInlineMessage(dom.memberMessage, "");
}

function renderAdminBookings() {
  if (!state.admin.bookings.length) {
    dom.adminBookingsList.innerHTML =
      "<div class='simple-item'><h4>Aucune demande</h4><p class='panel-text'>Les réservations client apparaîtront ici.</p></div>";
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
                ${escapeHtml(booking.email)} - ${escapeHtml(booking.serviceType)}
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
          <p class="booking-meta">Note client : ${escapeHtml(booking.notes || "Aucune note.")}</p>

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

          <label for="booking-note-${booking.id}">Note admin</label>
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
      "<div class='simple-item'><h4>Aucune date bloquée</h4><p class='panel-text'>Ajoute une date pour la rendre indisponible.</p></div>";
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
              <button class="btn btn-secondary btn-sm" data-action="delete-blocked-date" data-block-id="${item.id}" type="button">
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
      "<div class='simple-item'><h4>Aucune carte</h4><p class='panel-text'>Utilise le formulaire pour en créer une.</p></div>";
    return;
  }

  dom.activityAdminList.innerHTML = state.activities
    .map(
      (activity) => `
        <div class="simple-item">
          <div class="simple-item-header">
            <div>
              <h4>${escapeHtml(activity.title)}</h4>
              <p class="panel-text">${escapeHtml(activity.category)} - ordre ${activity.sortOrder}</p>
              <p class="panel-text">${escapeHtml(activity.description)}</p>
            </div>
            <div class="simple-item-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit-activity" data-activity-id="${activity.id}" type="button">Éditer</button>
              <button class="btn btn-secondary btn-sm" data-action="delete-activity" data-activity-id="${activity.id}" type="button">Supprimer</button>
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
      "<div class='simple-item'><h4>Aucun message</h4><p class='panel-text'>Les premiers contacts apparaîtront ici.</p></div>";
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
    await requestJson("/api/login", {
      method: "POST",
      body: {
        email: dom.loginEmail.value,
        password: dom.loginPassword.value,
      },
    });

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
    await requestJson("/api/register", {
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
    });

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
    await requestJson("/api/contact", {
      method: "POST",
      body: {
        fullName: dom.contactFullName.value,
        email: dom.contactEmail.value,
        phone: dom.contactPhone.value,
        message: dom.contactMessage.value,
      },
    });

    closeModal(dom.contactModal);
    dom.contactForm.reset();
    prefillContactForm();
    showGlobalMessage("Premier contact envoyé.", "success");
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
      "L’administration ne peut pas envoyer de demande client.",
      "error"
    );
    return;
  }

  try {
    await requestJson("/api/bookings", {
      method: "POST",
      body: {
        serviceType: dom.bookingServiceType.value,
        animalType: dom.bookingAnimalType.value,
        animalName: dom.bookingAnimalName.value,
        startDate: dom.bookingStartDate.value,
        endDate: dom.bookingEndDate.value,
        timeSlot: dom.bookingTimeSlot.value,
        notes: dom.bookingNotes.value,
      },
    });

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
    await requestJson("/api/account", {
      method: "PUT",
      body: {
        fullName: dom.profileFullName.value,
        email: dom.profileEmail.value,
        phone: dom.profilePhone.value,
        animalType: dom.profileAnimalType.value,
        animalName: dom.profileAnimalName.value,
      },
    });

    setInlineMessage(dom.profileMessage, "Profil mis à jour.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.profileMessage, error.message, "error");
  }
}

async function deleteAccount() {
  if (!state.user) return;
  if (!window.confirm("Supprimer ton compte et toutes tes demandes ?")) return;

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
  if (button.dataset.action === "edit-member") {
    selectMember(memberId);
    dom.memberForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    setInlineMessage(dom.memberMessage, "Sélectionne un membre.", "error");
    return;
  }

  try {
    await requestJson(`/api/admin/members/${memberId}`, {
      method: "PUT",
      body: {
        fullName: dom.memberFullName.value,
        email: dom.memberEmail.value,
        role: dom.memberRole.value,
        phone: dom.memberPhone.value,
        animalType: dom.memberAnimalType.value,
        animalName: dom.memberAnimalName.value,
      },
    });

    setInlineMessage(dom.memberMessage, "Membre mis à jour.", "success");
    await loadBootstrap();
    selectMember(memberId);
  } catch (error) {
    setInlineMessage(dom.memberMessage, error.message, "error");
  }
}

async function deleteMember(memberId) {
  if (!window.confirm("Supprimer ce membre ?")) return;

  try {
    await requestJson(`/api/admin/members/${memberId}`, { method: "DELETE" });
    showGlobalMessage("Membre supprimé.", "success");
    state.selectedMemberId = null;
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.memberMessage, error.message, "error");
  }
}

function handleAdminBookingsClick(event) {
  const button = event.target.closest("button[data-action='save-booking']");
  if (!button) return;
  saveAdminBooking(Number(button.dataset.bookingId));
}

async function saveAdminBooking(bookingId) {
  const statusSelect = dom.adminBookingsList.querySelector(
    `[data-role="booking-status"][data-booking-id="${bookingId}"]`
  );
  const noteInput = dom.adminBookingsList.querySelector(
    `[data-role="booking-note"][data-booking-id="${bookingId}"]`
  );

  try {
    await requestJson(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      body: {
        status: statusSelect.value,
        adminNote: noteInput.value,
      },
    });

    showGlobalMessage("Demande admin mise à jour.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

async function handleBlockedDateCreate(event) {
  event.preventDefault();
  setInlineMessage(dom.blockedDateMessage, "");

  try {
    await requestJson("/api/admin/blocked-dates", {
      method: "POST",
      body: {
        date: dom.blockedDateInput.value,
        reason: dom.blockedDateReason.value,
      },
    });

    dom.blockedDateForm.reset();
    setInlineMessage(dom.blockedDateMessage, "Date bloquée.", "success");
    await loadBootstrap();
  } catch (error) {
    setInlineMessage(dom.blockedDateMessage, error.message, "error");
  }
}

function handleBlockedDatesClick(event) {
  const button = event.target.closest("button[data-action='delete-blocked-date']");
  if (!button) return;
  deleteBlockedDate(Number(button.dataset.blockId));
}

async function deleteBlockedDate(blockId) {
  try {
    await requestJson(`/api/admin/blocked-dates/${blockId}`, { method: "DELETE" });
    showGlobalMessage("Date débloquée.", "success");
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
    await requestJson(
      activityId ? `/api/admin/activities/${activityId}` : "/api/admin/activities",
      {
        method: activityId ? "PUT" : "POST",
        body: payload,
      }
    );

    resetActivityForm();
    showGlobalMessage(
      activityId ? "Activité mise à jour." : "Activité ajoutée.",
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

  const activityId = Number(button.dataset.activityId);
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
  dom.activityForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function resetActivityForm() {
  dom.activityForm.reset();
  dom.activityId.value = "";
  dom.activitySortOrder.value = "0";
  setInlineMessage(dom.activityMessage, "");
}

async function deleteActivity(activityId) {
  if (!window.confirm("Supprimer cette carte d’information ?")) return;

  try {
    await requestJson(`/api/admin/activities/${activityId}`, { method: "DELETE" });
    showGlobalMessage("Activité supprimée.", "success");
    await loadBootstrap();
  } catch (error) {
    showGlobalMessage(error.message, "error");
  }
}

function handleContactsClick(event) {
  const button = event.target.closest("button[data-action='toggle-contact']");
  if (!button) return;

  const nextStatus = button.dataset.currentStatus === "handled" ? "new" : "handled";
  updateContactStatus(Number(button.dataset.contactId), nextStatus);
}

async function updateContactStatus(contactId, status) {
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

function handleMyBookingsClick(event) {
  const button = event.target.closest("button[data-action='cancel-booking']");
  if (!button) return;
  cancelMyBooking(Number(button.dataset.bookingId));
}

async function cancelMyBooking(bookingId) {
  if (!window.confirm("Annuler cette demande de garde ?")) return;

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
    openModal(dom.adminModal);
    return;
  }

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

function getPreferredName(fullName) {
  if (!fullName) return "";
  return String(fullName).trim().split(/\s+/)[0];
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
  return value.toISOString().slice(0, 10);
}

function setMinBookingDates() {
  const today = new Date().toISOString().slice(0, 10);
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
