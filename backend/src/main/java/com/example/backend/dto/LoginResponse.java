package com.example.backend.dto;

import lombok.Data;
import java.util.Set;

@Data
public class LoginResponse {
    private String token;
    private UserDTO user;
    private Set<String> permissions;
} 