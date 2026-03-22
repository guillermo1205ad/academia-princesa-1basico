import { useEffect, useMemo, useState } from "react";
import ActivityRenderer from "./ActivityRenderer";

const TABS = [
  { id: "learn", label: "Aprender" },
  { id: "practice", label: "Practicar" },
  { id: "play", label: "Jugar" },
  { id: "review", label: "Repaso final" },
];

function SubjectScreen({ subject, stats, onBack, onCompleteActivity, isActivityDone }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [sectionIndex, setSectionIndex] = useState({
    practice: 0,
    play: 0,
    review: 0,
  });

  useEffect(() => {
    setActiveTab("learn");
    setSectionIndex({
      practice: 0,
      play: 0,
      review: 0,
    });
  }, [subject.id]);

  const currentActivities = useMemo(() => {
    if (activeTab === "learn") {
      return [];
    }

    return subject.sections[activeTab];
  }, [activeTab, subject.sections]);

  const currentActivityIndex = sectionIndex[activeTab] ?? 0;
  const currentActivity = currentActivities[currentActivityIndex];

  const sectionCompleted = useMemo(() => {
    if (activeTab === "learn") {
      return 0;
    }

    return currentActivities.filter((activity) => isActivityDone(subject.id, activity.id)).length;
  }, [activeTab, currentActivities, isActivityDone, subject.id]);

  function moveActivity(step) {
    setSectionIndex((prev) => {
      const current = prev[activeTab] ?? 0;
      const nextIndex = Math.min(Math.max(current + step, 0), currentActivities.length - 1);

      return {
        ...prev,
        [activeTab]: nextIndex,
      };
    });
  }

  return (
    <section className="subject-screen">
      <header className={`subject-header accent-${subject.accent}`}>
        <button className="ghost-button" onClick={onBack}>
          ← Volver al menú
        </button>
        <div className="subject-header-title">
          <h1>
            {subject.emoji} {subject.name}
          </h1>
          <p>{subject.description}</p>
        </div>
        <span className="stars-chip">⭐ {stats.stars}</span>
      </header>

      <div className="subject-progress-panel">
        <div className="subject-progress-row">
          <span>
            {stats.completed}/{stats.total} actividades completadas
          </span>
          <strong>{stats.percent}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
        </div>
      </div>

      <nav className="tab-list" aria-label="Secciones de la asignatura">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "learn" ? (
        <div className="learn-grid">
          {subject.learnCards.map((card) => (
            <article key={card.title} className="learn-card">
              <h3>{card.title}</h3>
              <p className="learn-visual">{card.visual}</p>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="activity-section">
          <div className="activity-section-header">
            <p>
              Actividad {currentActivityIndex + 1} de {currentActivities.length}
            </p>
            <p>
              Completadas en esta sección: {sectionCompleted}/{currentActivities.length}
            </p>
          </div>

          <ActivityRenderer
            key={currentActivity.id}
            activity={currentActivity}
            isCompleted={isActivityDone(subject.id, currentActivity.id)}
            onComplete={(activityId) => onCompleteActivity(subject.id, activityId)}
          />

          <div className="activity-nav">
            <button
              type="button"
              className="secondary-button"
              onClick={() => moveActivity(-1)}
              disabled={currentActivityIndex === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => moveActivity(1)}
              disabled={currentActivityIndex === currentActivities.length - 1}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default SubjectScreen;
