"use client";
import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Logo from "./logo";
import Warning from "./warning";

interface CaptchaFormProps {
  _token: string;
  companyId: string;
  onVerify: (formData: FormData) => Promise<void>;
}

export default function CaptchaForm({
  companyId,
  onVerify,
  _token,
}: CaptchaFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCaptchaVerify = async (token: string) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("captcha-token", token);
    formData.append("token", _token);
    formData.append("company-id", companyId);
    console.log("TOKEN", token);
    try {
      await onVerify(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaError = () => {
    setIsLoading(false);
  };

  const handleCaptchaExpire = () => {
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="max-w-[90%] md:max-w-md w-full shadow-md h-fit md:min-w-[640px] pt-[40px] md:pt-[80px] relative">
        <span className="block mx-auto w-fit">
          <Logo />
        </span>
        <div className="border border-[#242424] p-6 rounded-xl mt-10">
          <span className="block mx-auto w-fit mb-4">
            <Warning />
          </span>
          <h1 className="text-white text-2xl font-bold text-center">
            Security verification
          </h1>
          <div className="max-w-[380px] mx-auto text-center text-[#a7a7a7] mt-2 flex flex-col gap-6">
            <p className="">
              You&apos;re about to access an official FACEIT service. To protect
              our platform and players, we require a quick verification.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#a7a7a7] text-sm">Verifying...</p>
                </div>
              ) : (
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  theme={"dark"}
                />
              )}
            </div>
          </div>

          <div className="max-w-[380px] mx-auto text-center text-[#a7a7a7]  flex flex-col gap-6 mt-6 text-sm">
            <p className="">
              This verification helps us block bots and unwanted traffic from
              accessing FACEIT services. Your safety and privacy are our top
              priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
