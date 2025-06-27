import { handleToken } from "@/app/actions/capcha";
import { handleCaptchaSubmit } from "@/app/actions/captcha-verify";
import CaptchaForm from "@/components/captcha-form";
import React from "react";

interface CapchaPageProps {
  params: Promise<{ token: string }>;
}

export default async function CapchaPage({ params }: CapchaPageProps) {
  const { token } = await params;
  const result = await handleToken(token);

  if (result?.showCaptcha) {
    return (
      <CaptchaForm
        _token={result.token}
        companyId={result.companyId}
        onVerify={handleCaptchaSubmit}
      />
    );
  }

  return <div>Loading...</div>;
}
