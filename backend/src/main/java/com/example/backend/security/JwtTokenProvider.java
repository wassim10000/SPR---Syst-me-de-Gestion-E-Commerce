package com.example.backend.security;

import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationInMs;

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        String token = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
        
        logger.debug("Token généré pour l'utilisateur: {}", userDetails.getUsername());
        return token;
    }

    public String getUsernameFromJWT(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            logger.debug("Username extrait du token: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction du username du token", e);
            throw e;
        }
    }

    public boolean validateToken(String authToken) {
        logger.info("Validating JWT token...");
        logger.debug("Token to validate: {}", authToken);
        logger.debug("Using JWT secret: {}", jwtSecret);
        
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(authToken)
                .getBody();
                
            logger.info("Token validated successfully for user: {}", claims.getSubject());
            logger.debug("Token issued at: {}", claims.getIssuedAt());
            logger.debug("Token expires at: {}", claims.getExpiration());
            logger.debug("Token claims: {}", claims);
            
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
            logger.debug("JWT Secret used for validation: {}", jwtSecret);
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
            logger.debug("Token expired at: {}", ex.getClaims().getExpiration());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Unexpected error validating JWT: {}", ex.getMessage(), ex);
        }
        return false;
    }
} 