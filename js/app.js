// =====================================================
// 지갑지킴이 2.1.1
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// =====================================================
// 앱 실행 환경 감지 + 브라우저 앱 모드 미리보기
// =====================================================

const params =
    new URLSearchParams(window.location.search);

const isAppPreview =
    params.get("app") === "1";

const isNativeApp =
    window.location.hostname === "localhost" &&
    !window.location.port;

if (isNativeApp || isAppPreview) {
    document.body.classList.add("app-mode");
}
// =====================================================
// Firebase
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDiHLEi_GAgfHax_3XwYd6z9xO433kSEDY",
  authDomain: "wallet-budget-8cadd.firebaseapp.com",
  projectId: "wallet-budget-8cadd",
  storageBucket: "wallet-budget-8cadd.firebasestorage.app",
  messagingSenderId: "924575676755",
  appId: "1:924575676755:web:f4d118ee533c7f45fd89a6"
};


const app =
  initializeApp(
    firebaseConfig
  );


const db =
  getFirestore(
    app
  );


const auth =
  getAuth(
    app
  );


// =====================================================
// 기본 카테고리
// =====================================================

const defaultCategories = [

  {
    name: "식비",
    emoji: "🍚",
    isDefault: true
  },

  {
    name: "간식",
    emoji: "🍪",
    isDefault: true
  },

  {
    name: "데이트",
    emoji: "💕",
    isDefault: true
  },

  {
    name: "생활비",
    emoji: "🏠",
    isDefault: true
  },

  {
    name: "FLEX",
    emoji: "💸",
    isDefault: true
  },

  {
    name: "쇼핑",
    emoji: "🛍️",
    isDefault: true
  }

];


// =====================================================
// 앱 상태
// =====================================================

let currentUser =
  null;


let myProfile =
  null;


let partnerProfile =
  null;


let currentCouple =
  null;


let coupleId =
  null;


let expenses =
  [];


let privateDetails =
  {};


let categories =
  [...defaultCategories];


let monthlySettings = {

  sharedBudget: 0,

  personalBudgets: {}

};


const today =
  new Date();


let selectedYear =
  today.getFullYear();


let selectedMonth =
  today.getMonth() + 1;


let editingExpenseId =
  null;


let detailUserUid =
  null;


// 최근 거래는 처음 15개만 표시

let transactionVisibleCount =
  15;


let selectedProfileIcon =
  "🩷";


let selectedSettingsIcon =
  "🩷";


// =====================================================
// Firestore 실시간 구독
// =====================================================

let unsubscribeExpenses =
  null;


let unsubscribeMonthlySettings =
  null;


let unsubscribeCategories =
  null;


let unsubscribeCouple =
  null;


let unsubscribePartnerProfile =
  null;


let unsubscribePrivateDetails =
  null;


// =====================================================
// DOM
// =====================================================

const $ =
  (id) =>
    document.getElementById(
      id
    );


// =====================================================
// 화면
// =====================================================

const loginScreen =
  $("login-screen");


const signupScreen =
  $("signup-screen");


const passwordResetScreen =
  $("password-reset-screen");


const profileScreen =
  $("profile-screen");


const coupleSetupScreen =
  $("couple-setup-screen");


const inviteScreen =
  $("invite-screen");


const joinCoupleScreen =
  $("join-couple-screen");


const appScreen =
  $("app-screen");


const personDetailScreen =
  $("person-detail-screen");


const allScreens = [

  loginScreen,
  signupScreen,
  passwordResetScreen,
  profileScreen,
  coupleSetupScreen,
  inviteScreen,
  joinCoupleScreen,
  appScreen,
  personDetailScreen

].filter(
  Boolean
);


// =====================================================
// 로그인 / 회원가입
// =====================================================

const loginEmail =
  $("login-email");


const loginPassword =
  $("login-password");


const loginBtn =
  $("login-btn");


const loginError =
  $("login-error");


const showSignupBtn =
  $("show-signup-btn");


const showPasswordResetBtn =
  $("show-password-reset-btn");


const passwordResetBackBtn =
  $("password-reset-back-btn");


const passwordResetEmail =
  $("password-reset-email");


const sendPasswordResetBtn =
  $("send-password-reset-btn");


const passwordResetMessage =
  $("password-reset-message");


const signupBackBtn =
  $("signup-back-btn");


const signupEmail =
  $("signup-email");


const signupPassword =
  $("signup-password");


const signupPasswordConfirm =
  $("signup-password-confirm");


const signupBtn =
  $("signup-btn");


const signupError =
  $("signup-error");


// =====================================================
// 프로필
// =====================================================

const profileNickname =
  $("profile-nickname");


const profileIconButtons =
  document.querySelectorAll(
    ".profile-icon-btn"
  );


const customProfileIcon =
  $("custom-profile-icon");


const saveProfileBtn =
  $("save-profile-btn");


const profileError =
  $("profile-error");


// =====================================================
// 커플 연결
// =====================================================

const setupMyIcon =
  $("setup-my-icon");


const setupMyNickname =
  $("setup-my-nickname");


const createCoupleBtn =
  $("create-couple-btn");


const showJoinCoupleBtn =
  $("show-join-couple-btn");


const setupLogoutBtn =
  $("setup-logout-btn");


const inviteCodeElement =
  $("invite-code");


const copyInviteCodeBtn =
  $("copy-invite-code-btn");


const inviteContinueBtn =
  $("invite-continue-btn");


const joinBackBtn =
  $("join-back-btn");


const joinCodeInput =
  $("join-code-input");


const joinCoupleBtn =
  $("join-couple-btn");


const joinError =
  $("join-error");


// =====================================================
// 헤더 / 월 이동
// =====================================================

const settingsBtn =
  $("settings-btn");


const logoutBtn =
  $("logout-btn");


const prevMonthBtn =
  $("prev-month-btn");


const nextMonthBtn =
  $("next-month-btn");


const currentMonthTitle =
  $("current-month-title");


// =====================================================
// 공동 대시보드
// =====================================================

const sharedUsedAmount =
  $("shared-used-amount");


const sharedBudgetAmount =
  $("shared-budget-amount");


const sharedBudgetPercent =
  $("shared-budget-percent");


const sharedBudgetProgress =
  $("shared-budget-progress");


const sharedRemainingAmount =
  $("shared-remaining-amount");


const budgetSettingBtn =
  $("budget-setting-btn");


// =====================================================
// 월 진행률
// =====================================================

const monthProgressPercent =
  $("month-progress-percent");


const monthProgressBar =
  $("month-progress-bar");


const monthBudgetStatus =
  $("month-budget-status");


// =====================================================
// 내 생활비
// =====================================================

const myIcon =
  $("my-icon");


const myNickname =
  $("my-nickname");


const myUsedAmount =
  $("my-used-amount");


const myBudgetAmount =
  $("my-budget-amount");


const myBudgetPercent =
  $("my-budget-percent");


const myBudgetProgress =
  $("my-budget-progress");


const myRemainingAmount =
  $("my-remaining-amount");


const myDetailBtn =
  $("my-detail-btn");


// =====================================================
// 상대 생활비
// =====================================================

const partnerIcon =
  $("partner-icon");


const partnerNickname =
  $("partner-nickname");


const partnerUsedAmount =
  $("partner-used-amount");


const partnerBudgetAmount =
  $("partner-budget-amount");


const partnerBudgetPercent =
  $("partner-budget-percent");


const partnerBudgetProgress =
  $("partner-budget-progress");


const partnerRemainingAmount =
  $("partner-remaining-amount");


const partnerDetailBtn =
  $("partner-detail-btn");


// =====================================================
// 카테고리
// =====================================================

const categorySettingBtn =
  $("category-setting-btn");


const sharedCategoryList =
  $("shared-category-list");


// =====================================================
// 지출 / 거래내역
// =====================================================

const addExpenseBtn =
  $("add-expense-btn");


const transactionList =
  $("transaction-list");


const transactionSort =
  $("transaction-sort");


const transactionMoreBtn =
  $("transaction-more-btn");


// =====================================================
// 소비 달력
// =====================================================

const expenseCalendar =
  $("expense-calendar");


// =====================================================
// 맨 위로 버튼
// =====================================================

const scrollTopBtn =
  $("scroll-top-btn");


// =====================================================
// 개인 상세
// =====================================================

const detailBackBtn =
  $("detail-back-btn");


const detailPersonIcon =
  $("detail-person-icon");


const detailMonthLabel =
  $("detail-month-label");


const detailPersonName =
  $("detail-person-name");


const detailUsedAmount =
  $("detail-used-amount");


const detailBudgetAmount =
  $("detail-budget-amount");


const detailBudgetPercent =
  $("detail-budget-percent");


const detailBudgetProgress =
  $("detail-budget-progress");


const detailRemainingAmount =
  $("detail-remaining-amount");


const detailCategoryList =
  $("detail-category-list");


const detailAloneAmount =
  $("detail-alone-amount");


const detailAlonePercent =
  $("detail-alone-percent");


const detailTogetherAmount =
  $("detail-together-amount");


const detailTogetherPercent =
  $("detail-together-percent");


const detailTransactionList =
  $("detail-transaction-list");


// =====================================================
// 지출 모달
// =====================================================

const expenseModal =
  $("expense-modal");


const expenseModalTitle =
  $("expense-modal-title");


const closeModalBtn =
  $("close-modal");


const dateInput =
  $("expense-date");


const amountInput =
  $("expense-amount");


const typeButtons =
  document.querySelectorAll(
    ".type-btn"
  );


const categoryInput =
  $("expense-category");


const descriptionInput =
  $("expense-description");


const privateExpenseGroup =
  $("private-expense-group");


const privateExpenseToggle =
  $("private-expense-toggle");


const payerButtons =
  document.querySelectorAll(
    ".payer-btn"
  );


const payerMeIcon =
  $("payer-me-icon");


const payerMeName =
  $("payer-me-name");


const payerPartnerIcon =
  $("payer-partner-icon");


const payerPartnerName =
  $("payer-partner-name");


const saveExpenseBtn =
  $("save-expense");


// =====================================================
// 예산 모달
// =====================================================

const budgetModal =
  $("budget-modal");


const closeBudgetModal =
  $("close-budget-modal");


const sharedBudgetInput =
  $("shared-budget-input");


const myBudgetInput =
  $("my-budget-input");


const partnerBudgetInput =
  $("partner-budget-input");


const budgetMyIcon =
  $("budget-my-icon");


const budgetMyName =
  $("budget-my-name");


const budgetPartnerIcon =
  $("budget-partner-icon");


const budgetPartnerName =
  $("budget-partner-name");


const saveBudgetBtn =
  $("save-budget-btn");


// =====================================================
// 카테고리 모달
// =====================================================

const categoryModal =
  $("category-modal");


const closeCategoryModal =
  $("close-category-modal");


const categorySettingList =
  $("category-setting-list");


const newCategoryEmoji =
  $("new-category-emoji");


const newCategoryName =
  $("new-category-name");


const addCategoryBtn =
  $("add-category-btn");


// =====================================================
// 설정 모달
// =====================================================

const settingsModal =
  $("settings-modal");


const closeSettingsModal =
  $("close-settings-modal");


const settingsNickname =
  $("settings-nickname");


const settingsIconButtons =
  document.querySelectorAll(
    ".settings-icon-btn"
  );


const customSettingsIcon =
  $("custom-settings-icon");


const saveSettingsProfileBtn =
  $("save-settings-profile-btn");


const settingsInviteCode =
  $("settings-invite-code");


const settingsPartnerName =
  $("settings-partner-name");


