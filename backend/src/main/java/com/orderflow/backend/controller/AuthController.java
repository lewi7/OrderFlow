package com.orderflow.backend.controller;

import com.orderflow.backend.dto.auth.LoginRequest;
import com.orderflow.backend.dto.auth.LoginResponse;
import com.orderflow.backend.dto.auth.RestaurantRegistrationRequest;
import com.orderflow.backend.model.Restaurant;
import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.RestaurantRepository;
import com.orderflow.backend.repository.UserRepository;
import com.orderflow.backend.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        
        String jwt = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();
        
        return ResponseEntity.ok(new LoginResponse(jwt, user));
    }
    
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registerRestaurant(@Valid @RequestBody RestaurantRegistrationRequest request) {
        try {
            log.info("Registration request received: {}", request.getRestaurantName());
            
            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            
            // Create restaurant
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.getRestaurantName());
            restaurant.setAddress(request.getRestaurantAddress());
            restaurant.setPhone(request.getRestaurantPhone());
            restaurant.setEmail(request.getRestaurantEmail());
            restaurant = restaurantRepository.save(restaurant);
            
            log.info("Restaurant created with ID: {}", restaurant.getId());
            
            // Create owner user
            User owner = new User();
            owner.setUsername(request.getUsername());
            owner.setPassword(passwordEncoder.encode(request.getPassword()));
            owner.setEmail(request.getEmail());
            owner.setFullName(request.getFullName());
            owner.setRole(User.UserRole.OWNER);
            owner.setRestaurant(restaurant);
            owner = userRepository.save(owner);
            
            log.info("User created with ID: {}", owner.getId());
            
            // Generate JWT token
            String jwt = tokenProvider.generateToken(owner);
            
            log.info("JWT token generated successfully");
            
            return ResponseEntity.ok(new LoginResponse(jwt, owner));
        } catch (Exception e) {
            log.error("Registration failed: ", e);
            throw e;
        }
    }
} 