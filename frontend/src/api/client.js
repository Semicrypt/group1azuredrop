import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured."
  );
}

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "azuredrop_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem(
        "azuredrop_token"
      )
    ) {
      localStorage.removeItem(
        "azuredrop_token"
      );

      localStorage.removeItem(
        "azuredrop_user"
      );
    }

    return Promise.reject(error);
  }
);

export default api;