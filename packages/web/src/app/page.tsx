export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Legacy Shield
          </h1>
          <p className="text-xl text-gray-600">
            Secure digital vault for critical documents with emergency access
          </p>
          <p className="text-sm text-gray-500">
            🇪🇺 100% European Hosting | 🔒 Zero-Knowledge Encryption
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <a href="/login" className="btn-primary">
            Sign In
          </a>
          <a href="/register" className="btn-secondary">
            Create Account
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🔐 Zero-Knowledge</h3>
            <p className="text-sm text-gray-600">
              Files encrypted in your browser before upload. We never see your data.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🚨 Emergency Access</h3>
            <p className="text-sm text-gray-600">
              Loved ones can access with unlock phrase when you can&apos;t.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🇪🇺 EU Hosted</h3>
            <p className="text-sm text-gray-600">
              Data stored exclusively in Germany. GDPR-native privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
