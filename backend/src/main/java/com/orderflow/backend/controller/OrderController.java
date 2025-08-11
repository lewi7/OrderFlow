package com.orderflow.backend.controller;

import com.orderflow.backend.model.Order;
import com.orderflow.backend.model.Restaurant;
import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.OrderRepository;
import com.orderflow.backend.repository.RestaurantRepository;
import com.orderflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    
    @GetMapping
    public ResponseEntity<Page<Order>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Order> orders = orderRepository.findByRestaurantOrderByCreatedAtDesc(
            user.getRestaurant(), pageable);
        
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Ensure user can only access orders from their restaurant
        if (!order.getRestaurant().getId().equals(user.getRestaurant().getId())) {
            throw new RuntimeException("Access denied");
        }
        
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        List<Order> activeOrders = orderRepository.findActiveOrdersByRestaurant(user.getRestaurant());
        
        return ResponseEntity.ok(activeOrders);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Ensure user can only update orders from their restaurant
        if (!order.getRestaurant().getId().equals(user.getRestaurant().getId())) {
            throw new RuntimeException("Access denied");
        }
        
        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);
        
        return ResponseEntity.ok(updatedOrder);
    }
    
    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;
        
        public Order.OrderStatus getStatus() {
            return status;
        }
        
        public void setStatus(Order.OrderStatus status) {
            this.status = status;
        }
    }
} 