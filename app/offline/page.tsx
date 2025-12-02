"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4">
      <div className="text-center">
        {/* オフラインアイコン */}
        <div className="mb-6 flex justify-center">
          <svg
            className="h-24 w-24 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        </div>

        {/* メインメッセージ */}
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          オフラインです
        </h1>
        <p className="mb-8 text-gray-600">
          インターネット接続が切れています。
          <br />
          接続が復旧したら自動的に再開します。
        </p>

        {/* オフラインでも利用可能な機能 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            オフラインでも利用可能
          </h2>
          <ul className="space-y-2 text-left text-gray-600">
            <li className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-teal-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              喫煙記録の追加
            </li>
            <li className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-teal-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              3分タイマー・深呼吸モード
            </li>
            <li className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-teal-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              過去の記録閲覧
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            オフライン中の記録は、接続が復旧したら自動的に同期されます。
          </p>
        </div>

        {/* 再読み込みボタン */}
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
