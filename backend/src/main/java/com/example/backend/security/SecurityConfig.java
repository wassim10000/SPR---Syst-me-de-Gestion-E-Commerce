package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;
    
    // Initialize accessDeniedHandler as it's required by the exception handling configuration
    private final AccessDeniedHandler accessDeniedHandler = (request, response, accessDeniedException) -> {
        logger.error("Access denied: {}", accessDeniedException.getMessage(), accessDeniedException);
        logger.error("Request URI: {}", request.getRequestURI());
        logger.error("Authentication: {}", SecurityContextHolder.getContext().getAuthentication());
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Error: Forbidden");
    };

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.info("Configuring CORS...");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        logger.info("CORS Configuration: {}", configuration);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring SecurityFilterChain...");
        
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                logger.info("Configuring authorization rules...");
                auth
                    .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/signup",
                        "/api/test/**",
                        "/api/debug/**"
                    ).permitAll()
                    .requestMatchers("/api/users/**").access((authentication, object) -> {
                        logger.info("Checking access to /api/users/**");
                        logger.info("Authentication: {}", authentication.get());
                        
                        if (authentication.get() == null || !authentication.get().isAuthenticated()) {
                            logger.warn("Access denied - not authenticated");
                            return new AuthorizationDecision(false);
                        }
                        
                        boolean hasAdminRole = authentication.get().getAuthorities().stream()
                            .anyMatch(grantedAuthority -> 
                                grantedAuthority.getAuthority().equals("ROLE_ADMIN") || 
                                grantedAuthority.getAuthority().equals("ADMIN"));
                                
                        logger.info("User has ADMIN role: {}", hasAdminRole);
                        logger.info("User authorities: {}", authentication.get().getAuthorities());
                        
                        return new AuthorizationDecision(hasAdminRole);
                    })
                    .anyRequest().authenticated();
            })
            .exceptionHandling(exception -> {
                logger.info("Configuring exception handling...");
                exception
                    .authenticationEntryPoint((request, response, authException) -> {
                        logger.error("Authentication error: {}", authException.getMessage(), authException);
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
                    })
                    .accessDeniedHandler((request, response, accessDeniedException) -> {
                        logger.error("Access denied: {}", accessDeniedException.getMessage(), accessDeniedException);
                        logger.error("Request URI: {}", request.getRequestURI());
                        logger.error("Authentication: {}", SecurityContextHolder.getContext().getAuthentication());
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Error: Forbidden");
                    });
            })
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        logger.info("SecurityFilterChain configuration complete");
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 