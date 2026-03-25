export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to Next.js
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mb-8">
          with Tailwind CSS configured and ready to go!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">⚡ Fast</h2>
            <p className="text-gray-600">
              Next.js delivers lightning-fast performance with server-side rendering and static generation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">🎨 Styled</h2>
            <p className="text-gray-600">
              Tailwind CSS provides a utility-first approach for rapid UI development with consistent design.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">📦 Full Stack</h2>
            <p className="text-gray-600">
              Build complete applications with API routes, database connections, and deployment ready.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a
            href="https://nextjs.org"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mr-4 mb-4"
          >
            Learn Next.js
          </a>
          <a
            href="https://tailwindcss.com"
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Tailwind Docs
          </a>
        </div>
      </div>
    </main>
  );
}
