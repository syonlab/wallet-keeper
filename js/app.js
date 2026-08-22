// =====================================================
// 지갑지킴이 2.0
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

const firebaseConfig = {
  apiKey: "AIzaSyDiHLEi_GAgfHax_3XwYd6z9xO433kSEDY",
  authDomain: "wallet-budget-8cadd.firebaseapp.com",
  projectId: "wallet-budget-8cadd",
  storageBucket: "wallet-budget-8cadd.firebasestorage.app",
  messagingSenderId: "924575676755",
  appId: "1:924575676755:web:f4d118ee533c7f45fd89a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// =====================================================
// 기본 데이터 / 상태
// =====================================================

const defaultCategories = [
  { name: "식비", emoji: "🍚", isDefault: true },
  { name: "간식", emoji: "🍪", isDefault: true },
  { name: "데이트", emoji: "💕", isDefault: true },
  { name: "생활비", emoji: "🏠", isDefault: true },
  { name: "FLEX", emoji: "💸", isDefault: true },
  { name: "쇼핑", emoji: "🛍️", isDefault: true }
];

let currentUser = null;
let myProfile = null;
let partnerProfile = null;
let currentCouple = null;
let coupleId = null;

let expenses = [];
let privateDetails = {};
let categories = [...defaultCategories];

let monthlySettings = {
  sharedBudget: 0,
  personalBudgets: {}
};

const today = new Date();

let selectedYear = today.getFullYear();
let selectedMonth = today.getMonth() + 1;

let editingExpenseId = null;
let detailUserUid = null;

let selectedProfileIcon = "🩷";
let selectedSettingsIcon = "🩷";

let unsubscribeExpenses = null;
let unsubscribeMonthlySettings = null;
let unsubscribeCategories = null;
let unsubscribeCouple = null;
let unsubscribePartnerProfile = null;
let unsubscribePrivateDetails = null;


// =====================================================
// DOM
// =====================================================

const $ = (id) => document.getElementById(id);


// 화면

const loginScreen = $("login-screen");
const signupScreen = $("signup-screen");
const passwordResetScreen = $("password-reset-screen");
const profileScreen = $("profile-screen");
const coupleSetupScreen = $("couple-setup-screen");
const inviteScreen = $("invite-screen");
const joinCoupleScreen = $("join-couple-screen");
const appScreen = $("app-screen");
const personDetailScreen = $("person-detail-screen");

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
].filter(Boolean);


// 로그인 / 회원가입 / 비밀번호 재설정

const loginEmail = $("login-email");
const loginPassword = $("login-password");
const loginBtn = $("login-btn");
const loginError = $("login-error");
const showSignupBtn = $("show-signup-btn");

const showPasswordResetBtn = $("show-password-reset-btn");
const passwordResetBackBtn = $("password-reset-back-btn");
const passwordResetEmail = $("password-reset-email");
const sendPasswordResetBtn = $("send-password-reset-btn");
const passwordResetMessage = $("password-reset-message");

const signupBackBtn = $("signup-back-btn");
const signupEmail = $("signup-email");
const signupPassword = $("signup-password");
const signupPasswordConfirm = $("signup-password-confirm");
const signupBtn = $("signup-btn");
const signupError = $("signup-error");


// 프로필

const profileNickname = $("profile-nickname");

const profileIconButtons =
  document.querySelectorAll(".profile-icon-btn");

const customProfileIcon =
  $("custom-profile-icon");

const saveProfileBtn =
  $("save-profile-btn");

const profileError =
  $("profile-error");


// 커플 연결

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


// 헤더 / 월

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


// 공동 대시보드

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


// 내 생활비

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


// 상대 생활비

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


// 카테고리 / 거래

const categorySettingBtn =
  $("category-setting-btn");

const sharedCategoryList =
  $("shared-category-list");

const addExpenseBtn =
  $("add-expense-btn");

const transactionList =
  $("transaction-list");


// 개인 상세

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


// 지출 모달

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
  document.querySelectorAll(".type-btn");

const categoryInput =
  $("expense-category");

const descriptionInput =
  $("expense-description");

const privateExpenseGroup =
  $("private-expense-group");

const privateExpenseToggle =
  $("private-expense-toggle");

const payerButtons =
  document.querySelectorAll(".payer-btn");

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


// 예산 모달

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


// 카테고리 모달

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


// 설정 모달

const settingsModal =
  $("settings-modal");

const closeSettingsModal =
  $("close-settings-modal");

const settingsNickname =
  $("settings-nickname");

const settingsIconButtons =
  document.querySelectorAll(".settings-icon-btn");

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

function showScreen(screen) {

  allScreens.forEach((item) => {
    item.hidden = true;
  });

  if (screen) {
    screen.hidden = false;
  }

}


function closeAllModals() {

  [
    expenseModal,
    budgetModal,
    categoryModal,
    settingsModal
  ]
    .filter(Boolean)
    .forEach((modal) =>
      modal.classList.remove("show")
    );

}


function parseMoney(value) {

  const onlyNumbers =
    String(value ?? "")
      .replace(/[^0-9]/g, "");

  return onlyNumbers
    ? Number(onlyNumbers)
    : 0;

}


function formatMoneyInput(value) {

  const number =
    parseMoney(value);

  return number
    ? number.toLocaleString("ko-KR")
    : "";

}


function formatWon(value) {

  return `${Number(
    value || 0
  ).toLocaleString("ko-KR")}원`;

}


function attachMoneyFormatter(input) {

  if (
    !input ||
    input.dataset.moneyFormatter === "true"
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


function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text ?? "");

  return div.innerHTML;

}


