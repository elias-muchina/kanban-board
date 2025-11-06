import { useState } from "react";
import type { KanbanColumnProps, KanbanCardProps } from "../../types";
import Card from "../ui/Card";
import { DraggableList } from "../draggable";
import ColumnForm from "./ColumnForm";

interface ExtendedKanbanColumnProps extends KanbanColumnProps {
	onColumnUpdate: (columnId: string, title: string) => void;
	onColumnDelete: (columnId: string) => void;
	onAddCard: () => void;
	onCardCrossMove: (card: KanbanCardProps, direction: "left" | "right") => void;
	onCardGrabbed: () => void;
	isGrabbed: boolean;
	dragClearTrigger: number;
}

function KanbanColumn({
	column,
	cards,
	onCardMove,
	onCardReorder,
	onCardEdit,
	onCardDelete,
	onColumnUpdate,
	onColumnDelete,
	onAddCard,
	onCardCrossMove,
	onCardGrabbed,
	isGrabbed,
	dragClearTrigger,
}: ExtendedKanbanColumnProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleReorder = (fromIndex: number, toIndex: number) => {
		if (fromIndex !== toIndex) {
			const cardId = cards[fromIndex]?.id;
			if (cardId) {
				onCardReorder(cardId, column.id, toIndex);
			}
		}
	};

	const handleMove = (
		card: KanbanCardProps,
		targetListId: string,
		targetIndex: number
	) => {
		onCardMove(card.id, card.columnId, targetListId, targetIndex);
	};

	const renderCard = (
		card: KanbanCardProps,
		_index: number,
		_isDragging: boolean,
		_isGrabbed: boolean
	) => (
		<article key={card.id} aria-label={`Card: ${card.title}`}>
			<Card>
				<div className="transition-all">
					<header className="flex justify-between items-start mb-2">
						<h3 className="text-md font-bold flex-1">{card.title}</h3>
						<div className="flex gap-1 ml-2">
							<button
								onClick={() => onCardEdit(card)}
								className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
								aria-label={`Edit ${card.title}`}
								title="Edit card"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
							<button
								onClick={() => onCardDelete(card.id)}
								className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition-colors"
								aria-label={`Delete ${card.title}`}
								title="Delete card"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</header>
					{card.description && (
						<p className="text-sm text-gray-600 mb-2">{card.description}</p>
					)}
					<div className="flex justify-between text-xs text-gray-500">
						<span>Assignee: {card.assignee}</span>
						<span
							className={`px-2 py-1 rounded ${
								card.priority === "High"
									? "bg-red-100 text-red-800"
									: card.priority === "Medium"
									? "bg-yellow-100 text-yellow-800"
									: "bg-green-100 text-green-800"
							}`}
						>
							{card.priority}
						</span>
					</div>
				</div>
			</Card>
		</article>
	);

	const handleDeleteConfirm = () => {
		onColumnDelete(column.id);
		setShowDeleteConfirm(false);
	};

	return (
		<section
			className={`bg-gray-50 rounded-lg shadow p-4 transition-all ${
				isGrabbed ? "border-2 border-blue-400 shadow-lg" : ""
			}`}
			style={{ minWidth: "320px", flex: "1 1 380px", maxWidth: "500px" }}
		>
			{/* Column Header */}
			<header className="mb-4">
				{isEditing ? (
					<ColumnForm
						initialTitle={column.title}
						onSubmit={(title) => {
							onColumnUpdate(column.id, title);
							setIsEditing(false);
						}}
						onCancel={() => setIsEditing(false)}
						submitLabel="Update"
					/>
				) : (
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-semibold text-center flex-1">
							{column.title}
						</h2>
						<div className="flex gap-1">
							<button
								onClick={() => setIsEditing(true)}
								className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
								aria-label={`Edit column ${column.title}`}
								title="Edit column"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition-colors"
								aria-label={`Delete column ${column.title}`}
								title="Delete column"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>
				)}

				{showDeleteConfirm && (
					<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
						<p className="text-sm text-red-800 mb-2">
							Delete column "{column.title}"? This will also delete all cards in
							this column.
						</p>
						<div className="flex gap-2">
							<button
								onClick={handleDeleteConfirm}
								className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm cursor-pointer transition-colors"
							>
								Delete
							</button>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm cursor-pointer transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				)}
			</header>

			<hr />

			<br />

			{/* Cards */}
			<main className="min-h-[200px]" role="region" aria-label="Cards list">
				<DraggableList
					items={cards}
					renderItem={renderCard}
					onReorder={handleReorder}
					onMove={handleMove}
					onCrossMove={onCardCrossMove}
					onItemGrabbed={onCardGrabbed}
					listId={column.id}
					direction="vertical"
					ariaLabel={`Cards in ${column.title} column`}
					className="space-y-2"
					dragClearTrigger={dragClearTrigger}
				/>
			</main>

			{/* Add card button */}
			<button
				onClick={onAddCard}
				className="w-full mt-3 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
			>
				+ Add a card
			</button>
		</section>
	);
}

export default KanbanColumn;
