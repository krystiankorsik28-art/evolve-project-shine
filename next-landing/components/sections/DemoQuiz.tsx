"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Clock, Award } from "lucide-react";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Jakie jest zadanie AI Tutora w EduNex?",
    options: [
      { text: "Generowanie egzaminów", correct: false },
      { text: "Personalizowana nauka dla każdego ucznia", correct: true },
      { text: "Tylko ocenianie prac", correct: false },
      { text: "Wysyłanie emaili", correct: false },
    ],
    explanation: "AI Tutor w EduNex dostosowuje się do tempa i stylu nauki każdego ucznia, oferując personalizowaną edukację 24/7.",
  },
  {
    id: 2,
    question: "Co wyróżnia EduNex na rynku?",
    options: [
      { text: "Integracja zaawansowanej AI z nauką", correct: true },
      { text: "Tylko wysyłanie ocen emailem", correct: false },
      { text: "Brak wsparcia technicznego", correct: false },
      { text: "Tylko dla liceów", correct: false },
    ],
    explanation: "EduNex łączy zaawansowaną technologię AI z edukacją, oferując automatyczne generowanie egzaminów, ocenianie i personalizowany tutoring.",
  },
  {
    id: 3,
    question: "Ile uczniów może mieć nauczyciel w planie Teacher Pro?",
    options: [
      { text: "Do 35 uczniów", correct: false },
      { text: "Do 60 uczniów", correct: true },
      { text: "Do 100 uczniów", correct: false },
      { text: "Nieograniczona liczba", correct: false },
    ],
    explanation: "Plan Teacher Pro wspiera do 60 uczniów z dostępem do wszystkich AI features i do 3 klas.",
  },
  {
    id: 4,
    question: "Czy EduNex integruje się z innymi platformami?",
    options: [
      { text: "Nie, działa w izolacji", correct: false },
      { text: "Tylko z Google Classroom", correct: false },
      { text: "Tak, w planie School i Enterprise", correct: true },
      { text: "Tylko z Moodle", correct: false },
    ],
    explanation: "Plan School i Enterprise oferuje integrację LMS, co pozwala na połączenie EduNex z istniejącymi systemami edukacyjnymi.",
  },
  {
    id: 5,
    question: "Jak długo zajmuje AI generowanie egzaminu?",
    options: [
      { text: "Kilka minut", correct: true },
      { text: "Kilka godzin", correct: false },
      { text: "Cały dzień", correct: false },
      { text: "Niesamowicie długo", correct: false },
    ],
    explanation: "AI generator EduNex tworzy pełnoprawne egzaminy w kilka minut na podstawie wybranego materiału i poziomu trudności.",
  },
];

interface Answer {
  questionId: number;
  selectedIndex: number;
}

export function DemoQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === currentQ.id);
  const isAnswered = currentAnswer !== undefined;

  const score = useMemo(() => {
    return answers.reduce((acc, answer) => {
      const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
      if (question?.options[answer.selectedIndex].correct) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [answers]);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setAnswers([...answers, { questionId: currentQ.id, selectedIndex: index }]);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  return (
    <section className="relative py-24 sm:py-32 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-4">
            <Sparkles className="w-3 h-3" />
            Demo Quiz
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Test Your Knowledge</h2>
          <p className="mt-3 text-sm text-white/40">Odkryj jak EduNex zmienia edukację. Zagraj w quiz i dowiedz się więcej!</p>
        </motion.div>

        {/* Quiz Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={`quiz-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white/60">
                      Pytanie <span className="text-cyan-400 font-semibold">{currentQuestion + 1}</span> z {QUIZ_QUESTIONS.length}
                    </div>
                  </div>
                  <div className="h-1 flex-1 mx-4 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <div className="p-8 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-sm">
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">{currentQ.question}</h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => {
                      const selected = currentAnswer?.selectedIndex === index;
                      const isCorrect = option.correct;
                      const showResult = isAnswered;
                      const isWrong = selected && !isCorrect && showResult;
                      const isCorrectSelected = selected && isCorrect && showResult;

                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleSelectAnswer(index)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3 ${
                            !showResult
                              ? "border-white/[0.08] hover:border-cyan-400/50 hover:bg-white/[0.02] cursor-pointer"
                              : isCorrectSelected
                                ? "border-green-500/50 bg-green-500/[0.08]"
                                : isWrong
                                  ? "border-red-500/50 bg-red-500/[0.08]"
                                  : selected
                                    ? "border-white/[0.08]"
                                    : "border-white/[0.08] opacity-50"
                          }`}
                          disabled={isAnswered}
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.99 } : {}}
                        >
                          <div className="flex-1">
                            <div className={`${selected ? (isCorrect ? "text-green-400" : "text-red-400") : "text-white/70"}`}>
                              {option.text}
                            </div>
                          </div>
                          {showResult && isCorrectSelected && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
                          {showResult && isWrong && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-lg border-l-4 ${
                        currentAnswer?.selectedIndex === currentQ.options.findIndex((o) => o.correct)
                          ? "border-l-green-500 bg-green-500/[0.05]"
                          : "border-l-blue-500 bg-blue-500/[0.05]"
                      }`}
                    >
                      <p className="text-sm text-white/70">{currentQ.explanation}</p>
                    </motion.div>
                  )}
                </div>

                {/* Next Button */}
                {isAnswered && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNext}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestion === QUIZ_QUESTIONS.length - 1 ? "Zobacz wyniki" : "Następne pytanie"} <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              /* Results Screen */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Score Circle */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-40 h-40 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl" />
                    <div className="relative flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{percentage}%</div>
                      <div className="text-sm text-white/60 mt-2">
                        {score} z {QUIZ_QUESTIONS.length}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Result Message */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    {percentage >= 80
                      ? "🎉 Świetnie!"
                      : percentage >= 60
                        ? "👍 Niezły wynik!"
                        : "💡 Wciąż się uczysz!"}
                  </h3>
                  <p className="text-white/60">
                    {percentage >= 80
                      ? "Masz doskonałą wiedzę na temat EduNex!"
                      : percentage >= 60
                        ? "Znasz już wiele o platformie EduNex!"
                        : "Poznaj więcej możliwości platformy EduNex!"}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center"
                  >
                    <Award className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{score}</div>
                    <div className="text-xs text-white/50">Poprawne</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center"
                  >
                    <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{QUIZ_QUESTIONS.length - score}</div>
                    <div className="text-xs text-white/50">Do nauki</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center"
                  >
                    <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{percentage}%</div>
                    <div className="text-xs text-white/50">Wynik</div>
                  </motion.div>
                </div>

                {/* CTA */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleRestart}
                    className="py-3 px-4 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    Powtórz Quiz
                  </motion.button>
                  <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    href="/auth/register"
                    className="py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    Zacznij darmowo <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
