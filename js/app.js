// ======================================================
// Firebase
// ======================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ======================================================
// Firebase 설정
// ======================================================

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


// ======================================================
// 기본 카테고리
// ======================================================

const defaultCategories = [
    { name: "식비", emoji: "🍚", isDefault: true },
    { name: "간식", emoji: "🍪", isDefault: true },
    { name: "데이트", emoji: "💕", isDefault: true },
    { name: "생활비", emoji: "🏠", isDefault: true },
    { name: "FLEX", emoji: "💸", isDefault: true },
    { name: "쇼핑", emoji: "🛍️", isDefault: true }
];


// ======================================================
// 현재 앱 상태
// ======================================================

let expenses = [];
let categories = [...defaultCategories];

let sharedBudgets = {};

let personalBudgets = {
    princess: 0,
    prince: 0
};

const today = new Date();

let selectedYear = today.getFullYear();
let selectedMonth = today.getMonth() + 1;

let editingExpenseId = null;

let unsubscribeExpenses = null;
let unsubscribeMonthlySettings = null;
let unsubscribeCategories = null;


// ======================================================
// HTML 요소
// ======================================================

// 로그인
const loginScreen =
    document.getElementById("login-screen");

const appScreen =
    document.getElementById("app-screen");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const loginBtn =
    document.getElementById("login-btn");

const loginError =
    document.getElementById("login-error");

const logoutBtn =
    document.getElementById("logout-btn");


// 월
const prevMonthBtn =
    document.getElementById("prev-month-btn");

const nextMonthBtn =
    document.getElementById("next-month-btn");

const currentMonthTitle =
    document.getElementById("current-month-title");

const summaryMonthTitle =
    document.getElementById("summary-month-title");


// 지출
const addExpenseBtn =
    document.getElementById("add-expense-btn");

const expenseModal =
    document.getElementById("expense-modal");

const closeModalBtn =
    document.getElementById("close-modal");

const saveExpenseBtn =
    document.getElementById("save-expense");

const dateInput =
    document.getElementById("expense-date");

const amountInput =
    document.getElementById("expense-amount");

const categoryInput =
    document.getElementById("expense-category");

const descriptionInput =
    document.getElementById("expense-description");

const typeButtons =
    document.querySelectorAll(".type-btn");

const payerButtons =
    document.querySelectorAll(".payer-btn");


// 대시보드
const transactionList =
    document.getElementById("transaction-list");

const sharedTotalRemaining =
    document.getElementById("shared-total-remaining");

const sharedTotalBudget =
    document.getElementById("shared-total-budget");

const sharedTotalUsed =
    document.getElementById("shared-total-used");

const sharedUsagePercent =
    document.getElementById("shared-usage-percent");

const sharedProgressBar =
    document.getElementById("shared-progress-bar");


// 공유 예산
const budgetSettingBtn =
    document.getElementById("budget-setting-btn");

const budgetModal =
    document.getElementById("budget-modal");

const closeBudgetModal =
    document.getElementById("close-budget-modal");

const saveBudgetBtn =
    document.getElementById("save-budget");


// 개인 예산
const personalBudgetBtn =
    document.getElementById("personal-budget-btn");

const personalBudgetModal =
    document.getElementById("personal-budget-modal");

const closePersonalBudgetModal =
    document.getElementById(
        "close-personal-budget-modal"
    );

const princessBudgetInput =
    document.getElementById(
        "princess-budget-input"
    );

const princeBudgetInput =
    document.getElementById(
        "prince-budget-input"
    );

const savePersonalBudgetBtn =
    document.getElementById(
        "save-personal-budget"
    );


// 카테고리
const categorySettingBtn =
    document.getElementById(
        "category-setting-btn"
    );

const categoryModal =
    document.getElementById(
        "category-modal"
    );

const closeCategoryModal =
    document.getElementById(
        "close-category-modal"
    );

const categorySettingList =
    document.getElementById(
        "category-setting-list"
    );

const newCategoryEmoji =
    document.getElementById(
        "new-category-emoji"
    );

