import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static ThemeData light() {
    const primaryColor = Color(0xFF2563EB);
    const secondaryColor = Color(0xFF0F172A);
    const surfaceColor = Color(0xFFFFFFFF);
    const backgroundColor = Color(0xFFF8FAFC);

    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
      secondary: const Color(0xFF0EA5E9),
      tertiary: const Color(0xFF10B981),
      background: backgroundColor,
      surface: surfaceColor,
      surfaceVariant: const Color(0xFFF1F5F9),
      error: const Color(0xFFEF4444),
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onBackground: secondaryColor,
      onSurface: secondaryColor,
      brightness: Brightness.light,
    );

    final textTheme = GoogleFonts.interTextTheme().apply(
      bodyColor: secondaryColor,
      displayColor: secondaryColor,
    );

    return ThemeData(
      colorScheme: colorScheme,
      scaffoldBackgroundColor: backgroundColor,
      useMaterial3: true,
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: -1,
          height: 1.2,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(fontSize: 16, height: 1.6),
        bodyMedium: textTheme.bodyMedium?.copyWith(fontSize: 14, height: 1.5),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: secondaryColor,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: secondaryColor,
        ),
        iconTheme: const IconThemeData(color: secondaryColor),
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        color: surfaceColor,
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ).copyWith(
          elevation: MaterialStateProperty.resolveWith<double>((
            Set<MaterialState> states,
          ) {
            if (states.contains(MaterialState.pressed)) {
              return 2;
            }
            return 0;
          }),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          side: const BorderSide(color: primaryColor, width: 1.5),
          textStyle: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 2),
        ),
        labelStyle: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade600),
        hintStyle: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade400),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFE0F2FE),
        labelStyle: textTheme.bodySmall?.copyWith(
          color: primaryColor,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: Colors.grey.shade600,
        selectedLabelStyle: textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.w600,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: DividerThemeData(
        color: Colors.grey.shade200,
        thickness: 1,
        space: 1,
      ),
    );
  }

  static ThemeData dark() {
    const primaryColor = Color(0xFF60A5FA);
    const secondaryColor = Color(0xFFF1F5F9);
    const surfaceColor = Color(0xFF1E293B);
    const backgroundColor = Color(0xFF0F172A);

    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
      secondary: const Color(0xFF38BDF8),
      tertiary: const Color(0xFF34D399),
      background: backgroundColor,
      surface: surfaceColor,
      surfaceVariant: const Color(0xFF334155),
      error: const Color(0xFFF87171),
      onPrimary: Colors.black,
      onSecondary: Colors.black,
      onBackground: secondaryColor,
      onSurface: secondaryColor,
      brightness: Brightness.dark,
    );

    final textTheme = GoogleFonts.interTextTheme().apply(
      bodyColor: secondaryColor,
      displayColor: secondaryColor,
    );

    return ThemeData(
      colorScheme: colorScheme,
      scaffoldBackgroundColor: backgroundColor,
      useMaterial3: true,
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: -1,
          height: 1.2,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(fontSize: 16, height: 1.6),
        bodyMedium: textTheme.bodyMedium?.copyWith(fontSize: 14, height: 1.5),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: secondaryColor,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: secondaryColor,
        ),
        iconTheme: const IconThemeData(color: secondaryColor),
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.grey.shade800, width: 1),
        ),
        color: surfaceColor,
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.black,
          elevation: 0,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          side: const BorderSide(color: primaryColor, width: 1.5),
          textStyle: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFF87171), width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFF87171), width: 2),
        ),
        labelStyle: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade400),
        hintStyle: textTheme.bodyMedium?.copyWith(color: Colors.grey.shade500),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFF1E3A5F),
        labelStyle: textTheme.bodySmall?.copyWith(
          color: primaryColor,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primaryColor,
        foregroundColor: Colors.black,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: primaryColor,
        unselectedItemColor: Colors.grey.shade500,
        selectedLabelStyle: textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.w600,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: DividerThemeData(
        color: Colors.grey.shade800,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
