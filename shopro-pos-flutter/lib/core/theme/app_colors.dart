import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFFFF6B00); // Shopro Orange
  static const Color primaryDark = Color(0xFFE66000);
  static const Color secondary = Color(0xFF2D3436);

  // Neutral Colors (Premium Light)
  static const Color lightBackground = Color(0xFFF8F9FA);
  static const Color lightSurface = Colors.white;
  static const Color lightBorder = Color(0xFFE9ECEF);
  static const Color lightMuted = Color(0xFF6C757D);
  static const Color lightText = Color(0xFF212529);

  // Status Colors (Matching 11-State Machine)
  static const Color statusAvailable = Color(0xFF00C897); // Green
  static const Color statusHeld = Color(0xFFF8E71C);      // Yellow
  static const Color statusOccupied = Color(0xFF4A90E2);  // Blue
  static const Color statusOrdered = Color(0xFFBD10E0);   // Purple
  static const Color statusDelivered = Color(0xFFF5A623); // Orange
  static const Color statusDessert = Color(0xFFFF69B4);   // Pink
  static const Color statusCheckDropped = Color(0xFF2D3436); // Black
  static const Color statusPaying = Color(0xFF9E9E9E);    // Gray
  static const Color statusDirty = Color(0xFFD0021B);     // Red
  static const Color statusCleaning = Color(0xFF8B4513);  // Brown
  static const Color statusMaintenance = Color(0xFFFFFFFF); // White

  // Tag Display Colors (From Screenshot)
  static const Color tagSentBackground = Color(0xFFE6F4EA);
  static const Color tagSentText = Color(0xFF1E8E3E);
  static const Color tagHoldingBackground = Color(0xFFE8F0FE);
  static const Color tagHoldingText = Color(0xFF1967D2);
  static const Color tagPendingBackground = Color(0xFFF1F3F4);
  static const Color tagPendingText = Color(0xFF5F6368);

  // Waitlist Tag Colors
  static const Color waitLow = Color(0xFFF5A623); // Orange (15m)
  static const Color waitMedium = Color(0xFFD0021B); // Red (42m)
  static const Color waitReady = Color(0xFF417505); // Dark Green (READY)

  // Functional Colors
  static const Color warning = Color(0xFFFFC107);
  static const Color success = Color(0xFF28A745);
  static const Color error = Color(0xFFDC3545);
  static const Color readyTag = Color(
    0xFFFF6B00,
  ); // For the "Ready" orange highlight
}
