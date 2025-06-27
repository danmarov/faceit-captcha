// src/app/test-ip/page.tsx
import {
  addToWhiteList,
  addToBlackList,
  removeFromAllLists,
} from "@/app/actions/capcha";
import { headers } from "next/headers";

async function handleAddToWhite(formData: FormData) {
  "use server";
  const ip = formData.get("ip") as string;
  const result = await addToWhiteList(ip);
  console.log("White list result:", result);
}

async function handleAddToBlack(formData: FormData) {
  "use server";
  const ip = formData.get("ip") as string;
  const result = await addToBlackList(ip);
  console.log("Black list result:", result);
}
async function handleRemoveIP(formData: FormData) {
  "use server";
  const ip = formData.get("ip") as string;
  const result = await removeFromAllLists(ip);
  console.log("Remove IP result:", result);
}
// Функция для получения реального IP
async function getRealClientIP(): Promise<string> {
  const headersList = await headers();

  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("remote-addr") ||
    "::1";

  console.log("🌐 All headers for IP detection:");
  console.log("x-forwarded-for:", headersList.get("x-forwarded-for"));
  console.log("x-real-ip:", headersList.get("x-real-ip"));
  console.log("cf-connecting-ip:", headersList.get("cf-connecting-ip"));
  console.log("remote-addr:", headersList.get("remote-addr"));
  console.log("Final detected IP:", ip);

  return ip;
}

export default async function TestIPPage() {
  const detectedIP = await getRealClientIP();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Test IP Management</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p>
          <strong>Your detected IP:</strong> {detectedIP}
        </p>
        <p>
          <strong>Test token:</strong> tk256 (or check /init-test for latest)
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Via ngrok your real IP should be detected from headers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add to White List */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            ✅ Add to White List
          </h2>
          <p className="text-sm text-green-700 mb-4">
            White listed IPs redirect directly to the target URL
          </p>
          <form action={handleAddToWhite} className="space-y-4">
            <input
              name="ip"
              placeholder="Enter IP"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              defaultValue={detectedIP}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition-colors"
            >
              Add to White List
            </button>
          </form>
        </div>

        {/* Add to Black List */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-800">
            🚫 Add to Black List
          </h2>
          <p className="text-sm text-red-700 mb-4">
            Black listed IPs redirect to the block page
          </p>
          <form action={handleAddToBlack} className="space-y-4">
            <input
              name="ip"
              placeholder="Enter IP"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              defaultValue={detectedIP}
              required
            />
            <button
              type="submit"
              className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition-colors"
            >
              Add to Black List
            </button>
          </form>
        </div>
      </div>
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">
          🗑️ Remove from All Lists
        </h2>
        <p className="text-sm text-yellow-700 mb-4">
          Remove IP from both white and black lists to test captcha
        </p>
        <form action={handleRemoveIP} className="space-y-4">
          <input
            name="ip"
            placeholder="Enter IP"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            defaultValue={detectedIP}
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700 transition-colors"
          >
            Remove from All Lists
          </button>
        </form>
      </div>
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🧪 Test Scenarios:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>Captcha (current):</strong> Visit → Should show captcha
          </li>
          <li>
            <strong>White List:</strong> Add ::1 to white list, then visit →
            Should redirect to Google
          </li>
          <li>
            <strong>Black List:</strong> Add ::1 to black list, then visit →
            Should redirect to block page
          </li>
          <li>
            <strong>Not Found:</strong> Visit → Should show Token Not Found
          </li>
        </ol>
      </div>
    </div>
  );
}