function getMonthKey() {

  return (
    `${selectedYear}-` +
    String(selectedMonth)
      .padStart(2, "0")
  );

}


function updateMonthTitle() {

  currentMonthTitle.textContent =
    `${selectedYear}년 ${selectedMonth}월`;

}


function getDefaultDate() {

  const now =
    new Date();

  const month =
    String(selectedMonth)
      .padStart(2, "0");

  let day =
    "01";

  if (
    now.getFullYear() === selectedYear &&
    now.getMonth() + 1 === selectedMonth
  ) {

    day =
      String(now.getDate())
        .padStart(2, "0");

  }

  return (
    `${selectedYear}-${month}-${day}`
  );

}


function setProgress(
  element,
  percent
) {

  if (!element) {
    return;
  }

  const safePercent =
    Number.isFinite(percent)
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
    safePercent >= 100
  ) {

    element.classList.add(
      "danger"
    );

  }

  else if (
    safePercent >= 80
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
    (used / budget) * 100
  );

}


function getCategoryInfo(name) {

  return (
    categories.find(
      (category) =>
        category.name === name
    )

    ||

    {
      name,
      emoji: "📌",
      isDefault: false
    }
  );

}


function getProfileByUid(uid) {

  if (!uid) {
    return null;
  }

  if (
    myProfile?.uid === uid
  ) {
    return myProfile;
  }

  if (
    partnerProfile?.uid === uid
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
        uid !== currentUser.uid
    )

    ||

    null
  );

}


function getPublicDescription(
  expense
) {

  if (!expense) {
    return "";
  }

  if (!expense.isPrivate) {

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

  if (description) {
    return description;
  }

  return (
    `${category.emoji} ${category.name}`
  );

}


function typeLabel(type) {

  return (
    type === "together"
      ? "같이"
      : "혼자"
  );

}


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
// Firestore 경로
// =====================================================

function userDocRef(uid) {

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
// 초대코드
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
      createRandomCode(6);

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
      event.key === "Enter"
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

  if (!email) {

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
      event.key === "Enter"
    ) {

      sendResetEmail();

    }

  }
);
// =====================================================
// 회원가입
// =====================================================

showSignupBtn.addEventListener(
  "click",
  () => {

    signupError.textContent =
      "";

    showScreen(
      signupScreen
    );

  }
);


signupBackBtn.addEventListener(
  "click",
  () => {

    showScreen(
      loginScreen
    );

  }
);


signupBtn.addEventListener(
  "click",
  async () => {

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
      password.length < 6
    ) {

      signupError.textContent =
        "비밀번호는 6자 이상 입력해주세요.";

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      signupError.textContent =
        "비밀번호가 서로 다릅니다.";

      return;

    }


    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
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
          "이미 사용 중인 이메일입니다.";

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        signupError.textContent =
          "이메일 형식을 확인해주세요.";

      }

      else {

        signupError.textContent =
          "회원가입 중 오류가 발생했습니다.";

      }

    }

  }
);


// =====================================================
// 로그아웃
// =====================================================

async function logout() {

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
// 프로필 아이콘 / 최초 프로필
// =====================================================

profileIconButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        profileIconButtons.forEach(
          (btn) =>
            btn.classList.remove(
              "active"
            )
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
    function () {

      const value =
        this.value.trim();

      if (!value) {
        return;
      }

      selectedProfileIcon =
        value;

      profileIconButtons.forEach(
        (button) =>
          button.classList.remove(
            "active"
          )
      );

    }
  );

}


saveProfileBtn.addEventListener(
  "click",
  async () => {

    const nickname =
      profileNickname
        .value
        .trim();

    profileError.textContent =
      "";

    if (!nickname) {

      profileError.textContent =
        "별명을 입력해주세요.";

      return;

    }


    if (
      !selectedProfileIcon
    ) {

      profileError.textContent =
        "아이콘을 선택해주세요.";

      return;

    }


    try {

      await setDoc(

        userDocRef(
          currentUser.uid
        ),

        {
          email:
            currentUser.email ||
            "",

          nickname,

          icon:
            selectedProfileIcon,

          coupleId:
            null,

          createdAt:
            serverTimestamp()
        },

        {
          merge: true
        }

      );


      myProfile = {

        uid:
          currentUser.uid,

        email:
          currentUser.email ||
          "",

        nickname,

        icon:
          selectedProfileIcon,

        coupleId:
          null

      };


      updateSetupProfilePreview();

      showScreen(
        coupleSetupScreen
      );

    }

    catch (error) {

      console.error(
        "프로필 저장 실패:",
        error
      );

      profileError.textContent =
        "프로필 저장 중 오류가 발생했습니다.";

    }

  }
);


function updateSetupProfilePreview() {

  setupMyIcon.textContent =
    myProfile?.icon ||
    "🙂";

  setupMyNickname.textContent =
    myProfile?.nickname ||
    "나";

}


// =====================================================
// 새 커플 만들기
// =====================================================

createCoupleBtn.addEventListener(
  "click",
  async () => {

    try {

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
        coupleId;


      currentCouple = {

        id:
          coupleId,

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
        "가계부 생성 실패:",
        error
      );

      alert(
        "가계부 생성 중 오류가 발생했습니다."
      );

    }

  }
);


// =====================================================
// 커플 참여
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

  }
);


joinBackBtn.addEventListener(
  "click",
  () => {

    showScreen(
      coupleSetupScreen
    );

  }
);


joinCodeInput.addEventListener(
  "input",
  function () {

    this.value =
      this.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        );

  }
);


