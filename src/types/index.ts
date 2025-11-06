export interface KanbanBoardProps {
	title: string;
}

export interface KanbanColumnProps {
	column: KanbanColumn;
	cards: KanbanCardProps[];
	onCardMove: (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
		newIndex: number
	) => void;
	onCardReorder: (cardId: string, columnId: string, newIndex: number) => void;
	onCardEdit: (card: KanbanCardProps) => void;
	onCardDelete: (cardId: string) => void;
}

export interface KanbanColumn {
	id: string;
	title: string;
}

export interface KanbanCardProps {
	id: string;
	columnId: string;
	title: string;
	description?: string;
	assignee: string;
	priority: Priority;
}

export interface CardProps {
	children: React.ReactNode;
}

export type Priority = "Low" | "Medium" | "High";

// DraggableList component types
export interface DraggableItem {
	id: string;
	[key: string]: any;
}

export interface DraggableListProps<T extends DraggableItem> {
	items: T[];
	renderItem: (
		item: T,
		index: number,
		isDragging: boolean,
		isGrabbed: boolean
	) => React.ReactNode;
	onReorder: (fromIndex: number, toIndex: number) => void;
	onMove?: (item: T, targetListId: string, targetIndex: number) => void;
	onCrossMove?: (item: T, direction: "left" | "right") => void;
	onItemGrabbed?: () => void;
	listId?: string;
	direction?: "vertical" | "horizontal";
	className?: string;
	ariaLabel?: string;
	dragClearTrigger?: number;
}

export interface DragState {
	isDragging: boolean;
	draggedIndex: number | null;
	draggedOverIndex: number | null;
	isKeyboardMode: boolean;
	grabbedIndex: number | null;
}

export type ModeType = "add" | "edit";
