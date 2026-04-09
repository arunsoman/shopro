## PHASE 6 — Spring Boot Audit Layer

### 6.1 Detect base package

```bash
# From pom.xml <groupId> + first package-info.java or main class
grep -r "^package " src/main/java/ | head -1 | awk '{print $2}' | tr -d ';'
```

### 6.2 Generate Java files into `src/main/java/{{basePackage}}/fapi/`

#### `FapiGatewayProperties.java`
```java
package {{basePackage}}.fapi;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "fapi.gateway")
@Validated
public record FapiGatewayProperties(
    @NotBlank String internalSecret,
    @NotBlank String issuer,
    @NotBlank String audience,
    @Positive int    tokenTtlLeewaySeconds
) {}
```

#### `FapiAuthentication.java`
```java
package {{basePackage}}.fapi;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

public class FapiAuthentication extends AbstractAuthenticationToken {
    private final String subject;
    private final String clientId;
    private final String scope;

    public FapiAuthentication(String subject, String clientId, String scope,
                               Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.subject  = subject;
        this.clientId = clientId;
        this.scope    = scope;
        setAuthenticated(true);
    }

    @Override public Object getPrincipal()   { return subject;  }
    @Override public Object getCredentials() { return null;     }
    public String getClientId()              { return clientId; }
    public String getScope()                 { return scope;    }
}
```

#### `FapiGatewayFilter.java`
```java
package {{basePackage}}.fapi;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FapiGatewayFilter extends OncePerRequestFilter {

    private final FapiGatewayProperties props;

    @Override
    protected void doFilterInternal(HttpServletRequest  req,
                                    HttpServletResponse res,
                                    FilterChain         chain)
            throws ServletException, IOException {

        String token = req.getHeader("X-Fapi-Internal-Token");

        if (token == null || token.isBlank()) {
            sendError(res, 401, "missing_gateway_token",
                      "Request did not originate from FAPI gateway");
            return;
        }

        try {
            var key = Keys.hmacShaKeyFor(
                props.internalSecret().getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .requireIssuer(props.issuer())
                .setAllowedClockSkewSeconds(props.tokenTtlLeewaySeconds())
                .build()
                .parseClaimsJws(token)
                .getBody();

            // Audience check
            if (!props.audience().equals(claims.getAudience())) {
                throw new JwtException("Audience mismatch");
            }

            // FAPI attestation — gateway must certify it verified the request
            Boolean fapiVerified = claims.get("fapiVerified", Boolean.class);
            if (!Boolean.TRUE.equals(fapiVerified)) {
                throw new JwtException("fapiVerified flag not set — request not FAPI attested");
            }

            // Build Spring Authentication
            String sub      = claims.getSubject();
            String clientId = claims.get("clientId", String.class);
            String scope    = claims.get("scope",    String.class);
            Boolean dpop    = claims.get("dpopVerified", Boolean.class);

            List<SimpleGrantedAuthority> authorities = Arrays
                .stream((scope != null ? scope : "").split(" "))
                .filter(s -> !s.isBlank())
                .map(s -> new SimpleGrantedAuthority("SCOPE_" + s))
                .toList();

            var auth = new FapiAuthentication(sub, clientId, scope, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Expose as request attributes — use in controllers, audit logger
            req.setAttribute("fapi.sub",              sub);
            req.setAttribute("fapi.clientId",         clientId);
            req.setAttribute("fapi.scope",            scope);
            req.setAttribute("fapi.dpopVerified",     Boolean.TRUE.equals(dpop));
            req.setAttribute("fapi.interactionId",
                req.getHeader("X-Fapi-Interaction-Id"));
            req.setAttribute("fapi.dpopKeyThumbprint",
                req.getHeader("X-Fapi-Dpop-Key-Thumbprint"));

            log.debug("[FAPI] Request attested — sub={} client={} dpop={}", sub, clientId, dpop);
            chain.doFilter(req, res);

        } catch (ExpiredJwtException ex) {
            log.warn("[FAPI] Internal token expired: {}", ex.getMessage());
            sendError(res, 401, "gateway_token_expired", "Internal gateway token expired");
        } catch (JwtException ex) {
            log.warn("[FAPI] Internal token invalid: {}", ex.getMessage());
            sendError(res, 401, "invalid_gateway_token", ex.getMessage());
        }
    }

    private void sendError(HttpServletResponse res, int status,
                           String error, String desc) throws IOException {
        SecurityContextHolder.clearContext();
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write(
            String.format("{\"error\":\"%s\",\"error_description\":\"%s\"}", error, desc));
    }
}
```