joinCoupleBtn.addEventListener(
  "click",
  async () => {

    const code =
      joinCodeInput
        .value
        .trim()
        .toUpperCase();

    joinError.textContent =
      "";

    if (!code) {

      joinError.textContent =
        "초대코드를 입력해주세요.";

      return;

    }


    try {

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
          "초대코드를 찾을 수 없습니다.";

        return;

      }


      const targetCoupleId =
        inviteSnapshot
          .data()
          .coupleId;


      if (
        !targetCoupleId
      ) {

        joinError.textContent =
          "올바르지 않은 초대코드입니다.";

        return;

      }


      const targetCoupleRef =
        doc(
          db,
          "couples",
          targetCoupleId
        );


      const coupleDocument =
        await getDoc(
          targetCoupleRef
        );


      if (
        !coupleDocument.exists()
      ) {

        joinError.textContent =
          "연결할 가계부를 찾을 수 없습니다.";

        return;

      }


      const coupleData =
        coupleDocument.data();


      const members =
        Array.isArray(
          coupleData.members
        )

          ? coupleData.members

          : [];


      if (
        members.includes(
          currentUser.uid
        )
      ) {

        await updateDoc(

          userDocRef(
            currentUser.uid
          ),

          {
            coupleId:
              targetCoupleId
          }

        );

      }

      else {

        if (
          members.length >= 2
        ) {

          joinError.textContent =
            "이미 두 사람이 연결된 가계부입니다.";

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

      }


      myProfile.coupleId =
        targetCoupleId;

      coupleId =
        targetCoupleId;


      await enterCoupleApp();

    }

    catch (error) {

      console.error(
        "커플 연결 실패:",
        error
      );

      joinError.textContent =
        "연결 중 오류가 발생했습니다.";

    }

  }
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


    try {

      await navigator.clipboard
        .writeText(
          code
        );


      const oldText =
        copyInviteCodeBtn
          .textContent;


      copyInviteCodeBtn.textContent =
        "복사했어요 ✓";


      setTimeout(
        () => {

          copyInviteCodeBtn.textContent =
            oldText;

        },
        1300
      );

    }

    catch (error) {

      console.error(
        "복사 실패:",
        error
      );


      alert(
        `초대코드: ${code}`
      );

    }

  }
);


inviteContinueBtn.addEventListener(
  "click",
  async () => {

    await enterCoupleApp();

  }
);


// =====================================================
// 로그인 상태
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    stopRealtimeListeners();

    closeAllModals();


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

    categories = [
      ...defaultCategories
    ];

    monthlySettings = {
      sharedBudget: 0,
      personalBudgets: {}
    };


    if (!user) {

      showScreen(
        loginScreen
      );

      return;

    }


    try {

      const profileSnapshot =
        await getDoc(

          userDocRef(
            user.uid
          )

        );


      if (
        !profileSnapshot.exists()
      ) {

        selectedProfileIcon =
          "🩷";

        profileNickname.value =
          "";


        if (
          customProfileIcon
        ) {

          customProfileIcon.value =
            "";

        }


        profileIconButtons.forEach(
          (
            button,
            index
          ) => {

            button.classList.toggle(
              "active",
              index === 0
            );

          }
        );


        showScreen(
          profileScreen
        );

        return;

      }


      myProfile = {

        uid:
          user.uid,

        ...profileSnapshot.data()

      };


      if (
        !myProfile.coupleId
      ) {

        updateSetupProfilePreview();

        showScreen(
          coupleSetupScreen
        );

        return;

      }


      coupleId =
        myProfile.coupleId;


      await enterCoupleApp();

    }

    catch (error) {

      console.error(
        "사용자 정보 확인 실패:",
        error
      );

      alert(
        "사용자 정보를 불러오지 못했습니다."
      );

      showScreen(
        loginScreen
      );

    }

  }
);


// =====================================================
// 가계부 입장 / 실시간 감지
// =====================================================

async function enterCoupleApp() {

  if (
    !currentUser ||
    !coupleId
  ) {
    return;
  }


  const coupleSnapshot =
    await getDoc(

      doc(
        db,
        "couples",
        coupleId
      )

    );


  if (
    !coupleSnapshot.exists()
  ) {

    await updateDoc(

      userDocRef(
        currentUser.uid
      ),

      {
        coupleId: null
      }

    );


    myProfile.coupleId =
      null;

    coupleId =
      null;


    updateSetupProfilePreview();

    showScreen(
      coupleSetupScreen
    );

    return;

  }


  currentCouple = {

    id:
      coupleSnapshot.id,

    ...coupleSnapshot.data()

  };


  startRealtimeListeners();

  updateMonthTitle();

  updateProfileUI();

  renderCategories();

  renderApp();

  showScreen(
    appScreen
  );

}


function startRealtimeListeners() {

  stopRealtimeListeners();

  listenCouple();

  listenExpenses();

  listenPrivateDetails();

  listenMonthlySettings();

  listenCategories();

}


