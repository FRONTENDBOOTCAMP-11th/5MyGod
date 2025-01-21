import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosInstance from "@hooks/useAxiosInstance";
import { useMutation } from "@tanstack/react-query";

// Props Validation
Payment.propTypes = {
  item: PropTypes.object.isRequired,
  buttonPos: PropTypes.number.isRequired,
};

// 상품(product)의 상태를 심부름 완료 및 종료("PS030")로 상태 바꾸는 함수
const useUpdateProductState = () => {
  const axios = useAxiosInstance();

  const updateProdState = async ({ productId, currentItem }) => {
    try {
      const updatedExtra = {
        ...currentItem.extra,
        productState: ["PS030"],
      };

      const response = await axios.patch(`/seller/products/${productId}`, {
        extra: updatedExtra,
      });
      if (!response.data.ok) {
        throw new Error("상품 상태 업데이트에 실패했습니다.");
      }
      return response.data;
    } catch (error) {
      console.error("상품 상태 업데이트 중 오류 발생:", error);
      throw error;
    }
  };
  return useMutation({
    mutationFn: updateProdState,
    onSuccess: (data) => {
      console.log("상품 상태가 성공적으로 업데이트되었습니다.", data);
    },
    onError: (error) => {
      console.error("상품 상태 업데이트 실패:", error);
    },
  });
};

export default function Payment({ item, buttonPos }) {
  const productId = item?._id;
  const payAmount = item?.price;

  useEffect(() => {
    const loadPortOneSDK = () => {
      const script = document.createElement("script");
      script.src = "https://cdn.portone.io/v2/browser-sdk.js";
      script.async = true;

      script.onload = () => {
        console.log("PortOne SDK 로드 완료");
      };

      script.onerror = () => {
        console.error("PortOne SDK 로드 실패");
      };

      document.body.appendChild(script);
    };

    loadPortOneSDK();
  }, []);

  const navigate = useNavigate();
  const { mutateAsync: updateProdState } = useUpdateProductState();

  const handlePayment = async () => {
    try {
      if (window.PortOne) {
        const result = await window.PortOne.requestPayment({
          storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
          paymentId: productId + "3456", //결제 ID - 심부름 고유값으로, testm5w7k로 시작하고 3자리 추가해주면 될것같습니다 ex. 1번 심부름은 testm5w7k001
          orderName: "테스트 결제",
          totalAmount: payAmount, //결제 금액
          currency: "KRW",
          channelKey: "channel-key-4ca6a942-3ee0-48fb-93ef-f4294b876d28",
          payMethod: "CARD",
          card: {},
          redirectUrl: "http://localhost:5173/pay/paysuccess", //결제 성공 후 이동할 url
        });
        console.log("결제 완료되었습니다.", result);
        // 결제 완료 후 product 상태 변경 (PS030)
        await updateProdState({
          productId,
          currentItem: item,
        });
        navigate("/pay/paysuccess", { state: item });
      } else {
        alert("결제 모듈이 로드되지 않았습니다.");
      }
    } catch (error) {
      //사용자가 결제 모듈을 취소했을 때
      console.log("결제를 취소했습니다.", error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className={`font-laundry text-[24px] p-[20px] rounded-t-lg fixed max-w-[393px] mx-auto left-0 right-0 w-full bg-complementary-400 text-primary-600 cursor-pointer z-10`}
      style={{ top: `${buttonPos}px` }}
    >
      심부름 완료 및 결제하기
    </button>
  );
}

Payment.propTypes = {
  item: PropTypes.object.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};
