package com.shopro.accounting.controller;

import com.shopro.accounting.dto.InvoiceDTO.*;
import com.shopro.accounting.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounting/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Record a new supplier invoice
     */
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
        @Valid @RequestBody InvoiceRequest request
    ) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    /**
     * Process payment for an invoice
     */
    @PostMapping("/pay")
    public ResponseEntity<InvoiceResponse> payInvoice(
        @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.ok(invoiceService.payInvoice(request));
    }
}
