import { useState, useEffect } from "react";
import "../styles/home.css";
import BoardCard from "./board/BoardCard";
import type { UserData, UserBoardData, BoardData, InviteData } from "../types";
import { apiRequestJson, getCurrentUser } from "../utils/api";
import ErrorAlert from "./misc/ErrorAlert";
import Loading from "./misc/Loading";
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Home() {
    const [userBoards, setUserBoards] = useState<UserBoardData[]>([]);
    const [invites, setInvites] = useState<InviteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserBoards();
        fetchUserInvites();
    }, []);

    const fetchUserBoards = async () => {
        try {
            setLoading(true);
            setError(null);
            const username = getCurrentUser();
            if (!username) {
                throw new Error("No authenticated user found");
            }

            const userData: UserData = await apiRequestJson(
                `/api/users/${username}`,
            );
            setUserBoards(userData.Boards);
        } catch (error) {
            console.error("Error fetching user boards:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load boards",
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInvites = async () => {
        try {
            const username = getCurrentUser();
            if (!username) return;

            const invitesData: InviteData[] = await apiRequestJson(
                `/api/invites?username=${username}`,
            );
            setInvites(invitesData);
        } catch (error) {
            console.error("Error fetching invites:", error);
        }
    };

    const handleAcceptInvite = async (inviteId: number, boardId: number) => {
        try {
            const username = getCurrentUser();
            if (!username) return;

            // Add user to board
            await apiRequestJson(`/api/boards/${boardId}/members`, {
                method: "POST",
                body: {
                    username: username,
                    owns_board: false,
                },
            });

            // Delete the invite
            await apiRequestJson(`/api/invites/${inviteId}`, {
                method: "DELETE",
            });

            // Remove invite from state and refresh boards
            setInvites((prev) =>
                prev.filter((invite) => invite.id !== inviteId),
            );
            fetchUserBoards();
        } catch (error) {
            console.error("Error accepting invite:", error);
            alert("Failed to accept invite.");
        }
    };

    const handleRejectInvite = async (inviteId: number) => {
        try {
            await apiRequestJson(`/api/invites/${inviteId}`, {
                method: "DELETE",
            });

            // Remove invite from state
            setInvites((prev) =>
                prev.filter((invite) => invite.id !== inviteId),
            );
        } catch (error) {
            console.error("Error rejecting invite:", error);
            alert("Failed to reject invite.");
        }
    };

    const handleDeleteBoard = async (boardId: number) => {
        try {
            await apiRequestJson(`/api/boards/${boardId}`, {
                method: "DELETE",
            });
            // Remove the deleted board from the state
            setUserBoards((prev) =>
                prev.filter((board) => board.id !== boardId),
            );
        } catch (error) {
            console.error("Error deleting board:", error);
            alert("Failed to delete board.");
        }
    };

    const handleCreateBoard = async () => {
        const boardTitle = prompt("Enter a title for your new board:");
        if (!boardTitle || boardTitle.trim() === "") {
            return;
        }

        try {
            const newBoard: BoardData = await apiRequestJson("/api/boards", {
                method: "POST",
                body: {
                    title: boardTitle.trim(),
                    owner_username: getCurrentUser(),
                },
            });

            // Add the new board to the state
            const newUserBoard = {
                id: newBoard.id,
                title: newBoard.title,
                BoardMemberships: { owns_board: true },
            };
            setUserBoards((prev) => [...prev, newUserBoard]);
        } catch (error) {
            console.error("Error creating board:", error);
            alert("Failed to create board.");
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorAlert title="Error" body={error} />;
    }

    const ownedBoards = userBoards.filter(
        (board) => board.BoardMemberships.owns_board,
    );
    const sharedBoards = userBoards.filter(
        (board) => !board.BoardMemberships.owns_board,
    );
    return (
        <div className="container">
            <div className="row mt-4">
                <div className="col-md-8">
                    <div className="board-header">
                        <h3>My Boards</h3>
                        <button
                            className="btn btn-success create-board-btn"
                            onClick={handleCreateBoard}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} className='me-2' />
                            Create Board
                        </button>
                    </div>
                    <div className="board-section">
                        <h4 className="mt-4 pb-2 mb-2">Owned Boards</h4>
                        {ownedBoards.length === 0 ? (
                            <p className="text-muted">
                                You don't own any boards yet.
                            </p>
                        ) : (
                            ownedBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    onDelete={handleDeleteBoard}
                                />
                            ))
                        )}
                    </div>

                    <div className="board-section">
                        <h4 className="mt-4 pb-2 mb-2">Shared Boards</h4>
                        {sharedBoards.length === 0 ? (
                            <p className="text-muted">
                                No boards are shared with you.
                            </p>
                        ) : (
                            sharedBoards.map((board) => (
                                <BoardCard
                                    key={board.id}
                                    board={board}
                                    onDelete={handleDeleteBoard}
                                />
                            ))
                        )}
                    </div>
                </div>
                <div className="col-md-4 border-start ps-3">
                    <h3>Invites</h3>
                    {invites.length === 0 ? (
                        <p className="text-muted">No pending invites.</p>
                    ) : (
                        invites.map((invite) => (
                            <div key={invite.id} className="card mb-4">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {invite.Board.title}
                                    </h5>
                                    <p className="card-text">
                                        Invited by {invite.sender}
                                    </p>
                                    <div className="btn-group">
                                        <button
                                            className="btn btn-success"
                                            onClick={() =>
                                                handleAcceptInvite(
                                                    invite.id,
                                                    invite.BoardId,
                                                )
                                            }
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                handleRejectInvite(invite.id)
                                            }
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
