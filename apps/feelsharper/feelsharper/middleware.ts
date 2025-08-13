import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/coach",
  "/log",
  "/calendar",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  // Check for Supabase auth cookies - they start with project ref
  // Look for any cookie that contains -auth-token pattern
  const cookies = req.cookies.getAll();
  const hasSession = cookies.some(cookie => 
    cookie.name.includes('-auth-token') || 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  if (isProtected && !hasSession) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect", path);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|public).*)"],
};
