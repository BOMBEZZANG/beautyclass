import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-16">
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">당신의 아름다움을</span>
              <span className="mt-2 block bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                한 단계 높여보세요
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              전문 강사진과 함께하는 프리미엄 뷰티 교육.
              <br />
              메이크업, 헤어, 네일 아트 등 다양한 뷰티 강좌를 만나보세요.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/courses"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                강의 둘러보기
              </Link>
              <button className="rounded-full border-2 border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-700 hover:border-pink-300 transition-colors">
                더 알아보기
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
                  👩‍🏫
                </div>
                <h3 className="text-lg font-semibold text-gray-900">전문 강사진</h3>
                <p className="mt-2 text-gray-600">
                  현업에서 활동하는 전문가들의 실전 노하우를 배워보세요
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                  📱
                </div>
                <h3 className="text-lg font-semibold text-gray-900">언제 어디서나</h3>
                <p className="mt-2 text-gray-600">
                  PC, 모바일에서 시간과 장소에 구애받지 않고 학습하세요
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
                  🎯
                </div>
                <h3 className="text-lg font-semibold text-gray-900">체계적인 커리큘럼</h3>
                <p className="mt-2 text-gray-600">
                  입문부터 고급까지 단계별로 체계적으로 학습할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900">
              지금 바로 시작하세요
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              새로운 강의가 매주 업데이트됩니다
            </p>
            <Link
              href="/courses"
              className="mt-8 inline-block rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              전체 강의 보기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 뷰티클래스. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
