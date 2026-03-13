import 'dart:convert';
import 'dart:math';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class DPoPService {
  // For MVP/Demo, we use a fixed RSA key pair.
  // In a real Guest app where we don't want to install anything (Flutter Web),
  // we would ideally generate this per-session.
  static final String _privateKeyPem = '''
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA7V+4l2Q2y...
-----END RSA PRIVATE KEY-----
''';

  static RSAPrivateKey? _cachedKey;

  static RSAPrivateKey get _key {
    return _cachedKey ??= RSAPrivateKey(_privateKeyPem);
  }

  static String _generateJti() {
    final rand = Random.secure();
    final values = List<int>.generate(16, (i) => rand.nextInt(256));
    return base64Url.encode(values).replaceAll('=', '');
  }

  /// Generates a DPoP proof JWT for the given request.
  static String generateProof(String htm, String htu) {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    
    // In a real FAPI world, the JWK must be in the header.
    // For now, we use RS256 with a known key for simulation.
    final jwt = JWT(
      {
        'jti': _generateJti(),
        'htm': htm.toUpperCase(),
        'htu': htu.split('?')[0],
        'iat': now,
      },
      header: {
        'typ': 'dpop+jwt',
        'alg': 'RS256',
        'jwk': {
          'kty': 'RSA',
          'n': '...', // Should be exported from public key
          'e': 'AQAB',
        },
      },
    );

    return jwt.sign(_key, algorithm: JWTAlgorithm.RS256);
  }
}
