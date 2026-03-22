import { useEffect, useMemo, useState } from "react";

const DEFAULT_SUCCESS = "¡Muy bien!";
const DEFAULT_ERROR = "Inténtalo otra vez.";

const CHOICE_TYPES = new Set(["singleChoice", "count", "compare", "order"]);

function normalizeOption(option) {
  if (typeof option === "string") {
    return { label: option, speak: option };
  }

  return {
    label: option.label,
    speak: option.speak ?? option.label,
  };
}

function useSpeech() {
  function speak(text, lang = "es-CL") {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }

  return { speak };
}

function ChoiceOptions({
  options,
  selectedIndex,
  onSelect,
  enableSpeech = false,
  speechLang = "es-CL",
  onSpeak,
}) {
  return (
    <div className="options-grid">
      {options.map((option, index) => {
        const normalized = normalizeOption(option);

        return (
          <div className="option-row" key={`${normalized.label}-${index}`}>
            <button
              type="button"
              className={`option-button ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => onSelect(index)}
            >
              {normalized.label}
            </button>
            {enableSpeech ? (
              <button
                type="button"
                className="audio-button"
                aria-label={`Escuchar ${normalized.label}`}
                onClick={() => onSpeak(normalized.speak, speechLang)}
              >
                🔊
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ActivityRenderer({ activity, isCompleted, onComplete }) {
  const [feedback, setFeedback] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [matchAnswers, setMatchAnswers] = useState({});
  const [readingIndex, setReadingIndex] = useState(0);
  const [readingCanAdvance, setReadingCanAdvance] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [seenCards, setSeenCards] = useState({});
  const [flashcardAnswer, setFlashcardAnswer] = useState(null);

  const { speak } = useSpeech();

  useEffect(() => {
    setFeedback(null);
    setSelectedChoice(null);
    setMatchAnswers({});
    setReadingIndex(0);
    setReadingCanAdvance(false);
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    setSeenCards(activity.type === "flashcards" ? { 0: true } : {});
    setFlashcardAnswer(null);
  }, [activity.id, activity.type]);

  useEffect(() => {
    if (activity.type === "flashcards") {
      setSeenCards((prev) => ({ ...prev, [flashcardIndex]: true }));
    }
  }, [activity.type, flashcardIndex]);

  const successText = activity.successMessage ?? DEFAULT_SUCCESS;
  const errorText = activity.errorMessage ?? DEFAULT_ERROR;

  const readingQuestion = useMemo(() => {
    if (activity.type !== "reading") {
      return null;
    }

    return activity.questions[readingIndex];
  }, [activity, readingIndex]);

  const flashcardsSeenAll =
    activity.type === "flashcards" &&
    activity.cards.every((_, index) => Boolean(seenCards[index]));

  function setSuccess(message = successText) {
    setFeedback({ kind: "success", text: message });
  }

  function setError(message = errorText) {
    setFeedback({ kind: "error", text: message });
  }

  function completeActivity() {
    onComplete(activity.id);
  }

  function handleChoice(index) {
    setSelectedChoice(index);

    if (index === activity.correctIndex) {
      setSuccess();
      completeActivity();
      return;
    }

    setError();
  }

  function handleMatchChoice(rowIndex, optionIndex) {
    setMatchAnswers((prev) => ({ ...prev, [rowIndex]: optionIndex }));
    setFeedback(null);
  }

  function checkMatchAnswers() {
    const allRowsAnswered = activity.rows.every((_, rowIndex) =>
      Number.isInteger(matchAnswers[rowIndex]),
    );

    if (!allRowsAnswered) {
      setError("Completa todas las filas para revisar.");
      return;
    }

    const allCorrect = activity.rows.every(
      (row, rowIndex) => row.correctIndex === matchAnswers[rowIndex],
    );

    if (allCorrect) {
      setSuccess();
      completeActivity();
      return;
    }

    setError();
  }

  function handleReadingChoice(index) {
    if (!readingQuestion) {
      return;
    }

    if (index === readingQuestion.correctIndex) {
      const isLast = readingIndex === activity.questions.length - 1;

      if (isLast) {
        setSuccess();
        completeActivity();
      } else {
        setSuccess("¡Muy bien! Ahora pasa a la siguiente pregunta.");
        setReadingCanAdvance(true);
      }
      return;
    }

    setError();
  }

  function goToNextReadingQuestion() {
    setReadingIndex((prev) => prev + 1);
    setReadingCanAdvance(false);
    setFeedback(null);
  }

  function handleFlashcardCheck(index) {
    setFlashcardAnswer(index);

    if (!activity.checkQuestion) {
      setSuccess();
      completeActivity();
      return;
    }

    if (index === activity.checkQuestion.correctIndex) {
      setSuccess();
      completeActivity();
      return;
    }

    setError();
  }

  function renderActivityVisual() {
    if (activity.type === "count") {
      return (
        <div className="emoji-grid">
          {activity.items.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      );
    }

    if (activity.type === "compare") {
      return (
        <div className="compare-box">
          <span>{activity.leftValue}</span>
          <span className="compare-sign">?</span>
          <span>{activity.rightValue}</span>
        </div>
      );
    }

    if (activity.type === "order") {
      return (
        <div className="sequence-box">
          {activity.numbers.map((number, index) => (
            <span key={`${number}-${index}`} className="sequence-chip">
              {number}
            </span>
          ))}
        </div>
      );
    }

    return null;
  }

  function renderFeedback() {
    if (!feedback) {
      return null;
    }

    return <p className={`feedback ${feedback.kind}`}>{feedback.text}</p>;
  }

  function renderChoiceActivity() {
    return (
      <>
        {renderActivityVisual()}
        <ChoiceOptions
          options={activity.options}
          selectedIndex={selectedChoice}
          onSelect={handleChoice}
          enableSpeech={activity.enableSpeech}
          speechLang={activity.speechLang}
          onSpeak={speak}
        />
      </>
    );
  }

  function renderMatchActivity() {
    return (
      <div className="match-list">
        {activity.rows.map((row, rowIndex) => (
          <div className="match-row" key={`${row.left}-${rowIndex}`}>
            <h4>{row.left}</h4>
            <div className="match-options">
              {row.options.map((option, optionIndex) => (
                <button
                  type="button"
                  key={`${option}-${optionIndex}`}
                  className={`mini-option ${
                    matchAnswers[rowIndex] === optionIndex ? "selected" : ""
                  }`}
                  onClick={() => handleMatchChoice(rowIndex, optionIndex)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className="primary-button" onClick={checkMatchAnswers}>
          Revisar respuestas
        </button>
      </div>
    );
  }

  function renderReadingActivity() {
    return (
      <div className="reading-box">
        <div className="story-card">
          <h4>{activity.storyTitle}</h4>
          <p>{activity.storyText}</p>
        </div>

        <div className="reading-question">
          <p>
            Pregunta {readingIndex + 1} de {activity.questions.length}
          </p>
          <h4>{readingQuestion.prompt}</h4>
          <ChoiceOptions
            options={readingQuestion.options}
            selectedIndex={null}
            onSelect={handleReadingChoice}
          />
          {readingCanAdvance ? (
            <button type="button" className="primary-button" onClick={goToNextReadingQuestion}>
              Siguiente pregunta
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function renderFlashcardActivity() {
    const currentCard = activity.cards[flashcardIndex];

    return (
      <div className="flashcard-wrap">
        <div className={`flashcard ${flashcardFlipped ? "flipped" : ""}`}>
          <span className="flashcard-emoji">{currentCard.emoji}</span>
          <h4>{flashcardFlipped ? currentCard.back : currentCard.front}</h4>
        </div>

        <div className="flashcard-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
            disabled={flashcardIndex === 0}
          >
            Anterior
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setFlashcardFlipped((prev) => !prev)}
          >
            {flashcardFlipped ? "Ver frente" : "Voltear"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setFlashcardIndex((prev) => Math.min(activity.cards.length - 1, prev + 1))
            }
            disabled={flashcardIndex === activity.cards.length - 1}
          >
            Siguiente
          </button>
          <button
            type="button"
            className="audio-button"
            aria-label="Escuchar palabra"
            onClick={() => speak(currentCard.front, activity.speechLang ?? "en-US")}
          >
            🔊
          </button>
        </div>

        <p className="flashcard-counter">
          Tarjeta {flashcardIndex + 1} de {activity.cards.length}
        </p>

        {flashcardsSeenAll && activity.checkQuestion ? (
          <div className="flashcard-check">
            <h4>{activity.checkQuestion.prompt}</h4>
            <ChoiceOptions
              options={activity.checkQuestion.options}
              selectedIndex={flashcardAnswer}
              onSelect={handleFlashcardCheck}
            />
          </div>
        ) : null}

        {flashcardsSeenAll && !activity.checkQuestion ? (
          <button type="button" className="primary-button" onClick={() => handleFlashcardCheck(0)}>
            Terminé las tarjetas
          </button>
        ) : null}
      </div>
    );
  }

  function renderContent() {
    if (CHOICE_TYPES.has(activity.type)) {
      return renderChoiceActivity();
    }

    if (activity.type === "match") {
      return renderMatchActivity();
    }

    if (activity.type === "reading") {
      return renderReadingActivity();
    }

    if (activity.type === "flashcards") {
      return renderFlashcardActivity();
    }

    return <p>Tipo de actividad no soportado.</p>;
  }

  return (
    <article className="activity-card">
      <div className="activity-head">
        <h3>{activity.title}</h3>
        {isCompleted ? <span className="activity-done">⭐ Completada</span> : null}
      </div>

      {activity.prompt ? <p className="activity-prompt">{activity.prompt}</p> : null}
      {renderContent()}
      {renderFeedback()}
    </article>
  );
}

export default ActivityRenderer;