function stopRealtimeListeners() {

  [
    unsubscribeExpenses,
    unsubscribeMonthlySettings,
    unsubscribeCategories,
    unsubscribeCouple,
    unsubscribePartnerProfile,
    unsubscribePrivateDetails
  ]
    .forEach(
      (unsubscribe) => {

        if (
          typeof unsubscribe ===
          "function"
        ) {

          unsubscribe();

        }

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


function listenCouple() {

  if (!coupleId) {
    return;
  }


  unsubscribeCouple =
    onSnapshot(

      coupleDocRef(),

      (snapshot) => {

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


        bindPartnerProfile(
          getPartnerUid()
        );


        updateSettingsInfo();

      },

      (error) => {

        console.error(
          "커플 정보 불러오기 실패:",
          error
        );

      }

    );

}


function bindPartnerProfile(
  partnerUid
) {

  if (
    unsubscribePartnerProfile
  ) {

    unsubscribePartnerProfile();

    unsubscribePartnerProfile =
      null;

  }


  partnerProfile =
    null;


  if (!partnerUid) {

    updateProfileUI();

    renderApp();

    return;

  }


  unsubscribePartnerProfile =
    onSnapshot(

      userDocRef(
        partnerUid
      ),

      (snapshot) => {

        partnerProfile =
          snapshot.exists()

            ? {
                uid:
                  snapshot.id,

                ...snapshot.data()
              }

            : null;


        updateProfileUI();

        updateSettingsInfo();

        renderApp();

      },

      (error) => {

        console.error(
          "상대 프로필 불러오기 실패:",
          error
        );

      }

    );

}


function listenExpenses() {

  if (!coupleId) {
    return;
  }


  const expensesQuery =
    query(

      expensesCollectionRef(),

      orderBy(
        "createdAt",
        "desc"
      )

    );


  unsubscribeExpenses =
    onSnapshot(

      expensesQuery,

      (snapshot) => {

        expenses =
          snapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          );


        renderApp();

      },

      (error) => {

        console.error(
          "지출 불러오기 실패:",
          error
        );

      }

    );

}


function listenPrivateDetails() {

  if (!currentUser) {
    return;
  }


  unsubscribePrivateDetails =
    onSnapshot(

      privateDetailsCollectionRef(),

      (snapshot) => {

        privateDetails =
          {};


        snapshot.forEach(
          (document) => {

            privateDetails[
              document.id
            ] =
              document
                .data()
                .description
              ||
              "";

          }
        );


        renderApp();

      },

      (error) => {

        console.error(
          "비공개 상세 불러오기 실패:",
          error
        );

      }

    );

}
// =====================================================
// 월별 예산 / 카테고리 실시간 감지
// =====================================================

function listenMonthlySettings() {

  if (!coupleId) {
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
                data.sharedBudget
              )
              ||
              0,

            personalBudgets:
              data.personalBudgets
              ||
              {}

          };

        }

        else {

          monthlySettings = {

            sharedBudget: 0,

            personalBudgets: {}

          };

        }


        renderApp();

      },

      (error) => {

        console.error(
          "월별 예산 불러오기 실패:",
          error
        );

      }

    );

}


function listenCategories() {

  if (!coupleId) {
    return;
  }


  unsubscribeCategories =
    onSnapshot(

      categorySettingsDocRef(),

      (snapshot) => {

        if (
          snapshot.exists()
          &&
          Array.isArray(
            snapshot
              .data()
              .categories
          )
        ) {

          categories =
            snapshot
              .data()
              .categories;

        }

        else {

          categories = [
            ...defaultCategories
          ];

        }


        renderCategories();

        renderCategorySettingList();

        renderApp();

      },

      (error) => {

        console.error(
          "카테고리 불러오기 실패:",
          error
        );

      }

    );

}


// =====================================================
// 프로필 UI
// =====================================================

function updateProfileUI() {

  const myName =
    myProfile?.nickname ||
    "나";

  const myEmoji =
    myProfile?.icon ||
    "🙂";

  const partnerName =
    partnerProfile?.nickname ||
    "연결 대기";

  const partnerEmoji =
    partnerProfile?.icon ||
    "⏳";


  myIcon.textContent =
    myEmoji;

  myNickname.textContent =
    myName;


  payerMeIcon.textContent =
    myEmoji;

  payerMeName.textContent =
    myName;


  budgetMyIcon.textContent =
    myEmoji;

  budgetMyName.textContent =
    myName;


  partnerIcon.textContent =
    partnerEmoji;

  partnerNickname.textContent =
    partnerName;


  payerPartnerIcon.textContent =
    partnerEmoji;

  payerPartnerName.textContent =
    partnerName;


  budgetPartnerIcon.textContent =
    partnerEmoji;

  budgetPartnerName.textContent =
    partnerName;


  const hasPartner =
    Boolean(
      partnerProfile
    );


  $("payer-partner-btn").disabled =
    !hasPartner;

  partnerDetailBtn.disabled =
    !hasPartner;

  partnerBudgetInput.disabled =
    !hasPartner;

}


// =====================================================
// 월 이동
// =====================================================

prevMonthBtn.addEventListener(
  "click",
  () => {

    selectedMonth--;


    if (
      selectedMonth < 1
    ) {

      selectedMonth =
        12;

      selectedYear--;

    }


    monthChanged();

  }
);


nextMonthBtn.addEventListener(
  "click",
  () => {

    selectedMonth++;


    if (
      selectedMonth > 12
    ) {

      selectedMonth =
        1;

      selectedYear++;

    }


    monthChanged();

  }
);


function monthChanged() {

  updateMonthTitle();

  listenMonthlySettings();

  renderApp();

}


// =====================================================
// 지출 모달
// =====================================================

addExpenseBtn.addEventListener(
  "click",
  () => {

    if (
      !currentUser ||
      !coupleId
    ) {
      return;
    }


    editingExpenseId =
      null;


    expenseModalTitle.textContent =
      "지출 추가";


    saveExpenseBtn.textContent =
      "저장하기";


    dateInput.value =
      getDefaultDate();


    amountInput.value =
      "";


    descriptionInput.value =
      "";


    privateExpenseToggle.checked =
      false;


    selectType(
      "alone"
    );


    selectPayerRole(
      "me"
    );


    if (
      categories.length > 0
    ) {

      categoryInput.value =
        categories[0].name;

    }


    updatePrivacyVisibility();


    expenseModal.classList.add(
      "show"
    );

  }
);


