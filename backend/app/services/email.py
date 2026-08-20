import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

def send_booking_email(booking):
    if not SMTP_USER or not SMTP_PASS:
        print("[WARN] SMTP credentials missing. Skipping email dispatch.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Inspection Confirmed: {booking.service_title}"
    msg["From"] = f"CSA Chimney Service <{SMTP_USER}>"
    msg["To"] = booking.email

    text_body = f"""
    Hello {booking.full_name},

    Your chimney inspection has been scheduled!

    Service: {booking.service_title}
    Date: {booking.booking_date} at {booking.booking_time}
    Location: {booking.address}
    Total Price: ${booking.price:.2f}

    Thank you for choosing CSA Chimney Service.
    """

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border-top: 6px solid #f97316;">
          <div style="padding: 24px; background-color: #0a0a0a; color: #ffffff;">
            <h2 style="margin: 0; color: #f97316;">CSA Chimney Service</h2>
          </div>
          <div style="padding: 24px;">
            <h3>Inspection Booking Confirmed</h3>
            <p>Hi <strong>{booking.full_name}</strong>,</p>
            <p>We have scheduled your upcoming inspection:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td>{booking.service_title}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date & Time:</strong></td><td>{booking.booking_date} at {booking.booking_time}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td><td>{booking.address}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Price:</strong></td><td>${booking.price:.2f}</td></tr>
            </table>
          </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [booking.email], msg.as_string())
            print(f"[SUCCESS] Email confirmation sent to {booking.email}")
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}")


def send_status_update_email(to_email: str, subject: str, body: str):
    if not SMTP_USER or not SMTP_PASS:
        print("[WARN] SMTP credentials missing. Skipping email dispatch.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"CSA Chimney Service <{SMTP_USER}>"
    msg["To"] = to_email

    # Convert line breaks to HTML breaks for the HTML body
    formatted_html_body = body.replace("\n", "<br/>")

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border-top: 6px solid #f97316;">
          <div style="padding: 24px; background-color: #0a0a0a; color: #ffffff;">
            <h2 style="margin: 0; color: #f97316;">CSA Chimney Service</h2>
          </div>
          <div style="padding: 24px; line-height: 1.6; font-size: 14px;">
            <p>{formatted_html_body}</p>
          </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [to_email], msg.as_string())
            print(f"[SUCCESS] Status update email sent to {to_email}")
    except Exception as e:
        print(f"[ERROR] Failed to send status update email: {e}")