import InputError from "@components/InputError";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import DaumPostCode from "react-daum-postcode";
import DateAndTimePicker from "@components/DateAndTimePicker";
import useAxiosInstance from "@hooks/useAxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useUserStore from "@zustand/userStore";

export default function New() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const axios = useAxiosInstance();
  const user = useUserStore();
  const hasHandledRedirect = useRef(false);

  /////////////////////////////////////////////////// 로그아웃 상태일 경우, 로그인 페이지로 이동시키기 ////////////////////////////////////////////////
  // useEffect(() => {
  //   console.log("현재 user 상태:", user); // 디버깅용 로그 추가

  //   if (!user || !user._id) {
  //     if (!hasHandledRedirect.current) {
  //       hasHandledRedirect.current = true; // 리다이렉트 플래그 설정
  //       const shouldRedirect = confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?");
  //       if (shouldRedirect) {
  //         navigate(`/users/login`);
  //       }
  //     }
  //   } else {
  //     hasHandledRedirect.current = false; // 정상 상태 플래그 해제
  //   }
  // }, [user, navigate]);

  ////////////////////////////////////////////////////////////// 제목 //////////////////////////////////////////////////////////////////
  // 제목 입력 상태 관리 및 실시간 반영
  const title = watch("name", "");

  const maxTitleLength = 50;

  const handleContentChange = (e) => {
    const input = e.target.value.slice(0, maxTitleLength - 1); // 50자 넘어가면 자름
    setValue("name", input, { shouldValidate: true });
  };

  ////////////////////////////////////////////////////////////// 카테고리, 태그 //////////////////////////////////////////////////////////////
  const [selectedCategory, setSelectedCategory] = useState(""); // 카테고리 선택 상태 관리
  const [selectedTags, setSelectedTags] = useState([]); // 태그 선택 상태 관리

  const categories = ["배달", "전문가", "재능판매", "대행", "돌봄"];

  const tags = ["시간이 생명", "도와주세요", "일정 조정 가능", "금액 협의 가능", "남자만", "여자만", "어른만"];

  // 카테고리와 태그를 코드와 매핑
  const categoryCodes = {
    배달: "PC01",
    전문가: "PC02",
    재능판매: "PC03",
    대행: "PC04",
    돌봄: "PC05",
  };

  const tagCodes = {
    "시간이 생명": "TA01",
    도와주세요: "TA02",
    "일정 조정 가능": "TA03",
    "금액 협의 가능": "TA04",
    남자만: "TA05",
    여자만: "TA06",
    어른만: "TA07",
  };

  // 카테고리 선택 / 해제 함수
  const handleCategoryClick = (category) => {
    const selectedCode = categoryCodes[category];
    // 이미 선택된 카테고리를 또 누르면 선택 해제, 선택 안되어 있던 카테고리를 누르면 선택
    const newValue = selectedCategory === selectedCode ? "" : selectedCode;
    setSelectedCategory(newValue);
    setValue("category", newValue, { shouldValidate: true }); // useForm에 반영
  };

  // 태그 선택 / 해제 함수
  const handleTagClick = (tag) => {
    const updatedTags = selectedTags.includes(tagCodes[tag])
      ? selectedTags.filter((t) => t !== tagCodes[tag])
      : [...selectedTags, tagCodes[tag]];
    setSelectedTags(updatedTags);
    setValue("tags", updatedTags, { shouldValidate: true }); // useForm에 반영
  };

  // 카테고리 목록 렌더링 함수 (선택 / 비선택 구분됨)
  const renderCategories = () =>
    categories.map((category) => (
      <li
        key={category}
        className={`category flex items-center gap-[4px] px-[6px] rounded  border-[1px] border-gray-500 font-pretendard text-[16px] max-w-full truncate text-ellipsis min-w-0 flex-shrink-0 select-none cursor-pointer ${
          selectedCategory === categoryCodes[category] ? "bg-primary-500 text-white" : "bg-gray-100 text-black"
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
          selectedTags.includes(tagCodes[tag]) ? "bg-primary-500 text-white" : "bg-gray-100 text-black"
        }`}
        onClick={() => handleTagClick(tag)}
      >
        {tag}
      </li>
    ));

  ////////////////////////////////////////////////////////////// 내용 //////////////////////////////////////////////////////////////
  const content = watch("content", "");

  const handleTitleChange = (e) => {
    const input = e.target.value;
    setValue("content", input, { shouldValidate: true });
  };

  ////////////////////////////////////////////////////////////// 위치 //////////////////////////////////////////////////////////////
  const [pickupAddress, setPickupAddress] = useState(""); // 픽업 주소
  const [pickupCoordinates, setPickupCoordinates] = useState(null); // 픽업 좌표
  const [pickupDetailAddress, setPickupDetailAddress] = useState(""); // 픽업 상세주소
  const [arrivalAddress, setArrivalAddress] = useState(""); // 도착 주소
  const [arrivalCoordinates, setArrivalCoordinates] = useState(null); // 도착 좌표
  const [arrivalDetailAddress, setArrivalDetailAddress] = useState(""); // 도착 상세주소
  const [isPickupOpen, setIsPickupOpen] = useState(false); // 픽업 주소 검색창 열기/닫기
  const [isArrivalOpen, setIsArrivalOpen] = useState(false); // 도착 주소 검색창 열기/닫기
  const [isPickupDisabled, setIsPickupDisabled] = useState(false); // 픽업이 필요 없어요 상태
  const [isArrivalDisabled, setIsArrivalDisabled] = useState(false); // 도착 위치가 필요 없어요 상태

  const [isKakaoReady, setIsKakaoReady] = useState(false); // 카카오맵 api 로드 상태

  // 카카오맵 API 로드 상태 확인
  useEffect(() => {
    const checkKakaoAPI = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        setIsKakaoReady(true);
        console.log("Kakao Maps API 로드 완료");
      } else {
        console.log("Kakao Maps API 로드 대기 중...");
      }
    };

    // 로드 상태 체크
    if (document.readyState === "complete") {
      checkKakaoAPI();
    } else {
      window.addEventListener("DOMContentLoaded", checkKakaoAPI);
    }

    return () => window.removeEventListener("DOMContentLoaded", checkKakaoAPI);
  }, []);

  // 주소를 좌표로 변환하는 함수
  const convertAddressToCoordinates = (address, setCoordinates) => {
    if (!isKakaoReady) {
      console.error("Kakao Maps API가 아직 준비되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setCoordinates({
          latitude: parseFloat(result[0].y),
          longitude: parseFloat(result[0].x),
        });
      } else {
        console.error("주소를 좌표로 변환하는 데 실패했습니다: ", status);
      }
    });
  };

  // 픽업 주소 선택 완료 시 처리하는 함수
  const handleCompletePickup = (data) => {
    const newAddress = data.address;
    setPickupAddress(newAddress);
    setIsPickupOpen(false);
    setValue("pickup", newAddress, { shouldValidate: true });

    // Kakao API를 통한 좌표 변환
    convertAddressToCoordinates(newAddress, setPickupCoordinates);

    setTimeout(() => {
      trigger("pickup");
    }, 0);
  };

  // 픽업 주소가 좌표로 잘 변환되었는지 확인
  useEffect(() => {
    if (pickupCoordinates) {
      console.log("픽업 좌표: ", pickupCoordinates);
    }
  }, [pickupCoordinates]);

  // 도착 주소 선택 완료 시 처리하는 함수
  const handleCompleteArrival = (data) => {
    const newAddress = data.address;
    setArrivalAddress(newAddress);
    setIsArrivalOpen(false);
    setValue("arrival", newAddress, { shouldValidate: true });

    // Kakao API를 통한 좌표 변환
    convertAddressToCoordinates(newAddress, setArrivalCoordinates);

    setTimeout(() => {
      trigger("arrival");
    }, 0);
  };

  // 도착 주소가 좌표로 잘 변환되었는지 확인
  useEffect(() => {
    if (arrivalCoordinates) {
      console.log("도착 좌표: ", arrivalCoordinates);
    }
  }, [arrivalCoordinates]);

  ////////////////////////////////////////////////////////////// 마감 일시 //////////////////////////////////////////////////////////////
  const selectedDue = watch("selectedDue", "");

  const handleDueChange = (date) => setValue("selectedDue", date, { shouldValidate: true });

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

  ////////////////////////////////////////////////////////////// 제출 //////////////////////////////////////////////////////////////
  const addItem = useMutation({
    mutationFn: (formData) => {
      const body = {
        price: Number(price.replace(/,/g, "")), // 가격(필수) - 쉼표 제거한 뒤 숫자값으로 변환해서 전송
        quantity: 999, // 수량(필수)
        name: title, // 상품명(필수)
        content: content, // 상품 설명(필수)
        extra: {
          category: [selectedCategory],
          tags: selectedTags,
          productState: ["PS010"],
          pickupLocation: isPickupDisabled
            ? null
            : {
                address: pickupAddress,
                detailAddress: pickupDetailAddress || null,
                coordinates: pickupCoordinates || null,
              },
          arrivalLocation: isArrivalDisabled
            ? null
            : {
                address: arrivalAddress,
                detailAddress: arrivalDetailAddress || "",
                coordinates: arrivalCoordinates || null,
              },
          due: selectedDue,
        },
      };
      console.log("전송 데이터: ", body);
      return axios.post("/seller/products/", body);
    },
    onSuccess: ({ data }) => {
      alert("심부름 요청이 등록되었습니다.");
      console.log("서버 응답 데이터: ", data);
      navigate(`/errand/${data.item._id}`);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  ////////////////////////////////////////////////////////////// return //////////////////////////////////////////////////////////////
  return (
    <main className="bg-background-color flex-grow p-[16px] flex flex-col gap-[16px] relative">
      {/* 전체 폼 + 제출함수 */}
      <form
        className="flex flex-col gap-[20px] pb-[70px]"
        onSubmit={handleSubmit((data) => {
          console.log("폼 데이터: ", data);
          addItem.mutate();
        })}
      >
        {/* 심부름 제목 입력 */}
        <div className="task_name p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
          <div className="flex flex-col">
            <p className="font-laundry text-input-title">심부름 제목을 입력해주세요</p>
            <InputError target={errors?.name} />
          </div>

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
        </div>

        {/* 카테고리 선택 */}
        <div className="task_category p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
          <div className="flex flex-col">
            <p className="font-laundry text-input-title">심부름 구분을 선택해주세요</p>
            <InputError target={errors?.category} />
          </div>

          <ul
            className="category_list flex gap-[12px]"
            {...register("category", {
              required: "심부름 카테고리를 선택해주세요.",
            })}
          >
            {renderCategories()}
          </ul>
        </div>

        {/* 태그 선택 */}
        <div className="task_tag p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
          <div className="flex flex-col">
            <p className="font-laundry text-input-title">
              태그를 선택해주세요 <span className="text-gray-500">(중복 선택 가능)</span>
            </p>
            <InputError target={errors?.tags} />
          </div>

          <ul
            className="tag_list flex gap-[12px] flex-wrap"
            {...register("tags", {
              validate: (value) => (value && value.length > 0 ? true : "최소 하나 이상의 태그를 선택해주세요."),
            })}
          >
            {renderTags()}
          </ul>
        </div>

        {/* 심부름 내용 입력 */}
        <div className="task_content p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
          <div className="flex flex-col">
            <p className="font-laundry text-input-title">무엇을 요청할까요?</p>
            <InputError target={errors.content} />
          </div>

          <div className="min-h-[200px] bg-gray-100 rounded-lg p-[20px]">
            <textarea
              className="w-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none"
              placeholder="심부름 내용을 설명해주세요 (10자 이상)"
              onChange={handleContentChange}
              {...register("content", {
                required: "심부름 내용을 작성해주세요.",
                minLength: {
                  value: 10,
                  message: "심부름 내용은 최소 10자 이상 작성해주세요.",
                },
              })}
            ></textarea>
          </div>
        </div>

        {/* 심부름 위치 선택 */}
        <div className="task_location p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]">
          <p className="font-laundry text-input-title">심부름의 위치를 알려주세요</p>

          {/* 픽업 위치 입력 필드들 */}
          {!isPickupDisabled ? (
            <div className="pickup_fields flex flex-col gap-[12px]">
              <div className="flex gap-[8px] items-center">
                <img src="../../assets/pin.svg" />
                <p className="font-laundry font-bold">픽업 위치</p>
              </div>
              <InputError target={errors?.pickup} />

              {/* 주소 검색 필드 */}
              <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
                <input
                  type="text"
                  className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                  placeholder="주소 검색"
                  value={pickupAddress}
                  onClick={() => setIsPickupOpen(true)}
                  readOnly
                  {...register("pickup", {
                    validate: () =>
                      isPickupDisabled || pickupAddress
                        ? true
                        : "주소를 입력하거나 '픽업이 필요 없어요'를 선택해주세요.",
                  })}
                />
              </div>

              {/* Daum Postcode 검색창 */}
              {isPickupOpen && (
                <div className="daum-postcode-modal flex flex-col gap-[12px] p-[12px] shadow-card-shadow rounded-lg">
                  <DaumPostCode onComplete={handleCompletePickup} />
                  <button
                    className="font-pretendard bg-gray-200 p-[4px] rounded-lg text-card-price text-lg text-gray-800"
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
                  onChange={(e) => {
                    const input = e.target.value;
                    setPickupDetailAddress(input);
                  }}
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
            <label htmlFor="no-pickup" className="flex items-center cursor-pointer gap-[8px]">
              <img
                src={isPickupDisabled ? "/assets/checked.png" : "/assets/unchecked.png"}
                className="w-[24px] h-[24px] rounded-md"
              />
              <p className="font-pretendard font-bold select-none">픽업이 필요 없어요</p>
            </label>
          </div>

          {/* 도착 위치 입력 필드들 */}
          {!isArrivalDisabled ? (
            <div className="arrival_fileds flex flex-col gap-[12px]">
              <div className="flex gap-[8px] items-center">
                <img src="../../assets/pin.svg" />
                <p className="font-laundry font-bold">도착 위치</p>
              </div>
              <InputError target={errors?.arrival} />

              {/* 주소 검색 필드 */}
              <div className="h-[40px] bg-gray-100 rounded-lg p-[10px] flex items-center">
                <input
                  type="text"
                  className="w-full h-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none font-pretendard leading-[20px] whitespace-nowrap overflow-x-auto"
                  placeholder="주소 검색"
                  value={arrivalAddress}
                  onClick={() => setIsArrivalOpen(true)}
                  readOnly
                  {...register("arrival", {
                    validate: () =>
                      isArrivalDisabled || arrivalAddress
                        ? true
                        : "주소를 입력하거나 '도착 위치가 필요 없어요'를 선택해주세요.",
                  })}
                />
              </div>

              {/* Daum Postcode 검색창 */}
              {isArrivalOpen && (
                <div className="daum-postcode-modal flex flex-col gap-[12px] p-[12px] shadow-card-shadow rounded-lg">
                  <DaumPostCode onComplete={handleCompleteArrival} />
                  <button
                    className="font-laundry bg-primary-400 text-white p-[4px] rounded-lg text-[20px]"
                    onClick={() => setIsArrivalOpen(false)}
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
                  onChange={(e) => {
                    const input = e.target.value;
                    setArrivalDetailAddress(input);
                  }}
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
                setIsArrivalDisabled(isChecked);
                setIsArrivalOpen(false);
                setArrivalAddress("");
              }}
            />
            <label htmlFor="no-arrival" className="flex items-center cursor-pointer gap-[8px]">
              <img
                src={isArrivalDisabled ? "/assets/checked.png" : "/assets/unchecked.png"}
                className="w-[24px] h-[24px] rounded-md"
              />
              <p className="font-pretendard font-bold">도착 위치가 필요 없어요</p>
            </label>
          </div>
        </div>

        {/* 심부름 일시 선택 */}
        <div
          className="task_dateandtime p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]"
          {...register("selectedDue", {
            required: "마감 일시를 선택해주세요.",
          })}
        >
          <div className="flex flex-col">
            <p className="font-laundry text-card-title">심부름의 마감 일시를 선택해주세요</p>
            <InputError target={errors?.selectedDue} />
          </div>

          <DateAndTimePicker onDueChange={handleDueChange} />
        </div>

        {/* 심부름 금액 입력 */}
        <div
          className="task_price p-[20px] bg-[#fff] rounded-lg shadow-card-shadow flex flex-col gap-[16px]"
          onSubmit={handleSubmit(() => {
            trigger("content");
            addItem.mutate();
          })}
        >
          <div className="flex flex-col">
            <p className="font-laundry text-input-title">심부름비를 제시해주세요</p>
            <InputError target={errors.price} />{" "}
          </div>

          <div className="min-h-[16px] bg-gray-100 rounded-lg p-[20px] flex gap-[8px]">
            <input
              type="tet"
              className="w-full bg-transparent placeholder-gray-500 placeholder:font-pretendard placeholder:font-bold resize-none"
              placeholder="금액을 입력해주세요"
              value={formatPrice(price)} // watch로 감지된 값에 쉼표를 적용하여 표시
              onChange={handlePriceChange} // 핸들러로 숫자만 react-hook-form 값에 저장
              {...register("price", {
                required: "심부름 금액을 입력해주세요.",
              })}
            ></input>

            <div>원</div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="bg-primary-500 font-laundry text-[24px] text-white p-[20px] rounded-t-lg absolute bottom-0 left-0 w-full"
        >
          심부름 요청하기
        </button>
      </form>
    </main>
  );
}
