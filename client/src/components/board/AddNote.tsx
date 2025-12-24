import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface AddNoteProps {
    categoryId: number;
    onAddNote?: () => Promise<void>;
}

function AddNote({ categoryId, onAddNote }: AddNoteProps) {
    const [title, setTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddNote = async () => {
        if (!title.trim()) {
            return; // Prevent adding empty note
        }

        setLoading(true);

        try {
            // post request to add a note
            const res = await fetch(`/api/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content: 'add content here!', categoryId })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to add note");
            }

            setTitle("");
            setIsAdding(false);
            await onAddNote?.(); // Refresh the notes in the category
        } catch (error) {
            console.error("Error adding note:", error);
            alert(error instanceof Error ? error.message : "Failed to add note");
        } finally {
            setLoading(false);
        }
    }

    if (isAdding) {
        return (
            <div className="kanban-note">
                <input
                    className="note-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New note title"
                    onBlur={() => {
                        setIsAdding(false);
                        setTitle('');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleAddNote();
                        }
                        else if (e.key === "Escape") {
                            setIsAdding(false);
                            setTitle("");
                        }
                    }}
                    autoFocus
                    disabled={loading}
                />
            </div>
        )
    }

    return (
        <button
            className="btn btn-primary btn-add-note mt-3"
            onClick={() => setIsAdding(true)}
            disabled={loading}
        >
            <FontAwesomeIcon icon={faPlus} size="xs" />
        </button>
    )

}

export default AddNote;