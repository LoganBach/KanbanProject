import React, { useState } from "react";
import "../../styles/login.css";
import TitledContainer from "./TitledContainer";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await apiRequest("/api/auth/login", {
                method: "POST",
                body: { username, password },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Login failed");
            }

            const data = await response.json();

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", data.username);
            sessionStorage.setItem("email", data.email);
            sessionStorage.setItem("is_admin", data.is_admin);

            navigate("/home"); // Navigate to home after successful login
        } catch (error) {
            console.error("Error during login:", error);
            alert(error instanceof Error ? error.message : "Login failed");
            return;
        }
    };
    return (
        <>
            {/* Login Form */}
            <TitledContainer>
                <form onSubmit={handleSubmit} className="mx-auto">
                    {/* Username */}
                    <div className="mb-3">
                        <label htmlFor="inputUsername" className="form-label">
                            Username
                        </label>
                        <input
                            type="username"
                            className="form-control"
                            id="inputUsername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {/* Password */}
                    <div className="mb-3">
                        <label htmlFor="inputPassword" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="inputPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* Login Button */}
                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary w-100">
                            Login
                        </button>
                    </div>
                    {/* Register Link */}
                    <div id="regRedirect" className="text-center">
                        <label className="me-2">Don't have an Account?</label>
                        <Link to="/register">Register Here</Link>
                    </div>
                </form>
            </TitledContainer>
        </>
    );
}

export default Login;
