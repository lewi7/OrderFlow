package com.orderflow.backend.dto.auth;

import com.orderflow.backend.model.User;
import lombok.Data;

@Data
public class LoginResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private UserInfo user;
    
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }
    
    @Data
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private Long restaurantId;
        private String restaurantName;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.role = user.getRole().name();
            this.restaurantId = user.getRestaurant().getId();
            this.restaurantName = user.getRestaurant().getName();
        }
    }
} 