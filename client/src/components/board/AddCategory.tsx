import { useState } from 'react';
import '../../styles/category.css';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AddCategoryProps {
    boardId: number;
    onAddCategory: () => void;
}

function AddCategory({ boardId, onAddCategory }: AddCategoryProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {

        // Prevent adding empty category
        if (!newCategoryTitle.trim()) {
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newCategoryTitle, boardId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to add category');
            }

            setNewCategoryTitle('');
            setIsAdding(false);
            onAddCategory();

        } catch (error) {
            console.error('Error adding category:', error);
            alert(error instanceof Error ? error.message : 'Failed to add category');
        } finally {
            setLoading(false);
        }
    }
    if (isAdding) {
        return (
            <div className="kanban-category">
                <div className='kanban-category-header'>
                    <input
                        className="category-title-input"
                        type="text"
                        value={newCategoryTitle}
                        onChange={(e) => setNewCategoryTitle(e.target.value)}
                        placeholder="New category title"
                        onBlur={() => {
                            setIsAdding(false);
                            setNewCategoryTitle('');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAdd();
                            } else if (e.key === 'Escape') {
                                setIsAdding(false);
                                setNewCategoryTitle('');
                            }
                        }}
                        autoFocus
                        disabled={loading}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="kanban-category" onClick={() => setIsAdding(true)}>
            <button
                className="btn btn-primary btn-add-category"
                onClick={() => setIsAdding(true)}
                disabled={loading}
            >
                <FontAwesomeIcon icon={faPlus} size="xs" />
            </button>
        </div>
    )
}

export default AddCategory;

