import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Prescription } from './prescriptions';
import type { Patient } from './patients';

interface DoctorInfo {
  name: string;
  specialty?: string;
}

export async function generatePrescriptionPdf(
  prescription: Prescription,
  patient: Patient,
  doctor: DoctorInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const margin = 48;
  const pageWidth = page.getWidth();
  const contentWidth = pageWidth - margin * 2;

  // Same brand palette as the site (tailwind.config.js primary/accent).
  const primary = rgb(0.275, 0.251, 0.816); // #4640d0
  const accent = rgb(0.063, 0.718, 0.498); // #10b77f
  const dark = rgb(0.11, 0.11, 0.15);
  const gray = rgb(0.45, 0.45, 0.5);
  const lightGray = rgb(0.93, 0.93, 0.96);
  const white = rgb(1, 1, 1);

  const drawText = (
    text: string,
    x: number,
    y: number,
    size = 11,
    useFont = font,
    color = dark
  ) => {
    page.drawText(text, { x, y, size, font: useFont, color });
  };

  // ---- Header band ----
  const headerHeight = 90;
  page.drawRectangle({ x: 0, y: page.getHeight() - headerHeight, width: pageWidth, height: headerHeight, color: primary });
  page.drawRectangle({ x: 0, y: page.getHeight() - headerHeight - 4, width: pageWidth, height: 4, color: accent });

  drawText("Dr Baig's Clinic", margin, page.getHeight() - 38, 22, boldFont, white);
  drawText('Skin, Hair & Wellness Care', margin, page.getHeight() - 58, 10, italicFont, rgb(0.9, 0.9, 1));

  // "Rx" mark, top right of the header band
  drawText('Rx', pageWidth - margin - 34, page.getHeight() - 50, 34, boldFont, white);

  let y = page.getHeight() - headerHeight - 34;

  // ---- Doctor / date row ----
  drawText(`${doctor.name}${doctor.specialty ? '  ·  ' + doctor.specialty : ''}`, margin, y, 12, boldFont, primary);
  const dateLabel = new Date(prescription.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateWidth = font.widthOfTextAtSize(dateLabel, 11);
  drawText(dateLabel, pageWidth - margin - dateWidth, y, 11, font, gray);
  y -= 24;

  // ---- Patient info card ----
  const cardHeight = 56;
  page.drawRectangle({ x: margin, y: y - cardHeight, width: contentWidth, height: cardHeight, color: lightGray });
  const cardPad = 16;
  drawText('PATIENT', margin + cardPad, y - 20, 8, boldFont, gray);
  drawText(patient.name, margin + cardPad, y - 38, 13, boldFont, dark);

  const idLabel = 'PATIENT ID';
  const idLabelWidth = boldFont.widthOfTextAtSize(idLabel, 8);
  const idColX = pageWidth - margin - cardPad - Math.max(idLabelWidth, boldFont.widthOfTextAtSize(patient.patient_code, 13));
  drawText(idLabel, idColX, y - 20, 8, boldFont, gray);
  drawText(patient.patient_code, idColX, y - 38, 13, boldFont, primary);
  y -= cardHeight + 30;

  // ---- Diagnosis ----
  if (prescription.diagnosis) {
    drawText('DIAGNOSIS', margin, y, 9, boldFont, accent);
    y -= 16;
    drawText(prescription.diagnosis, margin, y, 11, font, dark);
    y -= 28;
  }

  // ---- Medications table ----
  drawText('MEDICATIONS', margin, y, 9, boldFont, accent);
  y -= 18;

  const colX = {
    name: margin,
    dosage: margin + contentWidth * 0.34,
    frequency: margin + contentWidth * 0.56,
    duration: margin + contentWidth * 0.8,
  };
  const headerRowY = y;
  page.drawRectangle({ x: margin, y: headerRowY - 4, width: contentWidth, height: 20, color: primary });
  drawText('Medicine', colX.name + 8, headerRowY, 9, boldFont, white);
  drawText('Dosage', colX.dosage, headerRowY, 9, boldFont, white);
  drawText('Frequency', colX.frequency, headerRowY, 9, boldFont, white);
  drawText('Duration', colX.duration, headerRowY, 9, boldFont, white);
  y -= 26;

  prescription.medications.forEach((med, i) => {
    const rowTop = y + 12;
    const rowHeight = med.notes ? 34 : 20;
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: rowTop - rowHeight, width: contentWidth, height: rowHeight, color: lightGray });
    }
    drawText(med.name, colX.name + 8, y, 10, boldFont, dark);
    drawText(med.dosage, colX.dosage, y, 10, font, dark);
    drawText(med.frequency, colX.frequency, y, 10, font, dark);
    drawText(med.duration, colX.duration, y, 10, font, dark);
    y -= 16;
    if (med.notes) {
      drawText(med.notes, colX.name + 8, y, 8.5, italicFont, gray);
      y -= 16;
    }
    y -= 2;
  });

  // ---- Additional notes ----
  if (prescription.notes) {
    y -= 14;
    drawText('ADDITIONAL NOTES', margin, y, 9, boldFont, accent);
    y -= 16;
    drawText(prescription.notes, margin, y, 10, font, dark);
    y -= 10;
  }

  // ---- Footer ----
  page.drawLine({ start: { x: margin, y: 70 }, end: { x: pageWidth - margin, y: 70 }, thickness: 0.75, color: lightGray });
  drawText("Dr Baig's Clinic — Skin, Hair & Wellness Care", margin, 52, 8.5, boldFont, gray);
  drawText(
    'This is a computer-generated prescription. Please follow the dosage exactly as prescribed.',
    margin,
    38,
    8,
    italicFont,
    gray
  );

  return pdfDoc.save();
}
