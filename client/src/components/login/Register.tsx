import React, { useState } from "react";
import "../../styles/login.css";
import TitledContainer from "./TitledContainer";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await apiRequest("/api/auth/register", {
                method: "POST",
                body: { username, password, email },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Registration failed");
            }

            alert("Registration successful!"); // TODO: use alert components instead
            navigate("/login"); // Navigate to login after successful registration
        } catch (error) {
            console.error("Error during registration:", error);
            alert(error instanceof Error ? error.message : "Registration failed");
            return;
        }
    };

    return (
        <>
            {/* Register Form Wrapper */}
            <TitledContainer>
                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="mb-3">
                        <label htmlFor="inputUsername" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            id="inputUsername"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {/* Email */}
                    <div className="mb-3">
                        <label htmlFor="inputEmail" className="form-label">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="inputEmail"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            id="inputPassword"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* Confirm Password */}
                    <div className="mb-3">
                        <label htmlFor="inputConfirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="inputConfirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* Submit Button */}
                    <div>
                        <button type="submit" className="btn btn-primary w-100">
                            Create Account
                        </button>
                    </div>
                    {/* Login Redirect */}
                    <div id="regRedirect" className="text-center mt-3">
                        <label>Already have an Account?</label>{" "}
                        <Link to="/login">Login Here</Link>
                    </div>
                </form>
            </TitledContainer>
        </>
    );
}

export default Register;
