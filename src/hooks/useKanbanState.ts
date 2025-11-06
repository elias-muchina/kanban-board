import { useState, useEffect, useCallback } from "react";
import type { KanbanColumn, KanbanCardProps } from "../types";
import { columns as initialColumns, cards as initialCards } from "../data";

const STORAGE_KEY = "kanban-board-state";

interface KanbanState {
	columns: KanbanColumn[];
	cards: KanbanCardProps[];
}

export function useKanbanState() {
	const [state, setState] = useState<KanbanState>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch (error) {
				console.error("Failed to parse stored kanban state:", error);
			}
		}
		return {
			columns: initialColumns,
			cards: initialCards,
		};
	});

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}, [state]);

	// Column management
	const addColumn = useCallback((title: string) => {
		const newColumn: KanbanColumn = {
			id: `column-${Date.now()}`,
			title,
		};
		setState((prev) => ({
			...prev,
			columns: [...prev.columns, newColumn],
		}));
	}, []);

	const updateColumn = useCallback((columnId: string, title: string) => {
		setState((prev) => ({
			...prev,
			columns: prev.columns.map((col) =>
				col.id === columnId ? { ...col, title } : col
			),
		}));
	}, []);

	const deleteColumn = useCallback((columnId: string) => {
		setState((prev) => ({
			...prev,
			columns: prev.columns.filter((col) => col.id !== columnId),
			cards: prev.cards.filter((card) => card.columnId !== columnId),
		}));
	}, []);

	const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
		setState((prev) => {
			const newColumns = [...prev.columns];
			const [movedColumn] = newColumns.splice(fromIndex, 1);
			newColumns.splice(toIndex, 0, movedColumn);
			return { ...prev, columns: newColumns };
		});
	}, []);

	// Card management
	const addCard = useCallback((card: Omit<KanbanCardProps, "id">) => {
		const newCard: KanbanCardProps = {
			...card,
			id: `card-${Date.now()}`,
		};
		setState((prev) => ({
			...prev,
			cards: [...prev.cards, newCard],
		}));
	}, []);

	const updateCard = useCallback(
		(cardId: string, updates: Partial<KanbanCardProps>) => {
			setState((prev) => ({
				...prev,
				cards: prev.cards.map((card) =>
					card.id === cardId ? { ...card, ...updates } : card
				),
			}));
		},
		[]
	);

	const deleteCard = useCallback((cardId: string) => {
		setState((prev) => ({
			...prev,
			cards: prev.cards.filter((card) => card.id !== cardId),
		}));
	}, []);

	const moveCard = useCallback(
		(
			cardId: string,
			_fromColumnId: string,
			toColumnId: string,
			newIndex: number
		) => {
			setState((prev) => {
				const card = prev.cards.find((c) => c.id === cardId);
				if (!card) {
					return prev;
				}

				// Remove card from its current position
				const otherCards = prev.cards.filter((c) => c.id !== cardId);

				// Get cards in the target column
				const targetColumnCards = otherCards.filter(
					(c) => c.columnId === toColumnId
				);

				// Insert card at the new position
				const updatedCard = { ...card, columnId: toColumnId };
				const finalCards = [
					...otherCards.filter((c) => c.columnId !== toColumnId),
					...targetColumnCards.slice(0, newIndex),
					updatedCard,
					...targetColumnCards.slice(newIndex),
				];

				return { ...prev, cards: finalCards };
			});
		},
		[]
	);

	const reorderCardsInColumn = useCallback(
		(columnId: string, fromIndex: number, toIndex: number) => {
			setState((prev) => {
				const columnCards = prev.cards.filter((c) => c.columnId === columnId);
				const otherCards = prev.cards.filter((c) => c.columnId !== columnId);

				const [movedCard] = columnCards.splice(fromIndex, 1);
				columnCards.splice(toIndex, 0, movedCard);

				return {
					...prev,
					cards: [...otherCards, ...columnCards],
				};
			});
		},
		[]
	);

	const getCardsForColumn = useCallback(
		(columnId: string) => {
			return state.cards.filter((card) => card.columnId === columnId);
		},
		[state.cards]
	);

	return {
		columns: state.columns,
		cards: state.cards,
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
	};
}
