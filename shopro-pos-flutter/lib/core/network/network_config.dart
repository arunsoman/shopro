import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class NetworkConfig {
  static const int port = 8080;

  static String get host {
    if (kIsWeb) {
      // Use the host from which the app was loaded (e.g. 192.168.1.5 or localhost)
      final uri = Uri.base;
      final webHost = uri.host;
      if (webHost.isNotEmpty) return webHost;
    }
    
    // Fallback for mobile emulators or specific platform logic
    try {
      if (!kIsWeb && Platform.isAndroid) {
        return '10.0.2.2';
      }
    } catch (_) {}
    
    return 'localhost';
  }

  static String get baseUrl {
    if (kDebugMode && kIsWeb) {
      return 'http://$host:$port/api/v1';
    }
    if (kDebugMode) {
      return 'http://$host:$port/api/v1';
    }
    // In production/docker, use relative paths or environment variables
    return '/api/v1';
  }

  static String get wsUrl {
    if (kIsWeb) {
      // On web we often use relative or the same host
      return 'ws://$host:$port/ws-raw';
    }
    // For mobile emulators
    return 'ws://$host:$port/ws-raw';
  }
}
