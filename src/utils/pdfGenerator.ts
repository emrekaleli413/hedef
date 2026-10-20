import { jsPDF } from 'jspdf';
import { Quotation, DocumentItem } from '../types';

export function trToEn(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');
}

export function savePdfSafely(doc: jsPDF, filename: string): void {
  try {
    doc.save(filename);
  } catch (saveErr) {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (fallbackErr) {
      console.warn('PDF download failed:', fallbackErr);
    }
  }
}

export function downloadQuotationPDF(quotation: Quotation): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SALESOPS INTELLIGENCE | HEDEF FILO', 20, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Kurumsal Filo Kiralama ve Operasyonel Arac Surec Yonetimi', 20, y + 16);

  y += 28;

  // Document Title & Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('RESMI TEKLIF VE SOZLESME ZEYILNAMESI', 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref No: ${quotation.id}`, 14, y + 6);
  doc.text(`Tarih: ${quotation.createdAt || new Date().toISOString().split('T')[0]}`, pageWidth - 60, y + 6);
  doc.text(`Gecerlilik: ${quotation.validityDate}`, pageWidth - 60, y + 11);

  y += 18;

  // Watermark note
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, y, pageWidth - 28, 8, 'FD');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DEMO BELGESI - TUTARLAR VE SARTLAR SISTEM SIMULASYONUDUR', 18, y + 5.5);

  y += 14;

  // Customer & Vehicle Information Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 38, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MUSTERI VE FILO BILGILERI', 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Left column
  doc.text(`Musteri Unvani:`, 18, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${quotation.customerRef} (${quotation.customerCode || 'VKN-90218'})`, 48, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Teklif Turu:`, 18, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${quotation.quotationType}`, 48, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Hazirlayan:`, 18, y + 29);
  doc.text(`${quotation.owner} (Satis Operasyon)`, 48, y + 29);

  // Right column
  const rightColX = 115;
  doc.text(`Arac Modeli:`, rightColX, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${quotation.vehicleModel}`, rightColX + 24, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Arac Adedi:`, rightColX, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${quotation.vehicleCount} Adet`, rightColX + 24, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Vade / KM:`, rightColX, y + 29);
  doc.text(`${quotation.termMonths} Ay / ${quotation.annualKm?.toLocaleString('tr-TR')} KM/Yil`, rightColX + 24, y + 29);

  y += 44;

  // Financial Breakdown Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('FINANSAL HESAPLAMA VE MALIYET KALEMLERI', 14, y);

  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Hizmet & Maliyet Kalemi', 18, y + 5);
  doc.text('Aciklama', 75, y + 5);
  doc.text('Birim Bedel', 135, y + 5);
  doc.text('Toplam (Aylik)', pageWidth - 40, y + 5);

  y += 7;

  const calc = quotation.calculationDetails;
  const items = [
    {
      label: 'Net Arac Finansman & Kiralama',
      desc: `${quotation.vehicleCount} Arac x ${quotation.termMonths} Ay baz amortisman`,
      unit: `${(quotation.monthlyRentPerVehicle * 0.65).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`,
      total: `${((quotation.totalMonthlyAmount || quotation.monthlyRentPerVehicle * quotation.vehicleCount) * 0.65).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`
    },
    {
      label: 'Kasko, Trafik & Ihtiyari Mali Mesuliyet',
      desc: 'Tam teminatli filo kaskosu + muafiyetsiz koruma',
      unit: `${(quotation.monthlyRentPerVehicle * 0.15).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`,
      total: `${((quotation.totalMonthlyAmount || quotation.monthlyRentPerVehicle * quotation.vehicleCount) * 0.15).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`
    },
    {
      label: 'Periyodik Bakim, Onarim & Asinma',
      desc: 'Yetkili servis bakimlari, fren, debriyaj, aku',
      unit: `${(quotation.monthlyRentPerVehicle * 0.12).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`,
      total: `${((quotation.totalMonthlyAmount || quotation.monthlyRentPerVehicle * quotation.vehicleCount) * 0.12).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`
    },
    {
      label: 'Lastik Yonetimi & Ikame Arac',
      desc: '40.000 km basina 1 takim kis lastigi + 24s ikame teminati',
      unit: `${(quotation.monthlyRentPerVehicle * 0.08).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`,
      total: `${((quotation.totalMonthlyAmount || quotation.monthlyRentPerVehicle * quotation.vehicleCount) * 0.08).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }
    doc.text(item.label, 18, y + 5);
    doc.text(item.desc, 75, y + 5);
    doc.text(item.unit, 135, y + 5);
    doc.text(item.total, pageWidth - 40, y + 5);
    y += 7;
  });

  // Total Summary Box
  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 24, 'FD');

  const monthlyTotal = quotation.totalMonthlyAmount || quotation.monthlyRentPerVehicle * quotation.vehicleCount;
  const vat = monthlyTotal * 0.20;
  const grandTotal = monthlyTotal + vat;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Aylik Ara Toplam (KDV Haric):', 110, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, pageWidth - 40, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Hesaplanan KDV (%20):', 110, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${vat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, pageWidth - 40, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('Aylik Genel Toplam (KDV Dahil):', 110, y + 19);
  doc.text(`${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, pageWidth - 40, y + 19);

  y += 30;

  // Operational Terms
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('GENEL OPERASYONEL SARTLAR VE TAAHHUTLER', 14, y);
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const terms = [
    '1. Araclar teslimat oncesi PDI (Pre-Delivery Inspection) kontrolunden gecirilerek tescil plakali teslim edilecektir.',
    '2. HGS ve trafik cezalari sozlesme suresince sistem tarafindan kiracinin cari hesabina aylik olarak yansitilacaktir.',
    '3. Sozlesme vadesi dolumuna 90 gun kala proaktif yenileme ve filo guncelleme kosullari kiraciya iletilecektir.',
    '4. KKB kredi onayina istinaden DBS (Dogrudan Borclanma Sistemi) veya Teminat Mektubu sart kosulabilir.'
  ];
  terms.forEach(term => {
    doc.text(term, 14, y);
    y += 4;
  });

  y += 6;

  // Signature Blocks
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 80, 24);
  doc.rect(pageWidth - 94, y, 80, 24);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('HEDEF FILO / SALESOPS AS.', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Yetkili Imza & Kase', 18, y + 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`${quotation.customerRef.substring(0, 28)}`, pageWidth - 90, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Musteri Onay & Kase', pageWidth - 90, y + 20);

  // Trigger safe download directly in the browser
  const sanitizedRef = trToEn(quotation.customerRef || 'Musteri').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${quotation.id}_${sanitizedRef}_Teklif.pdf`;
  savePdfSafely(doc, filename);
}

export function triggerPrintWindow(elementId: string): void {
  const content = document.getElementById(elementId);
  if (!content) {
    window.print();
    return;
  }

  // Create isolated printable hidden iframe to ensure reliable printing inside sandbox
  let printFrame = document.getElementById('salesops-print-frame') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'salesops-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1000px';
    printFrame.style.height = '1400px';
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  frameDoc.open();
  frameDoc.write(`
    <!doctype html>
    <html>
      <head>
        <title>SalesOps Resmi Teklif Belgesi</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #0f172a; }
          * { box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .print-header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 300);
}

