package mls.sho.mplace.repository;

import mls.sho.mplace.entity.MasterCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ContextConfiguration;
import mls.shopro.mplace.MarketplaceApplication;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@ContextConfiguration(classes = MarketplaceApplication.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
public class MasterCategoryRepositoryTest {

    @Autowired
    private MasterCategoryRepository masterCategoryRepository;

    @Test
    public void testSaveAndFetch() {
        MasterCategory parent = new MasterCategory();
        parent.setName("Parent Category");
        parent.setStorageCondition("AMBIENT");
        parent = masterCategoryRepository.save(parent);

        MasterCategory child = new MasterCategory();
        child.setName("Child Category");
        child.setParent(parent);
        masterCategoryRepository.save(child);

        MasterCategory fetched = masterCategoryRepository.findById(child.getId()).orElse(null);
        assertThat(fetched).isNotNull();
        assertThat(fetched.getName()).isEqualTo("Child Category");
        assertThat(fetched.getParent().getId()).isEqualTo(parent.getId());
    }
}
