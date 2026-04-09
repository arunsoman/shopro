package mls.sho.dms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Registers the dedicated thread-pool used by the business simulator.
 * Runs simulations on a separate pool so they never block Tomcat request threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * One thread per restaurant simulation (simulations are sequential per restaurant,
     * but different restaurants can run concurrently).
     * corePoolSize=1 keeps RAM predictable; maxPoolSize=4 allows up to 4 parallel sims.
     */
    @Bean(name = "simulationExecutor")
    public Executor simulationExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(1);
        exec.setMaxPoolSize(4);
        exec.setQueueCapacity(10);
        exec.setThreadNamePrefix("sim-");
        exec.setWaitForTasksToCompleteOnShutdown(true);
        exec.setAwaitTerminationSeconds(60);
        exec.initialize();
        return exec;
    }
}
