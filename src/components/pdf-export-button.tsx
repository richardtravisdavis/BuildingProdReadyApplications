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
      const [{ toCanvas }, jspdfModule] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;

      // Temporarily override styles for a clean, wide capture.
      // The content sits inside a max-w-7xl mx-auto px-4 py-6 container,
      // which causes centering gaps and top padding in the captured image.
      const wrapper = el.parentElement;
      const saved = {
        el: { width: el.style.width, minWidth: el.style.minWidth, position: el.style.position },
        wrapper: wrapper ? {
          maxWidth: wrapper.style.maxWidth,
          margin: wrapper.style.margin,
          padding: wrapper.style.padding,
        } : null,
      };

      el.style.width = "1600px";
      el.style.minWidth = "1600px";
      el.style.position = "absolute";
      if (wrapper) {
        wrapper.style.maxWidth = "none";
        wrapper.style.margin = "0";
        wrapper.style.padding = "0";
      }

      let canvas: HTMLCanvasElement;
      try {
        canvas = await toCanvas(el, {
          backgroundColor: "#00273B",
          pixelRatio: 1.5,
        });
      } finally {
        el.style.width = saved.el.width;
        el.style.minWidth = saved.el.minWidth;
        el.style.position = saved.el.position;
        if (wrapper && saved.wrapper) {
          wrapper.style.maxWidth = saved.wrapper.maxWidth;
          wrapper.style.margin = saved.wrapper.margin;
          wrapper.style.padding = saved.wrapper.padding;
        }
      }

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const headerHeight = 18;
      const contentTop = headerHeight + 2;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - contentTop - margin;

      // Scale image to fill page width
      const imgWidthMm = usableWidth;

      // Slice the canvas into page-sized chunks
      const pxPerMm = canvas.width / imgWidthMm;
      const sliceHeightPx = Math.floor(usableHeight * pxPerMm);
      const totalPages = Math.ceil(canvas.height / sliceHeightPx);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Branding header on every page
        pdf.setFillColor(0, 39, 59);
        pdf.rect(0, 0, pageWidth, headerHeight, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(252, 98, 0);
        pdf.text("Cresora ROI Analysis", 10, 12);
        pdf.setFontSize(9);
        pdf.setTextColor(156, 163, 175);
        const dateStr = new Date().toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        });
        pdf.text(dateStr, pageWidth - 10, 12, { align: "right" });
        if (totalPages > 1) {
          pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth / 2, 12, { align: "center" });
        }

        // Slice this page's portion from the full canvas
        const srcY = page * sliceHeightPx;
        const srcH = Math.min(sliceHeightPx, canvas.height - srcY);
        const sliceMmH = srcH / pxPerMm;

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = srcH;
        const ctx = slice.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        const sliceData = slice.toDataURL("image/jpeg", 0.85);
        pdf.addImage(sliceData, "JPEG", margin, contentTop, imgWidthMm, sliceMmH);
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
