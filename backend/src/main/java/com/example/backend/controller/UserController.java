package com.example.backend.controller;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.service.RoleService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private RoleService roleService;

    /**
     * Get all users
     * @return List of all users
     */
    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userService.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get user by ID
     * @param id User ID
     * @return User with the specified ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        logger.info("Fetching user with id: {}", id);
        User user = userService.findById(id);
        return ResponseEntity.ok(convertToDTO(user));
    }

    /**
     * Create a new user
     * @param user User data
     * @return Created user
     */
    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        logger.info("Creating new user with email: {}", user.getEmail());
        User createdUser = userService.create(user);
        return new ResponseEntity<>(convertToDTO(createdUser), HttpStatus.CREATED);
    }

    /**
     * Update an existing user
     * @param id User ID
     * @param userDetails Updated user data
     * @return Updated user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        logger.info("Updating user with id: {}", id);
        User updatedUser = userService.update(id, userDetails);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }

    /**
     * Delete a user
     * @param id User ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE') or hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with id: {}", id);
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle user active status
     * @param id User ID
     * @return Updated user
     */
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id) {
        logger.info("Toggling active status for user with id: {}", id);
        userService.toggleActif(id);
        User user = userService.findById(id);
        return ResponseEntity.ok(convertToDTO(user));
    }
    
    /**
     * Toggle user active status (alternative endpoint)
     * @param id User ID
     * @return Updated user
     */
    @RequestMapping(value = "/{id}/toggle-actif", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> toggleUserActif(@PathVariable Long id) {
        logger.info("Toggling active status for user with id: {}", id);
        userService.toggleActif(id);
        User user = userService.findById(id);
        return ResponseEntity.ok(convertToDTO(user));
    }

    /**
     * Assign a role to a user
     * @param userId User ID
     * @param roleId Role ID
     * @return Updated user
     */
    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> addRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        logger.info("Adding role {} to user {}", roleId, userId);
        User user = userService.findById(userId);
        Role role = roleService.findById(roleId);
        
        // Utiliser la méthode helper pour maintenir la relation bidirectionnelle
        user.addRole(role);
        userService.save(user);
        
        return ResponseEntity.ok(convertToDTO(user));
    }
    
    /**
     * Remove a role from a user
     * @param userId User ID
     * @param roleId Role ID
     * @return Updated user
     */
    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> removeRoleFromUser(@PathVariable Long userId, @PathVariable Long roleId) {
        logger.info("Removing role {} from user {}", roleId, userId);
        User user = userService.findById(userId);
        Role role = roleService.findById(roleId);
        
        // Utiliser la méthode helper pour maintenir la relation bidirectionnelle
        user.removeRole(role);
        userService.save(user);
        
        return ResponseEntity.ok(convertToDTO(user));
    }
    
    /**
     * Convert User entity to UserDTO
     * @param user User entity
     * @return UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setNom(user.getNom());
        userDTO.setEmail(user.getEmail());
        userDTO.setActif(user.isActif());
        userDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getNom())
                .collect(Collectors.toSet()));
        return userDTO;
    }
}
