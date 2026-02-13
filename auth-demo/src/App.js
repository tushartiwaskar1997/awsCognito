import React, { useState } from "react";
import { login } from "./service/auth";
import "./App.css"; // We'll add some CSS for styling

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); // For login errors

  async function handleLogin() {
    setError(""); // Reset error
    try {
      const data = await login(username, password);

      // Only set user if login successful
      if (data && data.AccessToken) {
        setUser({ username, token: data.AccessToken });
        console.log("Logged in:", data);
      } else {
        setError("Invalid username or password!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed: " + err.message);
    }
  }

  function handleLogout() {
    setUser(null);
    setUsername("");
    setPassword("");
    setError("");
  }

  return (
    <div className="login-container">
      {user ? (
        <div className="welcome-box">
          <h1>Welcome, {user.username} 🚀</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="login-box">
          <h2>Login</h2>
          {error && <div className="error-msg">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
      {/* Always show logout button even if login fails */}
      {user && (
        <div className="footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
