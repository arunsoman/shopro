package mls.shopro.mplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.boot.autoconfigure.SpringBootApplication
@org.springframework.context.annotation.ComponentScan(basePackages = {"mls.shopro.mplace", "mls.sho.mplace"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = {"mls.shopro.mplace", "mls.sho.mplace"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = {"mls.shopro.mplace", "mls.sho.mplace"})
public class MarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarketplaceApplication.class, args);
    }
}
