<?php

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

$user = currentUser();
?>
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= e(APP_NAME) ?> | Garde à domicile et pet-sitting</title>
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
    <link rel="stylesheet" href="/assets/style.css" />
  </head>

  <body>
    <div class="page-shell">
      <header class="site-header">
        <div class="header-inner">
          <a href="#home" class="brand" id="homeLink">
            <span class="brand-badge">CP</span>
            <span class="brand-copy">
              <strong><?= e(APP_NAME) ?></strong>
              <small>Garde à domicile • pet-sitting personnalisé</small>
            </span>
          </a>

          <div class="header-actions" id="publicActions">
            <button class="btn btn-secondary" id="openLoginBtn" type="button">Se connecter</button>
            <button class="btn btn-primary" id="openRegisterBtn" type="button">Créer un compte</button>
          </div>

          <div class="user-summary" id="userArea" hidden>
            <div class="user-identity">
              <span class="user-role-text" id="userRoleText"></span>
              <strong id="userInfoText"></strong>
            </div>
            <button class="btn btn-primary btn-sm" id="openBookingBtn" type="button">Prendre RDV</button>
            <button class="btn btn-primary btn-sm" id="openProfileBtn" type="button">Mon profil</button>
            <button class="btn btn-secondary btn-sm" id="openManageBtn" type="button" hidden>Gestion</button>
            <a class="btn btn-secondary btn-sm" id="logoutBtn" href="logout.php">Déconnexion</a>
          </div>
        </div>
      </header>

      <main>
        <section id="homeView">
          <section class="hero-section" id="home">
            <div class="hero-card">
              <div class="hero-copy">
                <h1>Garde d'animaux à domicile, simple et rassurante.</h1>
                <p class="hero-text">
                  Une solution moderne pour suivre les informations de votre animal
                  et organiser vos gardes en toute sérénité.
                </p>

                <div class="hero-actions">
                  <button class="btn btn-primary" id="heroRegisterBtn" type="button">
                    Créer un compte
                  </button>
                  <button class="btn btn-secondary" id="heroLoginBtn" type="button">
                    Accéder à mon espace
                  </button>
                  <button class="btn btn-secondary" id="heroBookingBtn" type="button">
                    Prendre RDV
                  </button>
                  <button class="btn btn-primary" id="heroManageBtn" type="button" hidden>
                    Gestion
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="section-block trust-section" id="trust">
            <div class="section-center">
              <h2>Pourquoi nous faire confiance ?</h2>
              <p class="section-text">
                Une expérience pensée pour accompagner les familles avec douceur,
                clarté et sérieux.
              </p>
            </div>

            <div class="feature-grid">
              <article class="feature-card">
                <span class="feature-icon" aria-hidden="true">🐾</span>
                <h3>Informations centralisées</h3>
                <p>Toutes les informations importantes de votre animal sont enregistrées au même endroit.</p>
              </article>
              <article class="feature-card">
                <span class="feature-icon" aria-hidden="true">🏡</span>
                <h3>Organisation simplifiée</h3>
                <p>Préparez facilement les gardes et les informations utiles.</p>
              </article>
              <article class="feature-card">
                <span class="feature-icon" aria-hidden="true">📞</span>
                <h3>Suivi personnalisé</h3>
                <p>Gardez le contact et retrouvez l'historique des informations importantes.</p>
              </article>
            </div>
          </section>

          <section class="section-block services-section" id="services">
            <div class="section-center">
              <h2>Des services adaptés au quotidien de votre animal</h2>
              <p class="section-text">
                Une approche souple pour accompagner les chiens et chats dans leur environnement.
              </p>
            </div>

            <div class="service-grid">
              <article class="service-card">
                <div class="service-image service-image-walk" role="img" aria-label="Chien en promenade"></div>
                <div class="service-content">
                  <h3>Promenade</h3>
                  <p>Des sorties calmes et adaptées au rythme de votre chien, pour préserver ses repères.</p>
                </div>
              </article>
              <article class="service-card">
                <div class="service-image service-image-care" role="img" aria-label="Chien et chat dans un cadre naturel"></div>
                <div class="service-content">
                  <h3>Garde chien & chat</h3>
                  <p>Une présence rassurante à domicile, avec les informations utiles toujours disponibles.</p>
                </div>
              </article>
              <article class="service-card">
                <div class="service-image service-image-training" role="img" aria-label="Moment d'éducation canine"></div>
                <div class="service-content">
                  <h3>Éducation canine</h3>
                  <p>Un accompagnement bienveillant pour renforcer la confiance et les habitudes positives.</p>
                </div>
              </article>
            </div>
          </section>

          <section class="section-block testimonials-section" id="testimonials">
            <div class="section-center">
              <h2>Témoignages</h2>
            </div>

            <div class="testimonial-grid">
              <article class="testimonial-card">
                <p class="stars" aria-label="5 étoiles">★★★★★</p>
                <blockquote>"Très sérieux et rassurant. Mon chien a été parfaitement suivi."</blockquote>
                <strong>Camille R.</strong>
              </article>
              <article class="testimonial-card">
                <p class="stars" aria-label="5 étoiles">★★★★★</p>
                <blockquote>"Une organisation simple, claire, et beaucoup de douceur avec mon chat."</blockquote>
                <strong>Julien M.</strong>
              </article>
              <article class="testimonial-card">
                <p class="stars" aria-label="5 étoiles">★★★★★</p>
                <blockquote>"J'ai retrouvé toutes les informations importantes au même endroit. Très pratique."</blockquote>
                <strong>Sophie L.</strong>
              </article>
            </div>
          </section>

          <section class="section-block" id="contactZone">
            <div class="contact-cta">
              <h2>Un premier échange simple</h2>
              <p class="section-text">
                Présentez votre besoin et échangeons ensemble pour trouver la solution adaptée à votre animal.
              </p>
              <div class="hero-actions contact-cta-actions">
                <button class="btn btn-primary" id="contactButton" type="button">
                  Nous contacter
                </button>
                <button class="btn btn-secondary" id="contactBookingBtn" type="button">
                  Prendre RDV
                </button>
              </div>
            </div>
          </section>
        </section>

        <section class="section-block manage-view" id="manageView" hidden>
          <div class="section-row">
            <div>
              <h2>Vue administration des membres</h2>
              <p class="section-text">Recherchez, modifiez et supprimez les comptes clients.</p>
            </div>
            <button class="btn btn-secondary" id="backHomeBtn" type="button">Retour accueil</button>
          </div>

          <article class="panel-card admin-panel-card bookings-admin-card">
            <div class="panel-card-top">
              <div>
                <h3>Demandes de garde</h3>
                <p class="panel-text" id="manageBookingsMessage"></p>
              </div>
            </div>
            <div class="booking-list" id="manageBookingsList"></div>
          </article>

          <div class="admin-grid modal-admin-layout">
            <article class="panel-card admin-panel-card">
              <div class="panel-card-top">
                <div>
                  <h3>Comptes et profils</h3>
                  <p class="panel-text" id="manageListMessage"></p>
                </div>
                <input id="manageSearch" type="search" class="compact-input" placeholder="Rechercher..." />
              </div>

              <div class="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>E-mail</th>
                      <th>Type d’animal</th>
                      <th>Nom de l’animal</th>
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="manageTableBody"></tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="footer-inner">
          <div>
            <strong><?= e(APP_NAME) ?></strong>
            <p>Garde d'animaux à domicile, simple et rassurante.</p>
          </div>
          <div class="footer-links">
            <a href="#">Mentions légales</a>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </footer>
    </div>

    <div class="modal-backdrop" id="loginModal" hidden>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="loginModalTitle">Accéder à mon espace</h3>
            <p class="modal-copy">Retrouvez votre profil et vos informations.</p>
          </div>
          <button class="icon-btn" id="closeLoginBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="loginForm" class="stack-form">
          <label for="loginEmail">Adresse e-mail</label>
          <input id="loginEmail" type="email" required />

          <label for="loginPassword">Mot de passe</label>
          <input id="loginPassword" type="password" required />

          <p class="inline-message" id="loginMessage"></p>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Se connecter</button>
          </div>
        </form>

        <p class="modal-switch">
          Pas encore d’espace ?
          <button class="text-button" id="switchToRegisterBtn" type="button">Créer mon espace</button>
        </p>
      </div>
    </div>

    <div class="modal-backdrop" id="registerModal" hidden>
      <div class="modal-card modal-wide" role="dialog" aria-modal="true" aria-labelledby="registerModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="registerModalTitle">Créer mon espace de suivi</h3>
            <p class="modal-copy">Un espace pour centraliser votre profil et vos informations animal.</p>
          </div>
          <button class="icon-btn" id="closeRegisterBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="registerForm" class="stack-form">
          <div class="inline-fields">
            <div>
              <label for="registerFirstName">Prénom</label>
              <input id="registerFirstName" type="text" required />
            </div>
            <div>
              <label for="registerLastName">Nom</label>
              <input id="registerLastName" type="text" required />
            </div>
          </div>

          <label for="registerEmail">Adresse e-mail</label>
          <input id="registerEmail" type="email" required />

          <label for="registerPassword">Mot de passe</label>
          <input id="registerPassword" type="password" minlength="6" required />
          <p class="field-hint">6 caractères minimum.</p>

          <label for="registerPhone">Téléphone</label>
          <input id="registerPhone" type="tel" />

          <label for="registerAnimalType">Type d’animal</label>
          <select id="registerAnimalType">
            <option value="">Sélectionner</option>
            <option value="chien">Chien</option>
            <option value="chat">Chat</option>
          </select>

          <label for="registerAnimalName">Nom de l’animal</label>
          <input id="registerAnimalName" type="text" />

          <p class="inline-message" id="registerMessage"></p>
          <p class="inline-message success-message" id="registerSuccess"></p>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Créer mon espace</button>
          </div>
        </form>

        <div class="modal-success" id="registerSuccessPanel" hidden>
          <div class="success-icon" aria-hidden="true">✓</div>
          <h4>Votre espace a bien été créé.</h4>
          <p>Vous pouvez maintenant vous connecter pour accéder à votre profil.</p>
          <div class="form-actions">
            <button class="btn btn-primary" id="closeRegisterSuccessBtn" type="button">Fermer</button>
          </div>
        </div>

        <p class="modal-switch">
          Vous avez déjà un espace ?
          <button class="text-button" id="switchToLoginBtn" type="button">Se connecter</button>
        </p>
      </div>
    </div>

    <div class="modal-backdrop" id="profileModal" hidden>
      <div class="modal-card modal-wide" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="profileModalTitle">Mon profil</h3>
            <p class="modal-copy">Vos coordonnées et les informations utiles pour la garde.</p>
          </div>
          <button class="icon-btn" id="closeProfileBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <section class="profile-pets">
          <div class="panel-card-top">
            <div>
              <h4>Mes animaux</h4>
              <p class="panel-text">Ajoutez les animaux à prendre en compte pour vos demandes de garde.</p>
            </div>
          </div>

          <form id="petForm" class="stack-form compact-form">
            <input id="petId" type="hidden" />
            <div class="inline-fields">
              <div>
                <label for="petName">Nom de l’animal</label>
                <input id="petName" type="text" required />
              </div>
              <div>
                <label for="petSpecies">Espèce</label>
                <select id="petSpecies" required>
                  <option value="">Sélectionner</option>
                  <option value="chien">Chien</option>
                  <option value="chat">Chat</option>
                </select>
              </div>
            </div>
            <label for="petNotes">Informations utiles</label>
            <textarea id="petNotes" rows="3" placeholder="Habitudes, traitement, alimentation, comportement."></textarea>
            <p class="inline-message" id="petMessage"></p>
            <div class="form-actions split-actions">
              <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
              <button class="btn btn-secondary btn-sm" id="petResetBtn" type="button">Nouvel animal</button>
            </div>
          </form>

          <div class="pet-list" id="petsList"></div>
        </section>

        <section class="profile-bookings">
          <div class="panel-card-top">
            <div>
              <h4>Mes demandes de garde</h4>
              <p class="panel-text" id="profileBookingsMessage"></p>
            </div>
            <button class="btn btn-secondary btn-sm" id="profileBookingBtn" type="button">Nouvelle demande</button>
          </div>
          <div class="booking-list" id="profileBookingsList"></div>
        </section>

        <form id="profileForm" class="stack-form">
          <input id="profileId" type="hidden" />

          <label for="profileFullName">Nom complet</label>
          <input id="profileFullName" type="text" required />

          <label for="profileEmail">Adresse e-mail</label>
          <input id="profileEmail" type="email" required />

          <label for="profilePhone">Téléphone</label>
          <input id="profilePhone" type="tel" />

          <label for="profileAnimalType">Type d’animal</label>
          <select id="profileAnimalType">
            <option value="">Non renseigné</option>
            <option value="chien">Chien</option>
            <option value="chat">Chat</option>
          </select>

          <label for="profileAnimalName">Nom de l’animal</label>
          <input id="profileAnimalName" type="text" />

          <p class="inline-message" id="profileModalMessage"></p>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" id="bookingModal" hidden>
      <div class="modal-card modal-wide" role="dialog" aria-modal="true" aria-labelledby="bookingModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="bookingModalTitle">Prendre RDV pour une garde</h3>
            <p class="modal-copy">Indiquez les dates souhaitées et les informations utiles pour préparer la garde.</p>
          </div>
          <button class="icon-btn" id="closeBookingBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="bookingForm" class="stack-form">
          <div id="bookingPetsWrap" hidden>
            <label>Animaux concernés</label>
            <div class="pet-choice-list" id="bookingPetsList"></div>
          </div>

          <div class="inline-fields" id="bookingManualAnimalFields">
            <div>
              <label for="bookingAnimalType">Type d’animal</label>
              <select id="bookingAnimalType" required>
                <option value="">Sélectionner</option>
                <option value="chien">Chien</option>
                <option value="chat">Chat</option>
              </select>
            </div>
            <div>
              <label for="bookingAnimalName">Nom de l’animal</label>
              <input id="bookingAnimalName" type="text" required />
            </div>
          </div>

          <div class="inline-fields">
            <div>
              <label for="bookingStartDateTime">Arrivée prévue</label>
              <input id="bookingStartDateTime" type="datetime-local" required />
            </div>
            <div>
              <label for="bookingEndDateTime">Départ prévu</label>
              <input id="bookingEndDateTime" type="datetime-local" required />
            </div>
          </div>

          <label for="bookingTime">Horaire souhaité</label>
          <input id="bookingTime" type="time" step="60" />

          <label for="bookingNotes">Informations complémentaires</label>
          <textarea
            id="bookingNotes"
            rows="4"
            placeholder="Habitudes, alimentation, médicaments, accès au domicile, remarques utiles."
          ></textarea>

          <p class="inline-message" id="bookingMessage"></p>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Envoyer la demande</button>
          </div>
        </form>

        <div class="modal-success" id="bookingSuccessPanel" hidden>
          <div class="success-icon" aria-hidden="true">✓</div>
          <h4>Votre demande a bien été envoyée.</h4>
          <p>Elle apparaît maintenant dans votre espace profil.</p>
          <div class="form-actions">
            <button class="btn btn-primary" id="closeBookingSuccessBtn" type="button">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" id="manageEditModal" hidden>
      <div class="modal-card modal-wide" role="dialog" aria-modal="true" aria-labelledby="manageEditModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="manageEditModalTitle">Modifier un membre</h3>
            <p class="modal-copy">Mettez à jour les informations du compte sélectionné.</p>
          </div>
          <button class="icon-btn" id="closeManageEditBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="manageEditForm" class="stack-form">
          <input id="manageId" type="hidden" />

          <label for="manageFullName">Nom complet</label>
          <input id="manageFullName" type="text" required />

          <label for="manageEmail">E-mail</label>
          <input id="manageEmail" type="email" required />

          <label for="managePhone">Téléphone</label>
          <input id="managePhone" type="tel" />

          <label for="manageRole">Rôle</label>
          <select id="manageRole">
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>

          <label for="manageAnimalType">Type d’animal</label>
          <select id="manageAnimalType">
            <option value="">Non renseigné</option>
            <option value="chien">Chien</option>
            <option value="chat">Chat</option>
          </select>

          <label for="manageAnimalName">Nom de l’animal</label>
          <input id="manageAnimalName" type="text" />

          <p class="inline-message" id="manageEditMessage"></p>

          <div class="form-actions split-actions">
            <button class="btn btn-primary btn-sm" type="submit">Sauvegarder</button>
            <button class="btn btn-secondary btn-sm" id="manageResetBtn" type="button">Effacer</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" id="contactModal" hidden>
      <div class="modal-card modal-wide" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">
        <div class="modal-head">
          <div>
            <h3 id="contactModalTitle">Nous contacter</h3>
            <p class="modal-copy">Présentez votre besoin et les informations importantes pour votre animal.</p>
          </div>
          <button class="icon-btn" id="closeContactBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="contactForm" class="stack-form">
          <div class="inline-fields">
            <div>
              <label for="contactFirstName">Prénom</label>
              <input id="contactFirstName" type="text" required />
            </div>
            <div>
              <label for="contactLastName">Nom</label>
              <input id="contactLastName" type="text" required />
            </div>
          </div>

          <label for="contactEmail">Adresse e-mail</label>
          <input id="contactEmail" type="email" required />

          <label for="contactPhone">Téléphone</label>
          <input id="contactPhone" type="tel" />

          <label for="contactMessage">Message</label>
          <textarea
            id="contactMessage"
            rows="5"
            placeholder="Votre besoin, les dates envisagées, le profil de l’animal, les habitudes importantes."
            required
          ></textarea>

          <p class="inline-message" id="contactMessageBox"></p>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">Envoyer mon message</button>
          </div>
        </form>

        <div class="modal-success" id="contactSuccessPanel" hidden>
          <div class="success-icon" aria-hidden="true">✓</div>
          <h4>Votre message a bien été envoyé.</h4>
          <p>Nous reviendrons vers vous pour échanger sur la solution adaptée à votre animal.</p>
          <div class="form-actions">
            <button class="btn btn-primary" id="closeContactSuccessBtn" type="button">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      window.CDP_CURRENT_USER = <?= json_encode($user, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: 'null' ?>;
    </script>
    <script src="/assets/script.js" defer></script>
  </body>
</html>
