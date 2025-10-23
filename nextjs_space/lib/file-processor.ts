import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import sharp from 'sharp';

export interface FileContext {
  fileName: string;
  fileType: string;
  content: string;
}

export async function extractFileContext(file: File): Promise<FileContext> {
  const fileName = file.name;
  const fileType = file.name.split('.').pop()?.toLowerCase() || '';
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    switch (fileType) {
      case 'pdf':
        return await processPDF(buffer, fileName);
      case 'doc':
      case 'docx':
        return await processDOCX(buffer, fileName);
      case 'txt':
      case 'md':
        return await processTXT(buffer, fileName);
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return await processImage(buffer, fileName, fileType);
      case 'csv':
        return await processCSV(buffer, fileName);
      case 'json':
        return await processJSON(buffer, fileName);
      case 'xml':
        return await processXML(buffer, fileName);
      default:
        return { fileName, fileType, content: `Unsupported file type: ${fileType}` };
    }
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    return { fileName, fileType, content: `Error processing file: ${error}` };
  }
}

async function processPDF(buffer: Buffer, fileName: string): Promise<FileContext> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const numPages = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || '';
    const author = pdfDoc.getAuthor() || '';
    const subject = pdfDoc.getSubject() || '';
    
    let metadata = `PDF Document (${numPages} page${numPages !== 1 ? 's' : ''})`;
    if (title) metadata += `\nTitle: ${title}`;
    if (author) metadata += `\nAuthor: ${author}`;
    if (subject) metadata += `\nSubject: ${subject}`;
    
    return {
      fileName,
      fileType: 'pdf',
      content: metadata
    };
  } catch (error) {
    return { fileName, fileType: 'pdf', content: 'PDF Document (Unable to extract metadata)' };
  }
}

async function processDOCX(buffer: Buffer, fileName: string): Promise<FileContext> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.slice(0, 1000);
    return {
      fileName,
      fileType: 'docx',
      content: `Word Document:\n${text}${text.length >= 1000 ? '...' : ''}`
    };
  } catch (error) {
    return { fileName, fileType: 'docx', content: 'Error: Unable to extract DOCX text' };
  }
}

async function processTXT(buffer: Buffer, fileName: string): Promise<FileContext> {
  const text = buffer.toString('utf-8').slice(0, 1000);
  return {
    fileName,
    fileType: 'txt',
    content: `Text File:\n${text}${text.length >= 1000 ? '...' : ''}`
  };
}

async function processImage(buffer: Buffer, fileName: string, fileType: string): Promise<FileContext> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      fileName,
      fileType,
      content: `Image: ${metadata.format?.toUpperCase()}, ${metadata.width}x${metadata.height} pixels, ${fileName}`
    };
  } catch (error) {
    return { fileName, fileType, content: `Image: ${fileName}` };
  }
}

async function processCSV(buffer: Buffer, fileName: string): Promise<FileContext> {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0]?.split(',') || [];
  return {
    fileName,
    fileType: 'csv',
    content: `CSV Data:\nColumns: ${headers.join(', ')}\nRows: ${lines.length - 1}`
  };
}

async function processJSON(buffer: Buffer, fileName: string): Promise<FileContext> {
  try {
    const text = buffer.toString('utf-8');
    const data = JSON.parse(text);
    const preview = JSON.stringify(data, null, 2).slice(0, 500);
    return {
      fileName,
      fileType: 'json',
      content: `JSON Data:\n${preview}${preview.length >= 500 ? '...' : ''}`
    };
  } catch (error) {
    return { fileName, fileType: 'json', content: 'Error: Invalid JSON format' };
  }
}

async function processXML(buffer: Buffer, fileName: string): Promise<FileContext> {
  const text = buffer.toString('utf-8').slice(0, 500);
  return {
    fileName,
    fileType: 'xml',
    content: `XML Data:\n${text}${text.length >= 500 ? '...' : ''}`
  };
}

export function formatFileContextForPrompt(contexts: FileContext[]): string {
  if (contexts.length === 0) return '';
  
  return '\n\n--- Additional Context from Uploaded Files ---\n\n' + 
    contexts.map(ctx => `File: ${ctx.fileName}\n${ctx.content}`).join('\n\n');
}
