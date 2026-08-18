// E2E 테스트 전용 계정 정보. Supabase가 형식만 검사하는 것으로 보여
// gmail.com 도메인을 씀 (example.com 등은 email_address_invalid로 거부된 전례 있음).
const RUN_ID = Date.now();

export const PASSWORD = "TeamUpE2e!23";

export const USER_A = {
  role: "authorA",
  email: `teamup.e2e.a.${RUN_ID}@gmail.com`,
  password: PASSWORD,
  nickname: `E2E작성자${RUN_ID.toString().slice(-6)}`,
};

export const USER_B = {
  role: "applicantB",
  email: `teamup.e2e.b.${RUN_ID}@gmail.com`,
  password: PASSWORD,
  nickname: `E2E지원자${RUN_ID.toString().slice(-6)}`,
};

export const RUN_TAG = `e2e-${RUN_ID}`;
