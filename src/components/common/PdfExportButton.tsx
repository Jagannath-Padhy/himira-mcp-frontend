import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';

type AllowedTargetRef = React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement | null>;

interface PdfExportButtonProps {
  targetRef: AllowedTargetRef;
}

const PdfExportButton = ({ targetRef }: PdfExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = targetRef.current as HTMLElement | null;
    if (!element) return;

    setIsExporting(true);

    const fallbackTextExport = () => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 12;
        const contentWidth = pageWidth - 2 * margin;
        let y = margin;

        pdf.setFontSize(14);
        pdf.setTextColor(25, 118, 210);
        pdf.text('Chat Conversation', margin, y);
        y += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Exported on: ${new Date().toLocaleString()}`, margin, y);
        y += 6;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;

        // Fallback: simple text content
        const text = element.innerText || '';
        const lines = pdf.splitTextToSize(text, contentWidth);
        const ensureSpace = (height: number) => {
          if (y + height > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
        };
        for (const line of lines) {
          ensureSpace(5);
          pdf.text(line, margin, y);
          y += 5;
        }

        const fileName = `chat-export-${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
      } catch (e) {
        console.error('Fallback export failed:', e);
        alert('Failed to export PDF. Please try again.');
      }
    };

    try {
      const getHtml2Canvas = async (): Promise<any | null> => {
        if (typeof window !== 'undefined' && (window as any).html2canvas) {
          return (window as any).html2canvas;
        }
        try {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load html2canvas'));
            document.head.appendChild(script);
          });
          return (window as any).html2canvas || null;
        } catch {
          return null;
        }
      };

      const html2canvas = await getHtml2Canvas();
      if (!html2canvas) throw new Error('html2canvas not available');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidthMm = pageWidth - margin * 2;
      const pxPerMm = canvas.width / imgWidthMm;
      const pageHeightPx = (pageHeight - margin * 2) * pxPerMm;

      let renderedHeightPx = 0;
      let pageIndex = 0;
      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx,
        );

        const sliceImgData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMm = sliceHeightPx / pxPerMm;
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceImgData, 'PNG', margin, margin, imgWidthMm, sliceHeightMm);

        renderedHeightPx += sliceHeightPx;
        pageIndex += 1;
      }

      const fileName = `chat-export-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.warn('High-fidelity export failed, using fallback text export.', err);
      fallbackTextExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Tooltip title={isExporting ? 'Generating PDF…' : 'Export chat as PDF'} arrow>
      <span>
        <IconButton
          onClick={handleExport}
          disabled={isExporting}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: 1,
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
            '&:active': { boxShadow: 1, transform: 'translateY(0)' },
            '&.Mui-disabled': { opacity: 0.6 },
          }}
        >
          {isExporting ? <CircularProgress size={18} /> : <PictureAsPdfIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default PdfExportButton;
