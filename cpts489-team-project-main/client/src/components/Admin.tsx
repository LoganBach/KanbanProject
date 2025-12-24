import { useState, useEffect } from "react";
import "../styles/profile.css";
import "../styles/admin.css";
import type { UserData } from "../types";
import { apiRequest, apiRequestJson } from "../utils/api";

function Admin() {
    const [users, setUsers] = useState<UserData[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const response = await apiRequestJson("api/users");
            setUsers(response as UserData[]);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function deleteUser(username: string) {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
        );

        if (confirmDelete) {
            try {
                await apiRequest(`api/users/${username}`, {
                    method: "DELETE",
                });
                // Refresh the users list after successful deletion
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user. Please try again.");
            }
        }
    }

    if (sessionStorage.getItem("is_admin")) {
        return (
            <div className="bg-light">
                <div id="wrapper">
                    <div id="headerBlock">
                        <h1>Admin Dashboard</h1>
                    </div>
                    <hr />
                    <div id="infoWrap">
                        <div className="user-management-section">
                            <h3>User Management</h3>
                            <div className="users-list">
                                {users.map((user) => (
                                    <div
                                        key={user.username}
                                        className="user-card"
                                    >
                                        <h4>{user.username}</h4>
                                        <p>Email: {user.email}</p>
                                        <button
                                            onClick={() =>
                                                deleteUser(user.username)
                                            }
                                            className="delete-user-btn"
                                        >
                                            Delete User
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-light">
                <h1>Admin Dashboard</h1>
                <p>You are not authorized to access this page.</p>
            </div>
        );
    }
}

export default Admin;
