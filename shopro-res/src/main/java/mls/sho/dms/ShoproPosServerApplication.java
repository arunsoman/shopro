package mls.sho.dms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {RedisRepositoriesAutoConfiguration.class})
@EnableScheduling
@ConfigurationPropertiesScan
public class ShoproPosServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShoproPosServerApplication.class, args);
    }
}
