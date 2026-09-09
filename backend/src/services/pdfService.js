import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extracts text page by page from a PDF file
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<{ totalPages: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Custom page render to capture text with page numbers
    const pages = [];
    let currentPage = 1;

    const options = {
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str + ' ';
            } else {
              text += '\n' + item.str + ' ';
            }
            lastY = item.transform[5];
          }
          const cleanedText = text.trim();
          pages.push({
            pageNumber: currentPage++,
            text: cleanedText
          });
          return cleanedText;
        });
      }
    };

    const parsed = await pdfParse(dataBuffer, options);
    
    // Fallback if pagerender did not populate
    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: parsed.text || ''
      });
    }

    return {
      totalPages: parsed.numpages || pages.length,
      pages,
      fullText: parsed.text
    };
  } catch (err) {
    console.error(`[PDF Service] Error parsing PDF ${filePath}:`, err);
    throw err;
  }
}