// =====================================================
// 공통 함수
// =====================================================

function showScreen(
  screen
) {

  allScreens.forEach(
    (item) => {

      item.hidden =
        true;

    }
  );


  if (
    screen
  ) {

    screen.hidden =
      false;

  }

}


function closeAllModals() {

  [
    expenseModal,
    budgetModal,
    categoryModal,
    settingsModal
  ]
    .filter(
      Boolean
    )
    .forEach(
      (modal) => {

        modal.classList.remove(
          "show"
        );

      }
    );

}


function parseMoney(
  value
) {

  const onlyNumbers =
    String(
      value ?? ""
    )
      .replace(
        /[^0-9]/g,
        ""
      );


  return onlyNumbers
    ? Number(
        onlyNumbers
      )
    : 0;

}


function formatMoneyInput(
  value
) {

  const number =
    parseMoney(
      value
    );


  return number
    ? number.toLocaleString(
        "ko-KR"
      )
    : "";

}


function formatWon(
  value
) {

  return `${Number(
    value ||
    0
  ).toLocaleString(
    "ko-KR"
  )}원`;

}


function attachMoneyFormatter(
  input
) {

  if (
    !input ||
    input.dataset.moneyFormatter ===
      "true"
  ) {

    return;

  }


  input.dataset.moneyFormatter =
    "true";


  input.addEventListener(
    "input",
    function () {

      this.value =
        formatMoneyInput(
          this.value
        );

    }
  );

}


function escapeHtml(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      text ?? ""
    );


  return div.innerHTML;

}


// =====================================================
// 월 관련
// =====================================================

function getMonthKey() {

  return (
    `${selectedYear}-` +
    String(
      selectedMonth
    )
      .padStart(
        2,
        "0"
      )
  );

}


function updateMonthTitle() {

  if (
    currentMonthTitle
  ) {

    currentMonthTitle.textContent =
      `${selectedYear}년 ${selectedMonth}월`;

  }

}


function getDefaultDate() {

  const now =
    new Date();


  const month =
    String(
      selectedMonth
    )
      .padStart(
        2,
        "0"
      );


  let day =
    "01";


  if (
    now.getFullYear() ===
      selectedYear
    &&
    now.getMonth() + 1 ===
      selectedMonth
  ) {

    day =
      String(
        now.getDate()
      )
        .padStart(
          2,
          "0"
        );

  }


  return (
    `${selectedYear}-${month}-${day}`
  );

}


// =====================================================
// 진행바
// =====================================================

function setProgress(
  element,
  percent
) {

  if (
    !element
  ) {

    return;

  }


  const safePercent =
    Number.isFinite(
      percent
    )
      ? percent
      : 0;


  element.style.width =
    `${Math.min(
      Math.max(
        safePercent,
        0
      ),
      100
    )}%`;


  element.classList.remove(
    "warning",
    "danger"
  );


  if (
    safePercent >=
    100
  ) {

    element.classList.add(
      "danger"
    );

  }

  else if (
    safePercent >=
    80
  ) {

    element.classList.add(
      "warning"
    );

  }

}


function getUsagePercent(
  used,
  budget
) {

  if (
    !budget ||
    budget <= 0
  ) {

    return 0;

  }


  return Math.round(
    (
      used /
      budget
    ) *
    100
  );

}


// =====================================================
// 카테고리 / 프로필
// =====================================================

function getCategoryInfo(
  name
) {

  return (
    categories.find(
      (category) =>
        category.name ===
        name
    )

    ||

    {
      name:
        name ||
        "기타",

      emoji:
        "📌",

      isDefault:
        false
    }
  );

}


function getProfileByUid(
  uid
) {

  if (
    !uid
  ) {

    return null;

  }


  if (
    myProfile?.uid ===
    uid
  ) {

    return myProfile;

  }


  if (
    partnerProfile?.uid ===
    uid
  ) {

    return partnerProfile;

  }


  return null;

}


function getPartnerUid() {

  if (
    !currentCouple?.members ||
    !currentUser
  ) {

    return null;

  }


  return (
    currentCouple.members.find(
      (uid) =>
        uid !==
        currentUser.uid
    )

    ||

    null
  );

}


// =====================================================
// 비공개 설명
// =====================================================

function getPublicDescription(
  expense
) {

  if (
    !expense
  ) {

    return "";

  }


  if (
    !expense.isPrivate
  ) {

    return (
      expense.description ||
      ""
    );

  }


  if (
    expense.payerUid ===
    currentUser?.uid
  ) {

    return (
      privateDetails[
        expense.id
      ]

      ||

      ""
    );

  }


  return "";

}


function getExpenseDisplayTitle(
  expense
) {

  const category =
    getCategoryInfo(
      expense.category
    );


  const description =
    getPublicDescription(
      expense
    );


  if (
    description
  ) {

    return description;

  }


  return (
    `${category.emoji} ${category.name}`
  );

}


function typeLabel(
  type
) {

  return (
    type ===
      "together"

      ? "같이"

      : "혼자"
  );

}


// =====================================================
// 현재 월 지출
// =====================================================

function getCurrentMonthExpenses() {

  const monthKey =
    getMonthKey();


  return expenses.filter(
    (expense) =>
      expense.monthKey ===
      monthKey
  );

}


// =====================================================
// 한 달 진행률
// =====================================================

function getMonthProgress() {

  const now =
    new Date();


  const selectedStart =
    new Date(
      selectedYear,
      selectedMonth - 1,
      1
    );


  const currentStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  if (
    selectedStart <
    currentStart
  ) {

    return 100;

  }


  if (
    selectedStart >
    currentStart
  ) {

    return 0;

  }


  const daysInMonth =
    new Date(
      selectedYear,
      selectedMonth,
      0
    )
      .getDate();


  return Math.round(
    (
      now.getDate() /
      daysInMonth
    ) *
    100
  );

}


// =====================================================
// 거래 정렬
// =====================================================

function getCreatedAtMillis(
  expense
) {

  const value =
    expense?.createdAt;


  if (
    !value
  ) {

    return 0;

  }


  if (
    typeof value.toMillis ===
    "function"
  ) {

    return value.toMillis();

  }


  if (
    typeof value.seconds ===
    "number"
  ) {

    return (
      value.seconds *
      1000
    );

  }


  const parsed =
    new Date(
      value
    )
      .getTime();


  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;

}


function sortExpenseList(
  list,
  mode = "date-desc"
) {

  const copied =
    [...list];


  // 입력순
  if (
    mode ===
    "created-desc"
  ) {

    return copied.sort(
      (a, b) =>
        getCreatedAtMillis(
          b
        )
        -
        getCreatedAtMillis(
          a
        )
    );

  }


  // 날짜순
  // 날짜가 같으면 최근 입력한 것이 위

  return copied.sort(
    (a, b) => {

      const dateCompare =
        String(
          b.date ||
          ""
        )
          .localeCompare(
            String(
              a.date ||
              ""
            )
          );


      if (
        dateCompare !==
        0
      ) {

        return dateCompare;

      }


      return (
        getCreatedAtMillis(
          b
        )
        -
        getCreatedAtMillis(
          a
        )
      );

    }
  );

}

// =====================================================
// 지출 수정 / 삭제 권한
// 작성자 또는 결제자 모두 수정 / 삭제 가능
// =====================================================

function canCurrentUserManageExpense(
  expense
) {

  if (
    !currentUser ||
    !expense
  ) {

    return false;

  }


  const isPayer =
    expense.payerUid ===
    currentUser.uid;


  const isCreator =
    expense.createdByUid ===
    currentUser.uid;


  return (
    isPayer ||
    isCreator
  );

}


// =====================================================
// Firestore 경로
// =====================================================

function userDocRef(
  uid
) {

  return doc(
    db,
    "users",
    uid
  );

}


function coupleDocRef() {

  return doc(
    db,
    "couples",
    coupleId
  );

}


function expensesCollectionRef() {

  return collection(
    db,
    "couples",
    coupleId,
    "expenses"
  );

}


function monthlySettingsDocRef() {

  return doc(
    db,
    "couples",
    coupleId,
    "monthlySettings",
    getMonthKey()
  );

}


function categorySettingsDocRef() {

  return doc(
    db,
    "couples",
    coupleId,
    "settings",
    "categories"
  );

}


function privateDetailsCollectionRef(
  uid = currentUser.uid
) {

  return collection(
    db,
    "users",
    uid,
    "privateExpenseDetails"
  );

}


function privateDetailDocRef(
  expenseId,
  uid = currentUser.uid
) {

  return doc(
    db,
    "users",
    uid,
    "privateExpenseDetails",
    expenseId
  );

}


// =====================================================
// 초대코드 생성
// =====================================================

function createRandomCode(
  length = 6
) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let result =
    "";


  for (
    let i = 0;
    i < length;
    i++
  ) {

    result +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];

  }


  return result;

}


async function makeUniqueInviteCode() {

  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {

    const code =
      createRandomCode(
        6
      );


    const inviteSnapshot =
      await getDoc(
        doc(
          db,
          "invites",
          code
        )
      );


    if (
      !inviteSnapshot.exists()
    ) {

      return code;

    }

  }


  throw new Error(
    "초대코드를 만들지 못했습니다."
  );

}


// =====================================================
// 로그인
// =====================================================

async function login() {

  const email =
    loginEmail
      .value
      .trim();


  const password =
    loginPassword.value;


  loginError.textContent =
    "";


  if (
    !email ||
    !password
  ) {

    loginError.textContent =
      "이메일과 비밀번호를 입력해주세요.";

    return;

  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    loginPassword.value =
      "";

  }

  catch (error) {

    console.error(
      "로그인 실패:",
      error
    );


    loginError.textContent =
      "이메일 또는 비밀번호를 확인해주세요.";

  }

}


loginBtn.addEventListener(
  "click",
  login
);


loginPassword.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      login();

    }

  }
);
// =====================================================
// 비밀번호 재설정
// =====================================================

showPasswordResetBtn.addEventListener(
  "click",
  () => {

    passwordResetMessage.textContent =
      "";


    passwordResetMessage.classList.remove(
      "success",
      "error"
    );


    passwordResetEmail.value =
      loginEmail.value.trim();


    showScreen(
      passwordResetScreen
    );


    passwordResetEmail.focus();

  }
);


passwordResetBackBtn.addEventListener(
  "click",
  () => {

    passwordResetMessage.textContent =
      "";


    passwordResetMessage.classList.remove(
      "success",
      "error"
    );


    showScreen(
      loginScreen
    );

  }
);


async function sendResetEmail() {

  const email =
    passwordResetEmail
      .value
      .trim();


  passwordResetMessage.textContent =
    "";


  passwordResetMessage.classList.remove(
    "success",
    "error"
  );


  if (
    !email
  ) {

    passwordResetMessage.textContent =
      "이메일을 입력해주세요.";


    passwordResetMessage.classList.add(
      "error"
    );


    return;

  }


  try {

    sendPasswordResetBtn.disabled =
      true;


    sendPasswordResetBtn.textContent =
      "보내는 중...";


    await sendPasswordResetEmail(
      auth,
      email
    );


    passwordResetMessage.textContent =
      "비밀번호 재설정 메일을 보냈어요. 메일함을 확인해주세요.";


    passwordResetMessage.classList.add(
      "success"
    );

  }

  catch (error) {

    console.error(
      "비밀번호 재설정 메일 전송 실패:",
      error
    );


    if (
      error.code ===
      "auth/invalid-email"
    ) {

      passwordResetMessage.textContent =
        "이메일 형식을 확인해주세요.";

    }

    else if (
      error.code ===
      "auth/too-many-requests"
    ) {

      passwordResetMessage.textContent =
        "요청이 너무 많아요. 잠시 후 다시 시도해주세요.";

    }

    else {

      passwordResetMessage.textContent =
        "메일을 보내지 못했어요. 이메일을 확인한 뒤 다시 시도해주세요.";

    }


    passwordResetMessage.classList.add(
      "error"
    );

  }

  finally {

    sendPasswordResetBtn.disabled =
      false;


    sendPasswordResetBtn.textContent =
      "재설정 메일 보내기";

  }

}


