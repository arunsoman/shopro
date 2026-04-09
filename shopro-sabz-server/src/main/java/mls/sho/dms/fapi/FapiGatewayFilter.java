package mls.sho.dms.fapi;

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

/**
 * Validates the internal JWT header injected by the FAPI Gateway.
 * This ensures that only requests processed by the gateway (with DPoP/MTLS verified) 
 * reach the application services.
 */
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

            Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(props.issuer())
                .clockSkewSeconds(props.tokenTtlLeewaySeconds())
                .build()
                .parseSignedClaims(token)
                .getPayload();

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
