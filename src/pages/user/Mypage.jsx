import React, { useState, useEffect } from "react";
import useAxiosInstance from "@hooks/useAxiosInstance";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useUserStore from "@zustand/userStore";

import Profile from "@pages/user/Profile";
import Tabs from "@pages/user/Tabs";
import MyRequests from "@pages/user/MyRequests";
import MyApplies from "@pages/user/MyApplies";
import MyEdit from "@pages/user/MyEdit";
import Logout from "@pages/user/Logout";

export default function MyPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "intro";
  const { user, setUser } = useUserStore();
  const axios = useAxiosInstance();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false); // 수정 중인지 아닌지
  const [logout, setLogout] = useState(false);

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"], // Query Key
    queryFn: () => axios.get(`/users/${user._id}`).then((res) => res.data),
    refetchInterval: 1000,
    staleTime: 0,
    cacheTime: 0,
  });
  console.log("유저 정보 : ", users);

  // 나의 요청탭
  const { data: requestData } = useQuery({
    queryKey: ["requests"],
    queryFn: () => axios.get("/seller/products/"),
    select: (res) => res.data,
    refetchInterval: 1000,
    staleTime: 0,
    cacheTime: 0,
  });

  console.log("requestdata: ", requestData);

  // 나의 지원탭
  const { data: applyData } = useQuery({
    queryKey: ["apply"],
    queryFn: () => axios.get("/orders/"),
    select: (res) => res.data,
    refetchInterval: 1000,
    staleTime: 0,
    cacheTime: 0,
  });

  console.log("apply data: ", applyData);

  if (isLoading) return <div>로딩 중...</div>;

  if (error) {
    const errorMessage = error.response?.data?.message || "유저 정보를 가져오는 데 실패했습니다.";
    return <div>{errorMessage}</div>;
  }

  const tabs = [
    { id: "intro", label: "소개" },
    { id: "requests", label: "나의 요청" },
    { id: "apply", label: "나의 지원" },
  ];

  const handleTabClick = (tab) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", tab);
      return params;
    });
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    queryClient.setQueryData(["userProfile"], { item: updatedUser });
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    sessionStorage.clear(); // 세션 스토리지 비우기
    localStorage.clear(); // 로컬 스토리지 비우기
    queryClient.clear(); // React Query 캐시 초기화
    setUser(null); // Zustand 스토어에서 유저 정보 초기화
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* 핸드폰 사이즈 맞춘 레이아웃 */}
      <div className="w-[393px] mx-auto min-h-screen bg-background-color">
        <Profile
          image={users.item.image}
          nickname={users.item.name || "닉네임 없음"}
          earnings={users.item.extra.earnings || "0"}
          hearts={users.item.extra.likes || "0"}
          isMyPage={true}
        />
        {/* 탭 섹션 */}
        <section className="mt-5 font-pretendard">
          <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />

          {/* 탭 내용 */}
          {activeTab === "intro" && (
            <div id="intro" className="tab-content">
              {isEditing ? (
                <MyEdit users={users} setIsEditing={setIsEditing} onUserUpdate={handleUserUpdate} />
              ) : (
                <>
                  <div className="intro bg-white p-5 ">
                    <div className="flex justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-700 ">자기소개</h3>
                      <button className="text-primary-500" onClick={() => setIsEditing(true)}>
                        수정하기
                      </button>
                    </div>
                    <p className="text-gray-500 mb-5">{users?.item.extra.introduction || "자기소개를 작성해보세요."}</p>
                  </div>
                  <div className="intro bg-white p-5 my-3">
                    <div className="flex justify-between my-3">
                      <h3 className="text-lg font-bold text-gray-700">심부름</h3>
                    </div>
                    {users.item.extra.errands?.length > 0 ? (
                      <ul className="flex space-x-3">
                        {users.item.extra.errands?.map((task, index) => (
                          <li key={index} className="flex items-center">
                            <p className="bg-gray-100 px-2 py-1 rounded-md">{task}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5">{users.item.name}님의 선호하는 심부름을 작성해보세요</p>
                    )}

                    <div className="flex justify-between my-3">
                      <h3 className="text-lg font-bold text-gray-700">이동 수단</h3>
                    </div>
                    {users.item.extra.transportation?.length > 0 ? (
                      <ul className="flex space-x-3">
                        {users.item.extra.transportation?.map((transport, index) => (
                          <li key={index} className="flex items-center">
                            <p className="bg-gray-100 px-2 py-1 rounded-md">{transport}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5">{users.item.name}님의 이동수단을 작성해보세요</p>
                    )}

                    <h3 className="text-lg font-bold mt-6 text-gray-700">심부름 상세</h3>
                    <p className="text-gray-700 text-sm mb-3">자주 하는 질문 또는 안내사항을 작성할 수 있어요</p>
                    {users.item.extra.details?.length > 0 ? (
                      <ul className="mb-3">
                        {users.item.extra.details?.map((detail, index) => (
                          <li
                            key={index}
                            className="w-full h-14 leading-[56px] bg-gray-100 rounded-[10px] px-5 mb-2 text-gray-800 font-semibold"
                          >
                            {detail}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5">{users.item.name}님의 심부름 상세를 작성해보세요</p>
                    )}
                  </div>
                  <div className="intro bg-white p-5 mt-3">
                    <h3 className="text-lg font-bold text-gray-700 pb-3">경력</h3>
                    {/* <ul className="flex flex-wrap h-14 bg-gray-100 rounded-[10px] px-5 mb-3 ">
                      {users.item.extra.experience
                        .reduce((acc, exp, index) => {
                          const threeIndex = Math.floor(index / 3); // 3개씩 묶기 위한 인덱스 계산
                          if (!acc[threeIndex]) {
                            acc[threeIndex] = []; // 새로운 그룹 생성
                          }
                          acc[threeIndex].push(exp); // 각 그룹에 항목 추가
                          return acc;
                        }, [])
                        .map((three, threeIndex) => (
                          <li key={threeIndex} className="flex pr-3">
                            {three.map((exp, index) => (
                              <span
                                key={index}
                                className={`leading-[56px] pr-3 ${
                                  index === 0 ? "font-bold text-gray-800" : "text-gray-700 text-sm"
                                }`}
                              >
                                {exp}
                              </span>
                            ))}
                          </li>
                        ))}
                    </ul> */}
                    {users.item.extra.experience?.length > 0 ? (
                      <ul className="mb-3">
                        {users.item.extra.experience?.map((experience, index) => (
                          <li
                            key={index}
                            className="w-full h-14 leading-[56px] bg-gray-100 rounded-[10px] px-5 mb-2 text-gray-800 font-semibold"
                          >
                            {experience}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5">{users.item.name}님의 경력을 작성해보세요</p>
                    )}

                    <h3 className="text-lg font-bold mt-6 text-gray-700 pb-3">자격증</h3>
                    {users.item.extra.certificates?.length > 0 ? (
                      <ul className="mb-3">
                        {users.item.extra.certificates?.map((certificate, index) => (
                          <li
                            key={index}
                            className="w-full h-14 leading-[56px] bg-gray-100 rounded-[10px] px-5 mb-2 text-gray-800 font-semibold"
                          >
                            {certificate}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5">{users.item.name}님의 자격증을 작성해보세요</p>
                    )}
                    <h3 className="text-lg font-bold mt-6 text-gray-700 pb-3">사업자</h3>
                    {users.item.extra.business?.length > 0 ? (
                      <ul className="mb-3">
                        {users.item.extra.business?.map((business, index) => (
                          <li
                            key={index}
                            className="w-full h-14 leading-[56px] bg-gray-100 rounded-[10px] px-5 mb-2 text-gray-800 font-semibold"
                          >
                            {business}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-5 pb-16">{users.item.name}님의 사업자를 작성해보세요</p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => setLogout(true)}
                      className="w-full text-center pt-6 text-gray-500 font-semibold mb-[100px]"
                    >
                      로그아웃
                    </button>
                    <Logout
                      isOpen={logout}
                      onConfirm={() => {
                        handleLogout();
                        setLogout(false);
                      }}
                      onCancel={() => setLogout(false)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div id="requests" className="tab-content p-4">
              <MyRequests requestData={requestData} />
            </div>
          )}

          {activeTab === "apply" && (
            <div id="apply" className="tab-content p-4">
              <MyApplies applyData={applyData} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
