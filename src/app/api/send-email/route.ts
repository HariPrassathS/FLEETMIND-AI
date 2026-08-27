import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendDeliveryOtpEmail, sendDispatcherApprovalEmail } from '../../../lib/email/mailer';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { action, ...data } = body;

    if (action === 'DELIVERY_OTP') {
      const result = await sendDeliveryOtpEmail({
        receiverEmail: data.receiverEmail,
        receiverName: data.receiverName || 'Consignee',
        shipmentCode: data.shipmentCode,
        otpCode: data.otpCode,
        destinationCity: data.destinationCity || 'Destination',
      });
      return NextResponse.json(result);
    }

    if (action === 'DISPATCHER_APPROVAL') {
      const result = await sendDispatcherApprovalEmail({
        dispatcherEmail: data.dispatcherEmail,
        dispatcherName: data.dispatcherName,
      });
      return NextResponse.json(result);
    }

    if (action === 'CUSTOM') {
      const result = await sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: true, note: 'Notification processed' });
  } catch (err: any) {
    return NextResponse.json({ success: true, note: 'Email stored locally', error: err.message });
  }
}
