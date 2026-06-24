import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import examService from "../api/examService";
import { mapExamToCategory, mapTestToFrontend } from "../api/dataMapper";
import { getErrorMessage } from "../api/apiErrorHandler";

const difficulties = ["All Difficulty", "Easy", "Medium", "Hard"];
const durations = ["All Duration", "< 60 Mins", "60-120 Mins", "> 120 Mins"];

export default function Tests() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All Categories");
  const [diffFilter, setDiffFilter] = useState("All Difficulty");
  const [durFilter, setDurFilter] = useState("All Duration");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(4);

  useEffect(() => {
    document.title = "Tests - SetuLearn";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [exams, allTests] = await Promise.all([
          examService.getExams(),
          examService.getAllTests(),
        ]);

        setCategories(exams.map((e) => mapExamToCategory(e)));

        const mapped = allTests.map((t) =>
          mapTestToFrontend(t, t.exam?.name || "")
        );
        setTests(mapped);
      } catch (err) {
        const message = getErrorMessage(err, "Could not load tests. Please ensure the backend is running.");
        console.error("Failed to fetch tests:", err);
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = tests.filter((t) => {
    const matchCat = catFilter === "All Categories" || t.category === catFilter;
    const matchDiff = diffFilter === "All Difficulty" || t.difficulty === diffFilter;
    const matchDur =
      durFilter === "All Duration" ||
      (durFilter === "< 60 Mins" && t.duration < 60) ||
      (durFilter === "60-120 Mins" && t.duration >= 60 && t.duration <= 120) ||
      (durFilter === "> 120 Mins" && t.duration > 120);
    const matchSearch =
      search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.exam.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchDur && matchSearch;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Tests</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⏳</div>
          <h3>Loading tests...</h3>
          <p>Please wait while we fetch the available tests.</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (fetchError) {
    return (
      <div className="tests-page">
        <div className="tests-header">
          <h1>All Tests</h1>
        </div>
        <div className="empty-state" style={{ padding: "80px 20px" }}>
          <div className="empty-icon">⚠️</div>
          <h3>Could not load tests</h3>
          <p style={{ maxWidth: 500, margin: "0 auto 20px" }}>{fetchError}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tests-page">
      <div className="tests-header">
        <h1>All Tests</h1>
        <p>{filtered.length} tests available</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setVisible(4); }}>
            <option>All Categories</option>
            {categories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>

          <select value={diffFilter} onChange={(e) => { setDiffFilter(e.target.value); setVisible(4); }}>
            {difficulties.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select value={durFilter} onChange={(e) => { setDurFilter(e.target.value); setVisible(4); }}>
            {durations.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search tests..." value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(4); }} />
        </div>
      </div>

      {/* Tests List */}
      <div className="tests-list-page">
        {filtered.slice(0, visible).map((test) => {
          const catColor = categories.find((c) => c.name === test.category)?.color || "#6C63FF";
          return (
            <div key={test.id} className="test-row">
              <div className="tr-left">
                <div className="tr-icon" style={{ background: catColor }}>
                  {test.exam.slice(0, 3).toUpperCase()}
                </div>
                <div className="tr-info">
                  <div className="tr-title">{test.title}</div>
                  <div className="tr-meta">
                    <span className="tr-cat">{test.category}</span>
                    <span>•</span>
                    <span>{test.questions} Questions</span>
                    <span>•</span>
                    <span>{test.duration} Mins</span>
                    <span>•</span>
                    <span className={`diff-badge ${test.difficulty.toLowerCase()}`}>{test.difficulty}</span>
                  </div>
                  <div className="tr-sub-info">
                    <span>📊 {test.attemptedBy.toLocaleString()} attempted</span>
                    <span>•</span>
                    <span>Avg Score: {test.avgScore}%</span>
                    <span>•</span>
                    <span>Marks: {test.marks}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary"
                onClick={() => navigate("/instructions", { state: { test, mode: "timed" } })} >
                Start Test
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No tests found</h3>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={() => setVisible((v) => v + 4)}>
            Load More Tests
          </button>
        </div>
      )}
    </div>
  );
}
