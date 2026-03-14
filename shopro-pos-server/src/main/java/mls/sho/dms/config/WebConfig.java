package mls.sho.dms.config;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.security.FloorPlanPermissionInterceptor;
import mls.sho.dms.application.security.StaffAuthenticationInterceptor;
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

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(floorPlanPermissionInterceptor)
                .addPathPatterns("/api/v1/floor-plan/**");
        
        registry.addInterceptor(staffAuthenticationInterceptor)
                .addPathPatterns("/api/v1/**");
    }
}
