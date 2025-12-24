import { Link, Outlet } from "react-router-dom";
import "../styles/navbar.css";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { clearAuth } from "../utils/api";
import { faUserCircle, faSignOut, faUser, faScrewdriverWrench, faThLarge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavbarProps {
    boardTitle?: string;
}

function Navbar({ boardTitle = "" }: NavbarProps) {
    const [username, setUsername] = React.useState("User Name");
    const [isAdmin, setIsAdmin] = React.useState(false);

    // Load username from session storage on component mount
    React.useEffect(() => {
        const storedUsername = sessionStorage.getItem("user");
        if (storedUsername) {
            setUsername(storedUsername);
        }
        const storedIsAdmin = sessionStorage.getItem("is_admin");
        if (storedIsAdmin === "true") {
            setIsAdmin(true);
        }
    }, []);

    const handleLogout = () => {
        clearAuth();
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
                <div className="container-fluid">
                    {/* Dashboard link */}
                    <Link className="navbar-brand fw-bold" to="/home">
                        <FontAwesomeIcon icon={faThLarge} className="me-2" />
                        KanbanOnline
                    </Link>
                    {/* Board title */}
                    {boardTitle && (
                        <div className="navbar-nav mx-auto d-none d-lg-block">
                            <span className="navbar-text fs-5">
                                <strong>Viewing: {boardTitle}</strong>
                            </span>
                        </div>
                    )}
                    {/* User profile dropdown */}
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="light"
                            id="navbarDropdown"
                            className="d-flex align-items-center border-0 bg-white"
                        >
                            <FontAwesomeIcon icon={faUser} size="lg" className="me-2" />
                            <span className="d-none d-sm-inline ms-1">
                                {username}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/profile">
                                <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                                Profile
                            </Dropdown.Item>
                            <Dropdown.Item
                                as={Link}
                                to="/admin"
                                hidden={!isAdmin}
                            >
                                <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" />
                                Admin
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                as={Link}
                                to="/login"
                                onClick={handleLogout}
                            >
                                <FontAwesomeIcon icon={faSignOut} className="me-2" />
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Navbar;
