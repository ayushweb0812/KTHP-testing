import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const publicLogo = path.join(process.cwd(), 'public', 'logo (1).svg');
  const appIcon = path.join(process.cwd(), 'app', 'icon.svg');
  
  try {
    fs.copyFileSync(publicLogo, appIcon);
    
    const favicon = path.join(process.cwd(), 'app', 'favicon.ico');
    if (fs.existsSync(favicon)) {
      fs.unlinkSync(favicon);
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
