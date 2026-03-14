"use client";

import { useState, type RefObject } from "react";

interface PDFExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

export default function PDFExportButton({ contentRef }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const el = contentRef.current;
    if (!el) return;

    setExporting(true);
    try {
      const [html2canvasModule, jspdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default ?? html2canvasModule;
      const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;

      const canvas = await html2canvas(el, {
        backgroundColor: "#00273B",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Branding header
      pdf.setFillColor(0, 39, 59); // #00273B
      pdf.rect(0, 0, pageWidth, 18, "F");
      pdf.setFontSize(14);
      pdf.setTextColor(252, 98, 0); // #FC6200
      pdf.text("Cresora ROI Analysis", 10, 12);
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      pdf.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageWidth - 10, 12, { align: "right" });

      // Content
      const contentTop = 20;
      const availableHeight = pageHeight - contentTop - 5;
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, "PNG", 5, contentTop, imgWidth, imgHeight);
      } else {
        // Scale to fit
        const scale = availableHeight / imgHeight;
        pdf.addImage(imgData, "PNG", 5, contentTop, imgWidth * scale, availableHeight);
      }

      pdf.save("cresora-roi-analysis.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="bg-[#003350] border border-[#003350]/60 text-white rounded-lg px-3 py-2 text-sm hover:border-[#FC6200] transition-colors disabled:opacity-50 min-h-[44px] whitespace-nowrap"
    >
      {exporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}
