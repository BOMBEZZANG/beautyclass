'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import * as PortOne from '@portone/browser-sdk/v2'

interface VideoPlayerWithAuthProps {
  videoUrl: string | null
  thumbnail: string | null
  title: string
  courseId: string
  price: number
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYouTubeEmbedUrl(url: string): string {
  let videoId = ''

  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  } else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
  } else if (url.includes('embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || ''
  }

  return `https://www.youtube.com/embed/${videoId}`
}

function VideoPlayer({ url }: { url: string }) {
  if (isYouTubeUrl(url)) {
    return (
      <iframe
        src={getYouTubeEmbedUrl(url)}
        title="YouTube video player"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <video
      src={url}
      controls
      className="absolute inset-0 h-full w-full object-cover"
    >
      브라우저가 비디오 태그를 지원하지 않습니다.
    </video>
  )
}

type AuthStatus = 'loading' | 'not_logged_in' | 'not_paid' | 'paid'

export default function VideoPlayerWithAuth({
  videoUrl,
  thumbnail,
  title,
  courseId,
  price,
}: VideoPlayerWithAuthProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [isProcessing, setIsProcessing] = useState(false)

  // 결제 처리 함수
  async function handlePayment() {
    setIsProcessing(true)

    try {
      // 현재 로그인한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('로그인이 필요합니다.')
        setIsProcessing(false)
        return
      }

      // 고유한 결제 ID 생성
      const paymentId = `payment-${courseId}-${user.id}-${Date.now()}`

      // 포트원 결제 요청
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: paymentId,
        orderName: title,
        totalAmount: price,
        currency: 'CURRENCY_KRW',
        payMethod: 'EASY_PAY',
        easyPay: {
          easyPayProvider: 'KAKAOPAY',
        },
        customer: {
          email: user.email,
        },
      })

      // 결제 결과 확인
      if (response?.code) {
        // 결제 실패 또는 취소
        alert(`결제 실패: ${response.message}`)
        setIsProcessing(false)
        return
      }

      // 결제 성공 - profiles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          has_paid: true,
        }, {
          onConflict: 'id',
        })

      if (updateError) {
        console.error('프로필 업데이트 오류:', updateError)
        alert('결제는 완료되었으나 프로필 업데이트에 실패했습니다. 고객센터에 문의해주세요.')
        setIsProcessing(false)
        return
      }

      // 성공 알림 및 새로고침
      alert('결제 완료!')
      window.location.reload()

    } catch (error) {
      console.error('결제 오류:', error)
      alert('결제 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      // 1. 로그인한 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setAuthStatus('not_logged_in')
        return
      }

      // 2. profiles 테이블에서 has_paid 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_paid')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        setAuthStatus('not_paid')
        return
      }

      // 3. has_paid 값에 따라 상태 설정
      if (profile.has_paid) {
        setAuthStatus('paid')
      } else {
        setAuthStatus('not_paid')
      }
    }

    checkAuth()
  }, [])

  // 로딩 중
  if (authStatus === 'loading') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 mb-8">
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 사용자
  if (authStatus === 'not_logged_in') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 mb-8">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <svg
            className="h-16 w-16 text-white mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-white text-xl font-semibold mb-6">
            로그인 후 시청 가능합니다
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-pink-600 hover:to-purple-600"
          >
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  // 결제하지 않은 사용자
  if (authStatus === 'not_paid') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 mb-8">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <svg
            className="h-16 w-16 text-white mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <p className="text-white text-xl font-semibold mb-2">
            이 강의는 유료 강의입니다
          </p>
          <p className="text-gray-300 mb-6">
            결제 후 시청해주세요
          </p>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '결제 처리 중...' : '지금 결제하기'}
          </button>
        </div>
      </div>
    )
  }

  // 결제한 사용자 - 비디오 플레이어 표시
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 mb-8">
      {videoUrl ? (
        <VideoPlayer url={videoUrl} />
      ) : thumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
          <span className="text-8xl">💄</span>
        </div>
      )}
    </div>
  )
}
