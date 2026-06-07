import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  org: JSON.parse(localStorage.getItem("org") || "null"),

  setAuth: (token, org) => {
    localStorage.setItem("token", token);
    localStorage.setItem("org", JSON.stringify(org));
    set({ token, org });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("org");
    set({ token: null, org: null });
  },
}));

export default useAuthStore;
