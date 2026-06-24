import api from "./axios";

/**
 * Service for test submission and result-related API calls.
 * Backend wraps responses in { success, message, data }.
 * Each method throws on failure; callers should catch and use getErrorMessage().
 */
const submissionService = {
  /**
   * Submit a test with answers.
   * POST /api/v1/tests/:id/submit
   * @param {string} testId
   * @param {object} payload - { submissionId, answers: [{ questionId, selectedOptionId }] }
   */
  submitTest: async (testId, payload) => {
    if (!testId) throw new Error("testId is required");
    if (!payload?.submissionId) throw new Error("submissionId is required in payload");
    if (!Array.isArray(payload?.answers)) throw new Error("answers array is required in payload");

    const response = await api.post(`/tests/${testId}/submit`, payload);
    return response.data.data;
  },

  /**
   * Get the result of a submission.
   * GET /api/v1/submissions/:id/result
   * @param {string} submissionId
   */
  getResult: async (submissionId) => {
    if (!submissionId) throw new Error("submissionId is required");
    const response = await api.get(`/submissions/${submissionId}/result`);
    return response.data.data;
  },
};

export default submissionService;
