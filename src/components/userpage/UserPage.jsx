import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosInstance from "@hooks/useAxiosInstance";
import Profile from "@pages/user/Profile";

const UserPage = () => {
  const { _id } = useParams();
  const axios = useAxiosInstance();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProfile", _id],
    queryFn: () => axios.get(`/users/${_id}`).then((res) => res.data),
  });

  if (isLoading) return <div>로딩 중...</div>;

  if (!userData?.item) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-[393px] mx-auto min-h-screen bg-background-color">
        <Profile
          image={userData.item.image}
          nickname={userData.item.name || "닉네임 없음"}
          earnings={userData.item.extra.earnings || "0"}
          hearts={userData.item.extra.likes || "0"}
          isMyPage={false}
        />

        {/* 사용자 소개 섹션 */}
        <section className="mt-5 font-pretendard">
          <div className="intro bg-white p-5">
            <h3 className="text-lg font-bold text-gray-700 mb-3">자기소개</h3>
            <p>{userData.item.extra.introduction || "자기소개가 없습니다."}</p>
          </div>

          {/* 심부름 및 이동수단 섹션 */}
          <div className="intro bg-white p-5 my-3">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-700 mb-3">심부름</h3>
              {userData.item.extra.errands?.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {userData.item.extra.errands.map((task, index) => (
                    <li
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-md"
                    >
                      {task}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">선호하는 심부름이 없습니다.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                이동 수단
              </h3>
              {userData.item.extra.transportation?.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {userData.item.extra.transportation.map(
                    (transport, index) => (
                      <li
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-md"
                      >
                        {transport}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">등록된 이동수단이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 경력 및 자격증 섹션 */}
          <div className="intro bg-white p-5">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-700 mb-3">경력</h3>
              {userData.item.extra.experience?.length > 0 ? (
                <ul className="space-y-2">
                  {userData.item.extra.experience.map((exp, index) => (
                    <li key={index} className="bg-gray-100 p-3 rounded-md">
                      {exp}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">등록된 경력이 없습니다.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">자격증</h3>
              {userData.item.extra.certificates?.length > 0 ? (
                <ul className="space-y-2">
                  {userData.item.extra.certificates.map((cert, index) => (
                    <li key={index} className="bg-gray-100 p-3 rounded-md">
                      {cert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">등록된 자격증이 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserPage;
