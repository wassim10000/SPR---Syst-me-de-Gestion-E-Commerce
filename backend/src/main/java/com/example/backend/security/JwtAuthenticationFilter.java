package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Ne pas filtrer uniquement pour les endpoints publics d'authentification
        return path.equals("/api/auth/login") || 
               path.equals("/api/auth/signup");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        String method = request.getMethod();
        
        // Log all headers for debugging
        logger.info("\n=== Incoming Request Headers ===");
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            logger.info("{}: {}", headerName, request.getHeader(headerName));
        }
        logger.info("===============================\n");
        
        // Skip authentication for public endpoints only
        if (requestUri.equals("/api/auth/login") || 
            requestUri.equals("/api/auth/signup") || 
            requestUri.startsWith("/api/test/") || 
            requestUri.startsWith("/api/debug/")) {
            logger.info("Skipping authentication for public endpoint: {}", requestUri);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            logger.info("\n=== Starting request processing ===");
            logger.info("Request: {} {}", method, requestUri);
            
            String jwt = getJwtFromRequest(request);
            logger.info("JWT extracted from request: {}", jwt != null ? "present" : "absent");

            if (StringUtils.hasText(jwt)) {
                logger.debug("JWT Token: {}", jwt);
                
                try {
                    if (tokenProvider.validateToken(jwt)) {
                        String username = tokenProvider.getUsernameFromJWT(jwt);
                        logger.info("JWT validated successfully for user: {}", username);
                        
                        try {
                            logger.info("Loading user details for: {}", username);
                            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                            
                            logger.info("User details loaded successfully");
                            logger.info("Username: {}", userDetails.getUsername());
                            logger.info("Authorities: {}", userDetails.getAuthorities());
                            logger.info("Account status - Enabled: {}, AccountNonExpired: {}, CredentialsNonExpired: {}, AccountNonLocked: {}",
                                userDetails.isEnabled(), userDetails.isAccountNonExpired(),
                                userDetails.isCredentialsNonExpired(), userDetails.isAccountNonLocked());
                            
                            logger.info("Creating authentication token...");
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            logger.info("Setting authentication in SecurityContext...");
                            SecurityContext context = SecurityContextHolder.createEmptyContext();
                            context.setAuthentication(authentication);
                            SecurityContextHolder.setContext(context);
                            
                            logger.info("Authentication set in SecurityContext");
                            logger.info("SecurityContext authentication: {}", 
                                SecurityContextHolder.getContext().getAuthentication());
                            logger.info("Authentication authorities: {}", 
                                SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                            
                            // Verify the authentication is properly set
                            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                            if (auth != null && auth.isAuthenticated()) {
                                logger.info("User '{}' is authenticated with authorities: {}", 
                                    auth.getName(), auth.getAuthorities());
                            } else {
                                logger.warn("Authentication failed or not set properly in SecurityContext");
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed");
                                return;
                            }
                        } catch (Exception e) {
                            logger.error("Error loading user details: {}", e.getMessage(), e);
                            SecurityContextHolder.clearContext();
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error loading user details");
                            return;
                        }
                    } else {
                        logger.warn("Invalid JWT token for request: {} {}", method, requestUri);
                        SecurityContextHolder.clearContext();
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                        return;
                    }
                } catch (Exception e) {
                    logger.error("Error validating token: {}", e.getMessage(), e);
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error validating token");
                    return;
                }
            } else {
                logger.info("No JWT token found in request: {} {}", method, requestUri);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No JWT token found");
                return;
            }
            
            logger.info("=== Finished authentication filter for {} {} ===\n", method, requestUri);
            filterChain.doFilter(request, response);
            
        } catch (Exception ex) {
            logger.error("Error in JWT Filter: {}", ex.getMessage(), ex);
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error during authentication");
            return;
        }
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
} 