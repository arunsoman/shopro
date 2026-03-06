package mls.sho.dms.application.service.inventory;

import mls.sho.dms.entity.inventory.RawIngredient;

public interface AlertService {
    void sendSafetyStockAlert(RawIngredient ingredient);
    void sendCriticalStockAlert(RawIngredient ingredient);
    void dispatchEmail(String to, String subject, String body);
    void dispatchSms(String to, String body);
    void sendNotification(String to, String subject, String body);
}
