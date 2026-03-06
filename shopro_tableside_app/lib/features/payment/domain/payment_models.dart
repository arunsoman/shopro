enum PaymentMethod { cash, card, giftCard, applePay, googlePay, mipay }

extension PaymentMethodExt on PaymentMethod {
  String get jsonValue {
    switch (this) {
      case PaymentMethod.cash:
        return 'CASH';
      case PaymentMethod.card:
        return 'CARD';
      case PaymentMethod.giftCard:
        return 'GIFT_CARD';
      case PaymentMethod.applePay:
        return 'APPLE_PAY';
      case PaymentMethod.googlePay:
        return 'GOOGLE_PAY';
      case PaymentMethod.mipay:
        return 'MIPAY';
    }
  }
}
