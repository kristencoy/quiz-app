const question = document.getElementById("question");
const progressText = document.getElementById("progress-text");
const progressBarFull = document.getElementById("progress-bar-full");
const scoreText = document.getElementById("score");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const loader = document.getElementById("loader");
const game = document.getElementById("game");
const nextBtn = document.getElementById("next-btn");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

fetch("https://opentdb.com/api.php?amount=30&category=18&type=multiple")
  .then((res) => res.json())
  .then((loadedQuestions) => {
    questions = loadedQuestions.results.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };
      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion[index + 1] = choice;
      });

      return formattedQuestion;
    });
    game.classList.remove("hidden");
    loader.classList.add("hidden");
    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

// constants

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 20;

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    //go to the end page
    return window.location.assign("/end.html");
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  //update the progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    console.log(number);
    choice.innerHTML = currentQuestion[number];
  });

  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

choices.forEach((choice, index) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;

    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
    if (classToApply === "correct") {
      incrementScore(CORRECT_BONUS);
    }

    const correctAnswer = choices[currentQuestion.answer - 1];

    selectedChoice.parentElement.classList.add(classToApply);
    correctAnswer.parentElement.classList.add("correct");

    const nextClickHandler = () => {
      selectedChoice.parentElement.classList.remove(classToApply);
      correctAnswer.parentElement.classList.remove("correct");
      getNewQuestion();
    };

    nextBtn.addEventListener("click", () => {
      nextClickHandler();
    });

    // setTimeout(() => {
    //   selectedChoice.parentElement.classList.remove(classToApply);
    // }, 1500);
  });
});

incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};