sendPasswordResetBtn.addEventListener(
  "click",
  sendResetEmail
);


passwordResetEmail.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      sendResetEmail();

    }

  }
);


// =====================================================
// 회원가입 화면
// =====================================================

showSignupBtn.addEventListener(
  "click",
  () => {

    signupError.textContent =
      "";


    signupEmail.value =
      loginEmail.value.trim();


    signupPassword.value =
      "";


    signupPasswordConfirm.value =
      "";


    showScreen(
      signupScreen
    );


    signupEmail.focus();

  }
);


signupBackBtn.addEventListener(
  "click",
  () => {

    signupError.textContent =
      "";


    showScreen(
      loginScreen
    );

  }
);


// =====================================================
// 회원가입
// =====================================================

async function signup() {

  const email =
    signupEmail
      .value
      .trim();


  const password =
    signupPassword.value;


  const confirmPassword =
    signupPasswordConfirm.value;


  signupError.textContent =
    "";


  if (
    !email ||
    !password ||
    !confirmPassword
  ) {

    signupError.textContent =
      "모든 항목을 입력해주세요.";


    return;

  }


  if (
    password !==
    confirmPassword
  ) {

    signupError.textContent =
      "비밀번호가 서로 달라요.";


    return;

  }


  if (
    password.length <
    6
  ) {

    signupError.textContent =
      "비밀번호는 6자리 이상 입력해주세요.";


    return;

  }


  try {

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    await setDoc(
      userDocRef(
        credential.user.uid
      ),
      {

        email,

        nickname:
          "",

        icon:
          "🩷",

        coupleId:
          null,

        createdAt:
          serverTimestamp()

      }
    );


    signupPassword.value =
      "";


    signupPasswordConfirm.value =
      "";

  }

  catch (error) {

    console.error(
      "회원가입 실패:",
      error
    );


    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      signupError.textContent =
        "이미 가입된 이메일이에요.";

    }

    else if (
      error.code ===
      "auth/invalid-email"
    ) {

      signupError.textContent =
        "이메일 형식을 확인해주세요.";

    }

    else if (
      error.code ===
      "auth/weak-password"
    ) {

      signupError.textContent =
        "비밀번호를 조금 더 길게 설정해주세요.";

    }

    else {

      signupError.textContent =
        "회원가입에 실패했어요. 잠시 후 다시 시도해주세요.";

    }

  }

}


signupBtn.addEventListener(
  "click",
  signup
);


signupPasswordConfirm.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      signup();

    }

  }
);


// =====================================================
// 프로필 아이콘 선택
// =====================================================

function clearActiveIconButtons(
  buttons
) {

  buttons.forEach(
    (button) => {

      button.classList.remove(
        "active"
      );

    }
  );

}


profileIconButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        clearActiveIconButtons(
          profileIconButtons
        );


        button.classList.add(
          "active"
        );


        selectedProfileIcon =
          button.dataset.icon;


        if (
          customProfileIcon
        ) {

          customProfileIcon.value =
            "";

        }

      }
    );

  }
);


if (
  customProfileIcon
) {

  customProfileIcon.addEventListener(
    "input",
    () => {

      const value =
        customProfileIcon
          .value
          .trim();


      if (
        value
      ) {

        clearActiveIconButtons(
          profileIconButtons
        );


        selectedProfileIcon =
          value;

      }

    }
  );

}


settingsIconButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        clearActiveIconButtons(
          settingsIconButtons
        );


        button.classList.add(
          "active"
        );


        selectedSettingsIcon =
          button.dataset.icon;


        if (
          customSettingsIcon
        ) {

          customSettingsIcon.value =
            "";

        }

      }
    );

  }
);


if (
  customSettingsIcon
) {

  customSettingsIcon.addEventListener(
    "input",
    () => {

      const value =
        customSettingsIcon
          .value
          .trim();


      if (
        value
      ) {

        clearActiveIconButtons(
          settingsIconButtons
        );


        selectedSettingsIcon =
          value;

      }

    }
  );

}


// =====================================================
// 최초 프로필 저장
// =====================================================

async function saveInitialProfile() {

  const nickname =
    profileNickname
      .value
      .trim();


  const customIcon =
    customProfileIcon
      ?.value
      .trim();


  const icon =
    customIcon

    ||

    selectedProfileIcon

    ||

    "🩷";


  profileError.textContent =
    "";


  if (
    !nickname
  ) {

    profileError.textContent =
      "닉네임을 입력해주세요.";


    return;

  }


  try {

    await updateDoc(
      userDocRef(
        currentUser.uid
      ),
      {

        nickname,

        icon

      }
    );


    await loadMyProfile();


    showCoupleSetupScreen();

  }

  catch (error) {

    console.error(
      "프로필 저장 실패:",
      error
    );


    profileError.textContent =
      "프로필을 저장하지 못했어요.";

  }

}


saveProfileBtn.addEventListener(
  "click",
  saveInitialProfile
);


// =====================================================
// 내 프로필 불러오기
// =====================================================

async function loadMyProfile() {

  if (
    !currentUser
  ) {

    return null;

  }


  const snapshot =
    await getDoc(
      userDocRef(
        currentUser.uid
      )
    );


  if (
    !snapshot.exists()
  ) {

    await setDoc(
      userDocRef(
        currentUser.uid
      ),
      {

        email:
          currentUser.email ||
          "",

        nickname:
          "",

        icon:
          "🩷",

        coupleId:
          null,

        createdAt:
          serverTimestamp()

      }
    );


    myProfile = {

      uid:
        currentUser.uid,

      email:
        currentUser.email ||
        "",

      nickname:
        "",

      icon:
        "🩷",

      coupleId:
        null

    };


    return myProfile;

  }


  myProfile = {

    uid:
      snapshot.id,

    ...snapshot.data()

  };


  return myProfile;

}


// =====================================================
// 커플 연결 준비 화면
// =====================================================

function showCoupleSetupScreen() {

  if (
    !myProfile
  ) {

    return;

  }


  if (
    setupMyIcon
  ) {

    setupMyIcon.textContent =
      myProfile.icon ||
      "🩷";

  }


  if (
    setupMyNickname
  ) {

    setupMyNickname.textContent =
      myProfile.nickname ||
      "나";

  }


  showScreen(
    coupleSetupScreen
  );

}


// =====================================================
// 커플 생성
// =====================================================

async function createCouple() {

  if (
    !currentUser ||
    !myProfile
  ) {

    return;

  }


  try {

    createCoupleBtn.disabled =
      true;


    createCoupleBtn.textContent =
      "만드는 중...";


    const inviteCode =
      await makeUniqueInviteCode();


    const newCoupleRef =
      doc(
        collection(
          db,
          "couples"
        )
      );


    await setDoc(
      newCoupleRef,
      {

        inviteCode,

        members: [
          currentUser.uid
        ],

        createdAt:
          serverTimestamp()

      }
    );


    await setDoc(
      doc(
        db,
        "invites",
        inviteCode
      ),
      {

        coupleId:
          newCoupleRef.id,

        createdBy:
          currentUser.uid,

        createdAt:
          serverTimestamp()

      }
    );


    await updateDoc(
      userDocRef(
        currentUser.uid
      ),
      {

        coupleId:
          newCoupleRef.id

      }
    );


    coupleId =
      newCoupleRef.id;


    myProfile.coupleId =
      newCoupleRef.id;


    currentCouple = {

      id:
        newCoupleRef.id,

      inviteCode,

      members: [
        currentUser.uid
      ]

    };


    inviteCodeElement.textContent =
      inviteCode;


    showScreen(
      inviteScreen
    );

  }

  catch (error) {

    console.error(
      "커플 생성 실패:",
      error
    );


    alert(
      "커플 공간을 만들지 못했어요."
    );

  }

  finally {

    createCoupleBtn.disabled =
      false;


    createCoupleBtn.textContent =
      "초대코드 만들기";

  }

}


createCoupleBtn.addEventListener(
  "click",
  createCouple
);


// =====================================================
// 초대코드 복사
// =====================================================

copyInviteCodeBtn.addEventListener(
  "click",
  async () => {

    const code =
      inviteCodeElement
        .textContent
        .trim();


    if (
      !code
    ) {

      return;

    }


    try {

      await navigator.clipboard.writeText(
        code
      );


      const originalText =
        copyInviteCodeBtn.textContent;


      copyInviteCodeBtn.textContent =
        "복사 완료!";


      setTimeout(
        () => {

          copyInviteCodeBtn.textContent =
            originalText;

        },
        1500
      );

    }

    catch (error) {

      console.error(
        "초대코드 복사 실패:",
        error
      );


      alert(
        `초대코드: ${code}`
      );

    }

  }
);


// =====================================================
// 커플 연결 화면 열기
// =====================================================

showJoinCoupleBtn.addEventListener(
  "click",
  () => {

    joinCodeInput.value =
      "";


    joinError.textContent =
      "";


    showScreen(
      joinCoupleScreen
    );


    joinCodeInput.focus();

  }
);


joinBackBtn.addEventListener(
  "click",
  () => {

    joinError.textContent =
      "";


    showCoupleSetupScreen();

  }
);


// =====================================================
// 초대코드로 커플 연결
// =====================================================

async function joinCouple() {

  const code =
    joinCodeInput
      .value
      .trim()
      .toUpperCase();


  joinError.textContent =
    "";


  if (
    !code
  ) {

    joinError.textContent =
      "초대코드를 입력해주세요.";


    return;

  }


  try {

    joinCoupleBtn.disabled =
      true;


    joinCoupleBtn.textContent =
      "연결 중...";


    const inviteSnapshot =
      await getDoc(
        doc(
          db,
          "invites",
          code
        )
      );


    if (
      !inviteSnapshot.exists()
    ) {

      joinError.textContent =
        "초대코드를 찾을 수 없어요.";


      return;

    }


    const inviteData =
      inviteSnapshot.data();


    const targetCoupleId =
      inviteData.coupleId;


    if (
      !targetCoupleId
    ) {

      joinError.textContent =
        "초대코드 정보가 올바르지 않아요.";


      return;

    }


    const targetCoupleRef =
      doc(
        db,
        "couples",
        targetCoupleId
      );


    const coupleSnapshot =
      await getDoc(
        targetCoupleRef
      );


    if (
      !coupleSnapshot.exists()
    ) {

      joinError.textContent =
        "커플 공간을 찾을 수 없어요.";


      return;

    }


    const coupleData =
      coupleSnapshot.data();


    const members =
      coupleData.members ||
      [];


    if (
      members.length >= 2
      &&
      !members.includes(
        currentUser.uid
      )
    ) {

      joinError.textContent =
        "이미 두 사람이 연결된 초대코드예요.";


      return;

    }


    await updateDoc(
      targetCoupleRef,
      {

        members:
          arrayUnion(
            currentUser.uid
          )

      }
    );


    await updateDoc(
      userDocRef(
        currentUser.uid
      ),
      {

        coupleId:
          targetCoupleId

      }
    );


    coupleId =
      targetCoupleId;


    myProfile.coupleId =
      targetCoupleId;


    await startCoupleApp();

  }

  catch (error) {

    console.error(
      "커플 연결 실패:",
      error
    );


    joinError.textContent =
      "커플 연결에 실패했어요.";

  }

  finally {

    joinCoupleBtn.disabled =
      false;


    joinCoupleBtn.textContent =
      "연결하기";

  }

}


