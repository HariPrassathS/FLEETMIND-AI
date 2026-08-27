import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const smtpUser = process.env.SMTP_USER || 'manikandanprabhu37@gmail.com';
const smtpPass = process.env.SMTP_PASS || 'vwawpfptwdcxhwcn';
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpFrom = process.env.SMTP_FROM || `"FleetMind AI" <${smtpUser}>`;

export function getMailTransporter() {
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.warn('SMTP Email delivery notice (running with resilient failover):', error?.message || error);
    return { success: false, error: error?.message || 'SMTP_FAILED' };
  }
}

/**
 * Send 6-Digit Delivery OTP to Consignee Receiver
 */
export async function sendDeliveryOtpEmail({
  receiverEmail,
  receiverName,
  shipmentCode,
  otpCode,
  destinationCity,
}: {
  receiverEmail: string;
  receiverName: string;
  shipmentCode: string;
  otpCode: string;
  destinationCity: string;
}) {
  const subject = `[FleetMind AI] Delivery Verification OTP for Consignment ${shipmentCode}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #1677FF; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">FleetMind AI</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Secure Delivery Handover Verification</p>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${receiverName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Your freight consignment <strong>${shipmentCode}</strong> has arrived at <strong>${destinationCity}</strong>. 
          Please provide the following 6-digit verification code to the driver upon physical receipt of your cargo:
        </p>
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Delivery One-Time Authorization Code</span>
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1677FF;">${otpCode}</span>
          <span style="font-size: 11px; color: #94a3b8; display: block; margin-top: 8px;">Valid for 10 minutes • Single use cryptographic handshake</span>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
          If you did not expect this consignment, please contact our 24/7 Operations Desk immediately at <strong>support@fleetmind.ai</strong>.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        FleetMind AI • Autonomous Fleet Load & Route Decision Platform
      </div>
    </div>
  `;

  return sendEmail({ to: receiverEmail, subject, html });
}

/**
 * Send Dispatcher Account Approval Notification
 */
export async function sendDispatcherApprovalEmail({
  dispatcherEmail,
  dispatcherName,
}: {
  dispatcherEmail: string;
  dispatcherName: string;
}) {
  const subject = `[FleetMind AI] Your Dispatcher Command Desk is Approved & Unlocked!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0B1F44; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">FleetMind <span style="color: #1677FF;">AI</span></h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Dispatcher Command Verification</p>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Welcome, <strong>${dispatcherName}</strong>!</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Your application for the <strong>FleetMind AI Dispatcher Command Desk</strong> has been reviewed and approved by the System Administrator.
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          You now have full access to autonomous load consolidation, deterministic 15-step VRP route optimization, live vehicle telemetry, and disruption management.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="http://localhost:3000/dispatcher/dashboard" style="background: #1677FF; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Launch Dispatcher Command Center
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: dispatcherEmail, subject, html });
}