const newCategoryName =
    document.getElementById(
        "new-category-name"
    );

const addCategoryBtn =
    document.getElementById(
        "add-category-btn"
    );


// ======================================================
// 금액 쉼표 기능
// ======================================================

// "10,000" → 10000
function parseMoney(value) {

    const onlyNumbers =
        String(value ?? "")
            .replace(/[^0-9]/g, "");

    return onlyNumbers
        ? Number(onlyNumbers)
        : 0;
}


// 10000 → "10,000"
function formatMoneyInput(value) {

    const number =
        parseMoney(value);

    return number
        ? number.toLocaleString("ko-KR")
        : "";
}


// 입력할 때 자동으로 쉼표 찍기
function attachMoneyFormatter(input) {

    if (!input) {
        return;
    }

    // 같은 input에 이벤트가 여러 번 붙는 것 방지
    if (
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


// 현재 화면에 있는 금액 입력칸 전부 적용
function attachAllMoneyFormatters() {

    attachMoneyFormatter(
        amountInput
    );

    document
        .querySelectorAll(
            ".budget-input"
        )
        .forEach(
            attachMoneyFormatter
        );

    attachMoneyFormatter(
        princessBudgetInput
    );

    attachMoneyFormatter(
        princeBudgetInput
    );

}


// ======================================================
// 로그인
// ======================================================

async function login() {

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;

    loginError.textContent = "";


    if (!email || !password) {

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

        loginPassword.value = "";

    } catch (error) {

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
    function (event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


// ======================================================
// 로그아웃
// ======================================================

logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "로그아웃 실패:",
                error
            );

        }

    }
);


// ======================================================
// 로그인 상태 감지
// ======================================================

onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            loginScreen.style.display =
                "none";

            appScreen.style.display =
                "block";

            loginError.textContent = "";

            startFirebaseListeners();

        } else {

            loginScreen.style.display =
                "flex";

            appScreen.style.display =
                "none";

            stopFirebaseListeners();

        }

    }
);


// ======================================================
// Firebase 실시간 연결
// ======================================================

function startFirebaseListeners() {

    listenExpenses();
    listenCategories();
    listenMonthlySettings();

}


function stopFirebaseListeners() {

    if (unsubscribeExpenses) {

        unsubscribeExpenses();

        unsubscribeExpenses = null;

    }


    if (unsubscribeMonthlySettings) {

        unsubscribeMonthlySettings();

        unsubscribeMonthlySettings = null;

    }


    if (unsubscribeCategories) {

        unsubscribeCategories();

        unsubscribeCategories = null;

    }

}


// ======================================================
// 월
// ======================================================

function getMonthKey() {

    return `${selectedYear}-${String(
        selectedMonth
    ).padStart(2, "0")}`;

}


function updateMonthTitle() {

    currentMonthTitle.textContent =
        `${selectedYear}년 ${selectedMonth}월`;

    summaryMonthTitle.textContent =
        `${selectedMonth}월 공유 생활비`;

}


function getDefaultDate() {

    const now = new Date();

    const month =
        String(selectedMonth)
            .padStart(2, "0");

    let day = "01";


    if (
        now.getFullYear() === selectedYear &&
        now.getMonth() + 1 === selectedMonth
    ) {

        day =
            String(now.getDate())
                .padStart(2, "0");

    }


    return `${selectedYear}-${month}-${day}`;

}


// 이전 달
prevMonthBtn.addEventListener(
    "click",
    function () {

        selectedMonth--;


        if (selectedMonth < 1) {

            selectedMonth = 12;
            selectedYear--;

        }


        monthChanged();

    }
);


