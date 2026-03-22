package mls.sho.mplace.controller;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.SubOrderDetailsDto;
import mls.sho.mplace.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/operator/sub-orders")
@RequiredArgsConstructor
public class OperatorSubOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<SubOrderDetailsDto> getAllSubOrders() {
        return orderService.getAllSubOrders();
    }

    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable UUID id, @RequestParam String status) {
        orderService.updateSubOrderStatus(id, status);
    }
}
