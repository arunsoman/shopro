import 'dart:convert';
import 'dart:math';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:cryptography/cryptography.dart';

class DPoPService {
  // We use a persistent key pair for the session.
  // In a real app, this would be generated once and stored in secure storage.
  static KeyPair? _keyPair;
  static Map<String, dynamic>? _jwk;

  static String _generateRandomString(int length) {
    final rand = Random.secure();
    final values = List<int>.generate(length, (i) => rand.nextInt(256));
    return base64Url.encode(values).replaceAll('=', '');
  }

  static Future<void> _ensureKeyPair() async {
    if (_keyPair != null) return;

    final algorithm = Ed25519();
    _keyPair = await algorithm.newKeyPair();
    final publicKey = await _keyPair!.extractPublicKey();
    final bytes = (publicKey as SimplePublicKey).bytes;

    // Construct JWK for Ed25519 (OKP kty)
    _jwk = {
      'kty': 'OKP',
      'crv': 'Ed25519',
      'x': base64Url.encode(bytes).replaceAll('=', ''),
      'use': 'sig',
    };
  }

  /// Generates a DPoP proof JWT for the given request.
  /// [htm] HTTP Method (e.g., POST)
  /// [htu] HTTP URL (Absolute URL without query params)
  static Future<String> generateProof(String htm, String htu) async {
    await _ensureKeyPair();
    
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    
    // We use the dart_jsonwebtoken to create the structure, but we'll sign it manually 
    // if it doesn't support Ed25519 directly, or use its built-in support if available.
    // Actually, dart_jsonwebtoken supports EdDSA/Ed25519 via the EdDSASigner.
    
    final jwt = JWT(
      {
        'jti': _generateRandomString(16),
        'htm': htm.toUpperCase(),
        'htu': htu.split('?')[0], // strip query params per RFC 9449
        'iat': now,
        'exp': now + 120,
      },
      header: {
        'typ': 'dpop+jwt',
        'alg': 'EdDSA',
        'jwk': _jwk,
      },
    );

    // To sign EdDSA with dart_jsonwebtoken, we need the private key bytes.
    final privateKey = await _keyPair!.extract();
    final privateKeyBytes = (privateKey as SimpleKeyPairData).bytes;
    
    // Use EdDSA algorithm
    return jwt.sign(EdDSAPrivateKey(privateKeyBytes));
  }
}
