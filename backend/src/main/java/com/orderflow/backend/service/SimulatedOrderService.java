package com.orderflow.backend.service;

import com.orderflow.backend.model.*;
import com.orderflow.backend.repository.MenuItemRepository;
import com.orderflow.backend.repository.OrderRepository;
import com.orderflow.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulatedOrderService {
    
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    
    @Value("${orderflow.simulated-orders.enabled:true}")
    private boolean enabled;
    
    @Value("${orderflow.simulated-orders.interval-minutes:5}")
    private int intervalMinutes;
    
    private final Random random = new Random();
    
    private static final String[] CUSTOMER_NAMES = {
        "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
        "Lisa Anderson", "James Taylor", "Jennifer Martinez", "Robert Garcia", "Amanda Rodriguez"
    };
    
    private static final String[] CUSTOMER_PHONES = {
        "+1-555-0101", "+1-555-0102", "+1-555-0103", "+1-555-0104", "+1-555-0105"
    };
    
    @Scheduled(fixedRateString = "#{${orderflow.simulated-orders.interval-minutes} * 60 * 1000}")
    public void generateSimulatedOrder() {
        if (!enabled) {
            return;
        }
        
        try {
            List<Restaurant> restaurants = restaurantRepository.findAll();
            if (restaurants.isEmpty()) {
                log.info("No restaurants found for simulated orders");
                return;
            }
            
            // Pick a random restaurant
            Restaurant restaurant = restaurants.get(random.nextInt(restaurants.size()));
            
            // Get available menu items for this restaurant
            List<MenuItem> availableItems = menuItemRepository.findByRestaurantAndIsAvailableTrue(restaurant);
            if (availableItems.isEmpty()) {
                log.info("No available menu items for restaurant: {}", restaurant.getName());
                return;
            }
            
            // Generate order
            Order order = createSimulatedOrder(restaurant, availableItems);
            orderRepository.save(order);
            
            log.info("Generated simulated order: {} for restaurant: {}", 
                    order.getOrderNumber(), restaurant.getName());
            
        } catch (Exception e) {
            log.error("Error generating simulated order", e);
        }
    }
    
    private Order createSimulatedOrder(Restaurant restaurant, List<MenuItem> availableItems) {
        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setCustomerName(CUSTOMER_NAMES[random.nextInt(CUSTOMER_NAMES.length)]);
        order.setCustomerPhone(CUSTOMER_PHONES[random.nextInt(CUSTOMER_PHONES.length)]);
        order.setSource(getRandomSource());
        order.setStatus(Order.OrderStatus.NEW);
        order.setNotes("Simulated order from " + order.getSource());
        
        // Add 1-3 random items
        int itemCount = random.nextInt(3) + 1;
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (int i = 0; i < itemCount; i++) {
            MenuItem menuItem = availableItems.get(random.nextInt(availableItems.size()));
            int quantity = random.nextInt(2) + 1;
            
            OrderItem orderItem = new OrderItem();
            orderItem.setName(menuItem.getName());
            orderItem.setDescription(menuItem.getDescription());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(menuItem.getPrice());
            orderItem.setTotalPrice(menuItem.getPrice().multiply(BigDecimal.valueOf(quantity)));
            orderItem.setMenuItem(menuItem);
            
            order.addItem(orderItem);
            subtotal = subtotal.add(orderItem.getTotalPrice());
        }
        
        order.setSubtotal(subtotal);
        order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.08))); // 8% tax
        order.setTotalAmount(subtotal.add(order.getTaxAmount()));
        
        return order;
    }
    
    private Order.OrderSource getRandomSource() {
        Order.OrderSource[] sources = {
            Order.OrderSource.UberEats,
            Order.OrderSource.SkipTheDishes,
            Order.OrderSource.DoorDash
        };
        return sources[random.nextInt(sources.length)];
    }
} 