package com.orderflow.backend.controller;

import com.orderflow.backend.model.Order;
import com.orderflow.backend.model.OrderItem;
import com.orderflow.backend.model.MenuItem;
import com.orderflow.backend.model.Restaurant;
import com.orderflow.backend.model.User;
import com.orderflow.backend.repository.OrderRepository;
import com.orderflow.backend.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AnalyticsController analyticsController;

    private User testUser;
    private Restaurant testRestaurant;
    private Order testOrder;
    private MenuItem testMenuItem;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        // Setup test data
        testRestaurant = new Restaurant();
        testRestaurant.setId(1L);
        testRestaurant.setName("Test Restaurant");

        testUser = new User();
        testUser.setId(1L);
        testUser.setRestaurant(testRestaurant);

        testMenuItem = new MenuItem();
        testMenuItem.setId(1L);
        testMenuItem.setName("Test Pizza");
        testMenuItem.setCategory("Pizza");
        testMenuItem.setPrice(new BigDecimal("15.99"));

        testOrderItem = new OrderItem();
        testOrderItem.setId(1L);
        testOrderItem.setMenuItem(testMenuItem);
        testOrderItem.setQuantity(2);
        testOrderItem.setUnitPrice(new BigDecimal("15.99"));
        testOrderItem.setTotalPrice(new BigDecimal("31.98"));

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setItems(Arrays.asList(testOrderItem));
        testOrder.setTotalAmount(new BigDecimal("31.98"));
        testOrder.setCreatedAt(LocalDateTime.now());

        // Setup security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getPrincipal()).thenReturn(testUser);
    }

    @Test
    void testGetDailyAnalytics() {
        // Given
        when(orderRepository.findByRestaurantIdAndCreatedAtBetween(any(), any(), any()))
            .thenReturn(Arrays.asList(testOrder));

        // When
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getDailyAnalytics(7, authentication);

        // Then
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
    }

    @Test
    void testGetTopSellingItems() {
        // Given
        when(orderRepository.findByRestaurantIdAndCreatedAtAfter(any(), any()))
            .thenReturn(Arrays.asList(testOrder));

        // When
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getTopSellingItems(7, authentication);

        // Then
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isEmpty());
    }

    @Test
    void testGetRevenueAnalytics() {
        // Given
        when(orderRepository.findByRestaurantIdAndCreatedAtAfter(any(), any()))
            .thenReturn(Arrays.asList(testOrder));

        // When
        ResponseEntity<Map<String, Object>> response = analyticsController.getRevenueAnalytics(7, authentication);

        // Then
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("totalRevenue"));
        assertTrue(response.getBody().containsKey("totalOrders"));
    }

    @Test
    void testGetDailyAnalyticsWithNoOrders() {
        // Given
        when(orderRepository.findByRestaurantIdAndCreatedAtBetween(any(), any(), any()))
            .thenReturn(Arrays.asList());

        // When
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getDailyAnalytics(7, authentication);

        // Then
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }
} 