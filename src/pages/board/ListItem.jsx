import { Link } from "react-router-dom";
import TagList from "@pages/board/TagList";
import PropTypes from "prop-types";
import dayjs from "dayjs";

ListItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),

    extra: PropTypes.shape({
      category: PropTypes.array.isRequired,
      tags: PropTypes.array.isRequired,
      due: PropTypes.string.isRequired,
      productState: PropTypes.array.isRequired,
    }),
  }),
};

// 남은 시간 계산하는 헬퍼 함수
function calculateRemainingTime(due) {
  const now = dayjs(); // 현재 시각
  const dueTime = dayjs(due, "YYYY.MM.DD HH:mm:ss"); // 마감일시를 dayjs 객체로 변환
  const diff = dueTime.diff(now, "millisecond"); // 남은 시간 (밀리초 단위)

  if (diff <= 0) {
    return "마감";
  }

  // 남은 시간 계산
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

export default function ListItem({ item }) {
  // 기한 만료 여부 변수
  const isPastDue = calculateRemainingTime(item?.extra?.due) === "마감";

  // 심부름 상태 변수
  const isCompleted = item.extra?.productState[0] === "PS030";
  const isExpired = item.extra?.productState[0] === "PS010" && isPastDue;
  const isOngoing = item.extra?.productState[0] === "PS020";

  // 완료 / 기한 만료 / 진행 중 심부름에 덮을 반투명 레이어
  let overlayClass;
  if (isCompleted || isExpired) {
    overlayClass = "absolute inset-0 bg-gray-400 bg-opacity-50 rounded-[10px]";
  } else if (isOngoing) {
    overlayClass =
      "absolute inset-0 bg-primary-100 bg-opacity-50 rounded-[10px]";
  } else {
    overlayClass = "";
  }

  // 반투명 레이어에 띄울 메시지
  let overlayMessage;
  if (isCompleted) {
    overlayMessage = "완료된 심부름";
  } else if (isExpired) {
    overlayMessage = "기한이 지난 심부름";
  } else if (isOngoing) {
    overlayMessage = "진행 중인 심부름";
  }

  // category에 따라 이미지 경로 매핑
  const categoryImages = {
    PC01: "/assets/bike.svg",
    PC02: "/assets/thumb.svg",
    PC03: "/assets/star.svg",
    PC04: "/assets/genie.svg",
    PC05: "/assets/twohearts.svg",
  };

  // category의 첫번째 값을 기반으로 이미지 경로 설정
  const categoryImage =
    categoryImages[item.extra?.category[0]] || "/assets/check.svg"; // category 설정이 안 된 경우 기본 이미지로 체크이미지 표시

  // 남은 시간
  const remainingTime = calculateRemainingTime(item.extra?.due);

  return (
    <Link
      to={`/errand/${item._id}`}
      className={`list_item w-full h-[116px] rounded-[10px] bg-white shadow-card-shadow px-[22px] py-[18px] flex gap-[24px] items-center relative`}
    >
      <div
        className={`overlay ${overlayClass} flex items-center justify-center absolute`}
      >
        <p className="w-1/2 h-1/2 bg-white bg-opacity-70 flex items-center justify-center rounded-lg font-laundry text-[20px] text-gray-500">
          {overlayMessage}
        </p>
      </div>
      <img
        src={categoryImage}
        alt="게시글 대표이미지"
        className="flex-shrink-0 w-[40px] h-[40px]"
      />

      <div className="li_contents max-w-full min-w-0 flex flex-col flex-grow gap-[4px]">
        <h2 className="li_title font-laundry text-card-title truncate overflow-hidden text-ellipsis">
          {item.name}
        </h2>

        <TagList item={item} />

        <div className="li_info flex flex-grow justify-between">
          <div className="font-pretendard text-card-timelimit">
            {remainingTime}
          </div>
          <div className="font-pretendard text-card-price">
            {new Intl.NumberFormat("ko-KR").format(item.price)} 원
          </div>
        </div>
      </div>
    </Link>
  );
}
