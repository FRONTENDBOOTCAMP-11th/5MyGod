import { Link, useNavigate } from "react-router-dom";
import useUserStore from "@zustand/userStore";

export default function HeaderButton() {
  const isLoggedOut = useUserStore((state) => state.user === null);
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLoggedOut) navigate("/users/login");
  };

  // 로그인 페이지에서는 버튼을 숨김
  if (
    location.pathname === "/users/login" ||
    location.pathname === "/users/signup"
  ) {
    return null;
  }

  return (
    <div className="flex items-center">
      {!isLoggedOut ? (
        <img
          src="/assets/alarm.png"
          className="size-10 cursor-pointer"
          onClick={handleClick}
          alt="알림"
        />
      ) : (
        <Link
          to={"/users/login"}
          state={{ title: "로그인" }}
          className="font-laundry text-primary-500 text-toggle-text font-bold cursor-pointer"
        >
          시작하기
        </Link>
      )}
    </div>
  );
}
