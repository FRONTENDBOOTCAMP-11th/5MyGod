import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Protected from "./protected";

const Layout = lazy(() => import("@components/layout"));
const MainPage = lazy(() => import("@pages/board/MainPage"));
const Detail = lazy(() => import("@pages/board/Detail"));
const Applicants = lazy(() => import("@pages/board/Applicants"));
const New = lazy(() => import("@pages/board/New"));
const Login = lazy(() => import("@pages/user/Login"));
const Signup = lazy(() => import("@pages/user/Signup"));
const MyPage = lazy(() => import("@pages/user/Mypage"));
const UserPage = lazy(() => import("@pages/user/UserPage"));
const OngoingErrands = lazy(() => import("@pages/user/OngoingErrands"));
const MyApplies = lazy(() => import("@pages/user/MyApplies"));
const PaySuccess = lazy(() => import("@components/pay/PaySuccess"));

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [
        { index: true, element: <MainPage /> },
        { path: "users/signup", element: <Signup /> },
        { path: "users/login", element: <Login /> },
        { path: "errand/:_id", element: <Detail /> },

        //로그인 필요한 페이지
        {
          element: <Protected />,
          children: [
            { path: "errand/applicants/:_id", element: <Applicants /> },
            { path: "errand/new", element: <New /> },
            { path: "users/mypage", element: <MyPage /> },
            { path: "users/myApplies", element: <MyApplies /> },
            { path: "users/ongoingErrands", element: <OngoingErrands /> },
            { path: "users/:_id", element: <UserPage /> },
            { path: "pay/paysuccess", element: <PaySuccess /> },
          ],
        },
      ],
    },
  ],
  {
    future: {
      // 없으면 콘솔에 경고 표시 (예정된 업데이트 이슈)
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default router;
