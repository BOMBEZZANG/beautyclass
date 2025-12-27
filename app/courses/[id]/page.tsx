import { supabase } from '@/lib/supabase'
import { Course } from '@/types/course'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import VideoPlayerWithAuth from '@/components/VideoPlayerWithAuth'
import TestPaymentButton from '@/components/TestPaymentButton'

async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    return null
  }

  return data
}

function getLevelBadgeColor(level: Course['level']) {
  switch (level) {
    case '입문':
      return 'bg-green-100 text-green-800'
    case '중급':
      return 'bg-yellow-100 text-yellow-800'
    case '고급':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatPrice(price: number) {
  if (price === 0) return '무료'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Sub Header */}
      <header className="pt-16 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            강의 목록으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player or Thumbnail with Auth Check */}
            <VideoPlayerWithAuth
              videoUrl={course.video_url}
              thumbnail={course.thumbnail}
              title={course.title}
              courseId={course.id}
              price={course.price}
            />

            {/* Course Info */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {course.category && (
                <span className="inline-flex items-center rounded-full bg-white px-4 py-1 text-sm font-medium text-gray-700 shadow-sm border">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getLevelBadgeColor(course.level)}`}
                >
                  {course.level}
                </span>
              )}
              {course.duration && (
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {course.duration}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white text-lg font-medium">
                {course.instructor.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500">강사</p>
                <p className="font-semibold text-gray-900">{course.instructor}</p>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">강의 소개</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-lg border">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">수강료</p>
                <p className={`text-3xl font-bold ${course.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {formatPrice(course.price)}
                </p>
              </div>

              <button className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-4 text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-pink-600 hover:to-purple-600 mb-4">
                수강 신청하기
              </button>

              <button className="w-full rounded-full border-2 border-gray-200 py-3 text-base font-medium text-gray-700 transition-colors hover:border-pink-300 hover:text-pink-500">
                장바구니에 담기
              </button>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">이 강의에 포함된 내용</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    무제한 액세스
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    모바일에서도 수강 가능
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    수료증 발급
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Test Payment Button - 개발용 */}
        <TestPaymentButton />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 뷰티클래스. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
