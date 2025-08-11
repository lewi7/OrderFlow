package com.orderflow.backend.repository;

import com.orderflow.backend.model.User;
import com.orderflow.backend.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRestaurant(Restaurant restaurant);
    
    List<User> findByRestaurantAndRole(Restaurant restaurant, User.UserRole role);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsernameAndRestaurant(String username, Restaurant restaurant);
    
    // Method needed for UserController
    List<User> findByRestaurantId(Long restaurantId);
} 