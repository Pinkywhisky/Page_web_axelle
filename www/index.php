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

          <nav class="main-nav">
            <a href="#approach">Approche</a>
            <a href="#services">Services</a>
            <a href="#contactZone">Demande de garde</a>
          </nav>

          <div class="header-actions" id="publicActions">
            <button class="btn btn-secondary" id="openLoginBtn" type="button">Se connecter</button>
            <button class="btn btn-primary" id="openRegisterBtn" type="button">Créer mon espace</button>
          </div>

          <div class="user-summary" id="userArea" hidden>
            <div class="user-identity">
              <span class="summary-label" id="userRoleText"></span>
              <strong id="userInfoText"></strong>
            </div>
            <button class="btn btn-primary btn-sm" id="openProfileBtn" type="button">Mon profil</button>
            <button class="btn btn-secondary btn-sm" id="openManageBtn" type="button" hidden>Gestion</button>
            <a class="btn btn-secondary btn-sm" id="logoutBtn" href="logout.php">Déconnexion</a>
          </div>
        </div>
      </header>

      <main>
        <section id="homeView">
          <section class="hero-section" id="home">
            <div class="hero-card section-center hero-intro">
              <div class="hero-copy">
                <p class="eyebrow">Garde à domicile et pet-sitting</p>
                <h1>Garde d’animaux à domicile, organisée simplement.</h1>
                <p class="hero-text">
                  Club des Pattes accompagne vos absences avec un espace clair :
                  inscription, suivi du profil et gestion des membres pour l’administration.
                </p>

                <div class="hero-actions">
                  <button class="btn btn-primary" id="heroRegisterBtn" type="button">
                    Créer mon espace
                  </button>
                  <button class="btn btn-secondary" id="heroLoginBtn" type="button">
                    Accéder à mon espace
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="section-block section-block-light" id="approach">
            <div class="section-center">
              <p class="eyebrow">Approche</p>
              <h2>Un cadre clair pour organiser la garde</h2>
              <p class="section-text">
                Les informations essentielles du foyer, de l’animal et des contacts
                restent centralisées dans un espace simple.
              </p>
            </div>

            <div class="service-grid approach-grid">
              <article class="service-card service-card-feature">
                <span class="service-icon" aria-hidden="true">i</span>
                <h3>Informations</h3>
                <p>Coordonnées et informations animal sont enregistrées proprement.</p>
              </article>
              <article class="service-card service-card-feature">
                <span class="service-icon" aria-hidden="true">✓</span>
                <h3>Suivi</h3>
                <p>L’espace profil donne une vue directe sur les données utiles.</p>
              </article>
              <article class="service-card service-card-feature">
                <span class="service-icon" aria-hidden="true">⚙</span>
                <h3>Gestion</h3>
                <p>Les admins peuvent lister, modifier ou supprimer les membres.</p>
              </article>
            </div>
          </section>

          <section class="section-block section-block-soft" id="services">
            <div class="section-center">
              <p class="eyebrow">Services</p>
              <h2>Une présence pensée pour chiens et chats</h2>
              <p class="section-text">
                Un espace simple pour garder les informations importantes au même endroit
                et faciliter le suivi avec l’équipe.
              </p>
            </div>
          </section>

          <section class="section-block" id="contactZone">
            <div class="contact-cta">
              <p class="eyebrow">Demande de garde</p>
              <h2>Préparons votre espace de suivi</h2>
              <p class="section-text">
                Créez un compte pour centraliser vos informations et faciliter les échanges.
              </p>
              <div class="hero-actions contact-cta-actions">
                <button class="btn btn-primary" id="contactRegisterBtn" type="button">
                  Créer mon espace
                </button>
              </div>
            </div>
          </section>
        </section>

        <section class="section-block manage-view" id="manageView" hidden>
          <div class="section-row">
            <div>
              <p class="eyebrow">Administration</p>
              <h2>Vue administration des membres</h2>
              <p class="section-text">Recherchez, modifiez et supprimez les comptes clients.</p>
            </div>
            <button class="btn btn-secondary" id="backHomeBtn" type="button">Retour accueil</button>
          </div>

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
                      <th>Rôle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="manageTableBody"></tbody>
                </table>
              </div>
            </article>

            <article class="panel-card admin-panel-card">
              <h3>Modifier un membre</h3>
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
            </article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="footer-inner">
          <div>
            <strong><?= e(APP_NAME) ?></strong>
            <p>Garde à domicile et pet-sitting avec un suivi clair des membres.</p>
          </div>
          <div>
            <p>Organisation claire</p>
            <p>Suivi des informations utiles</p>
          </div>
        </div>
      </footer>
    </div>

    <div class="modal-backdrop" id="loginModal" hidden>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
        <div class="modal-head">
          <div>
            <p class="modal-kicker">Connexion</p>
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
            <p class="modal-kicker">Inscription</p>
            <h3 id="registerModalTitle">Créer mon espace de suivi</h3>
            <p class="modal-copy">Un espace pour centraliser votre profil et vos informations animal.</p>
          </div>
          <button class="icon-btn" id="closeRegisterBtn" type="button" aria-label="Fermer">×</button>
        </div>

        <form id="registerForm" class="stack-form">
          <label for="registerFullName">Nom complet</label>
          <input id="registerFullName" type="text" required />

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
            <p class="modal-kicker">Profil</p>
            <h3 id="profileModalTitle">Mon profil</h3>
            <p class="modal-copy">Vos coordonnées et les informations utiles pour la garde.</p>
          </div>
          <button class="icon-btn" id="closeProfileBtn" type="button" aria-label="Fermer">×</button>
        </div>

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

    <script>
      window.CDP_CURRENT_USER = <?= json_encode($user, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: 'null' ?>;
    </script>
    <script src="/assets/script.js" defer></script>
  </body>
</html>
