const PDFDocument = require('pdfkit');

const buildPdfBuffer = ({ title, content }) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 48 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(18).text(title || 'Document', { underline: true });
  doc.moveDown();
  doc.fontSize(11).text(content || '', { align: 'left' });
  doc.end();
});

exports.buildPdfBuffer = buildPdfBuffer;
