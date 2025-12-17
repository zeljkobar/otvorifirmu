import puppeteer from "puppeteer";
import Handlebars from "handlebars";

interface DocumentData {
  companyName: string;
  founders: Array<{
    name: string;
    idNumber: string;
    address: string;
    sharePercentage: number;
  }>;
  capital: number;
  activity: string;
  address: string;
}

export class PDFGenerator {
  async generatePreview(
    templateContent: string,
    data: DocumentData
  ): Promise<Buffer> {
    const template = Handlebars.compile(templateContent);

    // Dodaj watermark i ograniči sadržaj za preview
    const previewData = {
      ...data,
      isPreview: true,
      watermark: "PREVIEW - NEOZVANIČEN DOKUMENT",
    };

    const html = template(previewData);

    // Dodaj CSS za watermark i preview styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            position: relative;
            margin: 40px;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(255, 0, 0, 0.1);
            z-index: 1000;
            pointer-events: none;
            font-weight: bold;
          }
          .preview-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            color: #856404;
          }
          .content {
            position: relative;
            z-index: 1;
          }
          /* Blur za sensitive podatke u preview */
          .preview .sensitive {
            filter: blur(2px);
            background: rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body class="preview">
        <div class="watermark">PREVIEW - NEOZVANIČEN</div>
        <div class="preview-notice">
          <strong>⚠️ PREVIEW DOKUMENT</strong><br>
          Ovo je preview verzija dokumenta. Za potpunu verziju potrebno je izvršiti plaćanje.
        </div>
        <div class="content">
          ${html}
        </div>
      </body>
      </html>
    `;

    return this.htmlToPDF(fullHtml, { isPreview: true });
  }

  async generateFinal(
    templateContent: string,
    data: DocumentData
  ): Promise<Buffer> {
    const template = Handlebars.compile(templateContent);
    const html = template({ ...data, isPreview: false });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
          }
          .content {
            line-height: 1.6;
          }
          h1, h2 { color: #2c3e50; }
          .signature-section {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="content">
          ${html}
        </div>
      </body>
      </html>
    `;

    return this.htmlToPDF(fullHtml, { isPreview: false });
  }

  private async htmlToPDF(
    html: string,
    options: { isPreview: boolean }
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfOptions = {
        format: "A4" as const,
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        displayHeaderFooter: false,
        headerTemplate: "",
      };

      // Za preview - dodaj ograničenja
      if (options.isPreview) {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate =
          '<div style="font-size:10px; text-align:center; color:red; width:100%;">PREVIEW - NEOZVANIČEN DOKUMENT</div>';
      }

      const pdf = await page.pdf(pdfOptions);
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}

export const pdfGenerator = new PDFGenerator();
