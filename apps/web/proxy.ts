import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const _pathName = request.nextUrl.pathname;

  try {
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({
      message: (error as Error).message,
    });
  }
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: "/api/:path*",
};
