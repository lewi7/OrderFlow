package com.orderflow.backend.repository;

import com.orderflow.backend.model.Order;
import com.orderflow.backend.model.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Page<Order> findByRestaurantOrderByCreatedAtDesc(Restaurant restaurant, Pageable pageable);
    
    List<Order> findByRestaurantAndStatus(Restaurant restaurant, Order.OrderStatus status);
    
    List<Order> findByRestaurantAndStatusIn(Restaurant restaurant, List<Order.OrderStatus> statuses);
    
    List<Order> findByRestaurantAndSource(Restaurant restaurant, Order.OrderSource source);
    
    @Query("SELECT o FROM Order o WHERE o.restaurant = :restaurant AND o.createdAt >= :startDate AND o.createdAt <= :endDate ORDER BY o.createdAt DESC")
    List<Order> findByRestaurantAndDateRange(@Param("restaurant") Restaurant restaurant, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant = :restaurant AND o.status = :status")
    long countByRestaurantAndStatus(@Param("restaurant") Restaurant restaurant, 
                                   @Param("status") Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.restaurant = :restaurant AND o.status IN ('NEW', 'PREPARING') ORDER BY o.createdAt ASC")
    List<Order> findActiveOrdersByRestaurant(@Param("restaurant") Restaurant restaurant);
    
    // Methods needed for AnalyticsController
    List<Order> findByRestaurantIdAndCreatedAtBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);
    List<Order> findByRestaurantIdAndCreatedAtAfter(Long restaurantId, LocalDateTime start);
} 