import 'dart:convert';
import 'dart:math';
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
    
    // Construct Header and Payload manually for precise control
    final header = {
      'typ': 'dpop+jwt',
      'alg': 'EdDSA',
      'jwk': _jwk,
    };
    
    final payload = {
      'jti': _generateRandomString(16),
      'htm': htm.toUpperCase(),
      'htu': htu.split('?')[0], // strip query params per RFC 9449
      'iat': now,
      'exp': now + 120,
    };

    final encodedHeader = base64Url.encode(utf8.encode(jsonEncode(header))).replaceAll('=', '');
    final encodedPayload = base64Url.encode(utf8.encode(jsonEncode(payload))).replaceAll('=', '');
    
    final messageToSign = '$encodedHeader.$encodedPayload';
    
    // Sign using pure cryptography package to avoid dart_jsonwebtoken compatibility issues with Java JJWT
    final algorithm = Ed25519();
    final signature = await algorithm.sign(
      utf8.encode(messageToSign),
      keyPair: _keyPair!,
    );
    
    final encodedSignature = base64Url.encode(signature.bytes).replaceAll('=', '');
    
    return '$messageToSign.$encodedSignature';
  }
}
