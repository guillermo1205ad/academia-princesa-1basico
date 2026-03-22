function MainMenu({ subjects, subjectStats, globalStats, onOpenSubject, onResetProgress }) {
  return (
    <section className="menu-screen">
      <header className="menu-header">
        <div>
          <h1>Elige un reino de aprendizaje</h1>
          <p>Gana estrellas mágicas y completa cada misión.</p>
        </div>

        <button className="ghost-button" onClick={onResetProgress}>
          Reiniciar progreso
        </button>
      </header>

      <article className="global-progress-card">
        <div className="global-progress-head">
          <h2>Progreso global</h2>
          <span className="stars-chip">⭐ {globalStats.stars}</span>
        </div>
        <p>
          {globalStats.completed} de {globalStats.total} actividades completadas
        </p>
        <div className="progress-track" aria-label="Progreso global">
          <div className="progress-fill" style={{ width: `${globalStats.percent}%` }} />
        </div>
      </article>

      <div className="subject-grid">
        {subjects.map((subject) => {
          const stats = subjectStats[subject.id];

          return (
            <button
              key={subject.id}
              className={`subject-card accent-${subject.accent}`}
              onClick={() => onOpenSubject(subject.id)}
            >
              <div className="subject-card-head">
                <span className="subject-emoji" aria-hidden="true">
                  {subject.emoji}
                </span>
                <div>
                  <h3>{subject.name}</h3>
                  <p>{subject.description}</p>
                </div>
              </div>

              <div className="subject-progress">
                <div className="subject-progress-row">
                  <span>
                    {stats.completed}/{stats.total} actividades
                  </span>
                  <strong>{stats.percent}%</strong>
                </div>
                <div className="progress-track small">
                  <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
                </div>
                <span className="stars-inline">⭐ {stats.stars}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MainMenu;
