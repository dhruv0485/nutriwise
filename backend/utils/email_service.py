import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Email configuration from environment variables
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL")

# Validate required email settings
if not all([MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, NOTIFICATION_EMAIL]):
    raise ValueError("All email environment variables are required: MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, NOTIFICATION_EMAIL")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

class EmailService:
    def __init__(self):
        self.username = MAIL_USERNAME
        self.password = MAIL_PASSWORD
        self.from_email = MAIL_FROM
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT

    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None):
        """Send email with HTML content"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            # Attach text content if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_contact_confirmation(self, name: str, email: str, subject: str, message: str):
        """Send contact form confirmation email"""
        html_content = self._get_contact_confirmation_template(name, subject, message)
        text_content = f"""
        Thank you for contacting NutriWise!
        
        Dear {name},
        
        We have received your message regarding "{subject}" and will get back to you within 24 hours.
        
        Your message: {message}
        
        Best regards,
        The NutriWise Team
        """
        
        return self.send_email(
            to_email=email,
            subject="Thank you for contacting NutriWise!",
            html_content=html_content,
            text_content=text_content
        )

    def send_registration_welcome(self, name: str, email: str):
        """Send welcome email after registration"""
        html_content = self._get_registration_welcome_template(name)
        text_content = f"""
        Welcome to NutriWise!
        
        Dear {name},
        
        Thank you for joining NutriWise! We're excited to help you on your health journey.
        
        You can now:
        - Create personalized diet plans
        - Track your fitness goals
        - Book consultations with nutritionists
        - Access educational content
        
        Best regards,
        The NutriWise Team
        """
        
        return self.send_email(
            to_email=email,
            subject="Welcome to NutriWise! 🎉",
            html_content=html_content,
            text_content=text_content
        )

    def send_consultation_confirmation(self, name: str, email: str, consultation_data: dict):
        """Send consultation booking confirmation"""
        html_content = self._get_consultation_confirmation_template(name, consultation_data)
        text_content = f"""
        Consultation Booking Confirmed!
        
        Dear {name},
        
        Your consultation with {consultation_data.get('dietitian_name', 'Dr. Priya Singh')} has been confirmed.
        
        Details:
        - Date: {consultation_data.get('date', 'TBD')}
        - Time: {consultation_data.get('time', 'TBD')}
        - Type: {consultation_data.get('method', 'Video Call')}
        - Price: ₹{consultation_data.get('price', '1500')}
        
        We'll send you a reminder 1 hour before your appointment.
        
        Best regards,
        The NutriWise Team
        """
        
        return self.send_email(
            to_email=email,
            subject="Consultation Booking Confirmed! 📅",
            html_content=html_content,
            text_content=text_content
        )

    def send_admin_notification(self, notification_type: str, data: dict):
        """Send notification to admin"""
        html_content = self._get_admin_notification_template(notification_type, data)
        
        return self.send_email(
            to_email=NOTIFICATION_EMAIL,
            subject=f"NutriWise Notification: {notification_type}",
            html_content=html_content
        )

    def _get_contact_confirmation_template(self, name: str, subject: str, message: str):
        """Contact form confirmation email template"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank you for contacting NutriWise</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #374151;
                    margin-bottom: 20px;
                }}
                .message-box {{
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border: 2px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .message-subject {{
                    font-weight: 600;
                    color: #065f46;
                    margin-bottom: 10px;
                }}
                .message-text {{
                    color: #374151;
                    line-height: 1.6;
                }}
                .footer {{
                    background: #f9fafb;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #6b7280;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 10px;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">📧</div>
                    <div class="logo">NutriWise</div>
                    <h1>Message Received!</h1>
                    <p>We'll get back to you within 24 hours</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Dear <strong>{name}</strong>,
                    </div>
                    
                    <p>Thank you for reaching out to NutriWise! We have received your message and our team will review it shortly.</p>
                    
                    <div class="message-box">
                        <div class="message-subject">Subject: {subject}</div>
                        <div class="message-text">{message}</div>
                    </div>
                    
                    <p>We typically respond within 24 hours during business days. If you have an urgent matter, please don't hesitate to call us at +1 (555) 123-4567.</p>
                    
                    <p>In the meantime, you can explore our services:</p>
                    <ul>
                        <li>🎯 Personalized AI Diet Plans</li>
                        <li>📊 Goal Tracking & Analytics</li>
                        <li>👩‍⚕️ Expert Consultations</li>
                        <li>📚 Educational Resources</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p><strong>NutriWise</strong></p>
                    <p>Your Health Journey Starts Here</p>
                    <p>📧 hello@nutriwise.com | 📞 +1 (555) 123-4567</p>
                    <p>© 2024 NutriWise. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_registration_welcome_template(self, name: str):
        """Registration welcome email template"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to NutriWise!</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 32px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 20px;
                    color: #374151;
                    margin-bottom: 25px;
                }}
                .features {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 30px 0;
                }}
                .feature {{
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border: 2px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                }}
                .feature-icon {{
                    font-size: 32px;
                    margin-bottom: 10px;
                }}
                .feature-title {{
                    font-weight: 600;
                    color: #065f46;
                    margin-bottom: 8px;
                }}
                .feature-desc {{
                    font-size: 14px;
                    color: #374151;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: transform 0.2s;
                }}
                .cta-button:hover {{
                    transform: translateY(-2px);
                }}
                .footer {{
                    background: #f9fafb;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #6b7280;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 10px;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🎉</div>
                    <div class="logo">NutriWise</div>
                    <h1>Welcome to NutriWise!</h1>
                    <p>Your health journey starts now</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Welcome aboard, <strong>{name}</strong>! 🚀
                    </div>
                    
                    <p>We're thrilled to have you join the NutriWise family! You've just taken the first step towards a healthier, happier you.</p>
                    
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">🤖</div>
                            <div class="feature-title">AI Diet Plans</div>
                            <div class="feature-desc">Personalized nutrition plans tailored just for you</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📊</div>
                            <div class="feature-title">Goal Tracking</div>
                            <div class="feature-desc">Monitor your progress with detailed analytics</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">👩‍⚕️</div>
                            <div class="feature-title">Expert Consultations</div>
                            <div class="feature-desc">Connect with certified nutritionists</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📚</div>
                            <div class="feature-title">Education Hub</div>
                            <div class="feature-desc">Learn from nutrition myths and facts</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/dashboard" class="cta-button">Start Your Journey →</a>
                    </div>
                    
                    <p><strong>What's next?</strong></p>
                    <ol>
                        <li>Complete your health profile</li>
                        <li>Set your nutrition goals</li>
                        <li>Generate your first AI diet plan</li>
                        <li>Book a consultation with our experts</li>
                    </ol>
                </div>
                
                <div class="footer">
                    <p><strong>NutriWise</strong></p>
                    <p>Your Health Journey Starts Here</p>
                    <p>📧 hello@nutriwise.com | 📞 +1 (555) 123-4567</p>
                    <p>© 2024 NutriWise. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_consultation_confirmation_template(self, name: str, consultation_data: dict):
        """Consultation booking confirmation email template"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Consultation Confirmed</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #374151;
                    margin-bottom: 20px;
                }}
                .appointment-details {{
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border: 2px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #bbf7d0;
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .detail-label {{
                    font-weight: 600;
                    color: #065f46;
                }}
                .detail-value {{
                    color: #374151;
                }}
                .reminder {{
                    background: #fef3c7;
                    border: 2px solid #fbbf24;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .reminder h3 {{
                    color: #92400e;
                    margin-top: 0;
                }}
                .footer {{
                    background: #f9fafb;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #6b7280;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 10px;
                }}
                .icon {{
                    font-size: 48px;
                    margin-bottom: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">📅</div>
                    <div class="logo">NutriWise</div>
                    <h1>Consultation Confirmed!</h1>
                    <p>Your appointment is scheduled</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Dear <strong>{name}</strong>,
                    </div>
                    
                    <p>Great news! Your consultation has been successfully booked. We're excited to help you on your health journey!</p>
                    
                    <div class="appointment-details">
                        <h3 style="color: #065f46; margin-top: 0;">Appointment Details</h3>
                        
                        <div class="detail-row">
                            <span class="detail-label">👩‍⚕️ Nutritionist:</span>
                            <span class="detail-value">{consultation_data.get('dietitian_name', 'Dr. Priya Singh')}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">📅 Date:</span>
                            <span class="detail-value">{consultation_data.get('date', 'TBD')}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">⏰ Time:</span>
                            <span class="detail-value">{consultation_data.get('time', 'TBD')}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">📞 Method:</span>
                            <span class="detail-value">{consultation_data.get('method', 'Video Call')}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">💰 Price:</span>
                            <span class="detail-value">₹{consultation_data.get('price', '1500')}</span>
                        </div>
                    </div>
                    
                    <div class="reminder">
                        <h3>📢 Important Reminders</h3>
                        <ul>
                            <li>We'll send you a reminder 1 hour before your appointment</li>
                            <li>For video calls, ensure you have a stable internet connection</li>
                            <li>Prepare any questions you'd like to discuss</li>
                            <li>Have your current diet and health information ready</li>
                        </ul>
                    </div>
                    
                    <p><strong>Need to reschedule?</strong> Please contact us at least 24 hours before your appointment.</p>
                </div>
                
                <div class="footer">
                    <p><strong>NutriWise</strong></p>
                    <p>Your Health Journey Starts Here</p>
                    <p>📧 hello@nutriwise.com | 📞 +1 (555) 123-4567</p>
                    <p>© 2024 NutriWise. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_admin_notification_template(self, notification_type: str, data: dict):
        """Admin notification email template"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NutriWise Admin Notification</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 30px;
                }}
                .notification-details {{
                    background: #fef2f2;
                    border: 2px solid #fecaca;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .footer {{
                    background: #f9fafb;
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 5px 0;
                    color: #6b7280;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 NutriWise Admin Notification</h1>
                    <p>{notification_type}</p>
                </div>
                
                <div class="content">
                    <h2>New {notification_type}</h2>
                    
                    <div class="notification-details">
                        <pre style="white-space: pre-wrap; font-family: inherit;">{str(data)}</pre>
                    </div>
                    
                    <p>Please review and take appropriate action.</p>
                </div>
                
                <div class="footer">
                    <p><strong>NutriWise Admin Panel</strong></p>
                    <p>© 2024 NutriWise. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

# Create global email service instance
email_service = EmailService() 