import useAxiosInstance from "@hooks/useAxiosInstance";
import ListItem from "@pages/board/ListItem";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@zustand/userStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigation } from "@contexts/NavigationContext";

export default function MainPage() {
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const user = useUserStore();

  // 스크롤에 따른 버튼 위치 변경
  const { visible } = useNavigation();
  const [buttonPos, setButtonPos] = useState(window.innerHeight - 83 - 76);

  useEffect(() => {
    const updateButtonPosition = () => {
      // 뷰포트 높이를 기준으로 버튼 위치 계산
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      setButtonPos(
        visible
          ? viewportHeight - 83 - 76 // 네비게이션 바가 보일 때
          : viewportHeight - 76 // 네비게이션 바가 숨겨질 때
      );
    };

    // 초기 위치 설정
    updateButtonPosition();

    // 스크롤시 위치 업데이트
    window.addEventListener("scroll", updateButtonPosition);

    return () => {
      window.removeEventListener("scroll", updateButtonPosition);
    };
  }, [visible]);

  // 심부름 목록 가져오기
  const { data } = useQuery({
    queryKey: ["errands"],
    queryFn: () => axios.get("/products"),
    select: (res) => res.data,
  });
  console.log("로그인 된 유저: ", user);
  console.log("심부름 전체 목록: ", data);

  if (!data) {
    return <div>로딩 중...</div>;
  }

  // 현재 시각
  const now = new Date();

  // 심부름 목록 필터링
  // const filteredItems = data.item.filter((item) => {
  //   const isRecruiting = item.extra.productState[0] === "PS010"; // 구인 중
  //   const isBeforeDue = new Date(item.extra.due) >= now; // 기한 안 지남

  //   return isRecruiting && isBeforeDue;
  // });

  // 심부름 배열을 순회하며 <ListItem> 생성
  const list = data.item.map((item) => <ListItem key={item._id} item={item} />);

  const handleRequestClick = () => {
    navigate(`/errand/new`); // 작성페이지로 이동
    window.scrollTo(0, 0); // 스크롤 위치 초기화
  };

  return (
    <div className="l_container max-w-[393px] h-screen mx-auto flex flex-col">
      <main className="bg-background-color flex-grow p-[16px] flex flex-col gap-[16px] relative">
        <div className="list_info font-laundry text-[14px] text-gray-700 flex justify-between items-center px-2">
          <p>
            심부름 <span className="text-red-500">{data.item.length}건이</span>{" "}
            있어요
          </p>

          <div className="flex gap-4">
            <img src="/assets/filter.svg" />
            <img src="/assets/search.svg" />
          </div>
        </div>

        <ul className="list flex flex-col items-center gap-[24px] pb-[80px]">
          {list}
        </ul>

        <button
          type="button"
          onClick={() => {
            handleRequestClick();
          }}
          className={`bg-primary-500 font-laundry text-[24px] text-white p-[20px] rounded-t-lg fixed max-w-[393px] mx-auto left-0 right-0`}
          style={{ top: `${buttonPos}px` }}
        >
          새로운 심부름 요청하기
        </button>
      </main>
    </div>
  );
}