joinCoupleBtn.addEventListener(
  "click",
  joinCouple
);


joinCodeInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      joinCouple();

    }

  }
);


// =====================================================
// 초대 화면에서 앱으로
// =====================================================

inviteContinueBtn.addEventListener(
  "click",
  async () => {

    await startCoupleApp();

  }
);


// =====================================================
// 로그아웃
// =====================================================

async function logout() {

  closeAllModals();


  try {

    await signOut(
      auth
    );

  }

  catch (error) {

    console.error(
      "로그아웃 실패:",
      error
    );

  }

}


logoutBtn.addEventListener(
  "click",
  logout
);


setupLogoutBtn.addEventListener(
  "click",
  logout
);


// =====================================================
// 실시간 구독 해제
// =====================================================

function clearSubscriptions() {

  [

    unsubscribeExpenses,
    unsubscribeMonthlySettings,
    unsubscribeCategories,
    unsubscribeCouple,
    unsubscribePartnerProfile,
    unsubscribePrivateDetails

  ]
    .filter(
      (unsubscribe) =>
        typeof unsubscribe ===
        "function"
    )
    .forEach(
      (unsubscribe) => {

        unsubscribe();

      }
    );


  unsubscribeExpenses =
    null;


  unsubscribeMonthlySettings =
    null;


  unsubscribeCategories =
    null;


  unsubscribeCouple =
    null;


  unsubscribePartnerProfile =
    null;


  unsubscribePrivateDetails =
    null;

}


// =====================================================
// 로그인 상태 변화
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    clearSubscriptions();


    currentUser =
      user;


    myProfile =
      null;


    partnerProfile =
      null;


    currentCouple =
      null;


    coupleId =
      null;


    expenses =
      [];


    privateDetails =
      {};


    monthlySettings = {

      sharedBudget: 0,

      personalBudgets: {}

    };


    categories =
      [...defaultCategories];


    detailUserUid =
      null;


    transactionVisibleCount =
      15;


    if (
      !user
    ) {

      showScreen(
        loginScreen
      );


      return;

    }


    try {

      await loadMyProfile();


      if (
        !myProfile.nickname
      ) {

        profileNickname.value =
          "";


        selectedProfileIcon =
          myProfile.icon ||
          "🩷";


        clearActiveIconButtons(
          profileIconButtons
        );


        profileIconButtons.forEach(
          (button) => {

            if (
              button.dataset.icon ===
              selectedProfileIcon
            ) {

              button.classList.add(
                "active"
              );

            }

          }
        );


        showScreen(
          profileScreen
        );


        return;

      }


      if (
        !myProfile.coupleId
      ) {

        showCoupleSetupScreen();


        return;

      }


      coupleId =
        myProfile.coupleId;


      await startCoupleApp();

    }

    catch (error) {

      console.error(
        "초기화 실패:",
        error
      );


      alert(
        "앱 정보를 불러오는 중 문제가 생겼어요."
      );

    }

  }
);
// =====================================================
// 커플 앱 시작
// =====================================================

async function startCoupleApp() {

  if (
    !currentUser ||
    !coupleId
  ) {

    return;

  }


  clearSubscriptions();


  updateMonthTitle();


  transactionVisibleCount =
    15;


  await loadCoupleOnce();


  subscribeCouple();

  subscribeExpenses();

  subscribeMonthlySettings();

  subscribeCategories();

  subscribePrivateDetails();


  showScreen(
    appScreen
  );


  renderApp();

}


// =====================================================
// 커플 정보 1회 불러오기
// =====================================================

async function loadCoupleOnce() {

  if (
    !coupleId
  ) {

    return;

  }


  const snapshot =
    await getDoc(
      coupleDocRef()
    );


  if (
    !snapshot.exists()
  ) {

    throw new Error(
      "커플 정보를 찾을 수 없습니다."
    );

  }


  currentCouple = {

    id:
      snapshot.id,

    ...snapshot.data()

  };


  await loadPartnerProfileOnce();

}


// =====================================================
// 상대 프로필 1회 불러오기
// =====================================================

async function loadPartnerProfileOnce() {

  const partnerUid =
    getPartnerUid();


  if (
    !partnerUid
  ) {

    partnerProfile =
      null;


    return;

  }


  const snapshot =
    await getDoc(
      userDocRef(
        partnerUid
      )
    );


  if (
    snapshot.exists()
  ) {

    partnerProfile = {

      uid:
        snapshot.id,

      ...snapshot.data()

    };

  }

  else {

    partnerProfile =
      null;

  }

}


// =====================================================
// 커플 정보 실시간 구독
// =====================================================

