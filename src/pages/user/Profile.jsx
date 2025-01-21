export default function Profile({ image, nickname, earnings, hearts, isMyPage }) {
  console.log(image);

  const img =
    image && typeof image === "string" && image.trim()
      ? `https://11.fesp.shop${image}`
      : "https://via.placeholder.com/100";

  return (
    <section className="flex items-center mt-6 px-4 font-laundry">
      {/* 프로필 이미지 */}
      <img src={img} alt="프로필 이미지" className="w-20 h-20 rounded-full border border-gray-300" />
      <div className="ml-4 text-gray-black-900 flex-1">
        {/* 닉네임과 추가 정보 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl">{nickname}</h2>
          {/* 하트 (isMyPage가 false일 때만 나란히 배치) */}
          {!isMyPage && (
            <div className="flex items-center justify-between w-20 h-10 px-3 bg-white rounded-[10px] gap-[2px]">
              <img src="/assets/heart.png" alt="하트 아이콘" className="w-5 h-5" />
              <span className="text-gray-black-900 text-sm leading-[20px]">
                {" "}
                {hearts > 999 ? "999+" : hearts || "0"}
              </span>
            </div>
          )}
        </div>

        {/* 수익금과 하트 (isMyPage가 true일 때만 아래에 배치) */}
        {isMyPage && (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center justify-between w-40 h-10 px-4 bg-white rounded-[10px]">
              <span className="text-gray-700 text-sm leading-[20px]">수익금:</span>
              <span className="text-gray-black-900 text-sm leading-[20px]">{earnings || "0"}</span>
            </div>
            <div className="flex items-center justify-between w-20 h-10 px-3 bg-white rounded-[10px]">
              <img src="/assets/heart.png" alt="하트 아이콘" className="w-5 h-5" />
              <span className="text-gray-black-900 text-sm leading-[20px]">
                {" "}
                {hearts > 999 ? "999+" : hearts || "0"}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
