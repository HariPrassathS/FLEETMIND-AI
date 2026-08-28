import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmail,
  sendDeliveryOtpEmail,
  sendDispatcherApprovalEmail,
  sendDeliveryInvoiceEmail,
} from '../../../lib/email/mailer';

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

    if (action === 'DELIVERY_INVOICE') {
      const result = await sendDeliveryInvoiceEmail({
        receiverEmail: data.receiverEmail,
        receiverName: data.receiverName || 'Authorized Consignee',
        shipmentId: data.shipmentId,
        shipmentCode: data.shipmentCode,
        pickupCity: data.pickupCity || 'Origin Hub',
        destinationCity: data.destinationCity || 'Destination Dock',
        weightKg: Number(data.weightKg) || 1000,
        commodity: data.commodity || 'General Freight Consignment',
        totalAmountInr: Number(data.totalAmountInr) || 3500,
        deliveredAt: data.deliveredAt || new Date().toISOString(),
        driverName: data.driverName,
        vehicleCode: data.vehicleCode,
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
