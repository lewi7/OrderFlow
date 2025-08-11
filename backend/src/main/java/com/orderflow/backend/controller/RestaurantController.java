package com.orderflow.backend.controller;

import com.orderflow.backend.model.Restaurant;
import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
@Slf4j
public class RestaurantController {
    
    private final RestaurantRepository restaurantRepository;
    
    @GetMapping
    public ResponseEntity<Restaurant> getRestaurant(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Restaurant restaurant = user.getRestaurant();
        
        return ResponseEntity.ok(restaurant);
    }
    
    @PutMapping
    public ResponseEntity<Restaurant> updateRestaurant(
            @RequestBody Restaurant restaurant,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        // Ensure user can only update their own restaurant
        if (!restaurant.getId().equals(user.getRestaurant().getId())) {
            throw new RuntimeException("Access denied");
        }
        
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        
        return ResponseEntity.ok(updatedRestaurant);
    }
} 