"use client";

import { useState, type RefObject } from "react";

interface PDFExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

// Save and restore inline styles for an element
function saveStyles(el: HTMLElement, props: string[]) {
  const saved: Record<string, string> = {};
  for (const p of props) {
    saved[p] = el.style.getPropertyValue(p);
  }
  return saved;
}

function restoreStyles(el: HTMLElement, saved: Record<string, string>) {
  for (const [p, v] of Object.entries(saved)) {
    if (v) {
      el.style.setProperty(p, v);
    } else {
      el.style.removeProperty(p);
    }
  }
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

      // The content ref sits inside a max-w-7xl mx-auto px-4 py-6 container.
      // We need to remove those constraints so the capture fills the full width
      // with no centering gaps or padding.
      const overrides: { el: HTMLElement; saved: Record<string, string> }[] = [];

      // Override the captured element itself
      const elProps = ["width", "min-width"];
      overrides.push({ el, saved: saveStyles(el, elProps) });
      el.style.setProperty("width", "1600px", "important");
      el.style.setProperty("min-width", "1600px", "important");

      // Walk up ancestors and remove max-width, margin, and padding constraints
      let ancestor = el.parentElement;
      while (ancestor && ancestor !== document.body) {
        const computed = getComputedStyle(ancestor);
        const needsOverride =
          computed.maxWidth !== "none" ||
          computed.marginLeft === "auto" ||
          computed.paddingTop !== "0px" ||
          computed.paddingLeft !== "0px";

        if (needsOverride) {
          const props = ["max-width", "margin", "padding", "width", "min-width"];
          overrides.push({ el: ancestor, saved: saveStyles(ancestor, props) });
          ancestor.style.setProperty("max-width", "none", "important");
          ancestor.style.setProperty("margin", "0", "important");
          ancestor.style.setProperty("padding", "0", "important");
          ancestor.style.setProperty("width", "1600px", "important");
          ancestor.style.setProperty("min-width", "1600px", "important");
        }
        ancestor = ancestor.parentElement;
      }

      let canvas: HTMLCanvasElement;
      try {
        canvas = await toCanvas(el, {
          backgroundColor: "#00273B",
          pixelRatio: 1.5,
        });
      } finally {
        // Restore all overridden styles
        for (const { el: e, saved } of overrides) {
          restoreStyles(e, saved);
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

      const imgWidthMm = usableWidth;
      const pxPerMm = canvas.width / imgWidthMm;
      const sliceHeightPx = Math.floor(usableHeight * pxPerMm);
      const totalPages = Math.ceil(canvas.height / sliceHeightPx);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // Branding header
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
