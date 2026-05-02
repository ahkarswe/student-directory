const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "ucms_auth_token";

export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem("ucms_auth_username");
  const role = localStorage.getItem("ucms_auth_role");

  return token ? { token, username, role } : null;
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("ucms_auth_username");
  localStorage.removeItem("ucms_auth_role");
};

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

const request = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type");
  const body = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
};

export const login = async (credentials) => {
  const response = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem("ucms_auth_username", response.user.username);
  localStorage.setItem("ucms_auth_role", response.user.role);

  return response.user;
};

export const getUsers = () => request("/auth/users");

export const createUser = (user) =>
  request("/auth/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  export const deleteUser = async (id) => {
  const response = await fetch(`/api/auth/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getStoredAuth()?.token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }

  return response.json();
};

export const getStudents = (params) => {
  const query = buildQueryString(params);
  return request(`/students${query ? `?${query}` : ""}`);
};

export const getStudent = (id) => request(`/students/${id}`);

export const createStudent = (formData) =>
  request("/students", {
    method: "POST",
    body: formData
  });

export const updateStudent = (id, formData) =>
  request(`/students/${id}`, {
    method: "PUT",
    body: formData
  });

export const deleteStudent = (id) =>
  request(`/students/${id}`, {
    method: "DELETE"
  });
