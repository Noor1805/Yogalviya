import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe checkout is disabled for this store.' },
    { status: 410 }
  );
}
