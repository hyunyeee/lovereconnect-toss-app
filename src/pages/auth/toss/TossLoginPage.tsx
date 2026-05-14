import { appLogin } from "@apps-in-toss/web-framework";
import { Button } from "@toss/tds-mobile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { Heart } from "lucide-react";

import { API } from "../../../lib/api/endpoints";
import { buildApiUrl } from "../../../lib/api/baseUrl";
import { authAtom, type AuthUser } from "../../../atoms/authAtom";

interface TossLoginResponse {
  memberId: number;
  nickname: string;
  token: string;
  isNewMember: boolean;
}

export default function TossLoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);

  const handleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      // appLogin
      const { authorizationCode, referrer } = await appLogin();

      // 서버 요청
      const url = buildApiUrl(API.MEMBER.TOSS_LOGIN);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ authorizationCode, referrer }),
      });

      const rawText = await res.text();

      if (!res.ok) {
        setErrorMsg("로그인 실패\n다시 로그인 버튼을 눌러주세요.");
        return;
      }

      let json: TossLoginResponse;

      try {
        json = JSON.parse(rawText);
      } catch {
        setErrorMsg("응답 파싱 실패");
        return;
      }

      const { memberId, nickname, isNewMember } = json;

      if (!memberId || !nickname) {
        setErrorMsg("로그인 응답 데이터 누락");
        return;
      }

      // 전역 상태 설정
      const user: AuthUser = {
        memberId,
        nickname,
      };

      setAuth({
        isLoggedIn: true,
        initialized: true,
        user,
      });

      // 신규 / 기존 분기
      if (isNewMember) {
        navigate("/toss/additional-info");
      } else {
        navigate("/");
      }
    } catch {
      setErrorMsg("로그인 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col px-4">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 flex animate-heart-pulse items-center justify-center">
              <Heart className="h-9 w-9 fill-main-pink opacity-60" stroke="none" />
            </div>
            <Heart className="h-8 w-8 fill-main-pink" stroke="none" />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-gray-600">
          토스로 간편하게 로그인하고
          <br />
          서비스를 이용해보세요
        </p>

        {errorMsg && <p className="mt-4 whitespace-pre-line text-xs text-red-500">{errorMsg}</p>}
      </div>

      <div className="mx-auto w-full max-w-sm pb-8">
        <Button
          size="large"
          display="block"
          loading={loading}
          disabled={loading}
          className="!h-12 !rounded-xl"
          onClick={handleLogin}
        >
          {errorMsg ? "다시 로그인하기" : "토스로 로그인하고 시작하기"}
        </Button>
      </div>
    </main>
  );
}
