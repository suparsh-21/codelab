import { createContext, useState, useEffect, useContext } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    // fetch user data after login
    const meRes = await API.get("/auth/me");
    setUser(meRes.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    localStorage.setItem("token", res.data.token);
    const meRes = await API.get("/auth/me");
    setUser(meRes.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    API.post("/auth/logout").catch(() => {}); // try to clear cookie too
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
