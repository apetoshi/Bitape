const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('Generating PDF from HTML...');
  
  // Get the absolute path to the HTML file
  const htmlPath = path.resolve(__dirname, '../public/bitape-whitepaper-pdf.html');
  const pdfOutputPath = path.resolve(__dirname, '../public/bitape-whitepaper.pdf');
  
  // Check if HTML file exists
  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML file not found at ${htmlPath}`);
    process.exit(1);
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  
  try {
    const page = await browser.newPage();
    
    // Load the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    await page.pdf({
      path: pdfOutputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
    
    console.log(`PDF generated successfully at ${pdfOutputPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generatePDF().catch(console.error); 