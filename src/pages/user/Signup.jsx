import useAxiosInstance from "@hooks/useAxiosInstance";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useGenderStore from "@zustand/userGenderStore";

export default function Signup() {
  const navigate = useNavigate();
  const axios = useAxiosInstance();
  const { gender, setGender } = useGenderStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const addUser = useMutation({
    mutationFn: async (userInfo) => {
      userInfo.type = "seller";
      userInfo.extra = { gender };
      // confirmPassword를 userInfo에서 제거하는 코드
      const { confirmPassword, ...userInfoWithoutConfirmPW } = userInfo;
      console.log(userInfoWithoutConfirmPW); //제거 확인
      return axios.post(`/users`, userInfoWithoutConfirmPW);
    },
    onSuccess: () => {
      alert("회원가입 완료");
      navigate(`/users/login`); // 회원가입 완료하면 로그인 페이지로 이동
    },
    onError: (err) => {
      console.error("에러 내용 : ", err);
      if (err.response?.data.errors) {
        err.response?.data.errors.forEach((error) =>
          setError(error.path, { message: error.msg })
        );
      } else {
        alert(err.response?.data.message || "잠시 후 다시 요청해주세요.");
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
      <div className="signup w-screen max-w-[393px]  bg-background-color font-laundry">
        <div className="signup__content p-6 pt-[50px] flex flex-col items-center justify-center">
          <h1 className="signup__title text-[36px] font-bold text-primary-500 leading-normal tracking-[-2.88px] text-center">
            오는길에
          </h1>
          <section className="mt-6 px-4">
            <form className="space-y-5" onSubmit={handleSubmit(addUser.mutate)}>
              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  {...register("email", { required: "이메일을 입력해주세요." })}
                  placeholder="이메일을 입력하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password">비밀번호</label>
                <input
                  type="password"
                  id="password"
                  {...register("password", {
                    required: "비밀번호를 입력해주세요.",
                  })}
                  placeholder="비밀번호를 입력하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "비밀번호를 확인해주세요.",
                    validate: (value) =>
                      value === watch("password") ||
                      "비밀번호가 일치하지 않습니다.",
                  })}
                  placeholder="비밀번호를 확인하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* 닉네임 */}
              <div>
                <label htmlFor="name">닉네임</label>
                <input
                  type="name"
                  id="name"
                  {...register("name", {
                    required: "닉네임을 입력해주세요.",
                    maxLength: {
                      value: 9,
                      message: "9자 이하로 입력해주세요.",
                    },
                  })}
                  placeholder="닉네임을 입력하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.name && (
                  <p className="text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 핸드폰 번호 입력 */}
              <div>
                <label htmlFor="phone">핸드폰 번호</label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  placeholder="핸드폰 번호를 입력하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.phone && (
                  <p className="text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* 주소 입력 */}
              <div>
                <label htmlFor="address">주소</label>
                <input
                  type="text"
                  id="address"
                  {...register("address")}
                  placeholder="주소를 입력하세요"
                  className="mt-1 block w-full p-3 border text-gray-700 border-gray-300 rounded-[10px] bg-white shadow-card-shadow"
                />
                {errors.address && (
                  <p className="text-red-500">{errors.address.message}</p>
                )}
              </div>

              {/* 성별 선택 */}
              <div>
                <label htmlFor="gender">성별</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className={`w-full px-4 py-2 rounded ${
                      gender === "male"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setGender("male")}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    className={`w-full px-4 py-2 rounded ${
                      gender === "female"
                        ? "bg-pink-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setGender("female")}
                  >
                    여성
                  </button>
                </div>
                {!gender && (
                  <p className="text-red-500 mt-2">성별을 선택해주세요.</p>
                )}
              </div>

              {/* 회원가입 버튼 */}
              <div>
                <button
                  type="submit"
                  className="w-full h-14 bg-primary-500 text-white rounded-[10px]"
                >
                  회원가입
                </button>
              </div>
            </form>
          </section>
          <footer className="flex justify-center mt-4 text-sm text-gray-500">
            <p>
              이미 계정이 있나요?{" "}
              <Link to="/users/login" className="text-primary-500">
                로그인
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
