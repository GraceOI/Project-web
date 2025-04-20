// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);
    
    // Make sure the uploads directory exists
    await writeFile(filePath, buffer);
    
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}