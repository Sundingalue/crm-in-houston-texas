import { NextResponse } from "next/server";

// Domain-based workspace mapping disabled temporarily to avoid Prisma edge errors.
export async function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
