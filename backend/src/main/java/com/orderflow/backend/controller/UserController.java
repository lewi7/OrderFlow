package com.orderflow.backend.controller;

import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.UserRepository;
import com.orderflow.backend.repository.RestaurantRepository;
import com.orderflow.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @GetMapping
    public ResponseEntity<List<User>> getUsers(Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<User> users = userRepository.findByRestaurantId(currentUser.getRestaurant().getId());
            
            // Don't return password hashes
            users.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error getting users", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request, 
                                        Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Check if current user has permission to create users
            if (currentUser.getRole() != User.UserRole.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().build();
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }
            
            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setEmail(request.getEmail());
            newUser.setFullName(request.getFullName());
            newUser.setRole(request.getRole());
            newUser.setRestaurant(currentUser.getRestaurant());
            
            User savedUser = userRepository.save(newUser);
            savedUser.setPassword(null); // Don't return password hash
            
            log.info("User created: {}", savedUser.getUsername());
            return ResponseEntity.ok(savedUser);
            
        } catch (Exception e) {
            log.error("Error creating user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, 
                                        @Valid @RequestBody UpdateUserRequest request,
                                        Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Check if current user has permission to update users
            if (currentUser.getRole() != User.UserRole.OWNER && !currentUser.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            User userToUpdate = userRepository.findById(id)
                .orElse(null);
            
            if (userToUpdate == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user belongs to same restaurant
            if (!userToUpdate.getRestaurant().getId().equals(currentUser.getRestaurant().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update fields
            if (request.getFullName() != null) {
                userToUpdate.setFullName(request.getFullName());
            }
            if (request.getEmail() != null) {
                // Check if email is already taken by another user
                if (!request.getEmail().equals(userToUpdate.getEmail()) && 
                    userRepository.existsByEmail(request.getEmail())) {
                    return ResponseEntity.badRequest().build();
                }
                userToUpdate.setEmail(request.getEmail());
            }
            if (request.getRole() != null && currentUser.getRole() == User.UserRole.OWNER) {
                userToUpdate.setRole(request.getRole());
            }
            
            User updatedUser = userRepository.save(userToUpdate);
            updatedUser.setPassword(null); // Don't return password hash
            
            log.info("User updated: {}", updatedUser.getUsername());
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            log.error("Error updating user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetUserPassword(@PathVariable Long id, 
                                               @Valid @RequestBody ResetPasswordRequest request,
                                               Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Check if current user has permission to reset passwords
            if (currentUser.getRole() != User.UserRole.OWNER && !currentUser.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            User userToUpdate = userRepository.findById(id)
                .orElse(null);
            
            if (userToUpdate == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user belongs to same restaurant
            if (!userToUpdate.getRestaurant().getId().equals(currentUser.getRestaurant().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Update password
            userToUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(userToUpdate);
            
            log.info("Password reset for user: {}", userToUpdate.getUsername());
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, 
                                        Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Check if current user has permission to delete users
            if (currentUser.getRole() != User.UserRole.OWNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Prevent deleting own account
            if (currentUser.getId().equals(id)) {
                return ResponseEntity.badRequest().build();
            }
            
            User userToDelete = userRepository.findById(id)
                .orElse(null);
            
            if (userToDelete == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user belongs to same restaurant
            if (!userToDelete.getRestaurant().getId().equals(currentUser.getRestaurant().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            userRepository.delete(userToDelete);
            
            log.info("User deleted: {}", userToDelete.getUsername());
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error deleting user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Request DTOs
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String email;
        private String fullName;
        private User.UserRole role;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public User.UserRole getRole() { return role; }
        public void setRole(User.UserRole role) { this.role = role; }
    }

    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private User.UserRole role;

        // Getters and setters
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public User.UserRole getRole() { return role; }
        public void setRole(User.UserRole role) { this.role = role; }
    }

    public static class ResetPasswordRequest {
        private String password;

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
} 