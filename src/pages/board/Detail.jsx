import LocationMap from "@components/LocationMap";
import useAxiosInstance from "@hooks/useAxiosInstance";
import CommentList from "@pages/board/CommentList";
import { useMutation, useQuery } from "@tanstack/react-query";
import useUserStore from "@zustand/userStore";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigation } from "@contexts/NavigationContext";
import Payment from "@components/pay/Payment";

export default function Detail() {
  const axios = useAxiosInstance();
  const { _id } = useParams();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { visible } = useNavigation();
  const [buttonPos, setButtonPos] = useState(window.innerHeight - 83 - 76);

  ///////////////////////////////////////////////////////////////// api 통신 /////////////////////////////////////////////////////////////////

  // 심부름 데이터 받아오기
  const { data } = useQuery({
    queryKey: ["products", _id],
    queryFn: () => axios.get(`/products/${_id}`),
    select: (res) => res.data,
  });
  console.log("심부름 데이터: ", data);
  console.log("유저 데이터: ", user);

  // 이 심부름에 대한 나의 지원 내역 받아오기
  const { data: myAppliesToThis } = useQuery({
    queryKey: ["myAppliesToThis", _id],
    queryFn: () => axios.get(`/orders?custom={"products._id": ${_id}}`),
    select: (res) => res.data.item,
    onError: (err) => {
      console.error(err);
    },
    enabled: !!user,
  });
  console.log("이 심부름에 대한 나의 지원 내역: ", myAppliesToThis);

  // 이 심부름에 대한 지원자 데이터 받아오기
  const { data: applicantsData } = useQuery({
    queryKey: ["applicants", _id],
    queryFn: () => axios.get(`/seller/orders?custom={"products._id": ${_id}}`),
    select: (res) => res.data,
    onError: (err) => console.error(err),
    enabled: !!user,
  });
  console.log("이 심부름에 대한 지원 데이터: ", applicantsData);

  //////////////////////////////////////////////////////////////////// 함수 //////////////////////////////////////////////////////////////////

  // 남은 시간 계산하는 헬퍼 함수
  function calculateRemainingTime(due) {
    const now = dayjs(); // 현재 시각
    const dueTime = dayjs(due, "YYYY.MM.DD HH:mm:ss"); // 마감일시를 dayjs 객체로 변환
    const diff = dueTime.diff(now, "millisecond"); // 남은 시간 (밀리초 단위)

    if (diff <= 0) {
      return "마감";
    }

    const duration = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)), // 남은 일수
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), // 남은 시간
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), // 남은 분
    };

    if (duration.days > 0) {
      // 하루 이상 남은 경우
      return `${duration.days}일 남음`;
    } else if (duration.hours > 0) {
      // 하루 미만, 1시간 이상 남은 경우
      return `${duration.hours}시간 남음`;
    } else if (duration.minutes > 0) {
      // 1시간 미만으로 남은 경우
      return "곧 마감";
    }
  }

  // 지원하기 함수
  const apply = useMutation({
    mutationFn: (_id) => {
      const body = {
        products: [
          {
            _id: Number(_id),
            quantity: 1,
          },
        ],
      };
      return axios.post(`/orders/`, body);
    },

    onSuccess: () => {
      alert("심부름 지원이 완료되었습니다.");
      navigate(`/users/mypage?tab=apply`);
    },
    onError: (err) => {
      alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(err);
    },
  });

  ///////////////////////////////////////////////////////////////////// UI //////////////////////////////////////////////////////////////////

  // 버튼 위치 관리
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

  // 회원 성별에 따라 이미지 매핑
  let genderImage;
  if (data?.item?.seller?.extra?.gender === "male") {
    genderImage = `/assets/male.png`;
  } else if (data?.item?.seller?.extra?.gender === "female") {
    genderImage = `/assets/female.png`;
  } else {
    genderImage = `/assets/unchecked.png`;
  }

  // 마감 일시를 동적으로 출력하기 위한 변수
  let dueDateDisplay;
  if (data?.item?.extra?.due) {
    const due = data.item.extra.due;
    const date = new Date(due);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedTime = `${date.getHours()}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
    dueDateDisplay = (
      <div>
        <span className="text-primary-700">{month}</span>월{" "}
        <span className="text-primary-700">{day}</span>일{" "}
        <span className="text-primary-700">{formattedTime}</span> 까지
      </div>
    );
  }

  // 위치 정보
  const pickupLocation = data?.item?.extra?.pickupLocation;
  const arrivalLocation = data?.item?.extra?.arrivalLocation;

  // 이 심부름에 지원한 지원자 수
  const applicantCount = applicantsData?.item?.length;

  //////////////////////////////////////////////////////////////// 다이나믹 버튼 ////////////////////////////////////////////////////////////////

  // 로그인 상태인지 아닌지 구분
  const isLoggedIn = user !== null && user !== undefined;
  console.log("로그인 상태인지: ", isLoggedIn);

  // 심부름 구분
  // 내가 올린 심부름인지 아닌지 여부
  const isMyErrand = data?.item?.seller_id === user?._id || false;
  console.log("내가 요청한 심부름인지: ", isMyErrand);
  // 심부름의 상태
  const errandState = data?.item?.extra?.productState[0];
  console.log("심부름 상태 코드: ", errandState);
  // 기한 만료 여부
  const isPastDue = calculateRemainingTime(data?.item?.extra?.due) === "마감";
  console.log("기한 만료 여부: ", isPastDue);
  // 이 심부름에 내가 이미 지원했는지 여부
  const isAlreadyApplied = myAppliesToThis?.length > 0;
  console.log("이미 지원했는지: ", isAlreadyApplied);

  // 심부름 구분에 따라 버튼의 UI와 동작 정의 (다이나믹 버튼)
  const defineDynamicButton = () => {
    if (!data || !data.item || !data.item.extra) return {};

    if (errandState === "PS030") {
      // 완료됨
      return {
        text: "이미 완료된 심부름이에요",
        action: () => {},
        dynamicBg: "bg-gray-400",
        dynamicTextColor: "text-white",
        dynamicCursor: "cursor-default",
      };
    } else if (errandState === "PS010" && isPastDue) {
      // 기한 만료됨
      return {
        text: "기한이 지난 심부름이에요",
        action: () => {},
        dynamicBg: "bg-gray-400",
        dynamicTextColor: "text-white",
        dynamicCursor: "cursor-default",
      };
    } else if (isMyErrand && errandState === "PS010") {
      // 내가 요청한 && 구인 중
      return {
        text: `지원자 ${applicantCount}명 확인하기`,
        action: () => {
          navigate(`/errand/applicants/${_id}`, { state: { applicantsData } }); // 지원자목록 페이지로 이동, 지원 데이터를 전달
        },
        dynamicBg: "bg-primary-500",
        dynamicTextColor: "text-white",
        dynamicCursor: "cursor-pointer",
      };
    } else if (!isMyErrand && errandState === "PS010") {
      // 남이 요청한 && 구인 중
      if (isAlreadyApplied) {
        // 이미 지원한 경우
        return {
          text: "이미 지원한 심부름이에요",
          dynamicBg: "bg-gray-400",
          dynamicTextColor: "text-white",
          dynamicCursor: "cursor-default",
        };
      } else {
        // 아직 지원 안한 경우
        return {
          text: "지원하기",
          action: () => {
            apply.mutate(_id); // 지원하기 함수 호출
          },
          dynamicBg: "bg-complementary-300",
          dynamicTextColor: "text-primary-500",
          dynamicCursor: "cursor-pointer",
        };
      }
    } else if (!isMyErrand && errandState === "PS020") {
      // 남이 요청한 && 진행 중
      return {
        text: "진행 중인 심부름이에요",
        action: () => {},
        dynamicBg: "bg-gray-400",
        dynamicTextColor: "text-white",
        dynamicCursor: "cursor-default",
      };
    }

    return {
      text: "",
      action: () => {},
      dynamicBg: "",
      dynamicTextColor: "",
      dynamicCursor: "cursor-default",
    };
  };

  const { text, action, dynamicBg, dynamicTextColor, dynamicCursor } =
    defineDynamicButton();

  //////////////////////////////////////////////////////////////// 리턴 블록 /////////////////////////////////////////////////////////////////

  if (!data) {
    return <div>로딩 중...</div>;
  }

  return (
    <main className="bg-background-color flex-grow p-[16px] flex flex-col gap-[16px] relative">
      <div className="post bg-[#fff] p-[22px] rounded-lg shadow-card-shadow grow">
        <div className="post_header border-b-[1px] border-gray-400 pb-[20px] flex flex-col gap-[20px]">
          <div className="post_title font-laundry text-detail-title break-all flex gap-[12px] items-center">
            <h1>{data.item.name}</h1>
          </div>

          {/* 작성자 프로필 */}
          <Link to={`/users/${data.item.seller_id}`}>
            <div className="profile_card flex gap-[12px] items-center text-small-text">
              <img
                src={`https://11.fesp.shop${data.item.seller.image}`}
                className="profile_image rounded-full w-[36px] h-[36px] border-primary-50 border-[1px] bg-cover bg-center shrink-0"
              />

              <div className="nickname">{data.item.seller.name}</div>

              <img
                className="gender w-[24px] h-[24px] shrink-0"
                src={`${genderImage}`}
              />

              {/* <div className="like_number shrink-0 flex gap-[2px] items-center">
              <img src="/assets/thumb.png" className="w-[24px] h-[24px]" />
              {data.item.seller.extra.likes}
            </div> */}
            </div>
          </Link>
        </div>

        <div className="post_body pt-[20px] flex flex-col gap-[16px] font-pretendard text-regular-text">
          {/* 심부름 내용 */}
          <div className="post_detail">
            <p className="whitespace-pre-line">{data.item.content}</p>
          </div>

          {/* 심부름 정보 블록*/}
          <div className="post_info flex flex-col gap-[12px]">
            {/* 시간 */}
            <div className="post_time flex gap-[8px] items-center">
              <img src="/assets/redwatch.png" className="w-[20px] h-[20px]" />
              {dueDateDisplay}
            </div>

            {/* 금액 */}
            <div className="post_price flex gap-[8px] items-center">
              <img src="/assets/moneypouch.png" className="w-[20px] h-[20px]" />
              <p>
                <span className="text-primary-700">
                  {`${new Intl.NumberFormat().format(data.item.price)} `}
                </span>
                원
              </p>
            </div>

            {/* 위치(지도) */}
            <div className="post_location flex flex-col gap-[16px]">
              {/* 픽업 위치 */}
              <div className="flex items-center gap-[8px]">
                <img src="/assets/pin.png" className="w-[20px] h-[20px]" />
                <p className="flex-grow">픽업 위치</p>
              </div>

              <div className="post_map w-full rounded-lg shadow-card-shadow p-[12px] border-[1px]">
                {pickupLocation?.coordinates ? (
                  <>
                    {pickupLocation?.coordinates && (
                      <LocationMap
                        title="픽업 위치"
                        coordinates={pickupLocation.coordinates}
                      />
                    )}

                    <div className="post_address p-[8px] pb-0 text-small-text flex flex-col gap-[4px]">
                      <div className="address_main flex gap-[4px]">
                        <span className="text-small-text text-primary-700">
                          기본 주소:{"  "}
                        </span>
                        <p className="text-small-text">
                          {pickupLocation.address}
                        </p>
                      </div>
                      <div className="address_main flex gap-[4px]">
                        <span className="text-small-text text-primary-700">
                          상세 주소:{"  "}
                        </span>
                        <p className="text-small-text">
                          {pickupLocation.detailAddress}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="message_nomap flex justify-center   rounded-lg p-[8px] text-gray-700">
                      픽업이 필요 없어요
                    </div>
                  </>
                )}
              </div>

              {/* 도착 위치 */}
              <div className="flex items-center gap-[8px]">
                <img src="/assets/pin.png" className="w-[20px] h-[20px]" />
                <p className="flex-grow">도착 위치</p>
              </div>

              <div className="post_map w-full rounded-lg shadow-card-shadow p-[12px] border-[1px]">
                {arrivalLocation?.coordinates ? (
                  <>
                    {arrivalLocation?.coordinates && (
                      <LocationMap
                        title="도착 위치"
                        coordinates={arrivalLocation.coordinates}
                      />
                    )}
                    <div className="post_address p-[8px] pb-0 text-small-text flex flex-col gap-[4px]">
                      <div className="address_main flex gap-[4px]">
                        <span className="text-small-text text-primary-700">
                          기본 주소:{"  "}
                        </span>
                        <p className="text-small-text">
                          {arrivalLocation.address}
                        </p>
                      </div>
                      <div className="address_main flex gap-[4px]">
                        <span className="text-small-text text-primary-700">
                          상세 주소:{"  "}
                        </span>
                        <p className="text-small-text">
                          {arrivalLocation.detailAddress}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="message_nomap flex justify-center rounded-lg p-[8px] text-gray-700">
                    도착 위치 정보가 없어요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentList />

      <div className="pb-40 bg-background-color"></div>

      {/* 결제 컴포넌트 버튼 */}
      {isLoggedIn && isMyErrand && errandState === "PS020" && (
        <Payment item={data.item} buttonPos={buttonPos} />
      )}

      {/* 다이나믹 버튼 */}
      {isLoggedIn && !(isMyErrand && errandState === "PS020") && (
        <button
          type="button"
          onClick={action}
          className={`${dynamicBg} ${dynamicTextColor} ${dynamicCursor} font-laundry text-[24px] p-[20px] rounded-t-lg fixed max-w-[393px] mx-auto left-0 right-0 w-full z-10`}
          style={{ top: `${buttonPos}px` }}
        >
          {text}
        </button>
      )}
    </main>
  );
}
