import 'dart:convert';
import 'dart:math';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class DPoPService {
  // Static key for the session (in a real app, this would be in secure storage)
  static final SecretKey _sessionKey = SecretKey(_generateRandomString(32));

  static String _generateRandomString(int length) {
    final rand = Random.secure();
    final values = List<int>.generate(length, (i) => rand.nextInt(256));
    return base64Url.encode(values);
  }

  /// Generates a DPoP proof JWT for the given request.
  /// [htm] HTTP Method (e.g., POST)
  /// [htu] HTTP URL (Absolute URL without query params)
  static String generateProof(String htm, String htu) {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    
    final jwt = JWT(
      {
        'jti': _generateRandomString(16),
        'htm': htm.toUpperCase(),
        'htu': htu,
        'iat': now,
        'exp': now + 120, // Valid for 2 minutes
      },
      header: {
        'typ': 'dpop+jwt',
        'alg': 'HS256',
        // In a real FAPI implementation, we would include the public key (jwk) here.
      },
    );

    return jwt.sign(_sessionKey);
  }
}
