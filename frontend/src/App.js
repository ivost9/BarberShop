import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import { theme } from "./utils/theme";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [view, setView] = useState("home");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("✅ SW Registered!", reg.scope))
          .catch((err) => console.error("❌ SW Registration Failed", err));
      };

      // Ако страницата вече е заредена, регистрирай веднага
      if (document.readyState === "complete") {
        registerSW();
      } else {
        // Иначе чакай зареждането
        window.addEventListener("load", registerSW);
      }
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
    setView("home");
  };

  return (
    <div className={theme.bg}>
      <InstallPrompt />
      <Toaster position="top-center" />
      <Navbar
        view={view}
        setView={setView}
        token={token}
        role={role}
        logout={logout}
      />
      {/* MAIN CONTENT */}
      <div className="container mx-auto p-4 max-w-4xl mt-6 sm:mt-10 pb-24">
        {view === "home" && <Home setView={setView} token={token} />}
        {view === "login" && (
          <Auth
            type="login"
            setToken={setToken}
            setRole={setRole}
            setUsername={setUsername}
            setView={setView}
          />
        )}
        {view === "register" && (
          <Auth
            type="register"
            setToken={setToken}
            setRole={setRole}
            setUsername={setUsername}
            setView={setView}
          />
        )}
        {/* DASHBOARD now handles both Client and Admin views */}
        {view === "dashboard" && (
          <Dashboard token={token} username={username} role={role} />
        )}
        {view === "profile" && <Profile token={token} />}
      </div>
    </div>
  );
}

export default App;
