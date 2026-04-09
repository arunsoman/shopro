package mls.sho.dms.application.primecost.repository;

import mls.sho.dms.application.primecost.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findAllByRestaurantId(Long restaurantId);
    List<Employee> findAllByRestaurantIdAndActive(Long restaurantId, boolean active);
    List<Employee> findAllByRestaurantIdAndEmployeeTypeAndActive(Long restaurantId, Employee.EmployeeType employeeType, boolean active);
}