function subscribeCouple() {

  if (
    !coupleId
  ) {

    return;

  }


  if (
    unsubscribeCouple
  ) {

    unsubscribeCouple();

  }


  unsubscribeCouple =
    onSnapshot(

      coupleDocRef(),

      async (snapshot) => {

        if (
          !snapshot.exists()
        ) {

          return;

        }


        currentCouple = {

          id:
            snapshot.id,

          ...snapshot.data()

        };


        subscribePartnerProfile();


        renderApp();

      },

      (error) => {

        console.error(
          "커플 정보 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 상대 프로필 실시간 구독
// =====================================================

function subscribePartnerProfile() {

  if (
    unsubscribePartnerProfile
  ) {

    unsubscribePartnerProfile();


    unsubscribePartnerProfile =
      null;

  }


  const partnerUid =
    getPartnerUid();


  if (
    !partnerUid
  ) {

    partnerProfile =
      null;


    renderApp();


    return;

  }


  unsubscribePartnerProfile =
    onSnapshot(

      userDocRef(
        partnerUid
      ),

      (snapshot) => {

        if (
          snapshot.exists()
        ) {

          partnerProfile = {

            uid:
              snapshot.id,

            ...snapshot.data()

          };

        }

        else {

          partnerProfile =
            null;

        }


        renderApp();

      },

      (error) => {

        console.error(
          "상대 프로필 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 지출 실시간 구독
// =====================================================

function subscribeExpenses() {

  if (
    !coupleId
  ) {

    return;

  }


  if (
    unsubscribeExpenses
  ) {

    unsubscribeExpenses();

  }


  const expenseQuery =
    query(

      expensesCollectionRef(),

      orderBy(
        "createdAt",
        "desc"
      )

    );


  unsubscribeExpenses =
    onSnapshot(

      expenseQuery,

      (snapshot) => {

        expenses =
          snapshot.docs.map(
            (expenseDoc) => ({

              id:
                expenseDoc.id,

              ...expenseDoc.data()

            })
          );


        renderApp();

      },

      (error) => {

        console.error(
          "지출 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 월별 예산 실시간 구독
// =====================================================

function subscribeMonthlySettings() {

  if (
    !coupleId
  ) {

    return;

  }


  if (
    unsubscribeMonthlySettings
  ) {

    unsubscribeMonthlySettings();

  }


  unsubscribeMonthlySettings =
    onSnapshot(

      monthlySettingsDocRef(),

      (snapshot) => {

        if (
          snapshot.exists()
        ) {

          const data =
            snapshot.data();


          monthlySettings = {

            sharedBudget:
              Number(
                data.sharedBudget ||
                0
              ),

            personalBudgets:
              data.personalBudgets ||
              {}

          };

        }

        else {

          monthlySettings = {

            sharedBudget:
              0,

            personalBudgets:
              {}

          };

        }


        renderApp();

      },

      (error) => {

        console.error(
          "월별 예산 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 카테고리 실시간 구독
// =====================================================

function subscribeCategories() {

  if (
    !coupleId
  ) {

    return;

  }


  if (
    unsubscribeCategories
  ) {

    unsubscribeCategories();

  }


  unsubscribeCategories =
    onSnapshot(

      categorySettingsDocRef(),

      (snapshot) => {

        if (
          snapshot.exists()
        ) {

          const data =
            snapshot.data();


          if (
            Array.isArray(
              data.categories
            )
            &&
            data.categories.length
          ) {

            categories =
              data.categories;

          }

          else {

            categories =
              [...defaultCategories];

          }

        }

        else {

          categories =
            [...defaultCategories];

        }


        renderCategoryOptions();

        renderCategorySettingList();

        renderApp();

      },

      (error) => {

        console.error(
          "카테고리 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 내 비공개 설명 실시간 구독
// =====================================================

function subscribePrivateDetails() {

  if (
    !currentUser
  ) {

    return;

  }


  if (
    unsubscribePrivateDetails
  ) {

    unsubscribePrivateDetails();

  }


  unsubscribePrivateDetails =
    onSnapshot(

      privateDetailsCollectionRef(),

      (snapshot) => {

        privateDetails =
          {};


        snapshot.docs.forEach(
          (detailDoc) => {

            privateDetails[
              detailDoc.id
            ] =
              detailDoc.data()
                .description ||
              "";

          }
        );


        renderApp();

      },

      (error) => {

        console.error(
          "비공개 지출 설명 구독 실패:",
          error
        );

      }

    );

}


// =====================================================
// 월 변경
// =====================================================

function changeMonth(
  amount
) {

  selectedMonth +=
    amount;


  if (
    selectedMonth <=
    0
  ) {

    selectedMonth =
      12;


    selectedYear -=
      1;

  }

  else if (
    selectedMonth >=
    13
  ) {

    selectedMonth =
      1;


    selectedYear +=
      1;

  }


  transactionVisibleCount =
    15;


  updateMonthTitle();


  subscribeMonthlySettings();


  renderApp();

}


prevMonthBtn.addEventListener(
  "click",
  () => {

    changeMonth(
      -1
    );

  }
);


nextMonthBtn.addEventListener(
  "click",
  () => {

    changeMonth(
      1
    );

  }
);


// =====================================================
// 거래내역 정렬
// =====================================================

if (
  transactionSort
) {

  transactionSort.addEventListener(
    "change",
    () => {

      transactionVisibleCount =
        15;


      renderTransactions();

    }
  );

}


// =====================================================
// 거래내역 더보기
// =====================================================

if (
  transactionMoreBtn
) {

  transactionMoreBtn.addEventListener(
    "click",
    () => {

      transactionVisibleCount +=
        15;


      renderTransactions();

    }
  );

}


// =====================================================
// 맨 위로 버튼
// =====================================================

if (
  scrollTopBtn
) {

  function updateScrollTopButton() {

    if (
      window.scrollY >
      500
    ) {

      scrollTopBtn.classList.add(
        "show"
      );

    }

    else {

      scrollTopBtn.classList.remove(
        "show"
      );

    }

  }


  window.addEventListener(
    "scroll",
    updateScrollTopButton,
    {
      passive:
        true
    }
  );


  scrollTopBtn.addEventListener(
    "click",
    () => {

      window.scrollTo({

        top:
          0,

        behavior:
          "smooth"

      });

    }
  );


  updateScrollTopButton();

}


// =====================================================
// 지출 카테고리 선택지
// =====================================================

function renderCategoryOptions() {

  if (
    !categoryInput
  ) {

    return;

  }


  const currentValue =
    categoryInput.value;


  categoryInput.innerHTML =
    "";


  categories.forEach(
    (category) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        category.name;


      option.textContent =
        `${category.emoji} ${category.name}`;


      categoryInput.appendChild(
        option
      );

    }
  );


  if (
    categories.some(
      (category) =>
        category.name ===
        currentValue
    )
  ) {

    categoryInput.value =
      currentValue;

  }

}


// =====================================================
// 지출 타입 선택
// =====================================================

function getSelectedExpenseType() {

  const activeButton =
    [...typeButtons].find(
      (button) =>
        button.classList.contains(
          "active"
        )
    );


  return (
    activeButton?.dataset.type ||
    "together"
  );

}


function setSelectedExpenseType(
  type
) {

  typeButtons.forEach(
    (button) => {

      const active =
        button.dataset.type ===
        type;


      button.classList.toggle(
        "active",
        active
      );

    }
  );


  updatePrivacyVisibility();

}


// =====================================================
// 결제자 선택
// =====================================================

function getSelectedPayerUid() {

  const activeButton =
    [...payerButtons].find(
      (button) =>
        button.classList.contains(
          "active"
        )
    );


  return (
    activeButton?.dataset.uid

    ||

    currentUser?.uid

    ||

    ""
  );

}


function setSelectedPayer(
  uid
) {

  payerButtons.forEach(
    (button) => {

      button.classList.toggle(

        "active",

        button.dataset.uid ===
          uid

      );

    }
  );

}


// =====================================================
// 비공개 설정 표시
// =====================================================

function updatePrivacyVisibility() {

  if (
    !privateExpenseGroup
  ) {

    return;

  }


  const type =
    getSelectedExpenseType();


  privateExpenseGroup.hidden =
    type !==
    "alone";


  if (
    type !==
      "alone"
    &&
    privateExpenseToggle
  ) {

    privateExpenseToggle.checked =
      false;

  }

}


// =====================================================
// 타입 버튼 이벤트
// =====================================================

typeButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        setSelectedExpenseType(
          button.dataset.type
        );

      }
    );

  }
);


// =====================================================
// 결제자 버튼 이벤트
// =====================================================

payerButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        setSelectedPayer(
          button.dataset.uid
        );

      }
    );

  }
);


// =====================================================
// 새 지출 모달
// =====================================================

function prepareExpenseModal() {

  editingExpenseId =
    null;


  expenseModalTitle.textContent =
    "지출 추가";


  dateInput.value =
    getDefaultDate();


  amountInput.value =
    "";


  descriptionInput.value =
    "";


  if (
    privateExpenseToggle
  ) {

    privateExpenseToggle.checked =
      false;

  }


  setSelectedExpenseType(
    "together"
  );


  renderCategoryOptions();


  if (
    categories.length
  ) {

    categoryInput.value =
      categories[0].name;

  }


  setSelectedPayer(
    currentUser.uid
  );


  saveExpenseBtn.textContent =
    "저장하기";


  expenseModal.classList.add(
    "show"
  );


  amountInput.focus();

}


addExpenseBtn.addEventListener(
  "click",
  prepareExpenseModal
);


// =====================================================
// 지출 모달 닫기
// =====================================================

closeModalBtn.addEventListener(
  "click",
  () => {

    expenseModal.classList.remove(
      "show"
    );


    editingExpenseId =
      null;

  }
);


// =====================================================
// 지출 수정 모달 열기
// =====================================================

function openEditExpense(
  expenseId
) {

  const expense =
    expenses.find(
      (item) =>
        item.id ===
        expenseId
    );


  if (
    !expense
  ) {

    alert(
      "지출 정보를 찾을 수 없어요."
    );


    return;

  }


  if (
    !canCurrentUserManageExpense(
      expense
    )
  ) {

    alert(
      "본인이 등록한 지출만 수정할 수 있어요."
    );


    return;

  }


  editingExpenseId =
    expense.id;


  expenseModalTitle.textContent =
    "지출 수정";


  dateInput.value =
    expense.date ||
    getDefaultDate();


  amountInput.value =
    formatMoneyInput(
      expense.amount
    );


  setSelectedExpenseType(
    expense.type ||
    "together"
  );


  renderCategoryOptions();


  categoryInput.value =
    expense.category

    ||

    categories[0]?.name

    ||

    "";


  descriptionInput.value =
    getPublicDescription(
      expense
    );


  if (
    privateExpenseToggle
  ) {

    privateExpenseToggle.checked =
      Boolean(
        expense.isPrivate
      );

  }


  setSelectedPayer(
    expense.payerUid ||
    currentUser.uid
  );


  saveExpenseBtn.textContent =
    "수정하기";


  expenseModal.classList.add(
    "show"
  );

}


// =====================================================
// 지출 저장
// =====================================================

async function saveExpense() {

  if (
    !currentUser ||
    !coupleId
  ) {

    return;

  }


  const date =
    dateInput.value;


  const amount =
    parseMoney(
      amountInput.value
    );


  const type =
    getSelectedExpenseType();


  const category =
    categoryInput.value;


  const description =
    descriptionInput
      .value
      .trim();


  const payerUid =
    getSelectedPayerUid();


  const isPrivate =
    type ===
      "alone"
    &&
    Boolean(
      privateExpenseToggle?.checked
    );


  if (
    !date
  ) {

    alert(
      "날짜를 선택해주세요."
    );


    return;

  }


  if (
    !amount ||
    amount <= 0
  ) {

    alert(
      "금액을 입력해주세요."
    );


    amountInput.focus();


    return;

  }


  if (
    !category
  ) {

    alert(
      "카테고리를 선택해주세요."
    );


    return;

  }


  if (
    !payerUid
  ) {

    alert(
      "결제자를 선택해주세요."
    );


    return;

  }


  const monthKey =
    date.slice(
      0,
      7
    );


  const wasEditing =
    Boolean(
      editingExpenseId
    );


  try {

    saveExpenseBtn.disabled =
      true;


    saveExpenseBtn.textContent =
      wasEditing
        ? "수정 중..."
        : "저장 중...";


    // =================================================
    // 기존 지출 수정
    // =================================================

    if (
      editingExpenseId
    ) {

      const oldExpense =
        expenses.find(
          (item) =>
            item.id ===
            editingExpenseId
        );


      if (
        !oldExpense
      ) {

        alert(
          "수정할 지출을 찾을 수 없어요."
        );


        return;

      }


      if (
        !canCurrentUserManageExpense(
          oldExpense
        )
      ) {

        alert(
          "본인이 등록한 지출만 수정할 수 있어요."
        );


        return;

      }


      const expenseRef =
        doc(
          db,
          "couples",
          coupleId,
          "expenses",
          editingExpenseId
        );


      await updateDoc(
        expenseRef,
        {

          date,

          monthKey,

          amount,

          type,

          category,

          payerUid,

          isPrivate,

          description:
            isPrivate
              ? ""
              : description,

          updatedAt:
            serverTimestamp()

        }
      );


      if (
        isPrivate
      ) {

        await setDoc(
          privateDetailDocRef(
            editingExpenseId
          ),
          {

            description,

            updatedAt:
              serverTimestamp()

          },
          {
            merge:
              true
          }
        );

      }

      else {

        try {

          await deleteDoc(
            privateDetailDocRef(
              editingExpenseId
            )
          );

        }

        catch (error) {

          console.warn(
            "비공개 설명 정리 생략:",
            error
          );

        }

      }

    }


    // =================================================
    // 새 지출 등록
    // =================================================

    else {

      const newExpenseRef =
        doc(
          expensesCollectionRef()
        );


      await setDoc(
        newExpenseRef,
        {

          date,

          monthKey,

          amount,

          type,

          category,

          payerUid,

          createdByUid:
            currentUser.uid,

          isPrivate,

          description:
            isPrivate
              ? ""
              : description,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      if (
        isPrivate
      ) {

        await setDoc(
          privateDetailDocRef(
            newExpenseRef.id
          ),
          {

            description,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );

      }

    }


    expenseModal.classList.remove(
      "show"
    );


    editingExpenseId =
      null;


    transactionVisibleCount =
      15;

  }

  catch (error) {

    console.error(
      "지출 저장 실패:",
      error
    );


    alert(
      "지출을 저장하지 못했어요."
    );

  }

  finally {

    saveExpenseBtn.disabled =
      false;


    saveExpenseBtn.textContent =
      wasEditing
        ? "수정하기"
        : "저장하기";

  }

}


saveExpenseBtn.addEventListener(
  "click",
  saveExpense
);


// =====================================================
// 지출 삭제
// =====================================================

async function deleteExpense(
  expenseId
) {

  const expense =
    expenses.find(
      (item) =>
        item.id ===
        expenseId
    );


  if (
    !expense
  ) {

    alert(
      "삭제할 지출을 찾을 수 없어요."
    );


    return;

  }


  if (
    !canCurrentUserManageExpense(
      expense
    )
  ) {

    alert(
      "본인이 등록한 지출만 삭제할 수 있어요."
    );


    return;

  }


  const confirmed =
    confirm(
      `${formatWon(expense.amount)} 지출을 삭제할까요?`
    );


  if (
    !confirmed
  ) {

    return;

  }


  try {

    await deleteDoc(
      doc(
        db,
        "couples",
        coupleId,
        "expenses",
        expenseId
      )
    );


    try {

      await deleteDoc(
        privateDetailDocRef(
          expenseId
        )
      );

    }

    catch (error) {

      console.warn(
        "비공개 설명 삭제 생략:",
        error
      );

    }


    transactionVisibleCount =
      15;

  }

  catch (error) {

    console.error(
      "지출 삭제 실패:",
      error
    );


    alert(
      "지출을 삭제하지 못했어요."
    );

  }

}


// =====================================================
// 금액 입력 콤마
// =====================================================

[
  amountInput,
  sharedBudgetInput,
  myBudgetInput,
  partnerBudgetInput
]
  .filter(
    Boolean
  )
  .forEach(
    attachMoneyFormatter
  );


// =====================================================
// 모달 바깥 클릭 시 닫기
// =====================================================

[
  expenseModal,
  budgetModal,
  categoryModal,
  settingsModal
]
  .filter(
    Boolean
  )
  .forEach(
    (modal) => {

      modal.addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            modal
          ) {

            modal.classList.remove(
              "show"
            );


            if (
              modal ===
              expenseModal
            ) {

              editingExpenseId =
                null;

            }

          }

        }
      );

    }
  );


// =====================================================
// ESC로 모달 닫기
// =====================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    closeAllModals();


    editingExpenseId =
      null;

  }
);
// =====================================================
// 메인 화면 렌더링
// =====================================================

function renderApp() {

  if (
    !currentUser ||
    !myProfile
  ) {

    return;

  }


  updateMonthTitle();


  const monthlyExpenses =
    getCurrentMonthExpenses();


  // ===================================================
  // 프로필
  // ===================================================

  renderProfileCards();

  renderPayerButtons();


  // ===================================================
  // 같이 사용한 지출
  // ===================================================

  const togetherExpenses =
    monthlyExpenses.filter(
      (expense) =>
        expense.type ===
        "together"
    );


  const sharedUsed =
    togetherExpenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        Number(
          expense.amount ||
          0
        ),
      0
    );


  const sharedBudget =
    Number(
      monthlySettings
        .sharedBudget ||
      0
    );


  const sharedPercent =
    getUsagePercent(
      sharedUsed,
      sharedBudget
    );


  // ===================================================
  // 공동 예산
  // ===================================================

  if (
    sharedUsedAmount
  ) {

    sharedUsedAmount.textContent =
      formatWon(
        sharedUsed
      );

  }


  if (
    sharedBudgetAmount
  ) {

    sharedBudgetAmount.textContent =
      formatWon(
        sharedBudget
      );

  }


  if (
    sharedBudgetPercent
  ) {

    sharedBudgetPercent.textContent =
      sharedBudget > 0
        ? `${sharedPercent}%`
        : "0%";

  }


  if (
    sharedRemainingAmount
  ) {

    sharedRemainingAmount.textContent =
      formatWon(
        Math.max(
          sharedBudget -
          sharedUsed,
          0
        )
      );

  }


  setProgress(
    sharedBudgetProgress,
    sharedPercent
  );


  renderMonthBudgetProgress(
    sharedUsed,
    sharedBudget
  );


  // ===================================================
  // 개인 생활비 카드
  // ===================================================

  renderPersonalBudgetCards(
    monthlyExpenses
  );


  // ===================================================
  // 공동 카테고리 비율
  // ===================================================

  renderCategoryRatios(
    sharedCategoryList,
    togetherExpenses
  );


  // ===================================================
  // 최근 거래내역
  // ===================================================

  renderTransactions();


  // ===================================================
  // 달력
  // ===================================================

  renderExpenseCalendar(
    monthlyExpenses
  );


  // ===================================================
  // 개인 상세화면 열려 있으면 실시간 갱신
  // ===================================================

  if (
    detailUserUid &&
    personDetailScreen &&
    !personDetailScreen.hidden
  ) {

    renderPersonDetail();

  }

}


// =====================================================
// 프로필 카드
// =====================================================

function renderProfileCards() {

  if (
    myIcon
  ) {

    myIcon.textContent =
      myProfile?.icon ||
      "🩷";

  }


  if (
    myNickname
  ) {

    myNickname.textContent =
      myProfile?.nickname ||
      "나";

  }


  if (
    partnerIcon
  ) {

    partnerIcon.textContent =
      partnerProfile?.icon ||
      "💜";

  }


  if (
    partnerNickname
  ) {

    partnerNickname.textContent =
      partnerProfile?.nickname ||
      "상대방";

  }

}


// =====================================================
// 지출 입력 결제자 표시
// =====================================================

function renderPayerButtons() {

  if (
    !currentUser ||
    !myProfile
  ) {

    return;

  }


  payerButtons.forEach(
    (button) => {

      const role =
        button.dataset.payerRole;


      if (
        role ===
        "me"
      ) {

        button.dataset.uid =
          currentUser.uid;

      }


      else if (
        role ===
        "partner"
      ) {

        button.dataset.uid =
          partnerProfile?.uid ||
          "";

      }

    }
  );


  if (
    payerMeIcon
  ) {

    payerMeIcon.textContent =
      myProfile.icon ||
      "🩷";

  }


  if (
    payerMeName
  ) {

    payerMeName.textContent =
      myProfile.nickname ||
      "나";

  }


  if (
    payerPartnerIcon
  ) {

    payerPartnerIcon.textContent =
      partnerProfile?.icon ||
      "💜";

  }


  if (
    payerPartnerName
  ) {

    payerPartnerName.textContent =
      partnerProfile?.nickname ||
      "상대방";

  }

}


// =====================================================
// 개인 생활비 카드
// =====================================================

function renderPersonalBudgetCards(
  monthlyExpenses
) {

  if (
    !currentUser
  ) {

    return;

  }


  const myUid =
    currentUser.uid;


  const partnerUid =
    partnerProfile?.uid ||
    null;


  // ===================================================
  // 내가 결제한 전체 지출
  // ===================================================

  const myUsed =
    monthlyExpenses
      .filter(
        (expense) =>
          expense.payerUid ===
          myUid
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          Number(
            expense.amount ||
            0
          ),
        0
      );


  // ===================================================
  // 상대가 결제한 전체 지출
  // ===================================================

  const partnerUsed =
    partnerUid

      ? monthlyExpenses
          .filter(
            (expense) =>
              expense.payerUid ===
              partnerUid
          )
          .reduce(
            (
              sum,
              expense
            ) =>
              sum +
              Number(
                expense.amount ||
                0
              ),
            0
          )

      : 0;


  const personalBudgets =
    monthlySettings
      .personalBudgets ||
    {};


  const myBudget =
    Number(
      personalBudgets[
        myUid
      ] ||
      0
    );


  const partnerBudget =
    partnerUid

      ? Number(
          personalBudgets[
            partnerUid
          ] ||
          0
        )

      : 0;


  const myPercent =
    getUsagePercent(
      myUsed,
      myBudget
    );


  const partnerPercent =
    getUsagePercent(
      partnerUsed,
      partnerBudget
    );


  // ===================================================
  // 내 카드
  // ===================================================

  if (
    myUsedAmount
  ) {

    myUsedAmount.textContent =
      formatWon(
        myUsed
      );

  }


  if (
    myBudgetAmount
  ) {

    myBudgetAmount.textContent =
      formatWon(
        myBudget
      );

  }


  if (
    myBudgetPercent
  ) {

    myBudgetPercent.textContent =
      myBudget > 0
        ? `${myPercent}%`
        : "0%";

  }


  if (
    myRemainingAmount
  ) {

    myRemainingAmount.textContent =
      formatWon(
        Math.max(
          myBudget -
          myUsed,
          0
        )
      );

  }


  setProgress(
    myBudgetProgress,
    myPercent
  );


  // ===================================================
  // 상대 카드
  // ===================================================

  if (
    partnerUsedAmount
  ) {

    partnerUsedAmount.textContent =
      formatWon(
        partnerUsed
      );

  }


  if (
    partnerBudgetAmount
  ) {

    partnerBudgetAmount.textContent =
      formatWon(
        partnerBudget
      );

  }


  if (
    partnerBudgetPercent
  ) {

    partnerBudgetPercent.textContent =
      partnerBudget > 0
        ? `${partnerPercent}%`
        : "0%";

  }


  if (
    partnerRemainingAmount
  ) {

    partnerRemainingAmount.textContent =
      formatWon(
        Math.max(
          partnerBudget -
          partnerUsed,
          0
        )
      );

  }


  setProgress(
    partnerBudgetProgress,
    partnerPercent
  );

}


// =====================================================
// 한 달 진행률 + 남은 예산
// =====================================================

function renderMonthBudgetProgress(
  used,
  budget
) {

  const monthProgress =
    getMonthProgress();


  if (
    monthProgressPercent
  ) {

    monthProgressPercent.textContent =
      `${monthProgress}%`;

  }


  if (
    monthProgressBar
  ) {

    monthProgressBar.style.width =
      `${Math.min(
        Math.max(
          monthProgress,
          0
        ),
        100
      )}%`;

  }


  if (
    !monthBudgetStatus
  ) {

    return;

  }


  const now =
    new Date();


  const selectedStart =
    new Date(
      selectedYear,
      selectedMonth - 1,
      1
    );


  const currentStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  // ===================================================
  // 과거 달
  // ===================================================

  if (
    selectedStart <
    currentStart
  ) {

    if (
      budget > 0
    ) {

      const usedPercent =
        getUsagePercent(
          used,
          budget
        );


      monthBudgetStatus.textContent =
        `마감된 달이에요 · 예산 ${usedPercent}% 사용`;

    }

    else {

      monthBudgetStatus.textContent =
        "마감된 달이에요 · 설정된 공동예산이 없어요.";

    }


    return;

  }


  // ===================================================
  // 미래 달
  // ===================================================

  if (
    selectedStart >
    currentStart
  ) {

    if (
      budget > 0
    ) {

      monthBudgetStatus.textContent =
        `아직 시작 전이에요 · 예산 ${formatWon(budget)} 준비`;

    }

    else {

      monthBudgetStatus.textContent =
        "아직 시작 전이에요 · 공동예산이 아직 설정되지 않았어요.";

    }


    return;

  }


  // ===================================================
  // 현재 달
  // ===================================================

  const remainingPeriod =
    Math.max(
      100 -
      monthProgress,
      0
    );


  if (
    budget <= 0
  ) {

    monthBudgetStatus.textContent =
      `남은 기간 ${remainingPeriod}% · 공동예산이 아직 설정되지 않았어요.`;


    return;

  }


  const usedPercent =
    getUsagePercent(
      used,
      budget
    );


  const remainingBudgetPercent =
    Math.max(
      100 -
      usedPercent,
      0
    );


  monthBudgetStatus.textContent =
    `남은 기간 ${remainingPeriod}% · 남은 예산 ${remainingBudgetPercent}%`;

}


// =====================================================
// 카테고리 비율
//
// ★ 중요
// 기존 style.css 클래스명을 그대로 사용합니다.
// =====================================================

function renderCategoryRatios(
  container,
  expenseList
) {

  if (
    !container
  ) {

    return;

  }


  const total =
    expenseList.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        Number(
          expense.amount ||
          0
        ),
      0
    );


  // ===================================================
  // 지출 없음
  // ===================================================

  if (
    !total
  ) {

    container.innerHTML = `
      <div class="empty-message">
        아직 지출이 없습니다.
      </div>
    `;


    return;

  }


  // ===================================================
  // 카테고리별 금액 합산
  // ===================================================

  const amounts =
    {};


  expenseList.forEach(
    (expense) => {

      const categoryName =
        expense.category ||
        "기타";


      amounts[
        categoryName
      ] =
        (
          amounts[
            categoryName
          ]

          ||

          0
        )

        +

        Number(
          expense.amount ||
          0
        );

    }
  );


  // ===================================================
  // 금액 / 퍼센트 계산
  // ===================================================

  const rows =
    Object.entries(
      amounts
    )
      .map(
        ([
          name,
          amount
        ]) => ({

          name,

          amount,

          percent:
            Math.round(
              (
                amount /
                total
              ) *
              100
            )

        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.amount -
          a.amount
      );


  container.innerHTML =
    "";


  // ===================================================
  // 기존 CSS 구조 그대로 생성
  // ===================================================

  rows.forEach(
    (row) => {

      const category =
        getCategoryInfo(
          row.name
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "category-ratio-item";


      item.innerHTML = `
        <div class="category-ratio-top">

          <div class="category-ratio-name">

            <span>
              ${escapeHtml(
                category.emoji
              )}
            </span>

            <strong>
              ${escapeHtml(
                category.name
              )}
            </strong>

          </div>


          <div class="category-ratio-number">

            <span>
              ${formatWon(
                row.amount
              )}
            </span>

            <strong>
              ${row.percent}%
            </strong>

          </div>

        </div>


        <div class="progress-track">

          <div
            class="progress-bar"
            style="width: ${Math.min(
              row.percent,
              100
            )}%"
          ></div>

        </div>
      `;


      container.appendChild(
        item
      );

    }
  );

}


// =====================================================
// 최근 거래내역
// =====================================================

function renderTransactions() {

  if (
    !transactionList
  ) {

    return;

  }


  const monthlyExpenses =
    getCurrentMonthExpenses();


  const sortMode =
    transactionSort?.value

    ||

    "date-desc";


  const sorted =
    sortExpenseList(
      monthlyExpenses,
      sortMode
    );


  // 처음에는 15개만

  const visibleExpenses =
    sorted.slice(
      0,
      transactionVisibleCount
    );


  renderTransactionList(
    transactionList,
    visibleExpenses
  );


  // ===================================================
  // 더보기 버튼
  // ===================================================

  if (
    transactionMoreBtn
  ) {

    const hasMore =
      sorted.length >
      transactionVisibleCount;


    transactionMoreBtn.hidden =
      !hasMore;


    if (
      hasMore
    ) {

      const remaining =
        sorted.length -
        transactionVisibleCount;


      transactionMoreBtn.textContent =
        `거래내역 더보기 ↓ (${remaining}개 남음)`;

    }

  }

}


// =====================================================
// 거래내역 HTML
//
// 기존 CSS 구조 사용
// =====================================================

function renderTransactionList(
  container,
  list
) {

  if (
    !container
  ) {

    return;

  }


  container.innerHTML =
    "";


  if (
    !list.length
  ) {

    container.innerHTML = `
      <div class="empty-message">
        등록된 지출이 없습니다.
      </div>
    `;


    return;

  }


  list.forEach(
    (expense) => {

      const payerProfile =
        getProfileByUid(
          expense.payerUid
        );


      const payerName =
        payerProfile?.nickname ||
        "사용자";


      const title =
        getExpenseDisplayTitle(
          expense
        );


      const canManage =
        canCurrentUserManageExpense(
          expense
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "transaction-item";


      let privacyLabel =
        "";


      if (
        expense.isPrivate
      ) {

        privacyLabel =
          expense.payerUid ===
          currentUser?.uid

            ? " · 🔒 비공개"

            : " · 🔒";

      }


      item.innerHTML = `
        <div class="transaction-info">

          <h3>
            ${escapeHtml(
              title
            )}
          </h3>

          <p class="transaction-meta">

            <span class="transaction-date-category">
              ${escapeHtml(
                expense.date ||
                ""
              )}
              ·
              ${escapeHtml(
                expense.category ||
                ""
              )}
            </span>

            <span
              class="transaction-tag ${
                expense.type === "together"
                  ? "tag-together"
                  : "tag-alone"
              }"
            >
              ${escapeHtml(
                typeLabel(
                  expense.type
                )
              )}
            </span>

            <span class="transaction-tag tag-payer">
              <span class="transaction-payer-icon">
                ${escapeHtml(
                 payerProfile?.icon ||
                "💜"
              )}
              </span>

              ${escapeHtml(
                payerName
              )}
            </span>

            ${privacyLabel}

          </p>

        </div>


        <div class="transaction-right">

          <div class="transaction-amount">
            -${formatWon(
              expense.amount
            )}
          </div>


          ${
            canManage

              ? `
                <div class="transaction-actions">

                  <button
                    type="button"
                    class="edit-expense-btn"
                    data-id="${escapeHtml(
                      expense.id
                    )}"
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    class="delete-expense-btn"
                    data-id="${escapeHtml(
                      expense.id
                    )}"
                  >
                    삭제
                  </button>

                </div>
              `

              : ""
          }

        </div>
      `;


      container.appendChild(
        item
      );

    }
  );


  // ===================================================
  // 수정 버튼
  // ===================================================

  container
    .querySelectorAll(
      ".edit-expense-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            openEditExpense(
              button.dataset.id
            );

          }
        );

      }
    );


  // ===================================================
  // 삭제 버튼
  // ===================================================

  container
    .querySelectorAll(
      ".delete-expense-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            deleteExpense(
              button.dataset.id
            );

          }
        );

      }
    );

}


