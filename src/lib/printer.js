import WebBluetoothReceiptPrinter from "./webbluetooth-receipt-printer.esm";

const receiptPrinter = new WebBluetoothReceiptPrinter();

/** Connect to the printer... */
export async function handleConnectButtonClick() {
  await receiptPrinter.connect();
}
