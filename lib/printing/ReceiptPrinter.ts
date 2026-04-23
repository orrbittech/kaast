export interface ReceiptPrintPayload {
  bookingCode: string;
  plate: string;
  washPackageName: string;
  amountPaidCents: number;
  outstandingCents: number;
}

export interface ReceiptPrinter {
  print(payload: ReceiptPrintPayload): Promise<void>;
}