// =====================================================
// 월간 소비 달력
// =====================================================

function renderExpenseCalendar(
  monthlyExpenses
) {

  if (
    !expenseCalendar
  ) {

    return;

  }


  expenseCalendar.innerHTML =
    "";


  const firstDay =
    new Date(
      selectedYear,
      selectedMonth - 1,
      1
    )
      .getDay();


  const daysInMonth =
    new Date(
      selectedYear,
      selectedMonth,
      0
    )
      .getDate();


  // ===================================================
  // 날짜별 하루 총 지출
  // ===================================================

  const dailyTotals =
    {};


  monthlyExpenses.forEach(
    (expense) => {

      if (
        !expense.date
      ) {

        return;

      }


      const day =
        Number(
          expense.date.slice(
            8,
            10
          )
        );


      if (
        !day ||
        day < 1 ||
        day > daysInMonth
      ) {

        return;

      }


      dailyTotals[
        day
      ] =
        (
          dailyTotals[
            day
          ]

          ||

          0
        )

        +

        Number(
          expense.amount ||
          0
        );

    }
  );


  // ===================================================
  // 첫 주 앞쪽 빈칸
  // ===================================================

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const emptyCell =
      document.createElement(
        "div"
      );


    emptyCell.className =
      "calendar-day empty";


    expenseCalendar.appendChild(
      emptyCell
    );

  }


  const now =
    new Date();


  const isCurrentMonth =
    now.getFullYear() ===
      selectedYear

    &&

    now.getMonth() + 1 ===
      selectedMonth;


  // ===================================================
  // 날짜 생성
  // ===================================================

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const amount =
      dailyTotals[
        day
      ]

      ||

      0;


    const cell =
      document.createElement(
        "div"
      );


    cell.className =
      "calendar-day";


    // 지출 있는 날

    if (
      amount > 0
    ) {

      cell.classList.add(
        "has-expense"
      );

    }


    // =================================================
    // 하루 5만원 이상 ~ 10만원 미만
    // =================================================

    if (
      amount >= 50000
      &&
      amount < 100000
    ) {

      cell.classList.add(
        "spending-medium"
      );

    }


    // =================================================
    // 하루 10만원 이상
    // =================================================

    if (
      amount >= 100000
    ) {

      cell.classList.add(
        "spending-high"
      );

    }


    // 오늘

    if (
      isCurrentMonth
      &&
      now.getDate() ===
        day
    ) {

      cell.classList.add(
        "today"
      );

    }


    // =================================================
    // 날짜 숫자
    // =================================================

    const dateElement =
      document.createElement(
        "span"
      );


    dateElement.className =
      "calendar-date";


    dateElement.textContent =
      String(
        day
      );


    cell.appendChild(
      dateElement
    );


    // =================================================
    // 하루 총 지출
    // =================================================

    if (
      amount > 0
    ) {

      const amountElement =
        document.createElement(
          "strong"
        );


      amountElement.className =
        "calendar-amount";


      amountElement.textContent =
        formatWon(
          amount
        );


      cell.appendChild(
        amountElement
      );

    }


    expenseCalendar.appendChild(
      cell
    );

  }


  // ===================================================
  // 마지막 주 뒤쪽 빈칸
  // ===================================================

  const totalCells =
    firstDay +
    daysInMonth;


  const trailingCells =
    (
      7 -
      (
        totalCells %
        7
      )
    )
    %
    7;


  for (
    let i = 0;
    i < trailingCells;
    i++
  ) {

    const emptyCell =
      document.createElement(
        "div"
      );


    emptyCell.className =
      "calendar-day empty";


    expenseCalendar.appendChild(
      emptyCell
    );

  }

}


