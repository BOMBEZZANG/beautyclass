import { supabase } from '@/lib/supabase'
import { Course } from '@/types/course'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data || []
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

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Header */}
      <header className="pt-16 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            뷰티 클래스
          </h1>
          <p className="mt-2 text-gray-600">
            전문 강사진과 함께하는 프리미엄 뷰티 교육
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              총 {courses.length}개의 강의
            </span>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              등록된 강의가 없습니다
            </h3>
            <p className="text-gray-500">
              곧 새로운 강의가 업데이트될 예정입니다
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                      <span className="text-5xl">💄</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Level & Duration */}
                  <div className="mb-3 flex items-center gap-2">
                    {course.level && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getLevelBadgeColor(course.level)}`}
                      >
                        {course.level}
                      </span>
                    )}
                    {course.duration && (
                      <span className="text-xs text-gray-500">
                        {course.duration}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {course.title}
                  </h2>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white text-sm font-medium">
                      {course.instructor.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {course.instructor}
                    </span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">수강료</span>
                      <span className={`text-lg font-bold ${course.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-pink-600 hover:to-purple-600">
                      수강 신청
                    </button>
                  </div>
                </div>
                </article>
              </Link>
            ))}
          </div>
        )}
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
