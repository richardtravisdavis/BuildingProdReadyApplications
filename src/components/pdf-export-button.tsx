"use client";

import { useState, useEffect, type RefObject } from "react";

interface PDFExportButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
  onBeforeExport?: () => void;
  onAfterExport?: () => void;
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

function applyWidthOverrides(el: HTMLElement) {
  const overrides: { el: HTMLElement; saved: Record<string, string> }[] = [];

  const elProps = ["width", "min-width"];
  overrides.push({ el, saved: saveStyles(el, elProps) });
  el.style.setProperty("width", "1600px", "important");
  el.style.setProperty("min-width", "1600px", "important");

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

  return overrides;
}

function AnimatedDots() {
  return (
    <>
      <style>{`
        @keyframes dotCycle {
          0%, 24% { opacity: 0; }
          25%, 49% { opacity: 1; }
          50%, 100% { opacity: 1; }
        }
        @keyframes dotCycle2 {
          0%, 49% { opacity: 0; }
          50%, 74% { opacity: 1; }
          75%, 100% { opacity: 1; }
        }
        @keyframes dotCycle3 {
          0%, 74% { opacity: 0; }
          75%, 99% { opacity: 1; }
          100% { opacity: 0; }
        }
        .pdf-dot-1 { opacity: 0; animation: dotCycle 2s infinite; }
        .pdf-dot-2 { opacity: 0; animation: dotCycle2 2s infinite; }
        .pdf-dot-3 { opacity: 0; animation: dotCycle3 2s infinite; }
      `}</style>
      <span className="pdf-dot-1">.</span>
      <span className="pdf-dot-2">.</span>
      <span className="pdf-dot-3">.</span>
    </>
  );
}

export default function PDFExportButton({ contentRef, onBeforeExport, onAfterExport }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const el = contentRef.current;
    if (!el) return;

    setExporting(true);

    // Tell the calculator to render all tabs
    onBeforeExport?.();

    // Wait for React to re-render and the browser to paint the overlay + all tabs
    await new Promise((r) => setTimeout(r, 100));

    try {
      const [{ toCanvas }, jspdfModule] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default;

      // Apply width overrides to the container and ancestors
      const overrides = applyWidthOverrides(el);

      // Collect all capturable blocks: direct children of each section
      const sections = el.querySelectorAll<HTMLElement>("[data-pdf-section]");
      const blocks: HTMLElement[] = [];
      for (const section of sections) {
        for (const child of section.children) {
          if (child instanceof HTMLElement) {
            blocks.push(child);
          }
        }
      }

      // Capture each block as a separate canvas
      const blockCanvases: HTMLCanvasElement[] = [];
      try {
        for (const block of blocks) {
          // Skip blocks with zero height (hidden elements)
          if (block.offsetHeight === 0) continue;
          const canvas = await toCanvas(block, {
            backgroundColor: "#00273B",
            pixelRatio: 1.5,
          });
          blockCanvases.push(canvas);
        }
      } finally {
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

      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      let pageNum = 0;
      let cursorY = contentTop; // current Y position on page in mm
      let needsNewPage = true; // first block needs a page

      function addPage() {
        if (pageNum > 0) pdf.addPage();
        pageNum++;
        cursorY = contentTop;

        // Dark page background
        pdf.setFillColor(0, 39, 59);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        // Branding header
        pdf.setFillColor(0, 39, 59);
        pdf.rect(0, 0, pageWidth, headerHeight, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(252, 98, 0);
        pdf.text("Cresora ROI Analysis", 10, 12);
        pdf.setFontSize(9);
        pdf.setTextColor(156, 163, 175);
        pdf.text(dateStr, pageWidth - 10, 12, { align: "right" });
        pdf.text(`Page ${pageNum}`, pageWidth / 2, 12, { align: "center" });
      }

      // Place each block on pages, flowing naturally
      for (const canvas of blockCanvases) {
        const imgWidthMm = usableWidth;
        const pxPerMm = canvas.width / imgWidthMm;
        const blockHeightMm = canvas.height / pxPerMm;

        // If the block fits on one page
        if (blockHeightMm <= usableHeight) {
          // Check if it fits on the current page
          const remainingSpace = pageHeight - margin - cursorY;
          if (needsNewPage || remainingSpace < blockHeightMm) {
            addPage();
            needsNewPage = false;
          }

          const imgData = canvas.toDataURL("image/jpeg", 0.85);
          pdf.addImage(imgData, "JPEG", margin, cursorY, imgWidthMm, blockHeightMm);
          cursorY += blockHeightMm + 1; // 1mm gap between blocks
        } else {
          // Block is taller than one page — slice it
          const sliceHeightPx = Math.floor(usableHeight * pxPerMm);
          const totalSlices = Math.ceil(canvas.height / sliceHeightPx);

          for (let i = 0; i < totalSlices; i++) {
            addPage();
            needsNewPage = false;

            const srcY = i * sliceHeightPx;
            const srcH = Math.min(sliceHeightPx, canvas.height - srcY);
            const sliceMmH = srcH / pxPerMm;

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = srcH;
            const ctx = sliceCanvas.getContext("2d")!;
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

            const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);
            pdf.addImage(sliceData, "JPEG", margin, contentTop, imgWidthMm, sliceMmH);
            cursorY = contentTop + sliceMmH + 1;
          }
        }
      }

      pdf.save("cresora-roi-analysis.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      onAfterExport?.();
      setExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="bg-[#003350] border border-[#003350]/60 text-white rounded-lg px-3 py-2 text-sm hover:border-[#FC6200] transition-colors disabled:opacity-50 min-h-[44px] whitespace-nowrap"
      >
        Export PDF
      </button>

      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl">
          <div className="bg-[#00273B] border border-[#003350] rounded-2xl px-24 py-12 flex flex-col items-center gap-4 shadow-2xl">
            <svg className="animate-spin h-10 w-10 text-[#FC6200]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-white text-lg font-medium">Generating PDF<AnimatedDots /></p>
            <p className="text-gray-400 text-sm">This may take a few seconds</p>
          </div>
        </div>
      )}
    </>
  );
}
