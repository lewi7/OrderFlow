package com.orderflow.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files from /static/** (frontend build)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        // Serve frontend routes from index.html for SPA routing
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward all non-API routes to index.html for SPA routing
        registry.addViewController("/").setViewName("forward:/static/index.html");
        registry.addViewController("/dashboard").setViewName("forward:/static/index.html");
        registry.addViewController("/kitchen").setViewName("forward:/static/index.html");
        registry.addViewController("/menu").setViewName("forward:/static/index.html");
        registry.addViewController("/settings").setViewName("forward:/static/index.html");
        registry.addViewController("/analytics").setViewName("forward:/static/index.html");
    }
} 