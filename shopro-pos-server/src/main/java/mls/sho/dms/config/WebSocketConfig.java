package mls.sho.dms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Use /topic for broadcasting (1-to-many) and /queue for direct messages (1-to-1)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages sent from clients to the server (e.g. @MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint clients will use to connect to the WebSocket server
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins for dev/demo purposes
                .withSockJS(); // Fallback option
                
        // Also add a raw websocket endpoint for clients not using SockJS
        registry.addEndpoint("/ws-raw")
                .setAllowedOriginPatterns("*");
    }
}
