import { useState } from 'react';
import type { NoteData } from '../../types';
import { apiRequestJson } from '../../utils/api';
import '../../styles/note.css';

interface NoteProps extends NoteData {
    tags?: string[];
    categoryId: number;
    onDelete?: (id: number) => void;
}

function Note({ id, title, content, tags = [], categoryId, onDelete }: NoteProps) {
    const [noteTitle, setNoteTitle] = useState(title);
    const [noteContent, setNoteContent] = useState(content);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    async function saveNote(field: 'title' | 'content', value: string) {
        if (isSaving) return;

        try {
            setIsSaving(true);
            const updateData = field === 'title' ? { title: value } : { content: value };

            await apiRequestJson(`/api/notes/${id}`, {
                method: 'PATCH',
                body: updateData
            });
        } catch (error) {
            console.error('Error updating note:', error);
            // Revert on error
            if (field === 'title') {
                setNoteTitle(title);
            } else {
                setNoteContent(content);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsEditingTitle(false);
            if (noteTitle !== title) {
                saveNote('title', noteTitle);
            }
        }
        if (e.key === 'Escape') {
            setNoteTitle(title);
            setIsEditingTitle(false);
        }
    };

    const handleContentKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            setIsEditingContent(false);
            if (noteContent !== content) {
                saveNote('content', noteContent);
            }
        }
        if (e.key === 'Escape') {
            setNoteContent(content);
            setIsEditingContent(false);
        }
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (noteTitle !== title) {
            saveNote('title', noteTitle);
        }
    };

    const handleContentBlur = () => {
        setIsEditingContent(false);
        if (noteContent !== content) {
            saveNote('content', noteContent);
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('noteId', id.toString());
        e.dataTransfer.setData('sourceCategoryId', categoryId.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    // Handle deletion of the note
    const handleDelete = async () => {
        try {
            setIsSaving(true);
            await apiRequestJson(`/api/notes/${id}`, {
                method: 'DELETE'
            });

        } catch (error) {
            console.error('Error deleting note:', error);
        } finally {
            setIsSaving(false);
            //Notify Category parent to remove the note
            if (onDelete) {
                onDelete(id);
            }
        }
    }

    return (
        <div
            className="kanban-note"
            draggable={!isEditingTitle && !isEditingContent}
            onDragStart={handleDragStart}
        >
            <div className="note-header-wrapper">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleTitleBlur}
                        autoFocus
                        className="note-title-input"
                        disabled={isSaving}
                    />
                ) : (
                    <h6
                        onClick={() => setIsEditingTitle(true)}
                        className="note-title-editable"
                    >
                        {noteTitle}
                    </h6>
                )}
                <button
                    className="btn btn-danger btn-sm note-delete-button"
                    onClick={handleDelete}
                    disabled={isSaving}
                >
                     x
                </button>
            </div>
            
            {isEditingContent ? (
                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    onKeyDown={handleContentKeyDown}
                    onBlur={handleContentBlur}
                    autoFocus
                    className="note-content-input"
                    disabled={isSaving}
                    rows={3}
                />
            ) : (
                <p
                    className="small note-content-editable"
                    onClick={() => setIsEditingContent(true)}
                >
                    {noteContent}
                </p>
            )}

            {tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag-label">
                    {tag}
                </span>
            ))}
        </div>
    );
}

export default Note;
