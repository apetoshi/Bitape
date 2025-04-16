const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHTMLToPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Read the HTML file
  const htmlPath = path.join(process.cwd(), 'public', 'bitape-whitepaper-pdf.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Set the content
  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });
  
  // Generate PDF
  await page.pdf({
    path: path.join(process.cwd(), 'public', 'bitape-whitepaper.pdf'),
    format: 'A4',
    margin: {
      top: '40px',
      right: '40px',
      bottom: '40px',
      left: '40px'
    },
    printBackground: true
  });
  
  await browser.close();
  console.log('PDF generated successfully!');
}

convertHTMLToPDF().catch(console.error); 