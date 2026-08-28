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

/**
 * Send Automated Consignment Invoice & Delivery Receipt to Receiver
 */
export async function sendDeliveryInvoiceEmail({
  receiverEmail,
  receiverName,
  shipmentCode,
  pickupCity,
  destinationCity,
  weightKg,
  commodity,
  totalAmountInr,
  deliveredAt,
  driverName,
  vehicleCode,
}: {
  receiverEmail: string;
  receiverName: string;
  shipmentCode: string;
  pickupCity: string;
  destinationCity: string;
  weightKg: number;
  commodity: string;
  totalAmountInr: number;
  deliveredAt: string;
  driverName?: string;
  vehicleCode?: string;
}) {
  const invoiceNumber = `INV-${shipmentCode.replace(/[^A-Za-z0-9]/g, '')}`;
  const subject = `[FleetMind AI] Official Tax Invoice & Delivery Receipt - ${shipmentCode} (#${invoiceNumber})`;
  const formattedDate = new Date(deliveredAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0B1F44 0%, #1677FF 100%); padding: 28px 24px; text-align: left; color: white;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">FleetMind <span style="color: #60A5FA;">AI</span></h1>
              <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Official Tax Invoice & Delivery Receipt</p>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #6EE7B7; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">✓ DELIVERED</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Content -->
      <div style="padding: 28px 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${receiverName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Your freight consignment has been successfully handed over and cryptographically verified at <strong>${destinationCity}</strong> on <strong>${formattedDate}</strong>. Below is your official freight receipt and tax invoice.
        </p>

        <!-- Invoice Details Table -->
        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; width: 40%;">Invoice No.</td>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #0f172a; font-family: monospace;">${invoiceNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Consignment Code</td>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 800; color: #1677FF; font-family: monospace;">${shipmentCode}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Route Corridor</td>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #334155;">${pickupCity} ➔ ${destinationCity}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Cargo Details</td>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #334155;">${commodity} (${weightKg.toLocaleString()} kg)</td>
          </tr>
          ${driverName ? `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Fulfillment Carrier</td>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #334155;">${driverName} (${vehicleCode || 'Fleet Vehicle'})</td>
          </tr>` : ''}
          <tr style="background: #eff6ff;">
            <td style="padding: 12px 14px; font-size: 12px; color: #1e40af; font-weight: 900; text-transform: uppercase;">Total Freight Tariff</td>
            <td style="padding: 12px 14px; font-size: 18px; font-weight: 900; color: #1e3a8a;">₹${totalAmountInr.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <!-- Verification Stamp -->
        <div style="border-left: 3px solid #10B981; padding-left: 12px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #047857; margin: 0; font-weight: bold;">
            ✓ Delivery Verified via OTP & Digital Signature Handshake
          </p>
          <p style="font-size: 11px; color: #64748b; margin: 2px 0 0;">
            Proof of Delivery (POD) has been archived in the tamper-proof ledger.
          </p>
        </div>

        <p style="font-size: 11px; color: #94a3b8; margin: 0;">
          For invoice inquiries or GST reconciliation, please reach us at <strong>billing@fleetmind.ai</strong>.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        FleetMind AI • Autonomous Fleet Load & Route Decision Platform
      </div>
    </div>
  `;

  return sendEmail({ to: receiverEmail, subject, html });
}
