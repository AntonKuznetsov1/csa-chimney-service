import os
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
BOOKING_NOTIFICATION_EMAIL = os.getenv(
  "BOOKING_NOTIFICATION_EMAIL", "csachimney@gmail.com"
)


def _send_resend_email(to_addresses, subject, text_body, html_body):
  if not RESEND_API_KEY:
    print("[WARN] RESEND_API_KEY missing. Skipping email dispatch.")
    return

  request = Request(
    "https://api.resend.com/emails",
    data=json.dumps({
      "from": EMAIL_FROM,
      "to": to_addresses,
      "subject": subject,
      "text": text_body,
      "html": html_body,
    }).encode("utf-8"),
    headers={
      "Authorization": f"Bearer {RESEND_API_KEY}",
      "Content-Type": "application/json",
    },
    method="POST",
  )

  try:
    with urlopen(request, timeout=15) as response:
      response.read()
    print(f"[SUCCESS] Email sent to {', '.join(to_addresses)}")
  except (HTTPError, URLError, TimeoutError) as error:
    print(f"[ERROR] Failed to send email through Resend: {error}")

def send_booking_email(booking):
    recipients = list(dict.fromkeys([booking.email, BOOKING_NOTIFICATION_EMAIL]))

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

    _send_resend_email(
      recipients,
      f"New booking: {booking.service_title}",
      text_body,
      html_body,
    )


def send_status_update_email(to_email: str, subject: str, body: str):
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

    _send_resend_email([to_email], subject, body, html_body)