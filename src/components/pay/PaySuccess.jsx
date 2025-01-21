import LikeButton from "@components/pay/LikeButton";
import useAxiosInstance from "@hooks/useAxiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaySuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMoveToMyRequests = () => {
    navigate("/users/mypage?tab=requests");
  };

  // const prodData = location.state; // 결제 완료한 상품 데이터
  const matchedUserId = location.state?.extra?.matchedUserId; //매칭된 유저 아이디
  const payAmount = location.state?.price;

  const axios = useAxiosInstance();

  const { data: userData } = useQuery({
    queryKey: ["users", matchedUserId],
    queryFn: () => axios.get(`/users/${matchedUserId}`),
    select: (res) => res.data.item,
    enabled: !!matchedUserId,
  });
  console.log("매칭된 유저 데이터 ", userData);

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <button
        onClick={handleMoveToMyRequests}
        className="absolute top-5 left-5 text-gray-400 text-2xl"
      >
        <img src="/assets/x-icon.png" />
      </button>

      <div className="content-center flex flex-col items-center">
        <img src="/assets/success.png" className="mx-auto" />
        <p className="font-pretendard font-extrabold text-popup-title text-primary-500 text-center my-5">
          결제 완료
        </p>
        <p className="font-pretendard text-popup-text text-gray-700 text-center">
          {payAmount?.toLocaleString()}원을 결제했어요.
        </p>
        <p className="font-pretendard text-popup-text text-gray-700 text-center mt-32 mb-2">
          {userData?.name}님의
          <br />
          심부름에 만족하셨다면
        </p>
        <LikeButton className="mx-auto" />
        <button
          onClick={handleMoveToMyRequests}
          className="bg-primary-500 text-white font-laundry text-[24px] p-[20px] rounded-t-lg fixed max-w-[393px] mx-auto left-0 right-0 w-full"
          style={{
            top: `${
              (window.visualViewport?.height || window.innerHeight) - 76
            }px`,
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
