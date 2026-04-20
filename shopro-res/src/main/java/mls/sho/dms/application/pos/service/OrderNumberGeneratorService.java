package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class OrderNumberGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Generates a new unique order number across instances using a PostgreSQL sequence.
     * Format: ORD-YYYYMMDD-[5-digit sequence]
     */
    public String generateOrderNumber() {
        Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('order_number_seq')", Long.class);
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniquePart = String.format("%05d", nextVal);
        return "ORD-" + datePart + "-" + uniquePart;
    }
}
