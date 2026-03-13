import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class NetworkConfig {
  static const int port = int.fromEnvironment('API_PORT', defaultValue: 8080);

  static String get host {
    if (kIsWeb) {
      // Use the host from which the app was loaded
      final uri = Uri.base;
      final webHost = uri.host;
      if (webHost.isNotEmpty) return webHost;
    }
    
    // Allow environment override
    const envHost = String.fromEnvironment('API_HOST');
    if (envHost.isNotEmpty) return envHost;
    
    // Fallback for mobile emulators or specific platform logic
    try {
      if (!kIsWeb && Platform.isAndroid) {
        return '10.0.2.2';
      }
    } catch (_) {}
    
    return 'shopro.afriqpay.com';
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
      if (kDebugMode) {
        return 'ws://$host:$port/ws-raw';
      }
      final uri = Uri.base;
      final protocol = uri.scheme == 'https' ? 'wss' : 'ws';
      // Use the same host and port as the current page.
      // This leverages the Nginx proxy for /ws-raw.
      final portString = uri.hasPort ? ':${uri.port}' : '';
      return '$protocol://${uri.host}$portString/ws-raw';
    }
    // For mobile emulators or specific environment overrides
    return 'ws://$host:$port/ws-raw';
  }
}
