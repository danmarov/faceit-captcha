// src/app/init-test/page.tsx
import { createTestData } from "@/app/actions/capcha";

export default async function InitTestPage() {
  const result = await createTestData();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Initialize Test Data</h1>

      <div
        className={`p-6 rounded-lg border-2 ${
          result.success
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">{result.success ? "✅" : "❌"}</span>
          <h2 className="text-xl font-semibold text-black">
            {result.success ? "Test Data Created!" : "Error"}
          </h2>
        </div>

        {result.success ? (
          <div className="space-y-2 text-black">
            <p>
              <strong>Test Token:</strong> {result.testToken}
            </p>
            <p>
              <strong>Company ID:</strong> {result.companyId}
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Now you can test with: <code>/s/{result.testToken}</code>
            </p>
            <p className="text-sm text-gray-600">
              • 127.0.0.1 is in white list (should redirect to Google)
              <br />
              • 192.168.1.1 is in black list (should redirect to blocked page)
              <br />• Other IPs will show captcha
            </p>
          </div>
        ) : (
          <p className="text-red-700">Error: {result.error}</p>
        )}
      </div>
    </div>
  );
}
