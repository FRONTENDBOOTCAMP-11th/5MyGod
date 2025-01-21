import React, { useEffect, useState } from "react";
import useAxiosInstance from "@hooks/useAxiosInstance";
import { useParams, useNavigate } from "react-router-dom";

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();
  const { _id } = useParams();
  const clientId = "final05";

  const defaultImagePath = `/files/${clientId}/user-neo.webp`;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultImagePath;
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/seller/orders");
      const data = response.data;

      if (data.ok === 1) {
        console.log("API 응답 데이터:", data);
        const filteredItems = data.item.filter(
          (item) => item.products[0]._id === parseInt(_id)
        );

        if (filteredItems.length > 0) {
          setCurrentProduct(filteredItems[0].products[0]);
        }

        const formattedApplicants = filteredItems.map((item) => ({
          id: item.user._id,
          name: item.user.name,
          description: item.user.extra.introduction || "소개글이 없습니다.",
          profileImage: item.user.image,
          productId: item.products[0]._id,
          productState: item.products[0].extra.productState[0],
          matchedUserId: item.products[0].extra.matchedUserId || null,
        }));

        setApplicants(formattedApplicants);
        setLoading(false);
      }
    } catch (error) {
      console.error("지원자 데이터를 가져오는 중 오류 발생:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleAcceptApplicant = async (productId, applicantId) => {
    try {
      const productResponse = await axiosInstance.get(
        `/seller/products/${_id}`
      );
      const currentProductData = productResponse.data.item;

      const updatedExtra = {
        ...currentProductData.extra,
        productState: ["PS020"],
        matchedUserId: applicantId,
      };

      const response = await axiosInstance.patch(`/seller/products/${_id}`, {
        extra: updatedExtra,
      });

      if (response.data.ok === 1) {
        console.log("지원자 수락 성공:", response.data);
        navigate("/users/mypage");
      } else {
        console.error("지원자 수락 실패:", response.data);
      }
    } catch (error) {
      console.error("지원자 수락 중 오류 발생:", error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  const isMatchedExists = applicants.some(
    (app) => app.productState === "PS020"
  );

  return (
    <div className="w-[393px] min-h-[852px] max-h-screen flex flex-col bg-[#F5F9FF] overflow-hidden">
      <main className="font-Pretendard text-gray-black-900 flex-1 p-4 space-y-6 overflow-y-auto bg-[#fff] relative">
        {isMatchedExists ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="text-xl font-semibold text-[#4849E8] mb-2">
                매칭이 완료된 심부름입니다
              </div>
              <div className="text-gray-600">
                다른 지원자들의 지원은 자동으로 마감되었습니다
              </div>
            </div>
          </div>
        ) : null}

        {applicants.length > 0 ? (
          applicants.map((applicant) => (
            <div
              key={applicant.id}
              className={`w-[360px] h-[84px] flex-shrink-0 flex items-center bg-white rounded-[10px] shadow-card-shadow ${
                isMatchedExists && applicant.productState !== "PS020"
                  ? "opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center ml-[16px] flex-grow">
                <img
                  src={`https://11.fesp.shop${applicant.profileImage}`}
                  alt={`${applicant.name}의 프로필`}
                  onError={handleImageError}
                  className="w-[42px] h-[42px] rounded-full object-cover mr-[16px] cursor-pointer"
                  onClick={() => navigate(`/users/${applicant.id}`)}
                />

                <div className="flex flex-col justify-center">
                  <h3 className="font-Pretendard text-[18px] font-semibold text-gray-black-900 tracking-[-1.08px]">
                    {applicant.name}
                  </h3>
                  <p className="font-Pretendard text-[16px] font-medium text-gray-black-900 tracking-[-0.96px]">
                    {applicant.description}
                  </p>
                </div>
              </div>
              <button
                className={`w-[77px] h-[84px] flex-shrink-0 rounded-r-[10px] ${
                  isMatchedExists || applicant.productState === "PS020"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4849E8] cursor-pointer"
                } text-white shadow-card-shadow`}
                onClick={() =>
                  handleAcceptApplicant(applicant.productId, applicant.id)
                }
                disabled={isMatchedExists || applicant.productState === "PS020"}
              >
                {applicant.productState === "PS020" ? "매칭완료" : "수락하기"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-black-700">
            지원자가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
};

export default Applicants;
