import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles').select('membership_status, role').eq('user_id', user.id).single()
    if (!profile || profile.membership_status === 'pending')
      return NextResponse.redirect(new URL('/register', request.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('user_id', user.id).single()
    if (!profile || !['admin', 'super_admin', 'staff', 'membership_manager', 'locker_manager', 'event_manager', 'content_manager'].includes(profile.role))
      return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname === '/login' && user)
    return NextResponse.redirect(new URL('/dashboard', request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}
