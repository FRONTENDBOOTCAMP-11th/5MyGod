import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useUserStore from "@zustand/userStore";

function Protected() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const promptShownRef = useRef(false);
  const prevUserRef = useRef(user);

  useEffect(() => {
    const isJustLoggedOut = sessionStorage.getItem("justLoggedOut") === "true";

    if (!user && prevUserRef.current && !isJustLoggedOut) {
      // 사용자가 로그아웃한 경우
      sessionStorage.setItem("justLoggedOut", "true");
      navigate("/");
    } else if (!user && !promptShownRef.current && !isJustLoggedOut) {
      promptShownRef.current = true;
      const gotoLogin = window.confirm("로그인 후 이용 가능합니다.\n로그인 페이지로 이동하시겠습니까?");
      if (gotoLogin) {
        navigate("/users/login");
      } else {
        navigate("/");
      }
    }

    if (isJustLoggedOut) {
      sessionStorage.removeItem("justLoggedOut");
    }

    prevUserRef.current = user;
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <Outlet />;
}

export default Protected;
