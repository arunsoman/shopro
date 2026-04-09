package mls.sho.dms.application.simulator.core;

import lombok.extern.slf4j.Slf4j;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * High-performance, storage-efficient binary logger for the simulator.
 * Records every agent activity with both real-world and simulation timestamps.
 */
@Slf4j
public class SimulationLogger implements AutoCloseable {
    private final DataOutputStream out;
    private final BufferedOutputStream bos;
    private final FileOutputStream fos;

    public SimulationLogger(Path logPath) throws IOException {
        Files.createDirectories(logPath.getParent());
        this.fos = new FileOutputStream(logPath.toFile(), false);
        this.bos = new BufferedOutputStream(fos);
        this.out = new DataOutputStream(bos);
        log.info("Binary simulation logger initialized at: {}", logPath.toAbsolutePath());
    }

    /**
     * Logs an agent event in a compact binary format.
     * Record Format [31+ bytes]:
     * - RealTime: Long (8 bytes)
     * - SimTime: Long (8 bytes)
     * - AgentType: Byte (1 byte)
     * - AgentId: Long (8 bytes)
     * - EventType: Byte (1 byte)
     * - Message: UTF String (2+ bytes)
     */
    public synchronized void logEvent(long simTimeMillis, byte agentType, long agentId, byte eventType, String message) {
        try {
            out.writeLong(System.currentTimeMillis()); 
            out.writeLong(simTimeMillis);           
            out.writeByte(agentType);
            out.writeLong(agentId);
            out.writeByte(eventType);
            out.writeUTF(message != null ? message : "");
        } catch (IOException e) {
            log.error("Binary log write failure: {}", e.getMessage());
        }
    }

    @Override
    public void close() throws IOException {
        if (out != null) {
            out.flush();
            out.close();
        }
        if (bos != null) bos.close();
        if (fos != null) fos.close();
        log.info("Simulation logger closed.");
    }

    public static final byte AGENT_CUSTOMER = 1;
    public static final byte AGENT_STAFF = 2;
    public static final byte AGENT_KITCHEN = 3;
    public static final byte AGENT_SYSTEM = 0;

    public static final byte EVENT_START = 1;
    public static final byte EVENT_TRANSITION = 2;
    public static final byte EVENT_ACTION = 3;
    public static final byte EVENT_FINISH = 4;
}
