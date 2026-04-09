package mls.sho.dms.fapi;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration specifically for FAPI-enabled endpoints.
 * Prioritizes the FapiGatewayFilter to validate internal gateway tokens.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class FapiSecurityConfig {

    private final FapiGatewayFilter fapiGatewayFilter;

    @Bean
    @Order(1)
    public SecurityFilterChain fapiFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**", "/auth/**", "/actuator/**")
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(AbstractHttpConfigurer::disable)
            .addFilterBefore(fapiGatewayFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/auth/**").permitAll() // Allow initial auth
                .anyRequest().authenticated()
            );
            // .requiresChannel(c -> c.anyRequest().requiresSecure()); // Disabled for local dev without SSL proxy

        return http.build();
    }
}
