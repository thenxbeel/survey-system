import { NextResponse } from 'next/server'

const COOKIE_NAME = 'token'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully.' },
    { status: 200 }
  )

  // Clear the auth cookie
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // expires immediately
  })

  return response
}
