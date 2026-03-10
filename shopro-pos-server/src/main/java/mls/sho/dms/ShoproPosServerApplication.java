package mls.sho.dms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShoproPosServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShoproPosServerApplication.class, args);
    }
}
