package mls.sho.dms.common.enums;

public enum MenuEngClassification {
    WINNER,       // High GP  + High Mix  → keep & promote
    WORKHORSE,    // Low GP   + High Mix  → reprice or reformulate
    OPPORTUNITY,  // High GP  + Low Mix   → market more aggressively
    LOSER         // Low GP   + Low Mix   → reconsider or remove
}
