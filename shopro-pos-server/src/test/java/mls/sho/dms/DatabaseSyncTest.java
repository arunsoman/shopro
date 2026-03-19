package mls.sho.dms;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
@ActiveProfiles("test")
public class DatabaseSyncTest {

    @Autowired
    private EntityManager entityManager;

    @Test
    @Transactional(readOnly = true)
    void verifyAllEntitiesSyncWithDatabase() {
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
        
        System.out.println("Verifying " + entities.size() + " entities...");
        
        for (EntityType<?> entity : entities) {
            String entityName = entity.getName();
            Class<?> javaType = entity.getJavaType();
            
            if (javaType.isAnnotationPresent(Entity.class)) {
                System.out.println("Checking entity: " + entityName);
                assertDoesNotThrow(() -> {
                    // This will trigger Hibernate to validate the mapping against the DB
                    entityManager.createQuery("SELECT e FROM " + entityName + " e").setMaxResults(1).getResultList();
                }, "Entity " + entityName + " is not in sync with the database schema!");
            }
        }
    }
}
