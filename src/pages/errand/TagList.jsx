import PropTypes from "prop-types";

TagList.propTypes = {
  item: PropTypes.object.isRequired,
};

export default function TagList({ item }) {
  // 태그 별로 이미지와 텍스트 매핑
  const tagData = {
    TA01: {
      image: "/assets/watch.png",
      text: "시간이 생명",
      bgClass: "bg-[#FCFFD8]",
    },
    TA02: {
      image: "/assets/siren.png",
      text: "도와주세요",
      bgClass: "bg-[#FFD8E0]",
    },
    TA03: {
      image: "/assets/calendar.png",
      text: "일정 조정 가능",
      bgClass: "bg-orange-100",
    },
    TA04: {
      image: "/assets/money.png",
      text: "금액 협의 가능",
      bgClass: "bg-primary-50",
    },
    TA05: {
      image: "/assets/male.png",
      text: "남자만",
      bgClass: "bg-neutral-100",
    },
    TA06: {
      image: "/assets/female.png",
      text: "여자만",
      bgClass: "bg-neutral-100",
    },
    TA07: {
      image: "/assets/adult.png",
      text: "어른만",
      bgClass: "bg-neutral-100",
    },
  };

  return (
    <ul
      className={`tags flex gap-[8px] min-w-0 w-full overflow-scroll scrollbar-hide`}
    >
      {item.extra?.tags.length > 0 ? (
        item.extra?.tags.map((tag, index) => {
          const tagInfo = tagData[tag] || {}; // 태그 정보 가져오기

          return (
            <li
              key={index}
              className={`tag flex items-center gap-[4px] px-[6px] rounded ${
                tagInfo.bgClass || "bg-neutral-100"
              } font-pretendard text-[16px] max-w-full truncate text-ellipsis min-w-0 flex-shrink-0`}
            >
              <img
                src={tagInfo.image}
                alt={`${tag} 태그 이미지`}
                className="tag_image w-[18px] h-[18px]"
              />
              <p className="tag_text font-pretendard text-[16px] max-w-full">
                {tagInfo.text}
              </p>
            </li>
          );
        })
      ) : (
        <div></div>
      )}
    </ul>
  );
}
