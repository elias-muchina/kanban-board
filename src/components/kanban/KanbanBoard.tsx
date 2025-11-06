import { useState, useEffect } from "react";
import type {
	KanbanBoardProps,
	KanbanColumn as KanbanColumnType,
	KanbanCardProps,
	ModeType,
} from "../../types";
import { useKanbanState } from "../../hooks/useKanbanState";
import KanbanColumn from "./KanbanColumn";
import { DraggableList } from "../draggable";
import ColumnForm from "./ColumnForm";
import CardForm from "./CardForm";

function KanbanBoard({ title }: KanbanBoardProps) {
	const {
		columns,
		addColumn,
		updateColumn,
		deleteColumn,
		reorderColumns,
		addCard,
		updateCard,
		deleteCard,
		moveCard,
		reorderCardsInColumn,
		getCardsForColumn,
	} = useKanbanState();

	const [showAddColumn, setShowAddColumn] = useState(false);
	const [cardFormState, setCardFormState] = useState<{
		show: boolean;
		mode: ModeType;
		columnId: string;
		card?: KanbanCardProps;
	}>({ show: false, mode: "add", columnId: "" });
	const [dragClearTrigger, setDragClearTrigger] = useState(0);

	// Force re-render of drag-drop components when columns change
	useEffect(() => {
		setDragClearTrigger((prev) => prev + 1);
	}, [columns.length]);

	const handleCardGrabbed = () => {
		const columnsList = document.querySelector('[aria-label="Kanban columns"]');
		if (columnsList) {
			const grabbedColumns = columnsList.querySelectorAll(
				'.draggable-item[aria-grabbed="true"]'
			);
			grabbedColumns.forEach((grabbedColumn) => {
				const escapeEvent = new KeyboardEvent("keydown", {
					key: "Escape",
					bubbles: true,
					cancelable: true,
				});
				grabbedColumn.dispatchEvent(escapeEvent);
			});
		}
	};

	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				const activeElement = document.activeElement as HTMLElement;
				if (activeElement && activeElement.blur) {
					activeElement.blur();
				}
			}
		};

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown);
		};
	}, []);

	const handleColumnReorder = (fromIndex: number, toIndex: number) => {
		reorderColumns(fromIndex, toIndex);
	};

	const handleCardMove = (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
		newIndex: number
	) => {
		// Verify target column exists
		const targetColumnExists = columns.some((col) => col.id === toColumnId);
		if (!targetColumnExists) {
			console.error("Target column does not exist:", toColumnId);
			return;
		}

		moveCard(cardId, fromColumnId, toColumnId, newIndex);
	};

	const handleCardReorder = (
		_cardId: string,
		columnId: string,
		newIndex: number
	) => {
		const columnCards = getCardsForColumn(columnId);
		const currentIndex = columnCards.findIndex((card) => card.id === _cardId);
		if (currentIndex !== -1 && currentIndex !== newIndex) {
			reorderCardsInColumn(columnId, currentIndex, newIndex);
		}
	};

	const handleCardCrossMove = (
		card: KanbanCardProps,
		direction: "left" | "right"
	) => {
		const currentColumnIndex = columns.findIndex(
			(col) => col.id === card.columnId
		);
		let targetColumnIndex: number;

		if (direction === "left") {
			targetColumnIndex = currentColumnIndex - 1;
		} else {
			targetColumnIndex = currentColumnIndex + 1;
		}

		if (targetColumnIndex >= 0 && targetColumnIndex < columns.length) {
			const targetColumn = columns[targetColumnIndex];
			moveCard(card.id, card.columnId, targetColumn.id, 0);

			setDragClearTrigger((prev) => prev + 1);

			setTimeout(() => {
				const allDraggableItems = document.querySelectorAll(".draggable-item");
				allDraggableItems.forEach((item) => {
					const element = item as HTMLElement;
					element.style.opacity = "";
					element.style.transform = "";
					element.classList.remove("opacity-50", "scale-95", "opacity-30");
				});
			}, 100);
		}
	};

	const handleCardEdit = (card: KanbanCardProps) => {
		setCardFormState({
			show: true,
			mode: "edit",
			columnId: card.columnId,
			card,
		});
	};

	const handleCardDelete = (cardId: string) => {
		if (confirm("Are you sure you want to delete this card?")) {
			deleteCard(cardId);
		}
	};

	const handleAddCard = (columnId: string) => {
		setCardFormState({
			show: true,
			mode: "add",
			columnId,
		});
	};

	const handleCardFormSubmit = (cardData: Omit<KanbanCardProps, "id">) => {
		if (cardFormState.mode === "add") {
			addCard(cardData);
		} else if (cardFormState.card) {
			updateCard(cardFormState.card.id, cardData);
		}
		setCardFormState({ show: false, mode: "add", columnId: "" });
	};

	const renderColumn = (
		column: KanbanColumnType,
		_index: number,
		_isDragging: boolean,
		isGrabbed: boolean
	) => (
		<article
			key={column.id}
			className="transition-all"
			aria-label={`${column.title} column`}
		>
			<KanbanColumn
				column={column}
				cards={getCardsForColumn(column.id)}
				onCardMove={handleCardMove}
				onCardReorder={handleCardReorder}
				onCardEdit={handleCardEdit}
				onCardDelete={handleCardDelete}
				onColumnUpdate={updateColumn}
				onColumnDelete={deleteColumn}
				onAddCard={() => handleAddCard(column.id)}
				onCardCrossMove={handleCardCrossMove}
				onCardGrabbed={handleCardGrabbed}
				isGrabbed={isGrabbed}
				dragClearTrigger={dragClearTrigger}
			/>
		</article>
	);

	const handleMainClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			!target.closest(".draggable-item") &&
			!target.closest("button") &&
			!target.closest("input")
		) {
			const activeElement = document.activeElement as HTMLElement;
			if (
				activeElement &&
				activeElement.blur &&
				activeElement.classList.contains("draggable-item")
			) {
				activeElement.blur();
			}
		}
	};

	return (
		<main
			className="min-h-screen w-full p-4 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-auto"
			onClick={handleMainClick}
		>
			<h1 className="text-gray-800 text-2xl font-bold mb-4">{title}</h1>

			<section
				className="flex gap-4 pb-4 pt-2 min-w-full"
				aria-label="Kanban board workspace"
			>
				<DraggableList
					items={columns}
					renderItem={renderColumn}
					onReorder={handleColumnReorder}
					listId="columns"
					direction="horizontal"
					ariaLabel="Kanban columns"
					className="flex gap-4 p-1 flex-1"
				/>

				<aside
					className="flex-shrink-0"
					style={{ minWidth: "320px", maxWidth: "400px" }}
					aria-label="Column management"
				>
					{showAddColumn ? (
						<ColumnForm
							onSubmit={(title) => {
								addColumn(title);
								setShowAddColumn(false);
							}}
							onCancel={() => setShowAddColumn(false)}
							submitLabel="Add Column"
						/>
					) : (
						<button
							onClick={() => setShowAddColumn(true)}
							className="w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors flex items-center justify-center cursor-pointer"
						>
							+ Add another column
						</button>
					)}
				</aside>
			</section>

			{cardFormState.show && (
				<CardForm
					initialCard={cardFormState.card}
					columnId={cardFormState.columnId}
					onSubmit={handleCardFormSubmit}
					onCancel={() =>
						setCardFormState({ show: false, mode: "add", columnId: "" })
					}
					submitLabel={cardFormState.mode === "add" ? "Add" : "Update"}
				/>
			)}
		</main>
	);
}

export default KanbanBoard;
