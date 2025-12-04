// ------------------------------
// TURBO: KETCHUP – data
// No subject pronouns in Spanish answers
// Seasonal where possible but still very beginner-friendly
// ------------------------------

const TURBO_KETCHUP_LEVELS = [
  {
    id: 1,
    name: "Level 1 – Christmas colours (single words)",
    questions: [
      { en: "red", es: "rojo" },
      { en: "green", es: "verde" },
      { en: "white", es: "blanco" },
      { en: "blue", es: "azul" },
      { en: "yellow", es: "amarillo" },
      { en: "black", es: "negro" }
    ]
  },
  {
    id: 2,
    name: "Level 2 – Colours + Christmas things",
    questions: [
      { en: "the red Christmas jumper", es: "el jersey rojo de navidad" },
      { en: "the green Christmas tree", es: "el árbol verde" },
      { en: "the white snow", es: "la nieve blanca" },
      { en: "the blue present", es: "el regalo azul" },
      { en: "the yellow star", es: "la estrella amarilla" },
      { en: "the black boots", es: "las botas negras" }
    ]
  },
  {
    id: 3,
    name: "Level 3 – Ser + physical adjectives (yo / tú, no pronouns)",
    questions: [
      { en: "I am tall", es: "soy alto" },
      { en: "I am short", es: "soy bajo" },
      { en: "I am thin", es: "soy delgado" },
      { en: "You are tall", es: "eres alto" },
      { en: "You are short", es: "eres bajo" },
      { en: "You are thin", es: "eres delgado" }
    ]
  },
  {
    id: 4,
    name: "Level 4 – Ser + physical adjectives (él / ella, no pronouns)",
    questions: [
      { en: "He is tall", es: "es alto" },
      { en: "She is tall", es: "es alta" },
      { en: "He is short", es: "es bajo" },
      { en: "She is short", es: "es baja" },
      { en: "He is fat", es: "es gordo" },
      { en: "She is thin", es: "es delgada" }
    ]
  },
  {
    id: 5,
    name: "Level 5 – Personality adjectives (yo / tú, no pronouns)",
    questions: [
      { en: "I am friendly", es: "soy simpático" },
      { en: "I am shy", es: "soy tímido" },
      { en: "I am funny", es: "soy divertido" },
      { en: "You are friendly", es: "eres simpático" },
      { en: "You are shy", es: "eres tímido" },
      { en: "You are funny", es: "eres divertido" }
    ]
  },
  {
    id: 6,
    name: "Level 6 – Personality adjectives (él / ella, no pronouns)",
    questions: [
      { en: "He is friendly", es: "es simpático" },
      { en: "She is friendly", es: "es simpática" },
      { en: "He is lazy", es: "es perezoso" },
      { en: "She is lazy", es: "es perezosa" },
      { en: "He is serious", es: "es serio" },
      { en: "She is serious", es: "es seria" }
    ]
  },
  {
    id: 7,
    name: "Level 7 – Tener + physical features",
    questions: [
      { en: "I have brown hair", es: "tengo el pelo marrón" },
      { en: "I have blue eyes", es: "tengo los ojos azules" },
      { en: "You have green eyes", es: "tienes los ojos verdes" },
      { en: "He has black hair", es: "tiene el pelo negro" },
      { en: "She has blonde hair", es: "tiene el pelo rubio" },
      { en: "We have brown eyes", es: "tenemos los ojos marrones" }
    ]
  },
  {
    id: 8,
    name: "Level 8 – Estar + feelings (Christmas mood)",
    questions: [
      { en: "I am tired", es: "estoy cansado" },
      { en: "I am happy", es: "estoy contento" },
      { en: "You are sad", es: "estás triste" },
      { en: "He is angry", es: "está enfadado" },
      { en: "She is nervous", es: "está nerviosa" },
      { en: "We are excited for Christmas", es: "estamos emocionados por navidad" }
    ]
  },
  {
    id: 9,
    name: "Level 9 – Mixed ser / estar / tener",
    questions: [
      { en: "I am tall and thin", es: "soy alto y delgado" },
      { en: "You are friendly and funny", es: "eres simpático y divertido" },
      { en: "She is shy and intelligent", es: "es tímida e inteligente" },
      { en: "He is lazy but funny", es: "es perezoso pero divertido" },
      { en: "I am happy and tired", es: "estoy contento y cansado" },
      { en: "I have brown hair and blue eyes", es: "tengo el pelo marrón y los ojos azules" }
    ]
  },
  {
    id: 10,
    name: "Level 10 – Full Christmas descriptions",
    questions: [
      { en: "I am tall and friendly", es: "soy alto y simpático" },
      { en: "You are short and serious", es: "eres bajo y serio" },
      { en: "She is tall, thin and friendly", es: "es alta, delgada y simpática" },
      { en: "He is lazy but funny", es: "es perezoso pero divertido" },
      { en: "I am happy and I have blue eyes", es: "estoy contento y tengo los ojos azules" },
      { en: "We are friendly and we have brown hair", es: "somos simpáticos y tenemos el pelo marrón" }
    ]
  }
];

