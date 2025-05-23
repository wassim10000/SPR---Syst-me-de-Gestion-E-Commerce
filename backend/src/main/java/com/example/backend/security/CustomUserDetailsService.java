package com.example.backend.security;

import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Logger logger = LoggerFactory.getLogger(getClass());
        logger.info("Loading user by email: {}", email);

        // Find user with roles and permissions
        User user = userRepository.findByEmailWithRolesAndPermissions(email)
            .orElseThrow(() -> {
                LoggerFactory.getLogger(getClass()).error("User not found with email: {}", email);
                return new UsernameNotFoundException("User not found with email: " + email);
            });

        if (!user.isActif()) {
            logger.warn("User account is not active: {}", email);
            throw new UsernameNotFoundException("User account is not active: " + email);
        }

        // Force loading of roles and permissions
        user.getRoles().size();
        user.getRoles().forEach(role -> {
            role.getPermissions().size();
        });

        logger.info("User found: {} with roles: {}", user.getEmail(),
            user.getRoles().stream()
                .map(Role::getNom)
                .collect(Collectors.joining(", ")));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Add roles and permissions
        user.getRoles().forEach(role -> {
            // Add role with ROLE_ prefix
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getNom()));
            // Add permissions
            role.getPermissions().forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission.getNom()))
            );
        });

        logger.info("Granted authorities: {}", authorities);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getMotDePasse())
                .authorities(authorities)
                .disabled(!user.isActif())
                .build();
    }
} 