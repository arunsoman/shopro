package mls.sho.dms.entity.menu;

/**
 * Lifecycle states for a menu item.
 * DRAFT        — created but not yet visible on any screen.
 * PUBLISHED    — visible on Server POS grid and Tableside mobile menu.
 * EIGHTY_SIXED — temporarily unavailable; visible but non-tappable on POS; hidden on Tableside.
 * ARCHIVED     — permanently retired; hidden everywhere; data preserved for historical records.
 */
public enum MenuItemStatus {
    DRAFT,
    PUBLISHED,
    EIGHTY_SIXED,
    ARCHIVED
}
