package com.orderflow.backend.repository;

import com.orderflow.backend.model.MenuItem;
import com.orderflow.backend.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    
    List<MenuItem> findByRestaurantAndIsAvailableTrue(Restaurant restaurant);
    
    List<MenuItem> findByRestaurantAndCategory(Restaurant restaurant, String category);
    
    List<MenuItem> findByRestaurantAndIsAvailableTrueAndCategory(Restaurant restaurant, String category);
} 