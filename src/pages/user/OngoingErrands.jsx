import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosInstance from "@hooks/useAxiosInstance";
import useUserStore from "@zustand/userStore";
import ListItem from "@pages/board/ListItem";

const OngoingErrands = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  const { user } = useUserStore();
  const [errandItems, setErrandItems] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    // 초기 상태를 sessionStorage에서 가져오거나 기본값 설정
    return sessionStorage.getItem("activeTab") || "부탁한 심부름";
  });
  const [loading, setLoading] = useState(false);

  // activeTab이 변경될 때마다 sessionStorage에 저장
  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // API 호출 함수
  const fetchErrands = async (endpoint) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoint);

      if (response.data.ok === 1) {
        if (activeTab === "지원한 심부름") {
          const filteredItems =
            response.data.item
              .filter(
                (order) =>
                  order.state === "OS020" &&
                  order.products[0]?.extra?.productState[0] === "PS020"
              )
              .map((order) => order.products[0]) || [];
          setErrandItems(filteredItems);
        } else {
          const filteredItems =
            response.data.item.filter(
              (product) =>
                product.seller_id === user?._id &&
                product.extra?.productState[0] === "PS020"
            ) || [];
          setErrandItems(filteredItems);
        }
      }
    } catch (error) {
      console.error(`${activeTab} API 호출 오류:`, error);
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 및 초기 데이터 로드
  useEffect(() => {
    if (!user) return;

    const endpoint =
      activeTab === "지원한 심부름" ? "/orders" : "/seller/products";
    fetchErrands(endpoint);
  }, [activeTab, user]);

  // 로그인하지 않은 경우 렌더링하지 않음
  if (!user) return null;

  return (
    <main className="bg-background-color flex-grow p-[16px] flex flex-col gap-[16px] overflow-auto">
      <div className="px-4 py-2">
        <nav className="max-w-full bg-gray-100 border border-gray-200 rounded-lg p-2">
          <div className="flex justify-between items-center gap-2">
            <button
              className={`font-laundry w-1/2 text-center py-2 rounded-lg font-medium ${
                activeTab === "지원한 심부름"
                  ? "bg-white shadow-md"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("지원한 심부름")}
            >
              지원한 심부름
            </button>
            <button
              className={`font-laundry w-1/2 text-center py-2 rounded-lg font-medium ${
                activeTab === "부탁한 심부름"
                  ? "bg-white shadow-md"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("부탁한 심부름")}
            >
              부탁한 심부름
            </button>
          </div>
        </nav>
      </div>

      {loading && <div className="text-center text-gray-500">로딩 중...</div>}

      {!loading && errandItems.length > 0 && (
        <ul className="list flex flex-col items-center gap-[24px]">
          {errandItems.map((item, index) => (
            <ListItem key={item._id || index} item={item} />
          ))}
        </ul>
      )}

      {!loading && errandItems.length === 0 && (
        <div className="text-gray-500">진행 중인 심부름이 없습니다.</div>
      )}
    </main>
  );
};

export default OngoingErrands;
