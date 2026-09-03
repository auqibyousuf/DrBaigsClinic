import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Invoice } from './invoices';
import type { Patient } from './patients';

interface DoctorInfo {
  name: string;
  specialty?: string;
}

export async function generateInvoicePdf(
  invoice: Invoice,
  patient: Patient,
  doctor: DoctorInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const pageWidth = page.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const primary = rgb(0.275, 0.251, 0.816);
  const accent = rgb(0.063, 0.718, 0.498);
  const dark = rgb(0.11, 0.11, 0.15);
  const gray = rgb(0.45, 0.45, 0.5);
  const lightGray = rgb(0.93, 0.93, 0.96);
  const white = rgb(1, 1, 1);

  const drawText = (text: string, x: number, y: number, size = 11, useFont = font, color = dark) => {
    page.drawText(text, { x, y, size, font: useFont, color });
  };
  const rightAlignedText = (text: string, rightX: number, y: number, size = 11, useFont = font, color = dark) => {
    const width = useFont.widthOfTextAtSize(text, size);
    drawText(text, rightX - width, y, size, useFont, color);
  };

  const headerHeight = 90;
  page.drawRectangle({ x: 0, y: page.getHeight() - headerHeight, width: pageWidth, height: headerHeight, color: primary });
  page.drawRectangle({ x: 0, y: page.getHeight() - headerHeight - 4, width: pageWidth, height: 4, color: accent });

  drawText("Dr Baig's Clinic", margin, page.getHeight() - 38, 22, boldFont, white);
  drawText('Invoice', pageWidth - margin - boldFont.widthOfTextAtSize('Invoice', 24), page.getHeight() - 42, 24, boldFont, white);

  let y = page.getHeight() - headerHeight - 34;

  drawText(`Invoice No: ${invoice.invoice_number}`, margin, y, 11, boldFont, primary);
  const dateLabel = new Date(invoice.bill_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  rightAlignedText(dateLabel, pageWidth - margin, y, 11, font, gray);
  y -= 18;
  drawText(doctor.name, margin, y, 10, font, gray);
  y -= 24;

  const cardHeight = 40;
  page.drawRectangle({ x: margin, y: y - cardHeight, width: contentWidth, height: cardHeight, color: lightGray });
  drawText('PATIENT', margin + 16, y - 16, 8, boldFont, gray);
  drawText(`${patient.name}  ·  ${patient.patient_code}  ·  ${patient.phone}`, margin + 16, y - 32, 11, boldFont, dark);
  y -= cardHeight + 30;

  const colX = {
    name: margin,
    qty: margin + contentWidth * 0.42,
    price: margin + contentWidth * 0.55,
    discount: margin + contentWidth * 0.7,
    gst: margin + contentWidth * 0.83,
    total: margin + contentWidth * 0.9,
  };
  const headerRowY = y;
  page.drawRectangle({ x: margin, y: headerRowY - 4, width: contentWidth, height: 20, color: primary });
  drawText('Item', colX.name + 8, headerRowY, 9, boldFont, white);
  drawText('Qty', colX.qty, headerRowY, 9, boldFont, white);
  drawText('Price', colX.price, headerRowY, 9, boldFont, white);
  drawText('Disc.', colX.discount, headerRowY, 9, boldFont, white);
  drawText('GST%', colX.gst, headerRowY, 9, boldFont, white);
  drawText('Total', colX.total, headerRowY, 9, boldFont, white);
  y -= 26;

  invoice.line_items.forEach((item, i) => {
    const base = item.qty * item.price_per_unit;
    const discount = item.discount_type === 'percent' ? (base * item.discount_value) / 100 : item.discount_value;
    const afterDiscount = Math.max(base - discount, 0);
    const total = afterDiscount + (afterDiscount * item.gst_percent) / 100;

    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 8, width: contentWidth, height: 20, color: lightGray });
    }
    drawText(item.name, colX.name + 8, y, 10, font, dark);
    drawText(String(item.qty), colX.qty, y, 10, font, dark);
    drawText(`Rs. ${item.price_per_unit.toFixed(2)}`, colX.price, y, 10, font, dark);
    drawText(
      item.discount_type === 'percent' ? `${item.discount_value}%` : `Rs. ${item.discount_value.toFixed(2)}`,
      colX.discount,
      y,
      10,
      font,
      dark
    );
    drawText(`${item.gst_percent}%`, colX.gst, y, 10, font, dark);
    drawText(`Rs. ${total.toFixed(2)}`, colX.total, y, 10, boldFont, dark);
    y -= 20;
  });

  y -= 16;
  page.drawLine({ start: { x: margin, y: y + 8 }, end: { x: pageWidth - margin, y: y + 8 }, thickness: 0.75, color: lightGray });

  const totalsX = pageWidth - margin - 180;
  drawText('Subtotal', totalsX, y, 10, font, gray);
  rightAlignedText(`Rs. ${invoice.subtotal.toFixed(2)}`, pageWidth - margin, y, 10, font, dark);
  y -= 16;
  drawText('GST', totalsX, y, 10, font, gray);
  rightAlignedText(`Rs. ${invoice.gst_amount.toFixed(2)}`, pageWidth - margin, y, 10, font, dark);
  y -= 16;
  if (invoice.extra_discount_value > 0) {
    drawText('Extra Discount', totalsX, y, 10, font, gray);
    rightAlignedText(
      invoice.extra_discount_type === 'percent'
        ? `${invoice.extra_discount_value}%`
        : `Rs. ${invoice.extra_discount_value.toFixed(2)}`,
      pageWidth - margin,
      y,
      10,
      font,
      dark
    );
    y -= 16;
  }
  drawText('Total Payable', totalsX, y, 12, boldFont, accent);
  rightAlignedText(`Rs. ${invoice.total_payable.toFixed(2)}`, pageWidth - margin, y, 12, boldFont, accent);
  y -= 18;
  drawText('Paid Amount', totalsX, y, 10, font, gray);
  rightAlignedText(`Rs. ${invoice.paid_amount.toFixed(2)}`, pageWidth - margin, y, 10, font, dark);
  y -= 16;
  const due = invoice.total_payable - invoice.paid_amount;
  drawText('Due', totalsX, y, 10, boldFont, due > 0 ? rgb(0.8, 0.2, 0.2) : gray);
  rightAlignedText(`Rs. ${due.toFixed(2)}`, pageWidth - margin, y, 10, boldFont, due > 0 ? rgb(0.8, 0.2, 0.2) : gray);

  if (invoice.payments.length > 0) {
    y -= 26;
    drawText('PAYMENT', margin, y, 9, boldFont, accent);
    y -= 16;
    for (const p of invoice.payments) {
      drawText(`${p.mode}: Rs. ${p.amount.toFixed(2)}`, margin, y, 10, font, dark);
      y -= 15;
    }
  }

  if (invoice.notes) {
    y -= 14;
    drawText('NOTES', margin, y, 9, boldFont, accent);
    y -= 16;
    drawText(invoice.notes, margin, y, 10, font, dark);
  }

  page.drawLine({ start: { x: margin, y: 70 }, end: { x: pageWidth - margin, y: 70 }, thickness: 0.75, color: lightGray });
  drawText("Dr Baig's Clinic — Skin, Hair & Wellness Care", margin, 52, 8.5, boldFont, gray);

  return pdfDoc.save();
}
