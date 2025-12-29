import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import { createPrivateKey } from 'crypto'

// Vercel에서 Node.js 런타임 사용 (crypto 모듈 필요)
export const runtime = 'nodejs'

// Cloudflare Stream 환경변수
const CF_STREAM_KEY_ID = process.env.CF_STREAM_KEY_ID!
const CF_STREAM_SIGNING_KEY_BASE64 = process.env.CF_STREAM_SIGNING_KEY!
const CF_STREAM_CUSTOMER_SUBDOMAIN = process.env.CF_STREAM_CUSTOMER_SUBDOMAIN!

// Supabase Admin 클라이언트 (서버용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Base64로 인코딩된 PEM 키를 디코딩하고 KeyObject로 변환
 * Cloudflare는 PKCS#1 형식 (RSA PRIVATE KEY)을 제공하므로
 * Node.js crypto 모듈을 사용하여 처리
 */
function getPrivateKey() {
  const pemKey = Buffer.from(CF_STREAM_SIGNING_KEY_BASE64, 'base64').toString('utf-8')
  return createPrivateKey({
    key: pemKey,
    format: 'pem',
  })
}

/**
 * Cloudflare Stream Signed URL 토큰 생성 API
 * Signing Key를 사용하여 JWT를 직접 생성합니다.
 *
 * 요청: POST /api/video/token
 * Body: { videoId: string }
 * Headers: { Authorization: Bearer <supabase_access_token> }
 *
 * 응답: { token: string, videoId: string, expiresIn: number }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authorization 헤더에서 Supabase 세션 토큰 추출
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // 2. Supabase로 유저 정보 확인
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      )
    }

    // 3. profiles 테이블에서 결제 여부 확인
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('has_paid')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '프로필 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!profile.has_paid) {
      return NextResponse.json(
        { error: '결제가 필요합니다.' },
        { status: 403 }
      )
    }

    // 4. 요청 바디에서 videoId 추출
    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 5. Signing Key로 JWT 직접 생성
    const privateKey = getPrivateKey()

    // 토큰 만료 시간 (1시간)
    const expiresIn = 3600
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn

    const token = await new SignJWT({
      sub: videoId,
      kid: CF_STREAM_KEY_ID,
    })
      .setProtectedHeader({ alg: 'RS256', kid: CF_STREAM_KEY_ID })
      .setExpirationTime(expirationTime)
      .sign(privateKey)

    return NextResponse.json({
      token,
      videoId,
      customerSubdomain: CF_STREAM_CUSTOMER_SUBDOMAIN,
      expiresIn,
    })

  } catch (error) {
    console.error('비디오 토큰 생성 오류:', error)
    return NextResponse.json(
      { error: '토큰 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