// =====================================================
// 개인 상세화면 열기
// =====================================================

function openPersonDetail(
  uid
) {

  if (
    !uid
  ) {

    return;

  }


  detailUserUid =
    uid;


  renderPersonDetail();


  showScreen(
    personDetailScreen
  );


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });

}


// =====================================================
// 내 상세보기
// =====================================================

myDetailBtn.addEventListener(
  "click",
  () => {

    if (
      currentUser
    ) {

      openPersonDetail(
        currentUser.uid
      );

    }

  }
);


// =====================================================
// 상대 상세보기
// =====================================================

partnerDetailBtn.addEventListener(
  "click",
  () => {

    if (
      partnerProfile?.uid
    ) {

      openPersonDetail(
        partnerProfile.uid
      );

    }

  }
);


// =====================================================
// 상세화면 뒤로가기
// =====================================================

detailBackBtn.addEventListener(
  "click",
  () => {

    detailUserUid =
      null;


    showScreen(
      appScreen
    );


    renderApp();

  }
);
// =====================================================
// 개인 상세화면 렌더링
// =====================================================

function renderPersonDetail() {

  if (
    !detailUserUid ||
    !currentUser
  ) {

    return;

  }


  const profile =
    getProfileByUid(
      detailUserUid
    );


  if (
    !profile
  ) {

    return;

  }


  const monthlyExpenses =
    getCurrentMonthExpenses();


  const personExpenses =
    monthlyExpenses.filter(
      (expense) =>
        expense.payerUid ===
        detailUserUid
    );


  const sortedPersonExpenses =
    sortExpenseList(
      personExpenses,
      "date-desc"
    );


  const totalUsed =
    personExpenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        Number(
          expense.amount ||
          0
        ),
      0
    );


  const budget =
    Number(
      monthlySettings
        .personalBudgets?.[
          detailUserUid
        ]
      ||
      0
    );


  const percent =
    getUsagePercent(
      totalUsed,
      budget
    );


  const remaining =
    Math.max(
      budget -
      totalUsed,
      0
    );


  // ===================================================
  // 상단 프로필
  // ===================================================

  if (
    detailPersonIcon
  ) {

    detailPersonIcon.textContent =
      profile.icon ||
      "🙂";

  }


  if (
    detailPersonName
  ) {

    detailPersonName.textContent =
      profile.nickname ||
      "사용자";

  }


  if (
    detailMonthLabel
  ) {

    detailMonthLabel.textContent =
      `${selectedMonth}월 생활비`;

  }


  // ===================================================
  // 사용금액 / 예산
  // ===================================================

  if (
    detailUsedAmount
  ) {

    detailUsedAmount.textContent =
      formatWon(
        totalUsed
      );

  }


  if (
    detailBudgetAmount
  ) {

    detailBudgetAmount.textContent =
      formatWon(
        budget
      );

  }


  if (
    detailBudgetPercent
  ) {

    detailBudgetPercent.textContent =
      budget > 0
        ? `${percent}%`
        : "0%";

  }


  if (
    detailRemainingAmount
  ) {

    detailRemainingAmount.textContent =
      formatWon(
        remaining
      );

  }


  setProgress(
    detailBudgetProgress,
    percent
  );


  // ===================================================
  // 개인 카테고리 비율
  // 기존 CSS 구조 그대로 사용
  // ===================================================

  renderCategoryRatios(
    detailCategoryList,
    personExpenses
  );


  // ===================================================
  // 혼자 / 같이 비율
  // ===================================================

  const aloneAmount =
    personExpenses
      .filter(
        (expense) =>
          expense.type ===
          "alone"
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          Number(
            expense.amount ||
            0
          ),
        0
      );


  const togetherAmount =
    personExpenses
      .filter(
        (expense) =>
          expense.type ===
          "together"
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          Number(
            expense.amount ||
            0
          ),
        0
      );


  const alonePercent =
    totalUsed > 0

      ? Math.round(
          (
            aloneAmount /
            totalUsed
          ) *
          100
        )

      : 0;


  const togetherPercent =
    totalUsed > 0

      ? Math.round(
          (
            togetherAmount /
            totalUsed
          ) *
          100
        )

      : 0;


  if (
    detailAloneAmount
  ) {

    detailAloneAmount.textContent =
      formatWon(
        aloneAmount
      );

  }


  if (
    detailAlonePercent
  ) {

    detailAlonePercent.textContent =
      `${alonePercent}%`;

  }


  if (
    detailTogetherAmount
  ) {

    detailTogetherAmount.textContent =
      formatWon(
        togetherAmount
      );

  }


  if (
    detailTogetherPercent
  ) {

    detailTogetherPercent.textContent =
      `${togetherPercent}%`;

  }


  // ===================================================
  // 개인 거래내역
  // ===================================================

  renderTransactionList(
    detailTransactionList,
    sortedPersonExpenses
  );

}


// =====================================================
// 예산 설정 모달 열기
// =====================================================

