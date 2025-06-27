"use server";
import { db } from "@/app/lib/db";
import { randomUUID } from "crypto";
import { tokens, companies, addresses, requests } from "@/app/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const checkExistingData = async () => {
  try {
    console.log("🔍 Checking existing data...");

    const companiesData = await db.select().from(companies);
    const tokensData = await db.select().from(tokens);
    const addressesData = await db.select().from(addresses);

    console.log("📊 Companies:", companiesData);
    console.log("📊 Tokens:", tokensData);
    console.log("📊 Addresses:", addressesData);

    return {
      companies: companiesData,
      tokens: tokensData,
      addresses: addressesData,
    };
  } catch (error) {
    console.error("❌ Error checking data:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const createTestData = async () => {
  try {
    console.log("🏗️ Creating test data...");

    const existingCompanies = await db.select().from(companies);

    if (!existingCompanies.length) {
      return {
        success: false,
        error: "No companies found in database.",
      };
    }

    const companyId = existingCompanies[0].id;
    console.log("✅ Using existing company:", companyId);

    const timestamp = Date.now().toString().slice(-3);
    const testToken = `tk${timestamp}`;

    console.log("🎫 Creating token:", testToken);

    await db.delete(tokens).where(eq(tokens.id, testToken));

    await db.insert(tokens).values({
      id: testToken,
      companyId: companyId,
      url: "https://google.com",
      checkAdresses: true,
    });

    console.log("✅ Created test token:", testToken);

    await db.execute(sql`
      INSERT INTO addresses (id, company_id, address, type) 
      VALUES (${randomUUID()}, ${companyId}, '127.0.0.1', 'white')
      ON CONFLICT (company_id, address) 
      DO UPDATE SET type = 'white'
    `);

    console.log("✅ Added/Updated 127.0.0.1 to white list");

    await db.execute(sql`
      INSERT INTO addresses (id, company_id, address, type) 
      VALUES (${randomUUID()}, ${companyId}, '192.168.1.1', 'black')
      ON CONFLICT (company_id, address) 
      DO UPDATE SET type = 'black'
    `);

    console.log("✅ Added/Updated 192.168.1.1 to black list");

    return {
      success: true,
      testToken,
      companyId,
      message: "Test data created successfully!",
    };
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const cleanupTestData = async () => {
  try {
    console.log("🧹 Cleaning up test data...");

    await db.delete(tokens).where(sql`id LIKE 'test%'`);

    await db
      .delete(addresses)
      .where(sql`address IN ('127.0.0.1', '192.168.1.1')`);

    console.log("✅ Cleanup completed");

    return {
      success: true,
      message: `Cleaned up test tokens and addresses`,
    };
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const handleToken = async (token: string) => {
  console.log("🎫 Processing token:", token);

  const tokenData = await db
    .select({
      companyId: tokens.companyId,
      url: tokens.url,
      tokenCheckAdresses: tokens.checkAdresses,
      whitePage: companies.whitePage,
      blackPage: companies.blackPage,
      companyCheckAdresses: companies.checkAdresses,
    })
    .from(tokens)
    .innerJoin(companies, eq(tokens.companyId, companies.id))
    .where(eq(tokens.id, token))
    .limit(1);

  if (!tokenData.length) {
    console.log("❌ Token not found:", token);
    const fallbackUrl = process.env.FALLBACK_URL;
    redirect(fallbackUrl!);
  }

  const {
    companyId,
    url,
    tokenCheckAdresses,
    blackPage,
    companyCheckAdresses,
  } = tokenData[0];

  console.log("✅ Token found for company:", companyId);
  console.log(
    "🔍 Check addresses - Token:",
    tokenCheckAdresses,
    "Company:",
    companyCheckAdresses
  );

  const clientIP = await getClientIP();
  console.log("🌐 Client IP:", clientIP);

  const shouldCheckAddresses =
    tokenCheckAdresses ?? companyCheckAdresses ?? false;

  if (!shouldCheckAddresses) {
    console.log("✅ Address checking disabled, redirecting to:", url);
    await logRequest(companyId, token, clientIP, "white", url, "redirect");
    redirect(url);
  }

  console.log("🔍 Checking IP in address lists...");

  const addressData = await db
    .select({ type: addresses.type })
    .from(addresses)
    .where(
      and(eq(addresses.companyId, companyId), eq(addresses.address, clientIP))
    )
    .limit(1);

  if (addressData.length) {
    const addressType = addressData[0].type;
    console.log("📍 IP found in list, type:", addressType);

    if (addressType === "white") {
      console.log("✅ White IP, redirecting to:", url);
      await logRequest(companyId, token, clientIP, "white", url, "redirect");
      redirect(url);
    } else {
      console.log("🚫 Black/Block IP, redirecting to:", blackPage);
      await logRequest(
        companyId,
        token,
        clientIP,
        addressType,
        blackPage,
        "redirect"
      );
      redirect(blackPage);
    }
  }

  console.log("❓ IP not found in lists, showing captcha");
  await logRequest(companyId, token, clientIP, "block", "/captcha", "load");

  return {
    showCaptcha: true,
    companyId,
    token,
    clientIP,
  };
};

export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  return (
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("remote-addr") ||
    "127.0.0.1"
  );
}
export const removeFromAllLists = async (ip: string) => {
  try {
    const existingCompanies = await db.select().from(companies);
    const companyId = existingCompanies[0].id;

    await db
      .delete(addresses)
      .where(
        and(eq(addresses.companyId, companyId), eq(addresses.address, ip))
      );

    console.log(`🗑️ Removed ${ip} from all lists`);
    return { success: true, message: `Removed ${ip} from all lists` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown",
    };
  }
};
async function logRequest(
  companyId: string,
  token: string,
  clientIP: string,
  action: "white" | "black" | "block",
  actionPage: string,
  actionType: "load" | "redirect" | "iframe"
) {
  try {
    const headersList = await headers();

    await db.insert(requests).values({
      id: randomUUID(),
      companyId,
      token,
      remoteAddr: clientIP,
      httpUserAgent: headersList.get("user-agent"),
      httpReferer: headersList.get("referer"),
      cfConnectingIp: headersList.get("cf-connecting-ip"),
      xForwardedFor: headersList.get("x-forwarded-for"),
      action,
      actionPage,
      actionType,
      date: new Date(),
    });

    console.log("📝 Request logged successfully");
  } catch (error) {
    console.error("❌ Failed to log request:", error);
  }
}

export const addToWhiteList = async (ip: string) => {
  try {
    const existingCompanies = await db.select().from(companies);
    const companyId = existingCompanies[0].id;

    await db.execute(sql`
      INSERT INTO addresses (id, company_id, address, type) 
      VALUES (${randomUUID()}, ${companyId}, ${ip}, 'white')
      ON CONFLICT (company_id, address) 
      DO UPDATE SET type = 'white'
    `);

    console.log(`✅ Added ${ip} to white list`);
    return { success: true, message: `Added ${ip} to white list` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown",
    };
  }
};

export const addToBlackList = async (ip: string) => {
  try {
    const existingCompanies = await db.select().from(companies);
    const companyId = existingCompanies[0].id;

    await db.execute(sql`
      INSERT INTO addresses (id, company_id, address, type) 
      VALUES (${randomUUID()}, ${companyId}, ${ip}, 'black')
      ON CONFLICT (company_id, address) 
      DO UPDATE SET type = 'black'
    `);

    console.log(`✅ Added ${ip} to black list`);
    return { success: true, message: `Added ${ip} to black list` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown",
    };
  }
};
