import { getSubjectActivityIds } from "../data/subjectsData";

const STORAGE_KEY = "temario-1basico-progress-v1";

function unique(values) {
  return [...new Set(values)];
}

function buildSubjectProgress(subject) {
  return {
    completedActivityIds: [],
    totalActivities: getSubjectActivityIds(subject).length,
    stars: 0,
  };
}

export function buildInitialProgress(subjects) {
  const bySubject = {};

  subjects.forEach((subject) => {
    bySubject[subject.id] = buildSubjectProgress(subject);
  });

  return {
    bySubject,
    lastUpdatedAt: null,
  };
}

export function loadProgress(subjects) {
  const initial = buildInitialProgress(subjects);

  if (typeof window === "undefined") {
    return initial;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return initial;
  }

  try {
    const parsed = JSON.parse(raw);
    const merged = {
      ...initial,
      bySubject: { ...initial.bySubject },
      lastUpdatedAt: parsed?.lastUpdatedAt ?? null,
    };

    subjects.forEach((subject) => {
      const validIds = new Set(getSubjectActivityIds(subject));
      const savedSubject = parsed?.bySubject?.[subject.id];
      const completedActivityIds = unique(savedSubject?.completedActivityIds ?? []).filter((id) =>
        validIds.has(id),
      );

      merged.bySubject[subject.id] = {
        completedActivityIds,
        totalActivities: validIds.size,
        stars: completedActivityIds.length,
      };
    });

    return merged;
  } catch (error) {
    return initial;
  }
}

export function saveProgress(progress) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(subjects) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }

  return buildInitialProgress(subjects);
}

export function markActivityCompleted(prevProgress, subjects, subjectId, activityId) {
  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) {
    return prevProgress;
  }

  const validIds = new Set(getSubjectActivityIds(subject));

  if (!validIds.has(activityId)) {
    return prevProgress;
  }

  const subjectProgress = prevProgress.bySubject[subjectId];

  if (!subjectProgress) {
    return prevProgress;
  }

  if (subjectProgress.completedActivityIds.includes(activityId)) {
    return prevProgress;
  }

  const completedActivityIds = [...subjectProgress.completedActivityIds, activityId];

  return {
    ...prevProgress,
    bySubject: {
      ...prevProgress.bySubject,
      [subjectId]: {
        ...subjectProgress,
        completedActivityIds,
        stars: completedActivityIds.length,
      },
    },
    lastUpdatedAt: new Date().toISOString(),
  };
}
