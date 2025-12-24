import Category from './Category';
import type { BoardData } from '../../types';
import '../../styles/board.css';
import AddCategory from './AddCategory';
import { useState, useEffect } from 'react';

interface BoardProps extends BoardData {
    moveNote: (noteId: number, newCategoryId: number) => Promise<void>;
    refreshBoard: () => Promise<void>;
}

function Board({ Categories, id, moveNote, refreshBoard }: BoardProps) {
    const [categories, setCategories] = useState(Categories);

    const refreshCategoryNotes = async () => {
        try {
            const res = await fetch(`/api/boards/${id}`);
            if (!res.ok) {
                throw new Error('Failed to board data');
            }

            const boardData = await res.json();
            setCategories(boardData.Categories);
        } catch (error) {
            console.error('Error refreshing categories:', error);
            alert(error instanceof Error ? error.message : 'Failed to refresh categories');
        }
    }

    useEffect(() => {
        setCategories(Categories);
    }, [Categories]);
    return (
        <>
            <div className="kanban-board">
                {categories.map((category) => (
                    <Category
                        key={category.id}
                        id={category.id}
                        BoardId={category.BoardId}
                        title={category.title}
                        Notes={category.Notes}
                        moveNote={moveNote}
                        refreshCategoryNotes={refreshCategoryNotes}
                    />
                ))}
                <AddCategory
                    key={`add-category-${id}`}
                    boardId={id}
                    onAddCategory={refreshBoard}
                />
            </div>
        </>
    );
}

export default Board;