function openBudgetModal() {

  if (
    !currentUser ||
    !myProfile
  ) {

    return;

  }


  const myUid =
    currentUser.uid;


  const partnerUid =
    partnerProfile?.uid ||
    null;


  const personalBudgets =
    monthlySettings
      .personalBudgets ||
    {};


  if (
    sharedBudgetInput
  ) {

    sharedBudgetInput.value =
      formatMoneyInput(
        monthlySettings
          .sharedBudget ||
        0
      );

  }


  if (
    myBudgetInput
  ) {

    myBudgetInput.value =
      formatMoneyInput(
        personalBudgets[
          myUid
        ] ||
        0
      );

  }


  if (
    partnerBudgetInput
  ) {

    partnerBudgetInput.value =
      formatMoneyInput(

        partnerUid

          ? (
              personalBudgets[
                partnerUid
              ] ||
              0
            )

          : 0

      );

  }


  if (
    budgetMyIcon
  ) {

    budgetMyIcon.textContent =
      myProfile.icon ||
      "🩷";

  }


  if (
    budgetMyName
  ) {

    budgetMyName.textContent =
      myProfile.nickname ||
      "나";

  }


  if (
    budgetPartnerIcon
  ) {

    budgetPartnerIcon.textContent =
      partnerProfile?.icon ||
      "💜";

  }


  if (
    budgetPartnerName
  ) {

    budgetPartnerName.textContent =
      partnerProfile?.nickname ||
      "상대방";

  }


  budgetModal.classList.add(
    "show"
  );

}


// =====================================================
// 예산 설정 버튼
// =====================================================

if (
  budgetSettingBtn
) {

  budgetSettingBtn.addEventListener(
    "click",
    openBudgetModal
  );

}


if (
  closeBudgetModal
) {

  closeBudgetModal.addEventListener(
    "click",
    () => {

      budgetModal.classList.remove(
        "show"
      );

    }
  );

}


// =====================================================
// 예산 저장
// =====================================================

async function saveBudget() {

  if (
    !currentUser ||
    !coupleId
  ) {

    return;

  }


  const myUid =
    currentUser.uid;


  const partnerUid =
    partnerProfile?.uid ||
    null;


  const sharedBudget =
    parseMoney(
      sharedBudgetInput?.value
    );


  const myBudget =
    parseMoney(
      myBudgetInput?.value
    );


  const partnerBudget =
    parseMoney(
      partnerBudgetInput?.value
    );


  const personalBudgets = {

    [myUid]:
      myBudget

  };


  if (
    partnerUid
  ) {

    personalBudgets[
      partnerUid
    ] =
      partnerBudget;

  }


  try {

    saveBudgetBtn.disabled =
      true;


    saveBudgetBtn.textContent =
      "저장 중...";


    await setDoc(
      monthlySettingsDocRef(),
      {

        sharedBudget,

        personalBudgets,

        updatedAt:
          serverTimestamp()

      },
      {
        merge:
          true
      }
    );


    budgetModal.classList.remove(
      "show"
    );

  }

  catch (error) {

    console.error(
      "예산 저장 실패:",
      error
    );


    alert(
      "예산을 저장하지 못했어요."
    );

  }

  finally {

    saveBudgetBtn.disabled =
      false;


    saveBudgetBtn.textContent =
      "저장하기";

  }

}


if (
  saveBudgetBtn
) {

  saveBudgetBtn.addEventListener(
    "click",
    saveBudget
  );

}


// =====================================================
// 카테고리 모달
// =====================================================

function openCategoryModal() {

  renderCategorySettingList();


  categoryModal.classList.add(
    "show"
  );

}


if (
  categorySettingBtn
) {

  categorySettingBtn.addEventListener(
    "click",
    openCategoryModal
  );

}


if (
  closeCategoryModal
) {

  closeCategoryModal.addEventListener(
    "click",
    () => {

      categoryModal.classList.remove(
        "show"
      );

    }
  );

}


// =====================================================
// 카테고리 설정 목록
// =====================================================

function renderCategorySettingList() {

  if (
    !categorySettingList
  ) {

    return;

  }


  categorySettingList.innerHTML =
    "";


  categories.forEach(
    (
      category,
      index
    ) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "category-setting-item";


      item.innerHTML = `
        <div class="category-setting-name">

          <span class="category-setting-emoji">
            ${escapeHtml(
              category.emoji
            )}
          </span>

          <span>
            ${escapeHtml(
              category.name
            )}
          </span>

        </div>


        ${
          category.isDefault

            ? `
              <span class="category-default-badge">
                기본
              </span>
            `

            : `
              <button
                type="button"
                class="category-delete-btn"
                data-index="${index}"
              >
                삭제
              </button>
            `
        }
      `;


      categorySettingList.appendChild(
        item
      );

    }
  );


  categorySettingList
    .querySelectorAll(
      ".category-delete-btn"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.index
              );


            deleteCategory(
              index
            );

          }
        );

      }
    );

}


// =====================================================
// 카테고리 저장
// =====================================================

async function saveCategories() {

  if (
    !coupleId
  ) {

    return;

  }


  await setDoc(
    categorySettingsDocRef(),
    {

      categories,

      updatedAt:
        serverTimestamp()

    },
    {
      merge:
        true
    }
  );

}


// =====================================================
// 카테고리 추가
// =====================================================

async function addCategory() {

  const emoji =
    newCategoryEmoji
      ?.value
      .trim()

    ||

    "📌";


  const name =
    newCategoryName
      ?.value
      .trim();


  if (
    !name
  ) {

    alert(
      "카테고리 이름을 입력해주세요."
    );


    return;

  }


  const duplicated =
    categories.some(
      (category) =>
        category.name ===
        name
    );


  if (
    duplicated
  ) {

    alert(
      "이미 같은 이름의 카테고리가 있어요."
    );


    return;

  }


  const newCategory = {

    emoji,

    name,

    isDefault:
      false

  };


  try {

    categories.push(
      newCategory
    );


    await saveCategories();


    if (
      newCategoryEmoji
    ) {

      newCategoryEmoji.value =
        "";

    }


    if (
      newCategoryName
    ) {

      newCategoryName.value =
        "";

    }


    renderCategorySettingList();

    renderCategoryOptions();

  }

  catch (error) {

    console.error(
      "카테고리 추가 실패:",
      error
    );


    categories =
      categories.filter(
        (category) =>
          category !==
          newCategory
      );


    alert(
      "카테고리를 추가하지 못했어요."
    );

  }

}


if (
  addCategoryBtn
) {

  addCategoryBtn.addEventListener(
    "click",
    addCategory
  );

}


if (
  newCategoryName
) {

  newCategoryName.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        addCategory();

      }

    }
  );

}


// =====================================================
// 카테고리 삭제
// =====================================================

async function deleteCategory(
  index
) {

  const category =
    categories[
      index
    ];


  if (
    !category
  ) {

    return;

  }


  if (
    category.isDefault
  ) {

    alert(
      "기본 카테고리는 삭제할 수 없어요."
    );


    return;

  }


  const used =
    expenses.some(
      (expense) =>
        expense.category ===
        category.name
    );


  if (
    used
  ) {

    const confirmed =
      confirm(
        `"${category.name}" 카테고리를 사용한 기존 지출이 있어요.\n그래도 카테고리 목록에서 삭제할까요?`
      );


    if (
      !confirmed
    ) {

      return;

    }

  }


  const oldCategories =
    [...categories];


  categories.splice(
    index,
    1
  );


  try {

    await saveCategories();


    renderCategorySettingList();

    renderCategoryOptions();

  }

  catch (error) {

    console.error(
      "카테고리 삭제 실패:",
      error
    );


    categories =
      oldCategories;


    alert(
      "카테고리를 삭제하지 못했어요."
    );

  }

}


// =====================================================
// 설정 모달
// =====================================================

function openSettingsModal() {

  if (
    !myProfile
  ) {

    return;

  }


  settingsNickname.value =
    myProfile.nickname ||
    "";


  selectedSettingsIcon =
    myProfile.icon ||
    "🩷";


  clearActiveIconButtons(
    settingsIconButtons
  );


  const presetExists =
    [...settingsIconButtons]
      .some(
        (button) =>
          button.dataset.icon ===
          selectedSettingsIcon
      );


  settingsIconButtons.forEach(
    (button) => {

      if (
        button.dataset.icon ===
        selectedSettingsIcon
      ) {

        button.classList.add(
          "active"
        );

      }

    }
  );


  if (
    customSettingsIcon
  ) {

    customSettingsIcon.value =
      presetExists
        ? ""
        : selectedSettingsIcon;

  }


  if (
    settingsInviteCode
  ) {

    settingsInviteCode.textContent =
      currentCouple?.inviteCode ||
      "-";

  }


  if (
    settingsPartnerName
  ) {

    settingsPartnerName.textContent =
      partnerProfile?.nickname ||
      "아직 연결되지 않았어요.";

  }


  settingsModal.classList.add(
    "show"
  );

}


if (
  settingsBtn
) {

  settingsBtn.addEventListener(
    "click",
    openSettingsModal
  );

}


if (
  closeSettingsModal
) {

  closeSettingsModal.addEventListener(
    "click",
    () => {

      settingsModal.classList.remove(
        "show"
      );

    }
  );

}


// =====================================================
// 설정에서 프로필 저장
// =====================================================

async function saveSettingsProfile() {

  if (
    !currentUser ||
    !myProfile
  ) {

    return;

  }


  const nickname =
    settingsNickname
      .value
      .trim();


  const customIcon =
    customSettingsIcon
      ?.value
      .trim();


  const icon =
    customIcon

    ||

    selectedSettingsIcon

    ||

    myProfile.icon

    ||

    "🩷";


  if (
    !nickname
  ) {

    alert(
      "닉네임을 입력해주세요."
    );


    return;

  }


  try {

    saveSettingsProfileBtn.disabled =
      true;


    saveSettingsProfileBtn.textContent =
      "저장 중...";


    await updateDoc(
      userDocRef(
        currentUser.uid
      ),
      {

        nickname,

        icon

      }
    );


    myProfile.nickname =
      nickname;


    myProfile.icon =
      icon;


    selectedProfileIcon =
      icon;


    selectedSettingsIcon =
      icon;


    renderApp();


    settingsModal.classList.remove(
      "show"
    );

  }

  catch (error) {

    console.error(
      "프로필 수정 실패:",
      error
    );


    alert(
      "프로필을 저장하지 못했어요."
    );

  }

  finally {

    saveSettingsProfileBtn.disabled =
      false;


    saveSettingsProfileBtn.textContent =
      "저장하기";

  }

}


if (
  saveSettingsProfileBtn
) {

  saveSettingsProfileBtn.addEventListener(
    "click",
    saveSettingsProfile
  );

}


// =====================================================
// 설정 초대코드 클릭 복사
// =====================================================

if (
  settingsInviteCode
) {

  settingsInviteCode.addEventListener(
    "click",
    async () => {

      const code =
        settingsInviteCode
          .textContent
          .trim();


      if (
        !code ||
        code ===
        "-"
      ) {

        return;

      }


      try {

        await navigator.clipboard.writeText(
          code
        );


        const original =
          settingsInviteCode.textContent;


        settingsInviteCode.textContent =
          "복사 완료!";


        setTimeout(
          () => {

            settingsInviteCode.textContent =
              original;

          },
          1200
        );

      }

      catch (error) {

        console.error(
          "초대코드 복사 실패:",
          error
        );

      }

    }
  );

}


// =====================================================
// 최종 초기값
// =====================================================

updatePrivacyVisibility();

renderCategoryOptions();

updateMonthTitle();