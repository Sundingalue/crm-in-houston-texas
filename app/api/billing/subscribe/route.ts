import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder billing endpoint
  return NextResponse.json({ message: "BILLING_STUB", detail: "Integrate Stripe or provider using env placeholders" });
}
