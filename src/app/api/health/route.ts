import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  let dbStatus = 'ok'
  try {
    await db.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'unreachable'
  }
  // always 200 — app is running regardless of db state at this moment
  return NextResponse.json({ status: 'ok', db: dbStatus })
}
