import { Link } from "react-router-dom";
import { useState } from "react";
import type { UserBoardData } from "../../types";
import { apiRequest, getCurrentUser } from "../../utils/api";

interface BoardCardProps {
    board: UserBoardData;
    onDelete: (boardId: number) => void;
}

function BoardCard({ board, onDelete }: BoardCardProps) {
    const isOwner = board.BoardMemberships.owns_board;
    const [inviteUsername, setInviteUsername] = useState("");

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${board.title}"?`)) {
            onDelete(board.id);
        }
    };

    const handleInvite = async () => {
        if (!inviteUsername.trim()) {
            alert("Please enter a username");
            return;
        }

        try {
            const response = await apiRequest(
                "http://localhost:5000/api/invites",
                {
                    method: "POST",
                    body: {
                        username: inviteUsername.trim(),
                        boardId: board.id,
                        sender: getCurrentUser(),
                    },
                },
            );

            if (response.ok) {
                alert(`Invite sent successfully to ${inviteUsername}!`);
                setInviteUsername("");
            } else {
                const errorData = await response.json();
                alert(
                    `Failed to send invite: ${errorData.error || "Unknown error"}`,
                );
            }
        } catch (error) {
            alert("Failed to send invite: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    return (
        <div className="card mb-3 board-card">
            <div className="card-body">
                <h5 className="card-title">{board.title}</h5>
                <div className="mt-2">
                    <Link to={`/board/${board.id}`} className="btn btn-primary">
                        View Board
                    </Link>
                    {isOwner && (
                        <>
                            <button
                                className="btn btn-danger ms-2"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                            <div className="mt-2">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Username to invite"
                                        value={inviteUsername}
                                        onChange={(e) =>
                                            setInviteUsername(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && handleInvite()
                                        }
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={handleInvite}
                                    >
                                        Invite
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BoardCard;