closeModalBtn.addEventListener(
  "click",
  () => {

    expenseModal.classList.remove(
      "show"
    );

  }
);


expenseModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      expenseModal
    ) {

      expenseModal.classList.remove(
        "show"
      );

    }

  }
);


typeButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        typeButtons.forEach(
          (btn) =>
            btn.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        updatePrivacyVisibility();

      }
    );

  }
);


payerButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        if (
          button.disabled
        ) {
          return;
        }


        payerButtons.forEach(
          (btn) =>
            btn.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        updatePrivacyVisibility();

      }
    );

  }
);


function selectType(type) {

  typeButtons.forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.type ===
          type
      );

    }
  );

}


function selectPayerRole(role) {

  payerButtons.forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.payerRole ===
          role
      );

    }
  );

}


function getSelectedType() {

  return (
    document.querySelector(
      ".type-btn.active"
    )?.dataset.type

    ||

    "alone"
  );

}


function getSelectedPayerRole() {

  return (
    document.querySelector(
      ".payer-btn.active"
    )?.dataset.payerRole

    ||

    "me"
  );

}


function getSelectedPayerUid() {

  if (
    getSelectedPayerRole() ===
    "partner"
  ) {

    return (
      partnerProfile?.uid ||
      null
    );

  }


  return (
    currentUser?.uid ||
    null
  );

}


function updatePrivacyVisibility() {

  const canUsePrivacy =

    getSelectedType() ===
      "alone"

    &&

    getSelectedPayerRole() ===
      "me";


  privateExpenseGroup.hidden =
    !canUsePrivacy;


  if (
    !canUsePrivacy
  ) {

    privateExpenseToggle.checked =
      false;

  }

}


// =====================================================
// 지출 저장 / 수정 / 삭제
// =====================================================

saveExpenseBtn.addEventListener(
  "click",
  async () => {

    const date =
      dateInput.value;


    const amount =
      parseMoney(
        amountInput.value
      );


    const category =
      categoryInput.value;


    const description =
      descriptionInput
        .value
        .trim();


    const type =
      getSelectedType();


    const payerUid =
      getSelectedPayerUid();


    const isPrivate =

      type === "alone"

      &&

      payerUid ===
        currentUser?.uid

      &&

      privateExpenseToggle.checked;


    if (!date) {

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

      return;

    }


    if (!category) {

      alert(
        "카테고리를 선택해주세요."
      );

      return;

    }


    if (!description) {

      alert(
        "지출 내용을 입력해주세요."
      );

      return;

    }


    if (!payerUid) {

      alert(
        "결제자를 선택해주세요."
      );

      return;

    }


    const expenseData = {

      date,

      monthKey:
        date.slice(
          0,
          7
        ),

      amount,

      category,

      type,

      payerUid,

      isPrivate,

      description:
        isPrivate
          ? ""
          : description,

      updatedAt:
        serverTimestamp()

    };


    try {

      let expenseId =
        editingExpenseId;


      let oldExpense =
        null;


      if (
        editingExpenseId
      ) {

        oldExpense =
          expenses.find(
            (item) =>
              item.id ===
              editingExpenseId
          )
          ||
          null;


        if (
          !oldExpense
          ||
          oldExpense.payerUid !==
            currentUser.uid
        ) {

          alert(
            "본인이 등록한 지출만 수정할 수 있어요."
          );

          return;

        }


        await updateDoc(

          doc(
            db,
            "couples",
            coupleId,
            "expenses",
            editingExpenseId
          ),

          expenseData

        );

      }

      else {

        const newExpenseRef =
          doc(
            expensesCollectionRef()
          );


        expenseId =
          newExpenseRef.id;


        await setDoc(

          newExpenseRef,

          {
            ...expenseData,

            createdAt:
              serverTimestamp()
          }

        );

      }


      if (
        isPrivate
      ) {

        await setDoc(

          privateDetailDocRef(
            expenseId
          ),

          {
            description,

            expenseId,

            coupleId,

            updatedAt:
              serverTimestamp()
          },

          {
            merge: true
          }

        );

      }

      else if (
        oldExpense?.isPrivate
        ||
        privateDetails[
          expenseId
        ]
      ) {

        try {

          await deleteDoc(

            privateDetailDocRef(
              expenseId
            )

          );

        }

        catch (error) {

          console.warn(
            "기존 비공개 상세 삭제 실패:",
            error
          );

        }

      }


      editingExpenseId =
        null;


      expenseModal.classList.remove(
        "show"
      );

    }

    catch (error) {

      console.error(
        "지출 저장 실패:",
        error
      );


      alert(
        "지출 저장 중 오류가 발생했습니다."
      );

    }

  }
);


async function openEditExpense(id) {

  const expense =
    expenses.find(
      (item) =>
        item.id === id
    );


  if (!expense) {
    return;
  }


  if (
    expense.payerUid !==
    currentUser.uid
  ) {

    alert(
      "본인이 등록한 지출만 수정할 수 있어요."
    );

    return;

  }


  editingExpenseId =
    id;


  expenseModalTitle.textContent =
    "지출 수정";


  saveExpenseBtn.textContent =
    "수정 저장";


  dateInput.value =
    expense.date
    ||
    getDefaultDate();


  amountInput.value =
    formatMoneyInput(
      expense.amount
    );


  categoryInput.value =
    expense.category;


  descriptionInput.value =
    getPublicDescription(
      expense
    );


  selectType(
    expense.type ||
    "alone"
  );


  if (
    expense.payerUid ===
    partnerProfile?.uid
  ) {

    selectPayerRole(
      "partner"
    );

  }

  else {

    selectPayerRole(
      "me"
    );

  }


  privateExpenseToggle.checked =
    Boolean(
      expense.isPrivate
    );


  updatePrivacyVisibility();


  expenseModal.classList.add(
    "show"
  );

}


