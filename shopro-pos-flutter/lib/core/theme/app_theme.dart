import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'app_spacing.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        surface: AppColors.lightSurface,
      ),
      scaffoldBackgroundColor: AppColors.lightBackground,
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.bold,
          color: AppColors.lightText,
        ),
        titleLarge: GoogleFonts.outfit(
          fontWeight: FontWeight.w600,
          color: AppColors.lightText,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          side: const BorderSide(color: AppColors.lightBorder),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightSurface,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }

  static ThemeData get emeraldTerminal {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.emeraldAccent,
        surface: AppColors.emeraldSurface,
        onSurface: AppColors.emeraldOffWhite,
        onPrimary: AppColors.emeraldBase,
      ),
      scaffoldBackgroundColor: AppColors.emeraldBase,
      textTheme: GoogleFonts.syneTextTheme().copyWith(
        displayLarge: GoogleFonts.syne(
          fontWeight: FontWeight.bold,
          color: AppColors.emeraldOffWhite,
        ),
        titleLarge: GoogleFonts.syne(
          fontWeight: FontWeight.w600,
          color: AppColors.emeraldOffWhite,
        ),
        bodyMedium: GoogleFonts.syne(
          color: AppColors.emeraldOffWhite,
        ),
        labelMedium: GoogleFonts.jetBrainsMono(
          color: AppColors.emeraldAccent,
        ),
        labelLarge: GoogleFonts.jetBrainsMono(
          fontWeight: FontWeight.bold,
          color: AppColors.emeraldOffWhite,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.emeraldSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.emeraldAccent,
          foregroundColor: AppColors.emeraldBase,
          textStyle: GoogleFonts.syne(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 32),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        ),
      ),
    );
  }
}
