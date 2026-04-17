package mls.sho.dms.application.purchasing.repository;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.Arrays;
import java.util.List;

/**
 * Repository for aggregated purchasing hub queries.
 * Provides optimized single-query access to hub counts.
 */
@Repository
public class PurchasingHubRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Get all hub counts in a single database query.
     * Returns a list with 4 values:
     * [0] - reorder staging count (ingredients below par without pending POs)
     * [1] - purchase orders to send count (DRAFT, SENT, PARTIAL status)
     * [2] - goods receipts pending count (received GRNs without invoices)
     * [3] - three way match pending count (same as goods receipts pending)
     */
    @SuppressWarnings("unchecked")
    public List<Object> getHubCounts(Long restaurantId) {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM ingredient i 
                 WHERE i.restaurant_id = :restaurantId 
                 AND i.par_level IS NOT NULL 
                 AND i.on_hand < i.par_level 
                 AND i.is_active = true
                 AND NOT EXISTS (
                     SELECT 1 FROM purchase_order_line pol
                     JOIN purchase_order po ON po.id = pol.purchase_order_id
                     WHERE pol.ingredient_id = i.id 
                     AND po.status IN ('DRAFT', 'SENT', 'PARTIAL')
                 )) as reorder_staging_count,
                
                (SELECT COUNT(*) FROM purchase_order po 
                 WHERE po.restaurant_id = :restaurantId 
                 AND po.status IN ('DRAFT', 'SENT', 'PARTIAL')) as po_to_send_count,
                
                (SELECT COUNT(*) FROM goods_receipt gr 
                 WHERE gr.restaurant_id = :restaurantId 
                 AND gr.status = 'RECEIVED'
                 AND NOT EXISTS (
                     SELECT 1 FROM purchase_invoice pi 
                     WHERE pi.goods_receipt_id = gr.id
                 )) as goods_receipts_pending_count,
                
                (SELECT COUNT(*) FROM goods_receipt gr 
                 WHERE gr.restaurant_id = :restaurantId 
                 AND gr.status = 'RECEIVED'
                 AND NOT EXISTS (
                     SELECT 1 FROM purchase_invoice pi 
                     WHERE pi.goods_receipt_id = gr.id
                 )) as three_way_match_pending_count
            """;
        
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("restaurantId", restaurantId);
        
        return query.getResultList();
    }
}
