import useUserStore from "@zustand/userStore";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const REFRESH_URL = "/auth/refresh";

function useAxiosInstance() {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const instance = axios.create({
    baseURL: "https://11.fesp.shop",
    timeout: 1000 * 15,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "client-id": "final05",
    },
  });

  instance.interceptors.request.use((config) => {
    if (user && config.url !== REFRESH_URL) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    config.params = {
      ...config.params, // 기존 쿼리스트링 복사
    };

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (response?.status === 401 && config.url !== REFRESH_URL) {
        try {
          // 토큰 갱신 요청
          const {
            data: { accessToken },
          } = await instance.get(REFRESH_URL, {
            headers: {
              Authorization: `Bearer ${user.refreshToken}`,
            },
          });

          setUser({ ...user, accessToken });

          // 실패했던 요청 재시도
          config.headers.Authorization = `Bearer ${accessToken}`;
          return axios(config);
        } catch (refreshError) {
          console.error("토큰 갱신 실패:", refreshError);
          // 토큰 갱신 실패 시 상태 초기화 (로그아웃 처리는 protect.jsx에서 관리)
          setUser(null);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export default useAxiosInstance;
