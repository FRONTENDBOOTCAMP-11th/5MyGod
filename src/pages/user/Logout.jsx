import React from "react";
import useUserStore from "@zustand/userStore";

const Logout = ({ isOpen, onConfirm, onCancel }) => {
  const resetUser = useUserStore((state) => state.resetUser);
  if (!isOpen) return null;

  const handleConfirm = () => {
    resetUser(); // 로그아웃 처리
    sessionStorage.setItem("justLoggedOut", "true");
    if (onConfirm) {
      onConfirm(); // 부모 컴포넌트에서 정의된 onConfirm 함수 호출
    }
    window.location.href = "/"; // 홈 화면으로 이동
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
        <h2 className="text-lg font-semibold mb-4">로그아웃 하시겠습니까?</h2>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            취소
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-red-600">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
