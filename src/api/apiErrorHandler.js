/**
 * Centralized API error handling utilities.
 * Extracts user-friendly messages from backend and network errors.
 */

/**
 * Extract a human-readable error message from any API error.
 * @param {unknown} error - The caught error from an API call
 * @param {string} fallback - Fallback message if none can be extracted
 * @returns {string} A user-friendly error message
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  // Axios error with response from backend
  if (error?.response?.data) {
    const data = error.response.data;

    // Backend returns { success: false, message: "...", errors: [...] }
    if (data.message) {
      return data.message;
    }

    // Backend validation errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join(", ");
    }

    // HTTP status based fallbacks
    const status = error.response.status;
    if (status === 404) return "The requested resource was not found.";
    if (status === 409) return "This action conflicts with the current state. Please refresh and try again.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status >= 500) return "Server error. Our team has been notified. Please try again later.";
  }

  // Network error (no response received)
  if (error?.request) {
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check your connection and try again.";
    }
    return "Unable to reach the server. Please check your internet connection.";
  }

  // Something else went wrong while setting up the request
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

/**
 * Check if the error indicates the backend is unreachable.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return !error?.response && error?.request;
}

/**
 * Check if the error is a timeout.
 * @param {unknown} error
 * @returns {boolean}
 */
export function isTimeoutError(error) {
  return error?.code === "ECONNABORTED";
}

/**
 * Wraps an async API call with consistent error handling.
 * Returns { data, error } where error is a user-friendly string or null.
 *
 * @param {Function} apiCall - Async function that performs the API request
 * @param {string} fallbackMsg - Fallback error message
 * @returns {Promise<{data: any|null, error: string|null}>}
 */
export async function safeApiCall(apiCall, fallbackMsg = "Something went wrong.") {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (err) {
    const message = getErrorMessage(err, fallbackMsg);
    console.error(`[API Error] ${fallbackMsg}:`, err);
    return { data: null, error: message };
  }
}