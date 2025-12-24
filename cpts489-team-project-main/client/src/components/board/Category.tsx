import { useState } from 'react';
import Note from './Note';
import AddNote from './AddNote';
import type { CategoryData } from '../../types';
import { apiRequestJson } from '../../utils/api';
import '../../styles/category.css';
import React from 'react';

interface CategoryProps extends CategoryData {
    moveNote: (noteId: number, newCategoryId: number) => Promise<void>;
    refreshCategoryNotes?: () => Promise<void>;
}

function Category({ id, title, Notes, BoardId, moveNote, refreshCategoryNotes }: CategoryProps) {
    const [categoryTitle, setCategoryTitle] = useState(title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    async function saveCategory(newTitle: string) {
        if (isSaving) return;

        try {
            setIsSaving(true);
            await apiRequestJson(`/api/categories/${id}`, {
                method: 'PUT',
                body: { title: newTitle, boardId: BoardId }
            });
        } catch (error) {
            console.error('Error updating category:', error);
            // Revert on error
            setCategoryTitle(title);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsEditingTitle(false);
            if (categoryTitle !== title) {
                saveCategory(categoryTitle);
            }
        }
        if (e.key === 'Escape') {
            setCategoryTitle(title);
            setIsEditingTitle(false);
        }
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (categoryTitle !== title) {
            saveCategory(categoryTitle);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const noteId = parseInt(e.dataTransfer.getData('noteId'));
        const sourceCategoryId = parseInt(e.dataTransfer.getData('sourceCategoryId'));

        if (noteId && sourceCategoryId !== id) {
            await moveNote(noteId, id);
        }
    };

    const handleDeleteCategory = async () => {
        if(!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            setIsSaving(true);
            await apiRequestJson(`/api/categories/${id}`, {
                method: 'DELETE'
            });
            
            if (refreshCategoryNotes) {
                await refreshCategoryNotes();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className={`kanban-category ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="kanban-category-header">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={categoryTitle}
                        onChange={(e) => setCategoryTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleTitleBlur}
                        autoFocus
                        className="category-title-input"
                        disabled={isSaving}
                    />
                ) : (
                    <h5
                        onClick={() => setIsEditingTitle(true)}
                        className="category-title-editable"
                    >
                        {categoryTitle}
                    </h5>
                )}
                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteCategory}
                    disabled={isSaving}
                >X</button>
            </div>
            <div className="kanban-notes">
                {Notes.map((note) => (
                    <Note
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        content={note.content}
                        tags={[]} // TODO
                        categoryId={id}
                        onDelete={async () => {
                            await refreshCategoryNotes?.();
                        }}
                    />
                ))}
                <AddNote
                    categoryId={id}
                    onAddNote={refreshCategoryNotes}
                />
            </div>
        </div>
    );
}

//export default Category;
export default React.memo(Category);