package com.orderflow.backend.controller;

import com.orderflow.backend.model.MenuItem;
import com.orderflow.backend.model.Restaurant;
import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.MenuItemRepository;
import com.orderflow.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Slf4j
public class MenuController {
    
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    
    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantAndIsAvailableTrue(user.getRestaurant());
        
        return ResponseEntity.ok(menuItems);
    }
    
    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(
            @RequestBody MenuItem menuItem,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        menuItem.setRestaurant(user.getRestaurant());
        
        MenuItem savedItem = menuItemRepository.save(menuItem);
        
        return ResponseEntity.ok(savedItem);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItem menuItem,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        // Ensure user can only update menu items from their restaurant
        if (!existingItem.getRestaurant().getId().equals(user.getRestaurant().getId())) {
            throw new RuntimeException("Access denied");
        }
        
        menuItem.setId(id);
        menuItem.setRestaurant(user.getRestaurant());
        
        MenuItem updatedItem = menuItemRepository.save(menuItem);
        
        return ResponseEntity.ok(updatedItem);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        // Ensure user can only delete menu items from their restaurant
        if (!menuItem.getRestaurant().getId().equals(user.getRestaurant().getId())) {
            throw new RuntimeException("Access denied");
        }
        
        menuItemRepository.delete(menuItem);
        
        return ResponseEntity.ok().build();
    }
} 