package mls.sho.dms.application.users.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PinEncoder {
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
    
    public String encode(String pin) {
        // PINs are 4-6 digits, but we hash them like passwords
        return encoder.encode(pin);
    }
    
    public boolean matches(String rawPin, String encodedPin) {
        return encoder.matches(rawPin, encodedPin);
    }
}