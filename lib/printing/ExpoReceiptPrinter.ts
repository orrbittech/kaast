import * as Print from "expo-print";
import type { ReceiptPrintPayload, ReceiptPrinter } from "./ReceiptPrinter";

function centsToRand(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}

class ExpoReceiptPrinter implements ReceiptPrinter {
  async print(payload: ReceiptPrintPayload): Promise<void> {
    const html = `
      <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>KARR Receipt</h2>
        <p><strong>Booking:</strong> ${payload.bookingCode}</p>
        <p><strong>Plate:</strong> ${payload.plate}</p>
        <p><strong>Service:</strong> ${payload.washPackageName}</p>
        <p><strong>Amount paid:</strong> ${centsToRand(payload.amountPaidCents)}</p>
        <p><strong>Outstanding:</strong> ${centsToRand(payload.outstandingCents)}</p>
      </body>
      </html>
    `;
    await Print.printAsync({ html });
  }
}

export const expoReceiptPrinter = new ExpoReceiptPrinter();
