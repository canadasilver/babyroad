import { NextResponse, type NextRequest } from 'next/server'

const REASON_MAP: [string, string][] = [
  ['redirect_uri_mismatch', 'redirect_uri_mismatch'],
  ['access_denied',         'access_denied'],
  ['code verifier',         'pkce_cookie_missing'],
  ['code_verifier',         'pkce_cookie_missing'],
  ['both auth code and code verifier', 'pkce_cookie_missing'],
  ['invalid_client',        'invalid_client'],
  ['invalid_grant',         'invalid_client'],
  ['unauthorized_client',   'invalid_client'],
  ['expired',               'expired_code'],
  ['already used',          'expired_code'],
]

function toSafeReason(oauthError: string, description: string | null): string {
  const combined = `${oauthError} ${description ?? ''}`.toLowerCase()
  for (const [keyword, reason] of REASON_MAP) {
    if (combined.includes(keyword)) return reason
  }
  return 'provider_error'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  const loginUrl = new URL('/login', request.url)

  if (oauthError) {
    const reason = toSafeReason(oauthError, oauthErrorDescription)
    loginUrl.searchParams.set('error', 'oauth_provider_error')
    loginUrl.searchParams.set('reason', reason)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    loginUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(loginUrl)
  }

  const confirmUrl = new URL('/auth/confirm', request.url)
  confirmUrl.searchParams.set('code', code)

  return NextResponse.redirect(confirmUrl)
}
