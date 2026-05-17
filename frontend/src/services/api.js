const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_STATE_KEY = "ucms_auth_state";
const LEGACY_TOKEN_KEY = "ucms_auth_token";

export const persistAuthState = (auth) => {
  localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(auth));
  localStorage.setItem(LEGACY_TOKEN_KEY, auth.token);
  localStorage.setItem("ucms_auth_username", auth.username || "");
  localStorage.setItem("ucms_auth_role", auth.role || "");
};

export const getStoredAuth = () => {
  const rawAuthState = localStorage.getItem(AUTH_STATE_KEY);

  if (rawAuthState) {
    try {
      return JSON.parse(rawAuthState);
    } catch {
      localStorage.removeItem(AUTH_STATE_KEY);
    }
  }

  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  const username = localStorage.getItem("ucms_auth_username");
  const role = localStorage.getItem("ucms_auth_role");

  return token ? { token, username, role } : null;
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STATE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem("ucms_auth_username");
  localStorage.removeItem("ucms_auth_role");
};

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

const request = async (path, options = {}) => {
  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
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

const saveAuthResponse = (response) => {
  const auth = {
    token: response.token,
    ...response.user
  };
  persistAuthState(auth);
  return auth;
};

export const login = async (credentials) => {
  const response = await request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  return saveAuthResponse(response);
};

export const signup = async (payload) => {
  const response = await request("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return saveAuthResponse(response);
};

export const getCurrentUser = () => request("/auth/me");

export const getUsers = () => request("/auth/users");

export const createUser = (user) =>
  request("/auth/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

export const updateUser = (id, user) =>
  request(`/auth/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

export const deleteUser = (id) =>
  request(`/auth/users/${id}`, {
    method: "DELETE"
  });

export const getInvitationCodes = () => request("/invitation-codes");

export const createInvitationCode = (inviteCode) =>
  request("/invitation-codes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(inviteCode)
  });

export const deactivateInvitationCode = (id) =>
  request(`/invitation-codes/${id}/deactivate`, {
    method: "PATCH"
  });

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

export const approveStudentProfile = (id) =>
  request(`/students/${id}/approve`, {
    method: "PATCH"
  });

export const deleteStudent = (id) =>
  request(`/students/${id}`, {
    method: "DELETE"
  });
