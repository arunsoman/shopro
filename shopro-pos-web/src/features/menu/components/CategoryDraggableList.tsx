import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { MenuCategoryResponse } from '../schema/menuSchema';
import { GripVertical, MoreVertical } from 'lucide-react';

interface CategoryDraggableListProps {
    categories: MenuCategoryResponse[];
    onReorder: (newOrderedIds: string[]) => void;
    onEdit: (category: MenuCategoryResponse) => void;
}

export function CategoryDraggableList({ categories, onReorder, onEdit }: CategoryDraggableListProps) {

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceIndex === destIndex) return;

        // Create a new array and move the item
        const newItems = Array.from(categories);
        const [reorderedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(destIndex, 0, reorderedItem);

        onReorder(newItems.map(c => c.id));
    };

    if (categories.length === 0) {
        return (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted">
                <p className="text-sm">No categories found.</p>
                <p className="text-xs">Click '+ Create Category' to get started.</p>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories-list">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-2"
                    >
                        {categories.map((category, index) => (
                            <Draggable key={category.id} draggableId={category.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-center justify-between rounded-md border p-3 transition-colors ${snapshot.isDragging
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-border bg-surface hover:bg-muted/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                {...provided.dragHandleProps}
                                                className="text-muted-2 hover:text-primary transition-colors"
                                            >
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium">{category.name}</span>
                                        </div>

                                        <button
                                            onClick={() => onEdit(category)}
                                            className="rounded-full p-2 text-muted-2 hover:bg-muted/10 hover:text-foreground transition-colors"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
