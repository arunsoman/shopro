package mls.sho.dms.fapi;

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
