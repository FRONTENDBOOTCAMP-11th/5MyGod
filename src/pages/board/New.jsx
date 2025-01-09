import InputError from "@components/InputError";
import { useState } from "react";
import { useForm } from "react-hook-form";
import DaumPostCode from "react-daum-postcode";
import DateAndTimePicker from "@components/DateAndTimePicker";

export default function New() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  ////////////////////////////////////////////////////////////// 제목 //////////////////////////////////////////////////////////////
  // 제목 입력 상태 관리 및 실시간 반영
  const title = watch("name", "");
  const maxTitleLength = 50;
  const handleTitleChange = (e) => {
    const input = e.target.value.slice(0, maxTitleLength - 1); // 50자 넘어가면 자름
    setValue("name", input, { shouldValidate: true });
  };

  ////////////////////////////////////////////////////////////// 카테고리, 태그 //////////////////////////////////////////////////////////////
  const [selectedCategory, setSelectedCategory] = useState(""); // 카테고리 선택 상태 관리
  const [selectedTags, setSelectedTags] = useState([]); // 태그 선택 상태 관리

  const categories = ["배달", "전문가", "재능판매", "대행", "돌봄"];

  const tags = [
    "시간이 생명",
    "도와주세요",
    "일정 조정 가능",
    "금액 협의 가능",
    "남자만",
    "여자만",
    "어른만",
  ];

  // 카테고리와 태그를 코드와 매핑
  const categoryCodes = {
    배달: "PC01",
    전문가: "PC02",
    재능판매: "PC03",
    대행: "PC04",
    돌봄: "PC05",
  };

  const tagCodes = {
    "시간이 생명": "CA01",
    도와주세요: "CA02",
    "일정 조정 가능": "CA03",
    "금액 협의 가능": "CA04",
    남자만: "CA05",
    여자만: "CA06",
    어른만: "CA07",
  };

  // 카테고리 선택 / 해제 함수
  const handleCategoryClick = (category) => {
    // 이미 선택된 카테고리를 또 누르면 선택 해제, 선택 안되어 있던 카테고리를 누르면 선택
    setSelectedCategory((prev) =>
      prev === categoryCodes[category] ? "" : categoryCodes[category]
    );
  };

  // 태그 선택 / 해제 함수
  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      // 이미 선택된 태그를 또 누르면 배열에서 제거(선택해제), 선택 안되어 있던 태그를 누르면 배열에 추가
      prev.includes(tagCodes[tag])
        ? prev.filter((t) => t !== tagCodes[tag])
        : [...prev, tagCodes[tag]]
    );
  };

  // 카테고리 목록 렌더링 함수 (선택 / 비선택 구분됨)
  const renderCategories = () =>
    categories.map((category) => (
      <li
        key={category}
        className={`category flex items-center gap-[4px] px-[6px] rounded  border-[1px] border-gray-500 font-pretendard text-[16px] max-w-full truncate text-ellipsis min-w-0 flex-shrink-0 select-none cursor-pointer ${
          selectedCategory === categoryCodes[category]
            ? "bg-primary-500 text-white"
            : "bg-gray-100 text-black"
        }`}
        onClick={() => handleCategoryClick(category)}
      >
        {category}
      </li>
    ));

  // 태그 목록 렌더링 함수 (선택 / 비선택 구분됨)
  const renderTags = () =>
    tags.map((tag) => (
      <li
        key={tag}
        className={`tag flex items-center gap-[4px] px-[6px] rounded border-[1px] border-gray-500 font-pretendard text-[16px] max-w-full truncate text-ellipsis min-w-0 flex-shrink-0 select-none cursor-pointer ${
          selectedTags.includes(tagCodes[tag])
            ? "bg-primary-500 text-white"
            : "bg-gray-100 text-black"
        }`}
        onClick={() => handleTagClick(tag)}
      >
        {tag}
      </li>
    ));

  ////////////////////////////////////////////////////////////// 위치 //////////////////////////////////////////////////////////////
  const [pickupAddress, setPickupAddress] = useState(""); // 픽업 주소
  const [deliveryAddress, setDeliveryAddress] = useState(""); // 도착 주소
  const [isPickupOpen, setIsPickupOpen] = useState(false); // 픽업 주소 검색창 열기/닫기
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false); // 도착 주소 검색창 열기/닫기
  const [isPickupDisabled, setIsPickupDisabled] = useState(false); // 픽업이 필요 없어요 상태
  const [isdeliveryDisabled, setIsDeliveryDisabled] = useState(false); // 도착 위치가 필요 없어요 상태

  // 주소 선택 핸들러 (픽업)
  const handleCompletePickup = (data) => {
    setPickupAddress(data.address);
    setIsPickupOpen(false); // 검색창 닫기
  };

  // 주소 선택 핸들러 (도착)
  const handleCompleteDelivery = (data) => {
    setDeliveryAddress(data.address);
    setIsDeliveryOpen(false); // 검색창 닫기
  };
  ////////////////////////////////////////////////////////////// 일시 //////////////////////////////////////////////////////////////
  const [dateAndTime, setDateAndTime] = useState("");

  ////////////////////////////////////////////////////////////// 금액 //////////////////////////////////////////////////////////////
  const price = watch("price", ""); // react-hook-form에서 price값을 실시간으로 감시

  // 세 자리마다 쉼표 찍는 함수
  const formatPrice = (value) => {
    if (!value) return "";
    const numberValue = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 값 제거
    return Number(numberValue).toLocaleString(); // 세 자리마다 쉼표 추가
  };

  // 입력값 변경 핸들러
  const handlePriceChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, ""); // 숫자가 아닌 값 제거
    setValue("price", inputValue, { shouldValidate: true }); // 숫자로만 이루어진 값을 react-hook-form 값으로 저장
  };

  ////////////////////////////////////////////////////////////// return //////////////////////////////////////////////////////////////
  return (
    <main className="bg-background-color flex-grow p-[16px] flex flex-col gap-[16px] overflow-scroll">
      {/* 심부름 제목 입력 */}
      <form
        className="task_name p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]"
        onSubmit={handleSubmit()}
      >
        <p className="font-laundry text-input-title">
          심부름 제목을 입력해주세요
        </p>

        <div className="min-h-[16px] bg-gray-100 rounded-lg p-[20px] flex gap-[8px] items-center">
          <input
            type="text"
            value={watch("name", "").slice(0, maxTitleLength - 1)}
            onChange={handleTitleChange}
            className="w-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none"
            placeholder="심부름 제목을 작성해주세요"
            {...register("name", {
              required: "심부름 제목을 작성해주세요.",
              maxLength: {
                value: maxTitleLength,
                message: `제목은 최대 ${maxTitleLength}자입니다.`,
              },
            })}
          ></input>
          <span className="text-xs text-gray-500 shrink-0">
            {title.length} / {maxTitleLength}
          </span>
        </div>
        <InputError target={errors?.name} />
      </form>

      {/* 카테고리 선택 */}
      <div className="task_category p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
        <p className="font-laundry text-input-title">
          심부름 구분을 선택해주세요
        </p>
        <ul className="category_list flex gap-[12px]">{renderCategories()}</ul>
      </div>

      {/* 태그 선택 */}
      <div className="task_tag p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
        <p className="font-laundry text-input-title">
          태그를 선택해주세요 <span className="text-gray-500">(선택)</span>
        </p>
        <ul className="tag_list flex gap-[12px] flex-wrap">{renderTags()}</ul>
      </div>

      {/* 심부름 내용 */}
      <form
        className="task_content p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]"
        onSubmit={handleSubmit()}
      >
        <p className="font-laundry text-input-title">무엇을 요청할까요?</p>

        <div className="min-h-[200px] bg-gray-100 rounded-lg p-[20px]">
          <textarea
            className="w-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none"
            placeholder="심부름 내용을 설명해주세요"
            {...register("content", {
              required: "심부름 내용을 작성해주세요.",
            })}
          ></textarea>
          <InputError target={errors.content} />
        </div>
      </form>

      {/* 심부름 위치 */}
      <div className="task_location p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
        <p className="font-laundry text-input-title">
          심부름의 위치를 알려주세요
        </p>

        {/* 픽업 위치 입력 필드들 */}
        {!isPickupDisabled ? (
          <div className="pickup_fields flex flex-col gap-[12px]">
            <div className="flex gap-[8px] items-center">
              <img src="../../assets/pin.svg" />
              <p className="font-laundry font-bold">픽업 위치</p>
            </div>

            {/* 주소 검색 필드 */}
            <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
              <input
                type="text"
                className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                placeholder="주소 검색"
                value={pickupAddress}
                onClick={() => setIsPickupOpen(true)}
                readOnly
              ></input>
            </div>

            {/* Daum Postcode 검색창 */}
            {isPickupOpen && (
              <div className="daum-postcode-modal flex flex-col gap-[12px] p-[12px] shadow-card-shadow rounded-lg">
                <DaumPostCode onComplete={handleCompletePickup} />
                <button
                  className="font-laundry bg-primary-400 text-white p-[4px] rounded-lg text-[20px]"
                  onClick={() => setIsPickupOpen(false)}
                >
                  닫기
                </button>
              </div>
            )}

            {/* 상세 주소 입력 필드 */}
            <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
              <textarea
                className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                placeholder="상세 주소"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="no_pickup_message p-[20px] bg-gray-100 rounded-lg">
            <p className="font-pretendard font-extrabold flex justify-center text-lg text-gray-400">
              픽업이 필요 없어요
            </p>
          </div>
        )}

        {/* 픽업이 필요 없어요 */}
        <div className="checkbox flex items-center gap-[8px]">
          <input
            type="checkbox"
            id="no-pickup"
            className="hidden" // 기본 체크박스 숨김
            onChange={(e) => {
              const isChecked = e.target.checked;
              setIsPickupDisabled(isChecked); // 상태 업데이트
              setIsPickupOpen(false); // 검색창 닫기
              setPickupAddress(""); // 주소 초기화
            }}
          />
          <label
            htmlFor="no-pickup"
            className="flex items-center cursor-pointer gap-[8px]"
          >
            <img
              src={
                isPickupDisabled
                  ? "/assets/checked.png"
                  : "/assets/unchecked.png"
              }
              className="w-[24px] h-[24px] rounded-md"
            />
            <p className="font-pretendard font-bold select-none">
              픽업이 필요 없어요
            </p>
          </label>
        </div>

        {/* 도착 위치 입력 필드들 */}
        {!isdeliveryDisabled ? (
          <div className="delivery_fileds flex flex-col gap-[12px]">
            <div className="flex gap-[8px] items-center">
              <img src="../../assets/pin.svg" />
              <p className="font-laundry font-bold">도착 위치</p>
            </div>

            {/* 주소 검색 필드 */}
            <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
              <input
                type="text"
                className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                placeholder="주소 검색"
                value={deliveryAddress}
                onClick={() => setIsDeliveryOpen(true)}
                readOnly
              ></input>
            </div>

            {/* Daum Postcode 검색창 */}
            {isDeliveryOpen && (
              <div className="daum-postcode-modal flex flex-col gap-[12px] p-[12px] shadow-card-shadow rounded-lg">
                <DaumPostCode onComplete={handleCompleteDelivery} />
                <button
                  className="font-laundry bg-primary-400 text-white p-[4px] rounded-lg text-[20px]"
                  onClick={() => setIsDeliveryOpen(false)}
                >
                  닫기
                </button>
              </div>
            )}

            {/* 상세 주소 입력 필드 */}
            <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
              <textarea
                className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                placeholder="상세 주소"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="no_pickup_message p-[20px] bg-gray-100 rounded-lg">
            <p className="font-pretendard font-extrabold flex justify-center text-lg text-gray-400">
              도착 위치가 필요 없어요
            </p>
          </div>
        )}

        {/* 도착 위치가 필요 없어요 */}
        <div className="checkbox flex items-center gap-[8px]">
          <input
            type="checkbox"
            id="no-arrival"
            className="hidden"
            onChange={(e) => {
              const isChecked = e.target.checked;
              setIsDeliveryDisabled(isChecked);
              setIsDeliveryOpen(false);
              setDeliveryAddress("");
            }}
          />
          <label
            htmlFor="no-arrival"
            className="flex items-center cursor-pointer gap-[8px]"
          >
            <img
              src={
                isdeliveryDisabled
                  ? "/assets/checked.png"
                  : "/assets/unchecked.png"
              }
              className="w-[24px] h-[24px] rounded-md"
            />
            <p className="font-pretendard font-bold">도착 위치가 필요 없어요</p>
          </label>
        </div>
      </div>

      {/* 심부름 일시 */}
      <div className="task_dateandtime p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
        <p className="font-laundry text-card-title">
          심부름의 마감 일시를 선택해주세요
        </p>
        <DateAndTimePicker onDateChange={(date) => setDateAndTime(date)} />
      </div>

      {/* 심부름 금액 */}
      <form
        className="task_price p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]"
        onSubmit={handleSubmit()}
      >
        <p className="font-laundry text-input-title">심부름비를 제시해주세요</p>

        <div className="min-h-[16px] bg-gray-100 rounded-lg p-[20px] flex gap-[8px]">
          <input
            type="text"
            className="w-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none"
            placeholder="금액을 입력해주세요"
            value={formatPrice(price)} // watch로 감지된 값에 쉼표를 적용하여 표시
            onChange={handlePriceChange} // 핸들러로 숫자만 react-hook-form 값에 저장
            {...register("price", {
              required: "심부름비 금액을 입력해주세요.",
            })}
          ></input>
          <InputError target={errors.price} />
          <div>원</div>
        </div>
      </form>
    </main>
  );
}
