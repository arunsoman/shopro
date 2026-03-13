import 'dart:convert';
import 'dart:math';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class DPoPService {
  // Static key for the session
  static final SecretKey _sessionKey = SecretKey(_generateRandomString(32));

  static String _generateRandomString(int length) {
    final rand = Random.secure();
    final values = List<int>.generate(length, (i) => rand.nextInt(256));
    return base64Url.encode(values);
  }

  /// Generates a DPoP proof JWT for the given request.
  static String generateProof(String htm, String htu) {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    
    final jwt = JWT(
      {
        'jti': _generateRandomString(16),
        'htm': htm.toUpperCase(),
        'htu': htu,
        'iat': now,
        'exp': now + 120,
      },
      header: {
        'typ': 'dpop+jwt',
        'alg': 'HS256',
      },
    );

    return jwt.sign(_sessionKey);
  }
}
