import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Prescription } from './prescriptions';
import type { Patient } from './patients';

interface DoctorInfo {
  name: string;
  specialty?: string;
  qualification?: string;
}

interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// A plain letterhead layout — clinic name/address top-right, doctor
// top-left, thin rules instead of colored bands/boxes. Matches the clean,
// simple reference the clinic asked to match, rather than a heavily
// "branded" document with filled color blocks.
export async function generatePrescriptionPdf(
  prescription: Prescription,
  patient: Patient,
  doctor: DoctorInfo,
  clinic: ClinicInfo = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const margin = 48;
  const pageWidth = page.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const accent = rgb(0.063, 0.5, 0.4); // clinic teal — used for headings/name only, no fills
  const dark = rgb(0.11, 0.11, 0.15);
  const gray = rgb(0.45, 0.45, 0.5);
  const rule = rgb(0.85, 0.85, 0.87);

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

  const drawRightAligned = (text: string, rightX: number, y: number, size: number, useFont = font, color = dark) => {
    const width = useFont.widthOfTextAtSize(text, size);
    drawText(text, rightX - width, y, size, useFont, color);
  };

  const drawRule = (y: number) => {
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.75, color: rule });
  };

  let y = page.getHeight() - margin;

  // ---- Doctor (left) / Clinic (right) header ----
  drawText(`Dr. ${doctor.name}`, margin, y, 16, boldFont, accent);
  if (doctor.qualification) drawText(doctor.qualification, margin, y - 16, 9.5, font, gray);
  if (doctor.specialty) drawText(doctor.specialty, margin, y - (doctor.qualification ? 28 : 16), 9.5, font, gray);

  const clinicName = clinic.name || "Dr Baig's Clinic";
  drawRightAligned(clinicName, pageWidth - margin, y, 16, boldFont, accent);
  let clinicLineY = y - 16;
  if (clinic.address) {
    for (const line of clinic.address.split('\n')) {
      drawRightAligned(line, pageWidth - margin, clinicLineY, 9.5, font, gray);
      clinicLineY -= 13;
    }
  }
  if (clinic.phone) {
    drawRightAligned(`Phone No: ${clinic.phone}`, pageWidth - margin, clinicLineY, 9.5, boldFont, dark);
  }

  y -= 46;
  drawRule(y);
  y -= 22;

  // ---- Patient info rows ----
  const age = calculateAge(patient.date_of_birth);
  const ageGenderLabel = [age !== null ? `${age}y` : null, patient.gender].filter(Boolean).join(', ') || '—';

  drawText('Patient Name & Patient Id:', margin, y, 9.5, boldFont, dark);
  drawText(
    `${patient.name}, ${patient.patient_code}`,
    margin + boldFont.widthOfTextAtSize('Patient Name & Patient Id: ', 9.5),
    y,
    9.5,
    font,
    dark
  );
  const dateLabel = new Date(prescription.created_at).toLocaleDateString('en-GB');
  drawRightAligned(`Date: ${dateLabel}`, pageWidth - margin, y, 9.5, font, dark);
  y -= 16;

  drawText('Age/Gender:', margin, y, 9.5, boldFont, dark);
  drawText(ageGenderLabel, margin + boldFont.widthOfTextAtSize('Age/Gender: ', 9.5), y, 9.5, font, dark);
  drawRightAligned(`Phone No: ${patient.phone}`, pageWidth - margin, y, 9.5, font, dark);
  y -= 20;

  drawRule(y);
  y -= 26;

  // Only rendered when they actually have data — an empty "Diagnosis:"
  // header with nothing under it looks broken, and most visits won't use
  // every section (see MEDISRAY_AUDIT.md finding #3).
  const drawBulletList = (title: string, items: string[]) => {
    if (items.length === 0) return;
    drawText(`${title} :`, margin, y, 11, boldFont, accent);
    y -= 18;
    for (const item of items) {
      drawText(`•  ${item}`, margin, y, 10.5, font, dark);
      y -= 16;
    }
    y -= 8;
  };

  // ---- Medical History ----
  if (prescription.medical_history) {
    drawText('Medical History :', margin, y, 11, boldFont, accent);
    y -= 18;
    for (const line of prescription.medical_history.split('\n')) {
      drawText(line, margin, y, 10, font, dark);
      y -= 14;
    }
    y -= 12;
  }

  // ---- Symptoms ----
  if (prescription.symptoms.length > 0) {
    drawText('Symptoms :', margin, y, 11, boldFont, accent);
    y -= 18;
    for (const s of prescription.symptoms) {
      const meta = [s.since && `since: ${s.since}`, s.severity && `severity: ${s.severity}`]
        .filter(Boolean)
        .join(', ');
      drawText(`•  ${s.value}${meta ? `  (${meta})` : ''}`, margin, y, 10.5, boldFont, dark);
      y -= 16;
    }
    y -= 8;
  }

  // ---- Diagnosis ----
  if (prescription.diagnosis) {
    drawText('Diagnosis :', margin, y, 11, boldFont, accent);
    y -= 20;
    drawText(`•  ${prescription.diagnosis}`, margin, y, 10.5, boldFont, dark);
    y -= 26;
  }

  drawBulletList('Examinations', prescription.examinations);

  // ---- Medications table (light rule-based, no filled header bar) ----
  if (prescription.medications.length > 0) {
    drawText('Medications :', margin, y, 11, boldFont, accent);
    y -= 20;

    const colX = {
      name: margin,
      dosage: margin + contentWidth * 0.34,
      frequency: margin + contentWidth * 0.56,
      duration: margin + contentWidth * 0.8,
    };
    drawText('Medicine', colX.name, y, 9, boldFont, gray);
    drawText('Dosage', colX.dosage, y, 9, boldFont, gray);
    drawText('Frequency', colX.frequency, y, 9, boldFont, gray);
    drawText('Duration', colX.duration, y, 9, boldFont, gray);
    y -= 8;
    drawRule(y);
    y -= 16;

    prescription.medications.forEach((med) => {
      drawText(med.name, colX.name, y, 10, boldFont, dark);
      drawText(med.dosage, colX.dosage, y, 10, font, dark);
      drawText(med.frequency, colX.frequency, y, 10, font, dark);
      drawText(med.duration, colX.duration, y, 10, font, dark);
      y -= 16;
      if (med.notes) {
        drawText(med.notes, colX.name, y, 8.5, italicFont, gray);
        y -= 15;
      }
    });
    y -= 12;
  }

  drawBulletList('Lab Investigation', prescription.investigations);
  drawBulletList('Advices', prescription.advices);

  // ---- Follow-up ----
  if (prescription.follow_up_date) {
    const followUpLabel = new Date(prescription.follow_up_date).toLocaleDateString('en-GB');
    drawText('Follow-up :', margin, y, 11, boldFont, accent);
    drawText(followUpLabel, margin + boldFont.widthOfTextAtSize('Follow-up : ', 11), y, 11, font, dark);
    y -= 28;
  }

  // ---- Additional notes ----
  if (prescription.additional_notes || prescription.notes) {
    drawText('Additional Notes :', margin, y, 11, boldFont, accent);
    y -= 18;
    drawText(prescription.additional_notes || prescription.notes || '', margin, y, 10, font, dark);
    y -= 12;
  }

  // ---- Footer ----
  drawRightAligned(`Dr. ${doctor.name}`, pageWidth - margin, 90, 11, boldFont, dark);
  const thankYou = 'Thank you for your visit. Wishing you good health.';
  const thankYouWidth = italicFont.widthOfTextAtSize(thankYou, 9);
  drawText(thankYou, (pageWidth - thankYouWidth) / 2, 40, 9, italicFont, gray);

  return pdfDoc.save();
}