// ------------------------------
// State
// ------------------------------

let currentLevelIndex = 0;
let currentQuestionIndex = 0;
let correctCount = 0;
let totalQuestions = 0;
let startTime = null;
let timerInterval = null;

// For speech
let recognition = null;

// ------------------------------
// Helpers
// ------------------------------

function $(id) {
  return document.getElementById(id);
}

// Make checking forgiving: ignore case, accents, ñ vs n, extra spaces.
function normalizeAnswer(text) {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // remove accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // treat ñ as n
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ");
}

// Load / save progress to localStorage so Jump Page can read it
function loadProgress() {
  const key = "turbo_ketchup_progress";
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not parse turbo_ketchup_progress", e);
    return null;
  }
}

function saveProgress({ scorePercent, timeSeconds }) {
  const key = "turbo_ketchup_progress";
  const levelNumber = currentLevelIndex + 1;
  let data = loadProgress() || {
    levelsCompleted: 0,
    bestScore: 0,
    bestTime: null,
    lastPlayed: null
  };

  // if all correct in this level, mark it as completed
  if (correctCount === totalQuestions && levelNumber > data.levelsCompleted) {
    data.levelsCompleted = levelNumber;
  }

  if (scorePercent > data.bestScore) {
    data.bestScore = scorePercent;
  }

  if (data.bestTime === null || timeSeconds < data.bestTime) {
    data.bestTime = timeSeconds;
  }

  data.lastPlayed = new Date().toISOString();

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save turbo_ketchup_progress", e);
  }

  updateOverallProgressDisplay();
}

function updateOverallProgressDisplay() {
  const data = loadProgress();
  const el = $("overall-progress");
  if (!el) return;

  if (!data) {
    el.textContent = "Levels completed: 0/10 | Best: 0%";
  } else {
    const time =
      data.bestTime != null ? ` | Best time: ${data.bestTime.toFixed(1)}s` : "";
    el.textContent = `Levels completed: ${data.levelsCompleted}/10 | Best: ${data.bestScore}%${time}`;
  }
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimerDisplay, 100);
}

function updateTimerDisplay() {
  if (!startTime) return;
  const seconds = (Date.now() - startTime) / 1000;
  $("timer").textContent = `Time: ${seconds.toFixed(1)}s`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  if (!startTime) return 0;
  const seconds = (Date.now() - startTime) / 1000;
  startTime = null;
  updateTimerDisplay();
  return seconds;
}

// ------------------------------
// Game flow
// ------------------------------

