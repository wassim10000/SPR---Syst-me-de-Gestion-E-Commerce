package com.example.backend.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String email;
    private Set<String> roles;
    private boolean actif;
} 