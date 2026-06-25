import { useLocation, useNavigate } from "react-router-dom";

export default function Solutions() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Destructure 'questions' directly from state
  const { test, answers = {}, questions = [] } = location.state || {};

  // 2. Guard clause: check if questions exist
  if (!test || !questions || questions.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Solutions Found</h2>
        <button className="btn-primary" onClick={() => navigate("/tests")} > Browse Tests </button>
      </div>
    );
  }
  console.log("Solutions Page State:", { test, answers, questions });
  document.title = `${test.title || "Exam"} Solutions - SetuLearn`;

  return (
    <div className="solution-page">
      <div className="solution-header">
        <button className="btn-outline" onClick={() => navigate(-1)} > ← Back </button>
        <h1>{test.title || "Exam"} - Solutions</h1>
      </div>

      {/* 3. Map over the 'questions' array directly */}
      {questions.map((q, index) => {
        const userSelectedId = answers[q.id];

        return (
          <div key={q.id} className="solution-card">
            <h3 className="solution-question">
              Q{index + 1}. {q.text}
            </h3>

            <div className="solution-options">
              {q.options.map((opt) => {

                // FIX: Coerce both to String to avoid type mismatch (e.g., 1 vs "1")
                const isCorrect = String(opt.id) === String(q.correct);
                const isSelected = String(opt.id) === String(userSelectedId);

                let className = "option-item";
                if (isCorrect) className += " correct-answer";
                else if (isSelected && !isCorrect) className += " wrong-answer";

                return (
                  <div key={opt.id} className={className}>
                    {opt.text}
                    {isCorrect && <span className="correct-badge">✓ Correct</span>}
                    {isSelected && !isCorrect && <span className="wrong-badge">✗ Your Answer</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}