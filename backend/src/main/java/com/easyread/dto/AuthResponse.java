package com.easyread.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String username;
    private String email;
    private String role;
    private String message;
}