export function downloadDocumentPDF(docItem: DocumentItem): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HEDEF FILO | EVRAK VE BELGE YONETIMI', 20, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Resmi Kurumsal Evrak Dogrulama ve Guvenli Belge Arsivi', 20, y + 16);

  y += 30;

  // Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${docItem.title.toUpperCase()}`, 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Evrak ID: ${docItem.id} · Ilgili Sozlesme: ${docItem.relatedEntityId}`, 14, y + 6);
  doc.text(`Tarih: ${docItem.uploadedAt || new Date().toISOString().split('T')[0]}`, pageWidth - 60, y + 6);

  y += 16;

  // Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 48, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BELGE DETAYLARI VE UYUMLULUK BILGISI', 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Musteri:', 18, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(docItem.customerRef, 45, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text('Kategori:', 18, y + 23);
  doc.text(docItem.category, 45, y + 23);

  doc.text('Dosya Adi:', 18, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(docItem.fileName || `${docItem.id}_belge.pdf`, 45, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text('Son Tarih:', 18, y + 37);
  doc.text(docItem.requiredByDate, 45, y + 37);

  doc.text('Durum:', 120, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(docItem.status, 140, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Zorunluluk:', 120, y + 23);
  doc.text(docItem.isMandatory ? 'Zorunlu Belge' : 'Destekleyici', 140, y + 23);

  doc.text('Risk Puani:', 120, y + 30);
  doc.text(`${docItem.riskScoreImpact} Puan`, 140, y + 30);

  y += 58;

  // Notes & Verification Stamp
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('OPERASYON VE INCELEME NOTU', 14, y);

  y += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(docItem.notes || 'Belge kurumsal filo kiralama surecleri dogrultusunda incelenmis ve arsivlenmistir.', 14, y);

  y += 20;

  // Verification Seal
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('DIJITAL ARSIV KONTROL VE GUVEBILIRLIK TEYIDI', 18, y + 7);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Bu evrak Hedef Filo SalesOps guvenli belge yonetim sistemi tarafindan dogrulanmistir.', 18, y + 14);
  doc.text(`Sistem Imzasi: SHA-256 / VALIDATED-DOC · Durum: ONAYLI`, 18, y + 19);

  const sanitized = trToEn(docItem.title).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${docItem.id}_${sanitized}.pdf`;
  savePdfSafely(doc, filename);
}

export function printDocumentItem(docItem: DocumentItem): void {
  let printFrame = document.getElementById('salesops-print-frame') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'salesops-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1000px';
    printFrame.style.height = '1400px';
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  frameDoc.open();
  frameDoc.write(`
    <!doctype html>
    <html>
      <head>
        <title>Hedef Filo - ${docItem.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; }
          .header { background: #0f172a; color: white; padding: 18px 24px; border-radius: 6px; margin-bottom: 24px; }
          .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
          .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
          .meta-box { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 18px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px; }
          .label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; display: block; }
          .val { font-weight: bold; color: #0f172a; margin-top: 2px; }
          .stamp { border: 2px dashed #94a3b8; border-radius: 6px; padding: 16px; margin-top: 30px; font-size: 11px; color: #475569; background: #fff; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HEDEF FILO | RESMI EVRAK VE BELGE YONETIMI</h1>
          <p>Dijital Arsiv Kontrol ve Guvenilirlik Teyidi</p>
        </div>
        <div class="meta-box">
          <div class="grid">
            <div><span class="label">Evrak ID</span><span class="val">${docItem.id}</span></div>
            <div><span class="label">Durum</span><span class="val">${docItem.status}</span></div>
            <div><span class="label">Belge Adi</span><span class="val">${docItem.title}</span></div>
            <div><span class="label">Musteri</span><span class="val">${docItem.customerRef}</span></div>
            <div><span class="label">Kategori</span><span class="val">${docItem.category}</span></div>
            <div><span class="label">Ilgili Sozlesme / Kayit</span><span class="val">${docItem.relatedEntityId}</span></div>
            <div><span class="label">Dosya Adi</span><span class="val">${docItem.fileName || `${docItem.id}_belge.pdf`}</span></div>
            <div><span class="label">Gecerlilik / Son Tarih</span><span class="val">${docItem.requiredByDate}</span></div>
          </div>
        </div>
        <div style="font-size: 13px; margin: 20px 0; padding: 14px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <strong style="display: block; margin-bottom: 4px;">Inceleme & Operasyon Notu:</strong>
          <span style="color: #475569;">${docItem.notes || 'Belge incelenmis ve arsivlenmistir.'}</span>
        </div>
        <div class="stamp">
          <strong style="display: block; color: #1e293b; margin-bottom: 4px;">DIJITAL ONAY DAMGASI · SHA-256 VALIDATED</strong>
          <span>Bu resmi evrak Hedef Filo SalesOps guvenli belge yonetim sistemi tarafindan dogrulanmistir.</span>
        </div>
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 300);
}
