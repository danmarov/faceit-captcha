"use server";

import { redirect } from "next/navigation";
import { addToBlackList, getClientIP } from "./capcha";
import { db } from "@/app/lib/db";
import { tokens, companies } from "@/app/lib/schema";
import { eq } from "drizzle-orm";

export async function handleCaptchaSubmit(formData: FormData) {
  const captchaToken = formData.get("captcha-token") as string;
  const token = formData.get("token") as string;
  const companyId = formData.get("company-id") as string;

  console.log("🎫 Processing captcha submission:");
  console.log("- Token:", token);
  console.log("- Company:", companyId);
  console.log("- Captcha Token:", captchaToken);

  if (!captchaToken) {
    console.log("❌ No captcha token provided - FALSE");
    return;
  }

  const clientIp = await getClientIP();

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captchaToken,
      }),
    });

    const result = await response.json();
    console.log("🔐 hCaptcha API Response:", result);

    if (result.success === true) {
      console.log("✅ CAPTCHA VERIFICATION: TRUE");

      await addToBlackList(clientIp);

      const tokenData = await db
        .select({
          url: tokens.url,
          blackPage: companies.blackPage,
        })
        .from(tokens)
        .innerJoin(companies, eq(tokens.companyId, companies.id))
        .where(eq(tokens.id, token))
        .limit(1);

      console.log("🔍 Token lookup result:", tokenData);
      console.log("📊 Found tokens count:", tokenData.length);

      if (tokenData.length > 0) {
        const { url } = tokenData[0];
        const targetUrl = url;
        console.log("🎯 Redirecting to target URL:", targetUrl);

        redirect(targetUrl);
      } else {
        console.log("❌ Token not found in database");
        console.log("🔍 Debug: Searching for token:", token);

        const allTokens = await db.select({ id: tokens.id }).from(tokens);
        console.log(
          "📋 All available tokens:",
          allTokens.map((t) => t.id)
        );

        const fallbackUrl = process.env.FALLBACK_URL || "https://google.com";
        console.log("🔄 Redirecting to fallback:", fallbackUrl);
        redirect(fallbackUrl);
      }
    } else {
      console.log("❌ CAPTCHA VERIFICATION: FALSE");
      console.log("❌ Errors:", result["error-codes"]);
    }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("❌ Captcha API Error:", error);
    console.log("❌ CAPTCHA VERIFICATION: FALSE (API Error)");

    const fallbackUrl = process.env.FALLBACK_URL || "https://google.com";
    redirect(fallbackUrl);
  }
}
