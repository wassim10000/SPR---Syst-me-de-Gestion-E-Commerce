package com.example.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String nom;
    private String email;
    private String motDePasse;
} 