import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Board from './Board';
import type { BoardData } from '../../types';
import { apiRequestJson } from '../../utils/api';
import ErrorAlert from '../misc/ErrorAlert';
import Loading from '../misc/Loading';

function BoardContainer({ updateBoardTitle }: { updateBoardTitle: (title: string) => void }) {
    const { boardId } = useParams<{ boardId: string }>();
    const [boardData, setBoardData] = useState<BoardData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBoard = async () => {
        try {
            setLoading(true);
            setError(null);

            const data: BoardData = await apiRequestJson(`/api/boards/${boardId}`);

            setBoardData(data);
            updateBoardTitle(data.title);
        } catch (err) {
            updateBoardTitle('');
            setError(err instanceof Error ? err.message : 'Error fetching board');
            console.error('Error fetching board:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [boardId, updateBoardTitle]);

    async function moveNote(noteId: number, newCategoryId: number) {
        try {
            // optimistically update the boardData state
            setBoardData(prevData => {
                if (!prevData) return prevData;

                // get all categories without the moved note
                const newCategories = prevData.Categories.map(category => ({
                    ...category,
                    Notes: category.Notes.filter(note => note.id !== noteId)
                }));

                // find the target category and add the note to it
                const targetCategoryIndex = newCategories.findIndex(cat => cat.id === newCategoryId);
                if (targetCategoryIndex !== -1) {
                    const noteToMove = prevData.Categories
                        .flatMap(cat => cat.Notes)
                        .find(note => note.id === noteId);

                    if (noteToMove) {
                        newCategories[targetCategoryIndex] = {
                            ...newCategories[targetCategoryIndex],
                            Notes: [...newCategories[targetCategoryIndex].Notes, noteToMove]
                        };
                    }
                }

                // update the boardData with the new categories after the move
                return { ...prevData, Categories: newCategories };
            });

            // update note's category in the backend
            await apiRequestJson(`/api/notes/${noteId}`, {
                method: 'PATCH',
                body: { categoryId: newCategoryId }
            });

            const freshData = await apiRequestJson(`/api/boards/${boardId}`) as BoardData;
            setBoardData(freshData);
        } catch (err) {
            console.error('Error moving note:', err);
            // revert by refetching
            const data: BoardData = await apiRequestJson(`/api/boards/${boardId}`);
            setBoardData(data);
        }
    };

    // display loading spinner while awaiting fetch
    if (loading) {
        return (
            <Loading />
        );
    }

    // display error message if fetch fails
    if (error) {
        return (
            <ErrorAlert title="Error loading board" body={error} />
        );
    }

    return (
        <Board {...boardData!} moveNote={moveNote} refreshBoard={fetchBoard} />
    );
}

export default BoardContainer;
