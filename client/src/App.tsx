import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/login/Login";
import Register from "./components/login/Register";
import BoardContainer from "./components/board/BoardContainer";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Admin from "./components/Admin";
import "./styles/global.css";
import React from "react";
import AuthRoute from "./components/AuthRoute";

function App() {
    const [boardTitle, setBoardTitle] = React.useState("");

    const updateBoardTitle = React.useCallback((title: string) => {
        setBoardTitle(title);
    }, []);

    // Reset board title when navigating to a different route
    const location = useLocation();
    React.useEffect(() => {
        setBoardTitle("");
    }, [location]);

    return (
        <Routes>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AuthRoute />}>
                <Route element={<Navbar boardTitle={boardTitle} />}>
                    <Route path="/home" element={<Home />} />
                    <Route
                        path="/board/:boardId"
                        element={<BoardContainer updateBoardTitle={updateBoardTitle} />}
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Admin />} />
                </Route>
            </Route>

            <Route
                path="*"
                element={
                    <div className="container mt-4">
                        <div className="alert alert-danger" role="alert">
                            <h4 className="alert-heading">404 Page Not Found</h4>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;
