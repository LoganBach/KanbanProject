import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/profile.css";
import { clearAuth, apiRequest, getCurrentUser } from "../utils/api";

function Profile() {
    const [email, setEmail] = useState("");
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

    // Fetch user data when component loads
    useEffect(() => {
        const fetchUserData = async () => {
            const username = getCurrentUser();
            if (!username) return;

            try {
                const response = await apiRequest(`/api/users/${username}`);
                if (response.ok) {
                    const userData = await response.json();
                    setEmail(userData.email || "");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        clearAuth();
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleUpdateEmail = async () => {
        const username = getCurrentUser();
        if (!username) {
            alert("Error: No user logged in");
            return;
        }

        if (!email.trim()) {
            alert("Email cannot be empty");
            return;
        }

        if (!validateEmail(email)) {
            alert("Please enter a valid email address");
            return;
        }

        setIsUpdatingEmail(true);

        try {
            const response = await apiRequest(`/api/users/${username}`, {
                method: "PUT",
                body: { email },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update email");
            }

            alert("Email updated successfully!");
        } catch (error) {
            console.error("Error updating email:", error);
            alert(error instanceof Error ? error.message : "Failed to update email");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    return (
        <div className="bg-light">
            {/* Wrapper for profile page */}
            <div id="wrapper">
                {/* Profile header and logout button */}
                <div id="headerBlock">
                    <h1>Username's Profile</h1>
                    <Link to="/login">
                        <button
                            id="logoutBtn"
                            className="btn btn-danger"
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                    </Link>
                </div>
                <hr />

                {/* Profile Information */}
                <div id="infoWrap">
                    <h3>Profile Information</h3>

                    {/* Display Name */}
                    <div className="infoBlock">
                        <label className="fw-bold">Username:</label>
                        <p>{sessionStorage.getItem("user")}</p>
                    </div>

                    <div className="infoBlock">
                        <label className="fw-bold">Admin:</label>
                        <p>{sessionStorage.getItem("is_admin")}</p>
                    </div>

                    {/* Email */}
                    <div className="infoBlock">
                        <label className="fw-bold">Email</label>
                        <input
                            id="emailInp"
                            style={{ width: "400px" }}
                            className="form-control"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                        />
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <button
                                className="btn btn-primary btn-sm mt-2"
                                onClick={handleUpdateEmail}
                                disabled={isUpdatingEmail}
                            >
                                {isUpdatingEmail ? "Updating..." : "Update Email"}
                            </button>
                        </div>
                    </div>

                    {/* Profile Picture */}
                    {/* <div className="infoBlock">
                        <label className="fw-bold">Profile Picture</label>
                        <img
                            id="profPicInfo"
                            className="img-thumbnail"
                            src="/200x200.svg"
                            alt="Profile"
                        />
                        <button id="changePicBtn" className="btn btn-primary btn-sm">
                            Change Picture
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default Profile;
