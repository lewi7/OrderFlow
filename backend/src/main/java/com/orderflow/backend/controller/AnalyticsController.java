package com.orderflow.backend.controller;

import com.orderflow.backend.model.Order;
import com.orderflow.backend.model.OrderItem;
import com.orderflow.backend.model.MenuItem;
import com.orderflow.backend.repository.OrderRepository;
import com.orderflow.backend.repository.MenuItemRepository;
import com.orderflow.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    @GetMapping("/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyAnalytics(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        
        try {
            Long restaurantId = getRestaurantIdFromAuth(authentication);
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days - 1);
            
            List<Map<String, Object>> dailyStats = new ArrayList<>();
            
            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
                
                List<Order> ordersForDay = orderRepository.findByRestaurantIdAndCreatedAtBetween(
                    restaurantId, startOfDay, endOfDay);
                
                Map<String, Object> dayStats = new HashMap<>();
                dayStats.put("date", date.toString());
                dayStats.put("orderCount", ordersForDay.size());
                
                BigDecimal totalRevenue = ordersForDay.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                dayStats.put("totalRevenue", totalRevenue);
                
                double avgOrderValue = ordersForDay.isEmpty() ? 0.0 : 
                    totalRevenue.doubleValue() / ordersForDay.size();
                dayStats.put("averageOrderValue", avgOrderValue);
                
                dailyStats.add(dayStats);
            }
            
            return ResponseEntity.ok(dailyStats);
        } catch (Exception e) {
            log.error("Error getting daily analytics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/items")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingItems(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        
        try {
            Long restaurantId = getRestaurantIdFromAuth(authentication);
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            
            List<Order> orders = orderRepository.findByRestaurantIdAndCreatedAtAfter(
                restaurantId, startDate);
            
            Map<Long, Integer> itemSales = new HashMap<>();
            Map<Long, String> itemNames = new HashMap<>();
            Map<Long, String> itemCategories = new HashMap<>();
            
            for (Order order : orders) {
                for (OrderItem item : order.getItems()) {
                    MenuItem menuItem = item.getMenuItem();
                    if (menuItem != null) {
                        Long menuItemId = menuItem.getId();
                        itemSales.merge(menuItemId, item.getQuantity(), Integer::sum);
                        
                        // Get menu item details if not already cached
                        if (!itemNames.containsKey(menuItemId)) {
                            itemNames.put(menuItemId, menuItem.getName());
                            itemCategories.put(menuItemId, menuItem.getCategory());
                        }
                    }
                }
            }
            
            List<Map<String, Object>> topItems = itemSales.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("menuItemId", entry.getKey());
                    item.put("menuItemName", itemNames.getOrDefault(entry.getKey(), "Unknown Item"));
                    item.put("category", itemCategories.getOrDefault(entry.getKey(), "Unknown Category"));
                    item.put("quantitySold", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("quantitySold"), (Integer) a.get("quantitySold")))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(topItems);
        } catch (Exception e) {
            log.error("Error getting top selling items", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        
        try {
            Long restaurantId = getRestaurantIdFromAuth(authentication);
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            
            List<Order> orders = orderRepository.findByRestaurantIdAndCreatedAtAfter(
                restaurantId, startDate);
            
            BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double averageOrderValue = orders.isEmpty() ? 0.0 : 
                totalRevenue.doubleValue() / orders.size();
            
            // Find busiest day
            Map<LocalDate, Long> ordersPerDay = orders.stream()
                .collect(Collectors.groupingBy(
                    order -> order.getCreatedAt().toLocalDate(),
                    Collectors.counting()
                ));
            
            LocalDate busiestDay = ordersPerDay.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            Map<String, Object> revenueStats = new HashMap<>();
            revenueStats.put("totalRevenue", totalRevenue);
            revenueStats.put("averageOrderValue", averageOrderValue);
            revenueStats.put("totalOrders", orders.size());
            revenueStats.put("period", days + " days");
            revenueStats.put("busiestDay", busiestDay != null ? busiestDay.toString() : null);
            
            return ResponseEntity.ok(revenueStats);
        } catch (Exception e) {
            log.error("Error getting revenue analytics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private Long getRestaurantIdFromAuth(Authentication authentication) {
        // This assumes the user object has restaurant information
        // You may need to adjust this based on your actual user model
        if (authentication != null && authentication.getPrincipal() instanceof com.orderflow.backend.model.User) {
            com.orderflow.backend.model.User user = (com.orderflow.backend.model.User) authentication.getPrincipal();
            return user.getRestaurant().getId();
        }
        throw new RuntimeException("Unable to determine restaurant ID from authentication");
    }
} 