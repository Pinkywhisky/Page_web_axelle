CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    role ENUM('client', 'admin') NOT NULL DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species ENUM('chien', 'chat') NOT NULL,
    race VARCHAR(100) DEFAULT NULL,
    sexe ENUM('male', 'femelle') DEFAULT NULL,
    date_naissance DATE DEFAULT NULL,
    poids DECIMAL(6,2) DEFAULT NULL,
    sterilise TINYINT(1) NOT NULL DEFAULT 0,
    compatible_chiens ENUM('oui', 'non', 'a_tester') NOT NULL DEFAULT 'a_tester',
    compatible_chats ENUM('oui', 'non', 'a_tester') NOT NULL DEFAULT 'a_tester',
    compatible_enfants ENUM('oui', 'non', 'a_tester') NOT NULL DEFAULT 'a_tester',
    craintif TINYINT(1) NOT NULL DEFAULT 0,
    fugueur TINYINT(1) NOT NULL DEFAULT 0,
    tres_energetique TINYINT(1) NOT NULL DEFAULT 0,
    protecteur_ressources TINYINT(1) NOT NULL DEFAULT 0,
    aboiements_frequents TINYINT(1) NOT NULL DEFAULT 0,
    commentaires_comportement TEXT DEFAULT NULL,
    allergies TEXT DEFAULT NULL,
    traitement_medical TEXT DEFAULT NULL,
    regime_alimentaire TEXT DEFAULT NULL,
    commentaires TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    animal_name VARCHAR(100) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    booking_time TIME DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    admin_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_request_pets (
    booking_request_id INT NOT NULL,
    pet_id INT NOT NULL,
    PRIMARY KEY (booking_request_id, pet_id),
    CONSTRAINT fk_booking_request_pet_booking
        FOREIGN KEY (booking_request_id) REFERENCES booking_requests(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_request_pet_pet
        FOREIGN KEY (pet_id) REFERENCES pets(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    message TEXT NOT NULL,
    admin_reply TEXT DEFAULT NULL,
    client_reply TEXT DEFAULT NULL,
    conversation TEXT DEFAULT NULL,
    status ENUM('new', 'waiting', 'closed') NOT NULL DEFAULT 'new',
    replied_at DATETIME DEFAULT NULL,
    client_replied_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
