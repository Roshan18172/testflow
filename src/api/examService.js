import api from "./axios";

/**
 * Service for exam/test-related API calls.
 * Backend wraps responses in { success, message, data }.
 * Each method throws on failure; callers should catch and use getErrorMessage().
 */
const examService = {
  /**
   * Get all exams (categories).
   * GET /api/v1/exams
   */
  getExams: async () => {
    const response = await api.get("/exams");
    return response.data.data;
  },

  /**
   * Get tests for a specific exam.
   * GET /api/v1/exams/:id/tests
   * @param {string} examId
   */
  getTestsByExam: async (examId) => {
    if (!examId) throw new Error("examId is required");
    const response = await api.get(`/exams/${examId}/tests`);
    return response.data.data;
  },

  /**
   * Get all tests.
   * GET /api/v1/tests
   * @param {object} params - Optional query params
   */
  getAllTests: async (params = {}) => {
    const response = await api.get("/tests", { params });
    return response.data.data;
  },

  /**
   * Get a single test by ID.
   * GET /api/v1/tests/:id
   * @param {string} testId
   */
  getTestById: async (testId) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.get(`/tests/${testId}`);
    return response.data.data;
  },

  /**
   * Start a test (creates a submission and returns questions).
   * POST /api/v1/tests/:id/start
   * @param {string} testId
   */
  startTest: async (testId) => {
    if (!testId) throw new Error("testId is required");
    const response = await api.post(`/tests/${testId}/start`);
    return response.data.data;
  },
};

export default examService;
