package mls.sho.dms.config;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.security.FloorPlanPermissionInterceptor;
import mls.sho.dms.application.security.StaffAuthenticationInterceptor;
import mls.sho.dms.application.security.MarketplaceAuthenticationInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global HTTP configuration for the application.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FloorPlanPermissionInterceptor floorPlanPermissionInterceptor;
    private final StaffAuthenticationInterceptor staffAuthenticationInterceptor;
    private final MarketplaceAuthenticationInterceptor marketplaceAuthenticationInterceptor;
    private final FAPIInterceptor fapiInterceptor;

    @Override
    public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/v1/uploads/**")
                .addResourceLocations("file:/app/uploads/");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(fapiInterceptor)
                .addPathPatterns("/api/v1/**");

        registry.addInterceptor(floorPlanPermissionInterceptor)
                .addPathPatterns("/api/v1/floor-plan/**");
        
        registry.addInterceptor(staffAuthenticationInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns("/api/v1/marketplace/**", "/api/v1/uploads/**"); // Exclude uploads from auth

        registry.addInterceptor(marketplaceAuthenticationInterceptor)
                .addPathPatterns("/api/v1/marketplace/**");
    }
}
