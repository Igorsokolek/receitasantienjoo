// render.js — converte os 5 HTMLs do kit em PDFs finais (Chromium print-to-pdf)
// Uso: NODE_PATH=<scratchpad>\pdfgen\node_modules node render.js
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright-core");
const { PDFDocument } = require("pdf-lib");

const BUILD = __dirname;
const OUT = path.join(path.dirname(__dirname), "entregavel");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const docs = [
  ["01-ebook.html", "01-Receitas-Anti-Nausea.pdf"],
  ["02-lista-compras.html", "02-Bonus-Lista-de-Compras.pdf"],
  ["03-guia-proteina-fibra.html", "03-Bonus-Guia-Proteina-e-Fibra.pdf"],
  ["04-tabela-substituicao.html", "04-Bonus-Tabela-de-Substituicao.pdf"],
  ["05-checklist-hidratacao.html", "05-Bonus-Checklist-Hidratacao-e-Porcoes.pdf"],
];

const footerTemplate =
  '<div style="width:100%;font-size:6.8px;color:#8a8378;padding:0 13mm;font-family:Arial,sans-serif;display:flex;justify-content:space-between;align-items:center;">' +
  "<span>Material culinário e informativo — não substitui orientação médica ou nutricional. Siga o profissional que acompanha seu tratamento.</span>" +
  '<span style="margin-left:10px;white-space:nowrap;">pág. <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>';

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  for (const [src, dst] of docs) {
    const url = pathToFileURL(path.join(BUILD, src)).href;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.pdf({
      path: path.join(OUT, dst),
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate,
      margin: { top: "13mm", bottom: "17mm", left: "13mm", right: "13mm" },
    });
    const pdf = await PDFDocument.load(fs.readFileSync(path.join(OUT, dst)));
    console.log(dst + " -> " + pdf.getPageCount() + " paginas");
  }
  await browser.close();
  console.log("Concluido.");
})().catch((e) => { console.error(e); process.exit(1); });