async function deleteExpense(id) {

  const expense =
    expenses.find(
      (item) =>
        item.id === id
    );


  if (!expense) {
    return;
  }


  if (
    expense.payerUid !==
    currentUser.uid
  ) {

    alert(
      "본인이 등록한 지출만 삭제할 수 있어요."
    );

    return;

  }


  const title =
    getExpenseDisplayTitle(
      expense
    )
    ||
    expense.category;


  const confirmed =
    confirm(
      `"${title}" 지출을 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(

      doc(
        db,
        "couples",
        coupleId,
        "expenses",
        id
      )

    );


    if (
      expense.isPrivate
      ||
      privateDetails[id]
    ) {

      try {

        await deleteDoc(
          privateDetailDocRef(
            id
          )
        );

      }

      catch (error) {

        console.warn(
          "비공개 상세 삭제 실패:",
          error
        );

      }

    }

  }

  catch (error) {

    console.error(
      "지출 삭제 실패:",
      error
    );


    alert(
      "지출 삭제 중 오류가 발생했습니다."
    );

  }

}


function bindTransactionActions(
  container
) {

  container.addEventListener(
    "click",
    (event) => {

      const editButton =
        event.target.closest(
          ".edit-expense-btn"
        );


      if (
        editButton
      ) {

        openEditExpense(
          editButton.dataset.id
        );

        return;

      }


      const deleteButton =
        event.target.closest(
          ".delete-expense-btn"
        );


      if (
        deleteButton
      ) {

        deleteExpense(
          deleteButton.dataset.id
        );

      }

    }
  );

}


bindTransactionActions(
  transactionList
);


bindTransactionActions(
  detailTransactionList
);


// =====================================================
// 예산
// =====================================================

budgetSettingBtn.addEventListener(
  "click",
  () => {

    const partnerUid =
      partnerProfile?.uid;


    sharedBudgetInput.value =
      formatMoneyInput(
        monthlySettings
          .sharedBudget
      );


    myBudgetInput.value =
      formatMoneyInput(

        monthlySettings
          .personalBudgets
          ?.[
            currentUser.uid
          ]

        ||

        0

      );


    partnerBudgetInput.value =
      formatMoneyInput(

        partnerUid

          ? monthlySettings
              .personalBudgets
              ?.[
                partnerUid
              ]
              ||
              0

          : 0

      );


    partnerBudgetInput.disabled =
      !partnerUid;


    budgetModal.classList.add(
      "show"
    );

  }
);


closeBudgetModal.addEventListener(
  "click",
  () => {

    budgetModal.classList.remove(
      "show"
    );

  }
);


budgetModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      budgetModal
    ) {

      budgetModal.classList.remove(
        "show"
      );

    }

  }
);


saveBudgetBtn.addEventListener(
  "click",
  async () => {

    const partnerUid =
      partnerProfile?.uid;


    const personalBudgets = {

      ...(
        monthlySettings
          .personalBudgets
        ||
        {}
      ),

      [currentUser.uid]:
        parseMoney(
          myBudgetInput.value
        )

    };


    if (
      partnerUid
    ) {

      personalBudgets[
        partnerUid
      ] =
        parseMoney(
          partnerBudgetInput.value
        );

    }


    try {

      await setDoc(

        monthlySettingsDocRef(),

        {
          sharedBudget:
            parseMoney(
              sharedBudgetInput.value
            ),

          personalBudgets,

          updatedAt:
            serverTimestamp()
        },

        {
          merge: true
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
        "예산 저장 중 오류가 발생했습니다."
      );

    }

  }
);


// =====================================================
// 카테고리
// =====================================================

categorySettingBtn.addEventListener(
  "click",
  () => {

    renderCategorySettingList();


    categoryModal.classList.add(
      "show"
    );

  }
);


closeCategoryModal.addEventListener(
  "click",
  () => {

    categoryModal.classList.remove(
      "show"
    );

  }
);


categoryModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      categoryModal
    ) {

      categoryModal.classList.remove(
        "show"
      );

    }

  }
);


function renderCategories() {

  const previous =
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
        previous
    )
  ) {

    categoryInput.value =
      previous;

  }

}
function renderCategorySettingList() {

  categorySettingList.innerHTML =
    "";


  categories.forEach(
    (category) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "category-setting-item";


      if (
        category.isDefault
      ) {

        item.innerHTML = `
          <span>
            ${escapeHtml(category.emoji)}
            ${escapeHtml(category.name)}
          </span>

          <span class="category-default-badge">
            기본
          </span>
        `;

      }

      else {

        item.innerHTML = `
          <span>
            ${escapeHtml(category.emoji)}
            ${escapeHtml(category.name)}
          </span>

          <button
            type="button"
            class="category-delete-btn"
            data-name="${escapeHtml(category.name)}"
          >
            삭제
          </button>
        `;

      }


      categorySettingList.appendChild(
        item
      );

    }
  );

}


addCategoryBtn.addEventListener(
  "click",
  async () => {

    const emoji =
      newCategoryEmoji
        .value
        .trim()
      ||
      "📌";


    const name =
      newCategoryName
        .value
        .trim();


    if (!name) {

      alert(
        "카테고리 이름을 입력해주세요."
      );

      return;

    }


    const duplicate =
      categories.some(
        (category) =>
          category.name
            .toLowerCase()
          ===
          name.toLowerCase()
      );


    if (
      duplicate
    ) {

      alert(
        "이미 존재하는 카테고리입니다."
      );

      return;

    }


    const updatedCategories = [

      ...categories,

      {
        name,

        emoji,

        isDefault:
          false
      }

    ];


    try {

      await setDoc(

        categorySettingsDocRef(),

        {
          categories:
            updatedCategories
        },

        {
          merge: true
        }

      );


      newCategoryEmoji.value =
        "";

      newCategoryName.value =
        "";

    }

    catch (error) {

      console.error(
        "카테고리 추가 실패:",
        error
      );


      alert(
        "카테고리 추가 중 오류가 발생했습니다."
      );

    }

  }
);


categorySettingList.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        ".category-delete-btn"
      );


    if (!button) {
      return;
    }


    const name =
      button.dataset.name;


    const category =
      categories.find(
        (item) =>
          item.name ===
          name
      );


    if (
      !category ||
      category.isDefault
    ) {
      return;
    }


    const confirmed =
      confirm(
        `"${name}" 카테고리를 삭제할까요?`
      );


    if (!confirmed) {
      return;
    }


    const updatedCategories =
      categories.filter(
        (item) =>
          item.name !==
          name
      );


    try {

      await setDoc(

        categorySettingsDocRef(),

        {
          categories:
            updatedCategories
        },

        {
          merge: true
        }

      );

    }

    catch (error) {

      console.error(
        "카테고리 삭제 실패:",
        error
      );


      alert(
        "카테고리 삭제 중 오류가 발생했습니다."
      );

    }

  }
);


// =====================================================
// 설정
// =====================================================

settingsBtn.addEventListener(
  "click",
  () => {

    settingsNickname.value =
      myProfile?.nickname ||
      "";


    selectedSettingsIcon =
      myProfile?.icon ||
      "🩷";


    const matchingButton =
      [
        ...settingsIconButtons
      ]
        .find(
          (button) =>
            button.dataset.icon ===
            selectedSettingsIcon
        );


    settingsIconButtons.forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.icon ===
            selectedSettingsIcon
        );

      }
    );


    if (
      customSettingsIcon
    ) {

      customSettingsIcon.value =
        matchingButton
          ? ""
          : selectedSettingsIcon;

    }


    updateSettingsInfo();


    settingsModal.classList.add(
      "show"
    );

  }
);


closeSettingsModal.addEventListener(
  "click",
  () => {

    settingsModal.classList.remove(
      "show"
    );

  }
);


settingsModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      settingsModal
    ) {

      settingsModal.classList.remove(
        "show"
      );

    }

  }
);


settingsIconButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        settingsIconButtons.forEach(
          (btn) =>
            btn.classList.remove(
              "active"
            )
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
    function () {

      const value =
        this.value.trim();


      if (!value) {
        return;
      }


      selectedSettingsIcon =
        value;


      settingsIconButtons.forEach(
        (button) =>
          button.classList.remove(
            "active"
          )
      );

    }
  );

}


saveSettingsProfileBtn.addEventListener(
  "click",
  async () => {

    const nickname =
      settingsNickname
        .value
        .trim();


    if (!nickname) {

      alert(
        "별명을 입력해주세요."
      );

      return;

    }


    try {

      await updateDoc(

        userDocRef(
          currentUser.uid
        ),

        {
          nickname,

          icon:
            selectedSettingsIcon
        }

      );


      myProfile.nickname =
        nickname;


      myProfile.icon =
        selectedSettingsIcon;


      updateProfileUI();

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
        "프로필 저장 중 오류가 발생했습니다."
      );

    }

  }
);


function updateSettingsInfo() {

  settingsInviteCode.textContent =
    currentCouple?.inviteCode ||
    "------";


  settingsPartnerName.textContent =
    partnerProfile?.nickname ||
    "아직 연결되지 않음";

}


// =====================================================
// 메인 계산 / 렌더
// =====================================================

function renderApp() {

  if (!currentUser) {
    return;
  }


  updateProfileUI();


  const monthlyExpenses =
    getCurrentMonthExpenses();


  const sharedExpenses =
    monthlyExpenses.filter(
      (expense) =>
        expense.type ===
        "together"
    );


  const sharedUsed =
    sharedExpenses.reduce(
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
        .sharedBudget
      ||
      0
    );


  const sharedPercent =
    getUsagePercent(
      sharedUsed,
      sharedBudget
    );


  const sharedRemaining =
    sharedBudget -
    sharedUsed;


  sharedUsedAmount.textContent =
    formatWon(
      sharedUsed
    );


  sharedBudgetAmount.textContent =
    formatWon(
      sharedBudget
    );


  sharedBudgetPercent.textContent =
    `${sharedPercent}%`;


  sharedRemainingAmount.textContent =
    formatWon(
      sharedRemaining
    );


  setProgress(
    sharedBudgetProgress,
    sharedPercent
  );


  const myUsed =
    monthlyExpenses
      .filter(
        (expense) =>
          expense.payerUid ===
          currentUser.uid
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


  const myBudget =
    Number(

      monthlySettings
        .personalBudgets
        ?.[
          currentUser.uid
        ]

      ||

      0

    );


  renderPersonCard(
    "me",
    myUsed,
    myBudget
  );


  if (
    partnerProfile
  ) {

    const partnerUsed =
      monthlyExpenses
        .filter(
          (expense) =>
            expense.payerUid ===
            partnerProfile.uid
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


    const partnerBudget =
      Number(

        monthlySettings
          .personalBudgets
          ?.[
            partnerProfile.uid
          ]

        ||

        0

      );


    renderPersonCard(
      "partner",
      partnerUsed,
      partnerBudget
    );

  }

  else {

    renderPersonCard(
      "partner",
      0,
      0
    );

  }


  renderCategoryRatios(
    sharedCategoryList,
    sharedExpenses
  );


  renderTransactionList(
    transactionList,
    monthlyExpenses
  );


  if (
    !personDetailScreen.hidden
    &&
    detailUserUid
  ) {

    renderPersonDetail();

  }

}


function renderPersonCard(
  role,
  used,
  budget
) {

  const percent =
    getUsagePercent(
      used,
      budget
    );


  const remaining =
    budget -
    used;


  if (
    role === "me"
  ) {

    myUsedAmount.textContent =
      formatWon(
        used
      );


    myBudgetAmount.textContent =
      formatWon(
        budget
      );


    myBudgetPercent.textContent =
      `${percent}%`;


    myRemainingAmount.textContent =
      formatWon(
        remaining
      );


    setProgress(
      myBudgetProgress,
      percent
    );


    return;

  }


  partnerUsedAmount.textContent =
    formatWon(
      used
    );


  partnerBudgetAmount.textContent =
    formatWon(
      budget
    );


  partnerBudgetPercent.textContent =
    `${percent}%`;


  partnerRemainingAmount.textContent =
    formatWon(
      remaining
    );


  setProgress(
    partnerBudgetProgress,
    percent
  );

}


// =====================================================
// 카테고리 비율
// =====================================================

function renderCategoryRatios(
  container,
  expenseList
) {

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


  if (!total) {

    container.innerHTML = `
      <div class="empty-message">
        아직 지출이 없습니다.
      </div>
    `;


    return;

  }


  const amounts =
    {};


  expenseList.forEach(
    (expense) => {

      amounts[
        expense.category
      ] =

        (
          amounts[
            expense.category
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
              ${escapeHtml(category.emoji)}
            </span>

            <strong>
              ${escapeHtml(category.name)}
            </strong>

          </div>


          <div class="category-ratio-number">

            <span>
              ${formatWon(row.amount)}
            </span>

            <strong>
              ${row.percent}%
            </strong>

          </div>

        </div>


        <div class="progress-track">

          <div
            class="progress-bar"
            style="width: ${Math.min(row.percent, 100)}%"
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
// 거래내역
// =====================================================

function renderTransactionList(
  container,
  list
) {

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
        expense.payerUid ===
        currentUser.uid;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "transaction-item";


      item.innerHTML = `
        <div class="transaction-info">

          <h3>
            ${escapeHtml(title)}
          </h3>

          <p>
            ${escapeHtml(expense.date || "")}
            ·
            ${escapeHtml(expense.category || "")}
            ·
            ${escapeHtml(typeLabel(expense.type))}
            ·
            ${escapeHtml(payerName)}
          </p>

        </div>


        <div class="transaction-right">

          <div class="transaction-amount">
            -${formatWon(expense.amount)}
          </div>


          ${
            canManage

              ? `
                <div class="transaction-actions">

                  <button
                    type="button"
                    class="edit-expense-btn"
                    data-id="${expense.id}"
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    class="delete-expense-btn"
                    data-id="${expense.id}"
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

}


// =====================================================
// 개인 상세
// =====================================================

myDetailBtn.addEventListener(
  "click",
  () => {

    detailUserUid =
      currentUser.uid;


    renderPersonDetail();


    showScreen(
      personDetailScreen
    );

  }
);


partnerDetailBtn.addEventListener(
  "click",
  () => {

    if (
      !partnerProfile
    ) {
      return;
    }


    detailUserUid =
      partnerProfile.uid;


    renderPersonDetail();


    showScreen(
      personDetailScreen
    );

  }
);


detailBackBtn.addEventListener(
  "click",
  () => {

    detailUserUid =
      null;


    showScreen(
      appScreen
    );

  }
);


function renderPersonDetail() {

  const profile =
    getProfileByUid(
      detailUserUid
    );


  if (!profile) {
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


  const used =
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
        .personalBudgets
        ?.[
          detailUserUid
        ]

      ||

      0

    );


  const percent =
    getUsagePercent(
      used,
      budget
    );


  const remaining =
    budget -
    used;


  detailPersonIcon.textContent =
    profile.icon ||
    "🙂";


  detailPersonName.textContent =
    profile.nickname ||
    "사용자";


  detailMonthLabel.textContent =
    `${selectedMonth}월 생활비`;


  detailUsedAmount.textContent =
    formatWon(
      used
    );


  detailBudgetAmount.textContent =
    formatWon(
      budget
    );


  detailBudgetPercent.textContent =
    `${percent}%`;


  detailRemainingAmount.textContent =
    formatWon(
      remaining
    );


  setProgress(
    detailBudgetProgress,
    percent
  );


  renderCategoryRatios(
    detailCategoryList,
    personExpenses
  );


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


  const total =
    aloneAmount +
    togetherAmount;


  detailAloneAmount.textContent =
    formatWon(
      aloneAmount
    );


  detailTogetherAmount.textContent =
    formatWon(
      togetherAmount
    );


  detailAlonePercent.textContent =
    total

      ? `${Math.round(
          (
            aloneAmount /
            total
          ) *
          100
        )}%`

      : "0%";


  detailTogetherPercent.textContent =
    total

      ? `${Math.round(
          (
            togetherAmount /
            total
          ) *
          100
        )}%`

      : "0%";


  renderTransactionList(
    detailTransactionList,
    personExpenses
  );

}


// =====================================================
// 최초 준비
// =====================================================

[
  amountInput,
  sharedBudgetInput,
  myBudgetInput,
  partnerBudgetInput
]
  .forEach(
    attachMoneyFormatter
  );


renderCategories();

updateMonthTitle();

dateInput.value =
  getDefaultDate();

updatePrivacyVisibility();