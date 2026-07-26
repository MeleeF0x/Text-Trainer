package io.meleefox.texttrainer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationResponse {
    private Long id;
    private String username;
    private String email;

    public RegistrationResponse(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

}
