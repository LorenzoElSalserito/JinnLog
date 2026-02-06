package com.lorenzodm.jinnlog.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO Request per creazione profilo locale (desktop)
 *
 * A differenza di CreateUserRequest, la password è opzionale
 * perché in modalità desktop non è necessaria l'autenticazione.
 *
 * @author Lorenzo DM
 * @since 0.3.0
 */
public record CreateLocalProfileRequest(
        /**
         * Username univoco (obbligatorio)
         */
        @NotBlank(message = "Username obbligatorio")
        @Size(min = 3, max = 50, message = "Username deve essere tra 3 e 50 caratteri")
        String username,

        /**
         * Nome visualizzato (obbligatorio)
         */
        @NotBlank(message = "Nome visualizzato obbligatorio")
        @Size(min = 1, max = 100, message = "Nome deve essere tra 1 e 100 caratteri")
        String displayName,

        /**
         * Email (opzionale, per futuro sync/cloud)
         */
        @Email(message = "Email non valida")
        @Size(max = 100)
        String email,

        /**
         * Path avatar locale (opzionale)
         */
        @Size(max = 255)
        String avatarPath
) {}