function populateLevelSelect() {
  const select = $("levelSelect");
  TURBO_KETCHUP_LEVELS.forEach((level, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${level.id}. ${level.name}`;
    select.appendChild(opt);
  });
}

function startLevel() {
  const select = $("levelSelect");
  const index = parseInt(select.value, 10) || 0;
  currentLevelIndex = index;
  currentQuestionIndex = 0;
  correctCount = 0;

  const level = TURBO_KETCHUP_LEVELS[currentLevelIndex];
  totalQuestions = level.questions.length;

  $("levelName").textContent = level.name;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("resultSummary").textContent = "";
  $("questionCounter").textContent = `Question: 1/${totalQuestions}`;
  $("scorePreview").textContent = `Score: 0/${totalQuestions}`;

  $("answerInput").value = "";
  $("answerInput").focus();

  $("checkAnswerBtn").disabled = false;
  $("nextQuestionBtn").disabled = true;
  $("repeatLevelBtn").disabled = true;

  startTimer();
  showQuestion();
}

function showQuestion() {
  const level = TURBO_KETCHUP_LEVELS[currentLevelIndex];
  const q = level.questions[currentQuestionIndex];
  $("questionText").textContent = q.en;
  $("questionCounter").textContent = `Question: ${currentQuestionIndex + 1}/${totalQuestions}`;
  $("answerInput").value = "";
  $("answerInput").focus();
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("nextQuestionBtn").disabled = true;
}

function checkAnswer() {
  const level = TURBO_KETCHUP_LEVELS[currentLevelIndex];
  const q = level.questions[currentQuestionIndex];
  const userRaw = $("answerInput").value;
  const user = normalizeAnswer(userRaw);
  const correct = normalizeAnswer(q.es);

  if (!user) {
    $("feedback").textContent = "Type (or say) your answer first.";
    $("feedback").className = "feedback";
    $("answerInput").focus();
    return;
  }

  if (user === correct) {
    correctCount++;
    $("feedback").textContent = "✅ Correct! Well done.";
    $("feedback").className = "feedback correct";
  } else {
    $("feedback").textContent = `❌ Not quite. Correct answer: "${q.es}"`;
    $("feedback").className = "feedback incorrect";
  }

  $("scorePreview").textContent = `Score: ${correctCount}/${totalQuestions}`;

  $("checkAnswerBtn").disabled = true;
  $("nextQuestionBtn").disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;
  const level = TURBO_KETCHUP_LEVELS[currentLevelIndex];

  if (currentQuestionIndex >= level.questions.length) {
    endLevel();
  } else {
    $("checkAnswerBtn").disabled = false;
    showQuestion();
  }
}

function endLevel() {
  const timeSeconds = stopTimer();
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const msgParts = [
    `Level finished!`,
    `You got ${correctCount}/${totalQuestions} correct (${scorePercent}%).`,
    `Time: ${timeSeconds.toFixed(1)} seconds.`
  ];

  if (correctCount === totalQuestions) {
    msgParts.push("Perfect score – Santa is impressed. 🎅");
  } else if (correctCount >= Math.ceil(totalQuestions * 0.7)) {
    msgParts.push("Very solid! Try again for perfection.");
  } else {
    msgParts.push("Good effort. One more go – no excuses. 😉");
  }

  $("resultSummary").textContent = msgParts.join(" ");

  saveProgress({ scorePercent, timeSeconds });

  $("checkAnswerBtn").disabled = true;
  $("nextQuestionBtn").disabled = true;
  $("repeatLevelBtn").disabled = false;
}

// ------------------------------
// Read aloud & voice input
// ------------------------------

function initSpeechFeatures() {
  // Voice input
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      $("answerInput").value = transcript;
      $("answerInput").focus();
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
    };
  } else {
    console.warn("Speech recognition not supported in this browser.");
  }
}

function handleReadSpanish() {
  const level = TURBO_KETCHUP_LEVELS[currentLevelIndex];
  if (!level) return;
  const q = level.questions[currentQuestionIndex];
  if (!q) return;

  const utterance = new SpeechSynthesisUtterance(q.es);
  utterance.lang = "es-ES";
  speechSynthesis.speak(utterance);
}

function handleVoiceInput() {
  if (!recognition) {
    alert("Voice input is not supported in this browser. Try Chrome on a laptop.");
    return;
  }
  recognition.start();
}

// ------------------------------
// Init
// ------------------------------

function initKetchup() {
  populateLevelSelect();
  updateOverallProgressDisplay();
  initSpeechFeatures();

  $("startLevelBtn").addEventListener("click", startLevel);
  $("checkAnswerBtn").addEventListener("click", checkAnswer);
  $("nextQuestionBtn").addEventListener("click", nextQuestion);
  $("repeatLevelBtn").addEventListener("click", startLevel);
  $("readSpanishBtn").addEventListener("click", handleReadSpanish);
  $("voiceInputBtn").addEventListener("click", handleVoiceInput);

  // Allow Enter to check
  $("answerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !$("checkAnswerBtn").disabled) {
      checkAnswer();
    }
  });

  // Back button just a hint; real navigation handled by Jump Page
  $("backHomeHintBtn").addEventListener("click", () => {
    alert("Use your browser's Back button or the Jump Page link to return home.");
  });
}

document.addEventListener("DOMContentLoaded", initKetchup);
