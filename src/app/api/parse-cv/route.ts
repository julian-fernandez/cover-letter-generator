import { NextRequest, NextResponse } from 'next/server';
// pdf-parse is listed in serverExternalPackages so it runs as a native Node module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;
  const name = file.name.toLowerCase();

  let text = '';

  try {
    if (mime === 'text/plain' || name.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mime === 'application/msword' || name.endsWith('.doc')) {
      return NextResponse.json(
        { error: 'Old .doc format is not supported. Save as .docx or .pdf and try again.' },
        { status: 415 }
      );
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT.' },
        { status: 415 }
      );
    }
  } catch (err) {
    console.error('[parse-cv]', err);
    return NextResponse.json(
      { error: 'Failed to parse file. Try copying and pasting instead.' },
      { status: 500 }
    );
  }

  const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  if (!cleaned) {
    return NextResponse.json(
      { error: 'Could not extract text from this file. Try copying and pasting instead.' },
      { status: 422 }
    );
  }

  return NextResponse.json({ text: cleaned });
}