// 다음 달
nextMonthBtn.addEventListener(
    "click",
    function () {

        selectedMonth++;


        if (selectedMonth > 12) {

            selectedMonth = 1;
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


// ======================================================
// 지출 모달
// ======================================================

addExpenseBtn.addEventListener(
    "click",
    function () {

        editingExpenseId = null;

        saveExpenseBtn.textContent =
            "저장하기";

        dateInput.value =
            getDefaultDate();

        amountInput.value = "";

        descriptionInput.value = "";

        selectType("혼자");

        selectPayer("공주");


        if (categories.length > 0) {

            categoryInput.value =
                categories[0].name;

        }


        expenseModal.classList.add(
            "show"
        );

    }
);


closeModalBtn.addEventListener(
    "click",
    function () {

        expenseModal.classList.remove(
            "show"
        );

    }
);


expenseModal.addEventListener(
    "click",
    function (event) {

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


// ======================================================
// 혼자 / 같이
// ======================================================

typeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                typeButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

            }
        );

    }
);


function selectType(type) {

    typeButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.textContent.includes(
                    type
                )
            );

        }
    );

}


// ======================================================
// 공주 / 왕자
// ======================================================

payerButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                payerButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

            }
        );

    }
);


function selectPayer(person) {

    payerButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.textContent.includes(
                    person
                )
            );

        }
    );

}


// ======================================================
// 지출 저장 / 수정
// ======================================================

