import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is handled client-side in AdminShell (localStorage JWT).
// This proxy only passes requests through — no server-side auth redirect.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|logos).*)'],
};
