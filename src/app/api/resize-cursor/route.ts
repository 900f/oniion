import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Resize to 32x32 pixels (standard Windows cursor size)
    const resizedBuffer = await sharp(buffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    // Convert to base64 for upload
    const base64 = resizedBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      size: 32 
    });
    
  } catch (error) {
    console.error('Resize error:', error);
    return NextResponse.json({ error: 'Failed to resize cursor' }, { status: 500 });
  }
}