saveExpenseBtn.addEventListener(
    "click",
    async function () {

        const date =
            dateInput.value;

        // 쉼표가 있어도 실제 저장은 숫자
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

        const selectedType =
            document.querySelector(
                ".type-btn.active"
            );

        const selectedPayer =
            document.querySelector(
                ".payer-btn.active"
            );


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


        if (!description) {

            alert(
                "지출 내용을 입력해주세요."
            );

            return;
        }


        if (
            !selectedType ||
            !selectedPayer
        ) {

            alert(
                "소비 유형과 결제자를 선택해주세요."
            );

            return;
        }


        const type =
            selectedType
                .textContent
                .trim();

        const payer =
            selectedPayer
                .textContent
                .trim();

        const monthKey =
            date.slice(0, 7);


        const expenseData = {
            date,
            monthKey,
            amount,
            category,
            description,
            type,
            payer
        };


        try {

            // 기존 지출 수정
            if (editingExpenseId) {

                await updateDoc(
                    doc(
                        db,
                        "expenses",
                        editingExpenseId
                    ),
                    expenseData
                );

            }

            // 새 지출
            else {

                await addDoc(
                    collection(
                        db,
                        "expenses"
                    ),
                    {
                        ...expenseData,

                        createdAt:
                            serverTimestamp()
                    }
                );

            }


            editingExpenseId = null;

            saveExpenseBtn.textContent =
                "저장하기";

            expenseModal.classList.remove(
                "show"
            );


        } catch (error) {

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


// ======================================================
// 지출 실시간 불러오기
// ======================================================

function listenExpenses() {

    if (unsubscribeExpenses) {

        unsubscribeExpenses();

    }


    const expensesQuery =
        query(
            collection(
                db,
                "expenses"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    unsubscribeExpenses =
        onSnapshot(
            expensesQuery,

            function (snapshot) {

                expenses = [];


                snapshot.forEach(
                    function (document) {

                        expenses.push({
                            id: document.id,
                            ...document.data()
                        });

                    }
                );


                renderApp();

            },

            function (error) {

                console.error(
                    "지출 불러오기 실패:",
                    error
                );

            }
        );

}


// ======================================================
// 거래 수정 / 삭제 버튼
// ======================================================

transactionList.addEventListener(
    "click",
    function (event) {

        const editButton =
            event.target.closest(
                ".edit-expense-btn"
            );


        if (editButton) {

            openEditExpense(
                editButton.dataset.id
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                ".delete-expense-btn"
            );


        if (deleteButton) {

            deleteExpense(
                deleteButton.dataset.id
            );

        }

    }
);


// ======================================================
// 지출 수정
// ======================================================

function openEditExpense(id) {

    const expense =
        expenses.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!expense) {
        return;
    }


    editingExpenseId = id;

    dateInput.value =
        expense.date ||
        getDefaultDate();


    // 수정창에서도 10,000 형태
    amountInput.value =
        formatMoneyInput(
            expense.amount
        );


    categoryInput.value =
        expense.category;

    descriptionInput.value =
        expense.description;


    selectType(
        expense.type.includes(
            "같이"
        )
            ? "같이"
            : "혼자"
    );


    selectPayer(
        expense.payer.includes(
            "공주"
        )
            ? "공주"
            : "왕자"
    );


    saveExpenseBtn.textContent =
        "수정 저장";

    expenseModal.classList.add(
        "show"
    );

}


// ======================================================
// 지출 삭제
// ======================================================

async function deleteExpense(id) {

    const expense =
        expenses.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!expense) {
        return;
    }


    const confirmed =
        confirm(
            `"${expense.description}" 지출을 삭제할까요?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "expenses",
                id
            )
        );

    } catch (error) {

        console.error(
            "지출 삭제 실패:",
            error
        );

        alert(
            "지출 삭제 중 오류가 발생했습니다."
        );

    }

}


// ======================================================
// 공유 예산 모달
// ======================================================

budgetSettingBtn.addEventListener(
    "click",
    function () {

        const inputs =
            document.querySelectorAll(
                ".budget-input"
            );


        inputs.forEach(
            function (input) {

                const category =
                    input.dataset.category;


                input.value =
                    formatMoneyInput(
                        sharedBudgets[
                            category
                        ]
                    );

            }
        );


        budgetModal.classList.add(
            "show"
        );

    }
);


closeBudgetModal.addEventListener(
    "click",
    function () {

        budgetModal.classList.remove(
            "show"
        );

    }
);


budgetModal.addEventListener(
    "click",
    function (event) {

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


// ======================================================
// 공유 예산 저장
// ======================================================

saveBudgetBtn.addEventListener(
    "click",
    async function () {

        const inputs =
            document.querySelectorAll(
                ".budget-input"
            );

        const newBudgets = {};


        inputs.forEach(
            function (input) {

                // "500,000" → 500000
                newBudgets[
                    input.dataset.category
                ] =
                    parseMoney(
                        input.value
                    );

            }
        );


        try {

            await setDoc(
                doc(
                    db,
                    "monthlySettings",
                    getMonthKey()
                ),
                {
                    sharedBudgets:
                        newBudgets,

                    personalBudgets:
                        personalBudgets
                },
                {
                    merge: true
                }
            );


            budgetModal.classList.remove(
                "show"
            );


        } catch (error) {

            console.error(
                "공유 예산 저장 실패:",
                error
            );

            alert(
                "공유 예산 저장 중 오류가 발생했습니다."
            );

        }

    }
);


// ======================================================
// 개인 예산 모달
// ======================================================

personalBudgetBtn.addEventListener(
    "click",
    function () {

        princessBudgetInput.value =
            formatMoneyInput(
                personalBudgets.princess
            );

        princeBudgetInput.value =
            formatMoneyInput(
                personalBudgets.prince
            );


        personalBudgetModal
            .classList
            .add("show");

    }
);


closePersonalBudgetModal.addEventListener(
    "click",
    function () {

        personalBudgetModal
            .classList
            .remove("show");

    }
);


personalBudgetModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            personalBudgetModal
        ) {

            personalBudgetModal
                .classList
                .remove("show");

        }

    }
);


// ======================================================
// 개인 예산 저장
// ======================================================

savePersonalBudgetBtn.addEventListener(
    "click",
    async function () {

        const newPersonalBudgets = {

            princess:
                parseMoney(
                    princessBudgetInput.value
                ),

            prince:
                parseMoney(
                    princeBudgetInput.value
                )

        };


        try {

            await setDoc(
                doc(
                    db,
                    "monthlySettings",
                    getMonthKey()
                ),
                {
                    sharedBudgets:
                        sharedBudgets,

                    personalBudgets:
                        newPersonalBudgets
                },
                {
                    merge: true
                }
            );


            personalBudgetModal
                .classList
                .remove("show");


        } catch (error) {

            console.error(
                "개인 예산 저장 실패:",
                error
            );

            alert(
                "개인 예산 저장 중 오류가 발생했습니다."
            );

        }

    }
);


// ======================================================
// 월별 예산 실시간 불러오기
// ======================================================

function listenMonthlySettings() {

    if (unsubscribeMonthlySettings) {

        unsubscribeMonthlySettings();

    }


    unsubscribeMonthlySettings =
        onSnapshot(
            doc(
                db,
                "monthlySettings",
                getMonthKey()
            ),

            function (snapshot) {

                if (snapshot.exists()) {

                    const data =
                        snapshot.data();


                    sharedBudgets = {
                        ...(data.sharedBudgets || {})
                    };


                    personalBudgets = {

                        princess:
                            Number(
                                data
                                    .personalBudgets
                                    ?.princess
                            ) || 0,

                        prince:
                            Number(
                                data
                                    .personalBudgets
                                    ?.prince
                            ) || 0

                    };


                } else {

                    sharedBudgets = {};

                    personalBudgets = {
                        princess: 0,
                        prince: 0
                    };

                }


                renderApp();

            },

            function (error) {

                console.error(
                    "월별 예산 불러오기 실패:",
                    error
                );

            }
        );

}


// ======================================================
// 카테고리 관리 모달
// ======================================================

categorySettingBtn.addEventListener(
    "click",
    function () {

        renderCategorySettingList();

        categoryModal.classList.add(
            "show"
        );

    }
);


closeCategoryModal.addEventListener(
    "click",
    function () {

        categoryModal.classList.remove(
            "show"
        );

    }
);


categoryModal.addEventListener(
    "click",
    function (event) {

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


// ======================================================
// 카테고리 관리 목록
// ======================================================

function renderCategorySettingList() {

    categorySettingList.innerHTML = "";


    categories.forEach(
        function (category) {

            const item =
                document.createElement(
                    "div"
                );

            item.classList.add(
                "category-setting-item"
            );


            if (category.isDefault) {

                item.innerHTML = `
                    <span>
                        ${escapeHtml(category.emoji)}
                        ${escapeHtml(category.name)}
                    </span>

                    <span class="category-default-badge">
                        기본
                    </span>
                `;

            } else {

                item.innerHTML = `
                    <span>
                        ${escapeHtml(category.emoji)}
                        ${escapeHtml(category.name)}
                    </span>

                    <button
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


// ======================================================
// 카테고리 추가
// ======================================================

addCategoryBtn.addEventListener(
    "click",
    async function () {

        const emoji =
            newCategoryEmoji
                .value
                .trim();

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
                function (category) {

                    return (
                        category.name
                            .toLowerCase()
                        ===
                        name.toLowerCase()
                    );

                }
            );


        if (duplicate) {

            alert(
                "이미 존재하는 카테고리입니다."
            );

            return;
        }


        const updatedCategories = [
            ...categories,
            {
                name,
                emoji: emoji || "📌",
                isDefault: false
            }
        ];


        try {

            await setDoc(
                doc(
                    db,
                    "settings",
                    "categories"
                ),
                {
                    categories:
                        updatedCategories
                }
            );


            newCategoryEmoji.value = "";
            newCategoryName.value = "";


        } catch (error) {

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


// ======================================================
// 카테고리 삭제
// ======================================================

categorySettingList.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".category-delete-btn"
            );


        if (!button) {
            return;
        }


        const categoryName =
            button.dataset.name;


        const category =
            categories.find(
                function (item) {

                    return (
                        item.name ===
                        categoryName
                    );

                }
            );


        if (
            !category ||
            category.isDefault
        ) {

            return;
        }


        const confirmed =
            confirm(
                `"${categoryName}" 카테고리를 삭제할까요?`
            );


        if (!confirmed) {
            return;
        }


        const updatedCategories =
            categories.filter(
                function (item) {

                    return (
                        item.name !==
                        categoryName
                    );

                }
            );


        try {

            await setDoc(
                doc(
                    db,
                    "settings",
                    "categories"
                ),
                {
                    categories:
                        updatedCategories
                }
            );


        } catch (error) {

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


// ======================================================
// 카테고리 실시간 불러오기
// ======================================================

function listenCategories() {

    if (unsubscribeCategories) {

        unsubscribeCategories();

    }


    unsubscribeCategories =
        onSnapshot(
            doc(
                db,
                "settings",
                "categories"
            ),

            function (snapshot) {

                if (
                    snapshot.exists() &&
                    Array.isArray(
                        snapshot.data()
                            .categories
                    )
                ) {

                    categories =
                        snapshot.data()
                            .categories;

                } else {

                    categories =
                        [...defaultCategories];

                }


                renderCategories();

                renderCategorySettingList();

            },

            function (error) {

                console.error(
                    "카테고리 불러오기 실패:",
                    error
                );

            }
        );

}


// ======================================================
// 카테고리 화면 갱신
// ======================================================

function renderCategories() {

    // 현재 선택 카테고리 기억
    const oldSelectedCategory =
        categoryInput.value;


    // ----------------------------------
    // 지출 카테고리 select
    // ----------------------------------

    categoryInput.innerHTML = "";


    categories.forEach(
        function (category) {

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
            function (category) {

                return (
                    category.name ===
                    oldSelectedCategory
                );

            }
        )
    ) {

        categoryInput.value =
            oldSelectedCategory;

    }


    // ----------------------------------
    // 공유 예산 카드
    // ----------------------------------

    const budgetList =
        document.querySelector(
            ".budget-list"
        );

    budgetList.innerHTML = "";


    categories.forEach(
        function (category) {

            const card =
                document.createElement(
                    "div"
                );

            card.classList.add(
                "budget-card"
            );

            card.dataset.category =
                category.name;


            card.innerHTML = `
                <div class="budget-card-main">

                    <div class="budget-card-top">

                        <h3>
                            ${escapeHtml(category.emoji)}
                            ${escapeHtml(category.name)}
                        </h3>

                        <strong class="budget-remaining">
                            0원
                        </strong>

                    </div>

                    <p class="budget-info">
                        예산을 설정해주세요
                    </p>

                    <div class="category-progress-wrap">

                        <div class="progress-track">

                            <div
                                class="progress-bar category-progress-bar"
                            ></div>

                        </div>

                        <span class="category-progress-text">
                            0%
                        </span>

                    </div>

                </div>
            `;


            budgetList.appendChild(
                card
            );

        }
    );


    // ----------------------------------
    // 공유 예산 설정 입력칸
    // ----------------------------------

    const budgetModalContent =
        budgetModal.querySelector(
            ".modal-content"
        );


    budgetModalContent
        .querySelectorAll(
            ".form-group"
        )
        .forEach(
            function (group) {

                group.remove();

            }
        );


    categories.forEach(
        function (category) {

            const group =
                document.createElement(
                    "div"
                );

            group.classList.add(
                "form-group"
            );


            // ★ type="text"로 만들어야 쉼표 가능
            group.innerHTML = `
                <label>
                    ${escapeHtml(category.emoji)}
                    ${escapeHtml(category.name)}
                </label>

                <input
                    type="text"
                    inputmode="numeric"
                    class="budget-input"
                    data-category="${escapeHtml(category.name)}"
                    placeholder="예산을 입력하세요"
                    autocomplete="off"
                >
            `;


            budgetModalContent.insertBefore(
                group,
                saveBudgetBtn
            );


            // 새로 생긴 입력창에도 쉼표 기능 연결
            attachMoneyFormatter(
                group.querySelector(
                    ".budget-input"
                )
            );

        }
    );


    renderApp();

}


// ======================================================
// 거래내역 HTML
// ======================================================

function createTransactionItem(
    expense
) {

    const item =
        document.createElement(
            "div"
        );

    item.classList.add(
        "transaction-item"
    );


    item.innerHTML = `
        <div class="transaction-info">

            <h3>
                ${escapeHtml(
                    expense.description
                )}
            </h3>

            <p>
                ${expense.date || ""}
                ·
                ${escapeHtml(expense.category)}
                ·
                ${escapeHtml(expense.type)}
                ·
                ${escapeHtml(expense.payer)}
            </p>

        </div>

        <div class="transaction-right">

            <div class="transaction-amount">
                -${Number(
                    expense.amount
                ).toLocaleString("ko-KR")}원
            </div>

            <div class="transaction-actions">

                <button
                    class="edit-expense-btn"
                    data-id="${expense.id}"
                >
                    수정
                </button>

                <button
                    class="delete-expense-btn"
                    data-id="${expense.id}"
                >
                    삭제
                </button>

            </div>

        </div>
    `;


    transactionList.appendChild(
        item
    );

}


// ======================================================
// 메인 화면 계산
// ======================================================

function renderApp() {

    const monthKey =
        getMonthKey();


    // 현재 월 지출
    const monthlyExpenses =
        expenses.filter(
            function (expense) {

                if (expense.monthKey) {

                    return (
                        expense.monthKey ===
                        monthKey
                    );

                }


                // 옛날 데이터 호환
                if (
                    expense.createdAt &&
                    expense.createdAt.toDate
                ) {

                    const date =
                        expense
                            .createdAt
                            .toDate();

                    const oldMonthKey =
                        `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, "0")}`;


                    return (
                        oldMonthKey ===
                        monthKey
                    );

                }


                return false;

            }
        );


    // 카테고리별 공유 사용금액
    const sharedUsed = {};


    categories.forEach(
        function (category) {

            sharedUsed[
                category.name
            ] = 0;

        }
    );


    // 개인 사용금액
    let princessUsed = 0;
    let princeUsed = 0;


    // 거래내역 초기화
    transactionList.innerHTML = "";


    if (
        monthlyExpenses.length === 0
    ) {

        transactionList.innerHTML = `
            <div class="empty-message">
                등록된 지출이 없습니다.
            </div>
        `;

    }


    // 지출 계산
    monthlyExpenses.forEach(
        function (expense) {

            createTransactionItem(
                expense
            );


            // 같이 사용한 금액만 공유 예산 차감
            if (
                expense.type?.includes(
                    "같이"
                )
            ) {

                if (
                    sharedUsed[
                        expense.category
                    ] !== undefined
                ) {

                    sharedUsed[
                        expense.category
                    ] +=
                        Number(
                            expense.amount
                        );

                }

            }


            // 결제자의 개인 잔액 차감
            if (
                expense.payer?.includes(
                    "공주"
                )
            ) {

                princessUsed +=
                    Number(
                        expense.amount
                    );

            }


            if (
                expense.payer?.includes(
                    "왕자"
                )
            ) {

                princeUsed +=
                    Number(
                        expense.amount
                    );

            }

        }
    );


    // ==================================================
    // 전체 공유 예산
    // ==================================================

    let totalSharedBudget = 0;
    let totalSharedUsed = 0;


    categories.forEach(
        function (category) {

            const budget =
                Number(
                    sharedBudgets[
                        category.name
                    ]
                ) || 0;

            const used =
                Number(
                    sharedUsed[
                        category.name
                    ]
                ) || 0;


            totalSharedBudget +=
                budget;

            totalSharedUsed +=
                used;

        }
    );


    const totalSharedRemaining =
        totalSharedBudget -
        totalSharedUsed;


    sharedTotalRemaining.textContent =
        `${totalSharedRemaining.toLocaleString(
            "ko-KR"
        )}원`;


    if (sharedTotalBudget) {

        sharedTotalBudget.textContent =
            `${totalSharedBudget.toLocaleString(
                "ko-KR"
            )}원`;

    }


    if (sharedTotalUsed) {

        sharedTotalUsed.textContent =
            `${totalSharedUsed.toLocaleString(
                "ko-KR"
            )}원`;

    }


    // ==================================================
    // 전체 사용률
    // ==================================================

    let totalUsagePercent = 0;


    if (totalSharedBudget > 0) {

        totalUsagePercent =
            Math.round(
                (
                    totalSharedUsed /
                    totalSharedBudget
                ) * 100
            );

    }


    if (sharedUsagePercent) {

        sharedUsagePercent.textContent =
            `${totalUsagePercent}%`;

    }


    if (sharedProgressBar) {

        sharedProgressBar.style.width =
            `${Math.min(
                totalUsagePercent,
                100
            )}%`;


        sharedProgressBar.classList.remove(
            "warning",
            "danger"
        );


        if (
            totalUsagePercent >= 100
        ) {

            sharedProgressBar.classList.add(
                "danger"
            );

        }

        else if (
            totalUsagePercent >= 80
        ) {

            sharedProgressBar.classList.add(
                "warning"
            );

        }

    }


    // ==================================================
    // 카테고리 카드
    // ==================================================

    document
        .querySelectorAll(
            ".budget-card"
        )
        .forEach(
            function (card) {

                const category =
                    card.dataset.category;

                const budget =
                    Number(
                        sharedBudgets[
                            category
                        ]
                    ) || 0;

                const used =
                    Number(
                        sharedUsed[
                            category
                        ]
                    ) || 0;

                const remaining =
                    budget - used;


                const info =
                    card.querySelector(
                        ".budget-info"
                    );

                const remainingElement =
                    card.querySelector(
                        ".budget-remaining"
                    );

                const progressBar =
                    card.querySelector(
                        ".category-progress-bar"
                    );

                const progressText =
                    card.querySelector(
                        ".category-progress-text"
                    );


                if (budget === 0) {

                    info.textContent =
                        "예산을 설정해주세요";

                } else {

                    info.textContent =
                        `${budget.toLocaleString(
                            "ko-KR"
                        )}원 중 ${used.toLocaleString(
                            "ko-KR"
                        )}원 사용`;

                }


                remainingElement.textContent =
                    `${remaining.toLocaleString(
                        "ko-KR"
                    )}원`;


                // 사용률
                let percent = 0;


                if (budget > 0) {

                    percent =
                        Math.round(
                            (
                                used /
                                budget
                            ) * 100
                        );

                }


                if (progressText) {

                    progressText.textContent =
                        `${percent}%`;

                }


                if (progressBar) {

                    progressBar.style.width =
                        `${Math.min(
                            percent,
                            100
                        )}%`;

                    progressBar.classList.remove(
                        "warning",
                        "danger"
                    );


                    if (percent >= 100) {

                        progressBar.classList.add(
                            "danger"
                        );

                    }

                    else if (
                        percent >= 80
                    ) {

                        progressBar.classList.add(
                            "warning"
                        );

                    }

                }


                card.classList.remove(
                    "warning",
                    "danger"
                );


                if (percent >= 100) {

                    card.classList.add(
                        "danger"
                    );

                }

                else if (
                    percent >= 80
                ) {

                    card.classList.add(
                        "warning"
                    );

                }

            }
        );


    // ==================================================
    // 개인 잔액
    // ==================================================

    const princessRemaining =
        Number(
            personalBudgets.princess
        ) -
        princessUsed;


    const princeRemaining =
        Number(
            personalBudgets.prince
        ) -
        princeUsed;


    const princessBalance =
        document.querySelector(
            `.personal-card[data-person="공주"] .personal-balance`
        );

    const princeBalance =
        document.querySelector(
            `.personal-card[data-person="왕자"] .personal-balance`
        );


    if (princessBalance) {

        princessBalance.textContent =
            `${princessRemaining.toLocaleString(
                "ko-KR"
            )}원`;

    }


    if (princeBalance) {

        princeBalance.textContent =
            `${princeRemaining.toLocaleString(
                "ko-KR"
            )}원`;

    }

}


// ======================================================
// HTML 특수문자 안전 처리
// ======================================================

function escapeHtml(text) {

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


// ======================================================
// 처음 실행
// ======================================================

updateMonthTitle();

dateInput.value =
    getDefaultDate();

attachAllMoneyFormatters();