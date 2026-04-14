import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Privy sync is deprecated" }, { status: 410 });
}
