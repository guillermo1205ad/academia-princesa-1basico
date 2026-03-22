import { useEffect, useMemo, useState } from "react";
import HomeScreen from "./components/HomeScreen";
import MainMenu from "./components/MainMenu";
import SubjectScreen from "./components/SubjectScreen";
import { getGlobalTotalActivities, getSubjectActivityIds, subjectsData } from "./data/subjectsData";
import {
  loadProgress,
  markActivityCompleted,
  resetProgress,
  saveProgress,
} from "./utils/storage";

function calculatePercent(completed, total) {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

function App() {
  const [view, setView] = useState("home");
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [progress, setProgress] = useState(() => loadProgress(subjectsData));

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const subjectStats = useMemo(() => {
    const statsBySubject = {};

    subjectsData.forEach((subject) => {
      const subjectIds = getSubjectActivityIds(subject);
      const completedIds = progress.bySubject[subject.id]?.completedActivityIds ?? [];
      const completed = subjectIds.filter((id) => completedIds.includes(id)).length;
      const total = subjectIds.length;

      statsBySubject[subject.id] = {
        completed,
        total,
        stars: completed,
        percent: calculatePercent(completed, total),
      };
    });

    return statsBySubject;
  }, [progress]);

  const globalStats = useMemo(() => {
    const total = getGlobalTotalActivities(subjectsData);
    const completed = Object.values(subjectStats).reduce((sum, stats) => sum + stats.completed, 0);

    return {
      total,
      completed,
      stars: completed,
      percent: calculatePercent(completed, total),
    };
  }, [subjectStats]);

  const activeSubject = subjectsData.find((subject) => subject.id === activeSubjectId) ?? null;

  function handleOpenSubject(subjectId) {
    setActiveSubjectId(subjectId);
    setView("subject");
  }

  function handleBackToMenu() {
    setActiveSubjectId(null);
    setView("menu");
  }

  function handleCompleteActivity(subjectId, activityId) {
    setProgress((prevProgress) =>
      markActivityCompleted(prevProgress, subjectsData, subjectId, activityId),
    );
  }

  function isActivityDone(subjectId, activityId) {
    return progress.bySubject[subjectId]?.completedActivityIds.includes(activityId) ?? false;
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      "¿Quieres reiniciar todo el progreso? Se borrarán estrellas y actividades completadas.",
    );

    if (!confirmed) {
      return;
    }

    setProgress(resetProgress(subjectsData));
    setView("menu");
    setActiveSubjectId(null);
  }

  return (
    <main className={`app-shell ${activeSubject ? `theme-${activeSubject.accent}` : ""}`}>
      {view === "home" ? <HomeScreen onStart={() => setView("menu")} /> : null}

      {view === "menu" ? (
        <MainMenu
          subjects={subjectsData}
          subjectStats={subjectStats}
          globalStats={globalStats}
          onOpenSubject={handleOpenSubject}
          onResetProgress={handleResetProgress}
        />
      ) : null}

      {view === "subject" && activeSubject ? (
        <SubjectScreen
          subject={activeSubject}
          stats={subjectStats[activeSubject.id]}
          onBack={handleBackToMenu}
          onCompleteActivity={handleCompleteActivity}
          isActivityDone={isActivityDone}
        />
      ) : null}
    </main>
  );
}

export default App;
