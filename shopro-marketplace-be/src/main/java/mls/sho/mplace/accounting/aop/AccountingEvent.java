package mls.sho.mplace.accounting.aop;

import java.lang.annotation.*;

/**
 * Annotation to mark methods that trigger automated journal entries
 * in the double-entry accounting engine.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AccountingEvent {
    AccountingEventType type();
    String amountExpression()  default "";   // SpEL: "#result.totalAmount" or "#amount"
    String entityExpression()  default "";   // SpEL: "#result"
    String countryExpression() default "";   // SpEL: "#result.venue.countryIsoCode"
}