#### `FapiAuditLogger.java`
```java
package {{basePackage}}.fapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FapiAuditLogger implements HandlerInterceptor {

    private final ObjectMapper objectMapper;
    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest req,
                              HttpServletResponse res, Object handler) {
        startTime.set(System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest  req,
                                HttpServletResponse res,
                                Object handler, Exception ex) {
        long duration = System.currentTimeMillis() - (startTime.get() != null ? startTime.get() : 0);
        startTime.remove();

        try {
            // Structured audit record — written to fapi-audit.log via Logback
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("ts",              Instant.now().toString());
            record.put("interactionId",   req.getAttribute("fapi.interactionId"));
            record.put("sub",             req.getAttribute("fapi.sub"));
            record.put("clientId",        req.getAttribute("fapi.clientId"));
            record.put("scope",           req.getAttribute("fapi.scope"));
            record.put("dpopVerified",    req.getAttribute("fapi.dpopVerified"));
            record.put("dpopThumbprint",  req.getAttribute("fapi.dpopKeyThumbprint"));
            record.put("method",          req.getMethod());
            record.put("path",            req.getRequestURI());
            record.put("status",          res.getStatus());
            record.put("durationMs",      duration);
            record.put("remoteIp",        req.getRemoteAddr());

            // Use dedicated "fapi-audit" logger — routed to separate file in logback.xml
            org.slf4j.LoggerFactory
                .getLogger("fapi-audit")
                .info(objectMapper.writeValueAsString(record));

        } catch (Exception logEx) {
            log.error("[FAPI] Audit logging failed", logEx);
        }
    }
}
```

#### `FapiSecurityConfig.java`
```java
package {{basePackage}}.fapi;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class FapiSecurityConfig {

    private final FapiGatewayFilter fapiGatewayFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(AbstractHttpConfigurer::disable)
            .addFilterBefore(fapiGatewayFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .anyRequest().authenticated()
            )
            .requiresChannel(c -> c.anyRequest().requiresSecure());

        return http.build();
    }
}
```

### 6.3 Patch `application.yml`

Append (original backed up first):
```yaml
fapi:
  gateway:
    internal-secret: ${FAPI_INTERNAL_SECRET}
    issuer: fapi-gateway
    audience: {{profile.sso.clientId}}-api
    token-ttl-leeway-seconds: 5

logging:
  file:
    name: logs/fapi-audit.log
```

Generate `src/main/resources/logback-spring.xml` additions:
```xml
<!-- Route fapi-audit logger to dedicated rolling file -->
<appender name="FAPI_AUDIT" class="ch.qos.logback.core.rolling.RollingFileAppender">
  <file>logs/fapi-audit.log</file>
  <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <fileNamePattern>logs/fapi-audit.%d{yyyy-MM-dd}.log.gz</fileNamePattern>
    <maxHistory>90</maxHistory>
  </rollingPolicy>
  <encoder>
    <pattern>%msg%n</pattern>  <!-- raw JSON only -->
  </encoder>
</appender>

<logger name="fapi-audit" level="INFO" additivity="false">
  <appender-ref ref="FAPI_AUDIT"/>
</logger>
```

### 6.4 Add Maven/Gradle dependencies

```xml
<!-- pom.xml additions -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
```

### PHASE 6 PASS CONDITIONS
- [ ] All 5 Java files generated in `src/main/java/{{basePackage}}/fapi/`
- [ ] Zero `{{...}}` placeholders remaining in any Java file
- [ ] `application.yml` patched (original backed up)
- [ ] `logback-spring.xml` updated
- [ ] `pom.xml` / `build.gradle` updated with jjwt deps
- [ ] `mvn compile` or `./gradlew compileJava` exits 0

---
