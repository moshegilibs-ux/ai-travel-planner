import { jsPDF } from "jspdf";
import type {
  CustomItineraryDay,
  CustomItineraryInput,
} from "@/lib/generate-itinerary";

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y, { align: "right" });
  return y + lines.length * 7;
}

export function exportItineraryPdf(
  input: CustomItineraryInput,
  itinerary: CustomItineraryDay[],
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const rightX = 195;
  const maxWidth = 175;
  let y = 18;

  doc.setR2L(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`מסלול אישי ל${input.destination}`, rightX, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`יעד: ${input.destination}`, rightX, y, { align: "right" });
  y += 7;
  doc.text(`מספר ימים: ${input.days}`, rightX, y, { align: "right" });
  y += 7;
  doc.text(`תקציב: ${input.budget}`, rightX, y, { align: "right" });
  y += 7;
  doc.text(`סוג טיול: ${input.tripType}`, rightX, y, { align: "right" });
  y += 12;

  if (input.selectedFlight) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("טיסה שנבחרה", rightX, y, { align: "right" });
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(
      doc,
      `${input.selectedFlight.airline} ${input.selectedFlight.flightNumber}: ${input.selectedFlight.departureTime}-${input.selectedFlight.arrivalTime}, מחיר משוער $${input.selectedFlight.estimatedPrice}`,
      rightX,
      y,
      maxWidth,
    );
    y += 6;
  }

  itinerary.forEach((day) => {
    if (y > 255) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(day.title, rightX, y, { align: "right" });
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(doc, `בוקר: ${day.morning}`, rightX, y, maxWidth);
    y = addWrappedText(doc, `צהריים: ${day.afternoon}`, rightX, y, maxWidth);
    y = addWrappedText(doc, `ערב: ${day.evening}`, rightX, y, maxWidth);
    if (day.flightNotes?.length) {
      y = addWrappedText(
        doc,
        `הערות טיסה: ${day.flightNotes.join(" | ")}`,
        rightX,
        y,
        maxWidth,
      );
    }
    y = addWrappedText(
      doc,
      `אטרקציות: ${day.attractions.join(", ")}`,
      rightX,
      y,
      maxWidth,
    );
    y = addWrappedText(doc, `מסעדה: ${day.restaurant}`, rightX, y, maxWidth);
    y = addWrappedText(doc, `טיפ: ${day.dailyTip}`, rightX, y, maxWidth);
    y += 6;
  });

  doc.save(`itinerary-${input.destination}.pdf`);
}
