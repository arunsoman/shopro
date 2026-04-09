package mls.sho.dms.application.users.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

//@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Value("${spring.mail.from}")
    private String fromEmail;
    
    // ==================== GUEST EMAILS ====================
    
    @Async
    public void sendVerificationEmail(String to, String token) {
        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        
        Context context = new Context();
        context.setVariable("verificationLink", verificationLink);
        context.setVariable("expiresIn", "24 hours");
        
        String htmlContent = templateEngine.process("email/verification", context);
        
        sendHtmlEmail(to, "Verify Your Email", htmlContent);
    }
    
    @Async
    public void sendWelcomeEmail(String to, String displayName) {
        Context context = new Context();
        context.setVariable("displayName", displayName);
        
        String htmlContent = templateEngine.process("email/welcome", context);
        sendHtmlEmail(to, "Welcome to Restaurant App!", htmlContent);
    }
    
    // ==================== SHOPRO EMAILS ====================
    
    @Async
    public void sendPasswordResetEmail(String to, String username, String token) {
        String resetLink = frontendUrl + "/shopro/reset-password?token=" + token;
        
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("resetLink", resetLink);
        context.setVariable("expiresIn", "15 minutes");
        
        String htmlContent = templateEngine.process("email/password-reset", context);
        sendHtmlEmail(to, "Password Reset Request", htmlContent);
    }
    
    @Async
    public void sendPasswordChangedConfirmation(String to, String username) {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("timestamp", java.time.LocalDateTime.now().toString());
        
        String htmlContent = templateEngine.process("email/password-changed", context);
        sendHtmlEmail(to, "Your Password Was Changed", htmlContent);
    }
    
    @Async
    public void sendMfaBackupCodes(String to, String username, List<String> backupCodes) {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("backupCodes", backupCodes);
        
        String htmlContent = templateEngine.process("email/mfa-backup-codes", context);
        sendHtmlEmail(to, "Your MFA Backup Codes", htmlContent);
    }
    
    // ==================== SECURITY ALERTS ====================
    
    @Async
    public void sendSecurityAlert(String to, String alertType, String details) {
        Context context = new Context();
        context.setVariable("alertType", alertType);
        context.setVariable("details", details);
        context.setVariable("timestamp", java.time.LocalDateTime.now().toString());
        
        String htmlContent = templateEngine.process("email/security-alert", context);
        sendHtmlEmail(to, "Security Alert: " + alertType, htmlContent);
    }
    
    // ==================== CORE EMAIL METHODS ====================
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
            // Fallback to plain text
            sendPlainTextEmail(to, subject, "Please view this email in an HTML-capable client.");
        }
    }
    
    private void sendPlainTextEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            log.info("Plain text email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }
}