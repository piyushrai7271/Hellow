const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔁 refresh token helper
const refreshToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return false;
  }
};

export const apiFetch = async (endpoint, options = {}, retry = true) => {
  try {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
      ...options,
    });

    // 🔥 If token expired → try refresh
    if (res.status === 401 && retry) {
      const refreshed = await refreshToken();

      if (refreshed) {
        // 🔁 retry original request (only once)
        return apiFetch(endpoint, options, false);
      } else {
        // ❌ refresh failed → logout
        window.location.href = "/login";
        return { success: false };
      }
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("API Error:", error);
    return { success: false };
  }
};







// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const apiFetch = async (endpoint, options = {}) => {
//   try {
//     const res = await fetch(`${BASE_URL}${endpoint}`, {
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       ...options,
//     });

//     const data = await res.json();

//     return data;
//   } catch (error) {
//     console.error("API Error:", error);
//     return { success: false };
//   }
// };