import { useLocation, useNavigate } from "react-router-dom";
import HeaderButton from "@components/HeaderButton";

export default function NavigationHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const PAGE_CONFIGS = [
    {
      pattern: /^\/$/,
      config: {
        title: "오는길에",
        showBackButton: false,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/errand\/new$/,
      config: {
        title: "심부름 요청하기",
        showBackButton: true,
        showHeaderButton: true,
        bgColor: "bg-white",
      },
    },
    {
      pattern: /^\/errand\/[^/]+\/applicants$/,
      config: {
        title: "지원자들",
        showBackButton: true,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/errand\/[^/]+$/,
      config: {
        title: "심부름 상세",
        showBackButton: true,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/users\/mypage$/,
      config: {
        title: "내 정보",
        showBackButton: false,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/users\/ongoingErrands$/,
      config: {
        title: "진행중 심부름",
        showBackButton: false,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/users\/signup$/,
      config: {
        title: "회원가입",
        showBackButton: true,
        showHeaderButton: false,
        bgColor: "bg-background-color",
      },
    },

    {
      pattern: /^\/users\/login$/,
      config: {
        title: "로그인",
        showBackButton: true,
        showHeaderButton: false,
        bgColor: "bg-background-color",
      },
    },
    {
      pattern: /^\/users\/[^/]+$/,
      config: {
        title: "프로필",
        showBackButton: true,
        showHeaderButton: true,
        bgColor: "bg-background-color",
      },
    },
  ];

  const DEFAULT_CONFIG = {
    title: "오는길에",
    showBackButton: true,
    showHeaderButton: true,
    bgColor: "bg-background-color",
  };

  const getPageConfig = () => {
    const matchedConfig = PAGE_CONFIGS.find(({ pattern }) =>
      pattern.test(location.pathname)
    );
    return matchedConfig ? matchedConfig.config : DEFAULT_CONFIG;
  };

  const config = getPageConfig();

  const handleBack = () => {
    navigate(-1);
  };

  const getTitleStyle = (title) => {
    if (title === "오는길에") {
      return "font-laundry align-baseline flex font-bold text-primary-500 text-[28px]";
    }
    return "font-laundry align-baseline grid place-items-center text-[20px] text-gray-900";
  };
  const commonHeaderStyle =
    "w-full min-h-[49px] flex justify-between items-center tracking-tighter sticky top-0";

  //결제 완료 페이지에서 안보이도록 처리
  if (location.pathname === "/pay/paysuccess") {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${commonHeaderStyle} ${config.bgColor} h-14 border-b border-gray-100 flex items-center max-w-[393px] mx-auto z-50`}
    >
      <div className="flex items-center justify-between w-full px-4">
        {/* 왼쪽: 타이틀 또는 앱 이름 */}
        <div className="flex items-center">
          {config.showBackButton && (
            <button onClick={handleBack}>
              <img src="/assets/back-icon.png" />
            </button>
          )}
          <h1 className={`${getTitleStyle(config.title)}`}>{config.title}</h1>
        </div>
        {/* 오른쪽: 로그인시 알람, 로그아웃시 "시작하기" */}
        <HeaderButton />
      </div>
    </header>
  );
}
