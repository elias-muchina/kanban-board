import React, { useState, useRef, useCallback, useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { DraggableListProps, DraggableItem, DragState } from "../../types";

function DraggableList<T extends DraggableItem>({
	items,
	renderItem,
	onReorder,
	onMove,
	onCrossMove,
	onItemGrabbed,
	listId = "draggable-list",
	direction = "vertical",
	className = "",
	ariaLabel = "Draggable list",
	dragClearTrigger = 0,
}: DraggableListProps<T>) {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		draggedIndex: null,
		draggedOverIndex: null,
		isKeyboardMode: false,
		grabbedIndex: null,
	});

	const listRef = useRef<HTMLDivElement>(null);
	const announcementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (
			dragState.grabbedIndex !== null &&
			dragState.grabbedIndex >= items.length
		) {
			setDragState((prev) => ({
				...prev,
				grabbedIndex: null,
				isKeyboardMode: false,
			}));
		}
	}, [items.length, dragState.grabbedIndex]);

	const draggedItemIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (dragState.isDragging && dragState.draggedIndex !== null) {
			const draggedItem = items[dragState.draggedIndex];
			if (draggedItem) {
				draggedItemIdRef.current = draggedItem.id;
			}
		} else {
			draggedItemIdRef.current = null;
		}
	}, [dragState.isDragging, dragState.draggedIndex, items]);

	useEffect(() => {
		if (dragState.isDragging && draggedItemIdRef.current) {
			const itemExists = items.some(
				(item) => item.id === draggedItemIdRef.current
			);
			if (!itemExists) {
				setDragState((prev) => ({
					...prev,
					isDragging: false,
					draggedIndex: null,
					draggedOverIndex: null,
				}));
				draggedItemIdRef.current = null;
			}
		}
	}, [items, dragState.isDragging]);

	useEffect(() => {
		if (dragClearTrigger > 0) {
			setDragState({
				isDragging: false,
				draggedIndex: null,
				draggedOverIndex: null,
				isKeyboardMode: false,
				grabbedIndex: null,
			});
			draggedItemIdRef.current = null;
		}
	}, [dragClearTrigger]);

	useEffect(() => {
		const cleanup = () => {
			setDragState((prev) => {
				if (prev.isDragging || prev.draggedIndex !== null) {
					return {
						isDragging: false,
						draggedIndex: null,
						draggedOverIndex: null,
						isKeyboardMode: prev.isKeyboardMode,
						grabbedIndex: prev.grabbedIndex,
					};
				}
				return prev;
			});
		};

		const handleGlobalDragEnd = () => {
			cleanup();
		};

		document.addEventListener("dragend", handleGlobalDragEnd);

		return () => {
			document.removeEventListener("dragend", handleGlobalDragEnd);
			cleanup();
		};
	}, []);

	const announce = useCallback((message: string) => {
		if (announcementRef.current) {
			announcementRef.current.textContent = message;
		}
	}, []);

	const handleDragStart = useCallback(
		(e: React.DragEvent, index: number) => {
			if (direction === "horizontal" && listId === "columns") {
				const target = e.target as HTMLElement;
				if (
					target.closest('.draggable-item[role="listitem"]') &&
					target.closest('[aria-label*="Cards in"]')
				) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			}

			setDragState((prev) => ({
				...prev,
				isDragging: true,
				draggedIndex: index,
				isKeyboardMode: false,
			}));

			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", `${listId}:${index}`);
			e.dataTransfer.setData("application/json", JSON.stringify(items[index]));

			const target = e.target as HTMLElement;
			target.setAttribute("aria-grabbed", "true");

			if (direction === "vertical" || listId !== "columns") {
				e.stopPropagation();
			}
		},
		[listId, items, direction]
	);

	const handleDragEnd = useCallback((e: React.DragEvent) => {
		setDragState({
			isDragging: false,
			draggedIndex: null,
			draggedOverIndex: null,
			isKeyboardMode: false,
			grabbedIndex: null,
		});

		const target = e.target as HTMLElement;
		target.setAttribute("aria-grabbed", "false");

		setTimeout(() => {
			setDragState((prev) => ({
				...prev,
				isDragging: false,
				draggedIndex: null,
				draggedOverIndex: null,
			}));
		}, 0);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		setDragState((prev) => ({
			...prev,
			draggedOverIndex: index,
		}));
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent, dropIndex: number) => {
			e.preventDefault();
			e.stopPropagation();

			const data = e.dataTransfer.getData("text/plain");
			const [sourceListId, sourceIndexStr] = data.split(":");
			const sourceIndex = parseInt(sourceIndexStr, 10);

			if (sourceListId === listId) {
				if (sourceIndex !== dropIndex) {
					onReorder(sourceIndex, dropIndex);
					announce(
						`Moved item from position ${sourceIndex + 1} to position ${
							dropIndex + 1
						}`
					);
				}
			} else if (onMove && sourceIndex >= 0) {
				try {
					const itemData = e.dataTransfer.getData("application/json");
					const item = itemData ? JSON.parse(itemData) : null;
					if (item) {
						onMove(item, listId, dropIndex);
						announce(`Moved item to ${ariaLabel} at position ${dropIndex + 1}`);
					}
				} catch (error) {
					console.error("Failed to parse drag data:", error);
				}
			}

			const clearState = {
				isDragging: false,
				draggedIndex: null,
				draggedOverIndex: null,
				isKeyboardMode: false,
				grabbedIndex: null,
			};
			setDragState(clearState);

			setTimeout(() => {
				setDragState(clearState);
			}, 50);
		},
		[listId, onReorder, onMove, items, ariaLabel, announce]
	);

	const handleFocus = useCallback(
		(_e: React.FocusEvent, index: number) => {
			if (dragState.grabbedIndex !== null && dragState.grabbedIndex !== index) {
				setDragState((prev) => ({
					...prev,
					grabbedIndex: null,
					isKeyboardMode: false,
				}));
			}
		},
		[dragState.grabbedIndex]
	);

	const handleBlur = useCallback((e: React.FocusEvent) => {
		const relatedTarget = e.relatedTarget as HTMLElement;
		const currentTarget = e.currentTarget as HTMLElement;
		const listContainer = currentTarget.closest(".draggable-list");

		if (!relatedTarget || !listContainer?.contains(relatedTarget)) {
			setDragState((prev) => ({
				...prev,
				grabbedIndex: null,
				isKeyboardMode: false,
			}));
		}
	}, []);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent, index: number) => {
			const { key } = e;

			if (key === " " || key === "Enter") {
				e.preventDefault();
				e.stopPropagation();

				const isGrabbing = dragState.grabbedIndex !== index;

				if (isGrabbing && onItemGrabbed) {
					onItemGrabbed();
				}

				setDragState((prev) => ({
					...prev,
					isKeyboardMode: true,
					grabbedIndex: prev.grabbedIndex === index ? null : index,
				}));

				const moveInstructions =
					direction === "vertical" && onCrossMove
						? "Use up/down arrows to move within column, left/right arrows to move between columns, Space to drop, Escape to cancel."
						: "Use arrow keys to move, Space to drop, Escape to cancel.";

				announce(
					isGrabbing
						? `Grabbed item at position ${index + 1}. ${moveInstructions}`
						: `Released item at position ${index + 1}`
				);
				return;
			}

			if (dragState.grabbedIndex !== index) {
				if (key.startsWith("Arrow")) {
					e.stopPropagation();
				}
				return;
			}

			if (key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				setDragState((prev) => ({
					...prev,
					grabbedIndex: null,
					isKeyboardMode: false,
				}));
				announce("Move cancelled");
				return;
			}

			let newIndex = index;
			let shouldMove = false;
			let shouldCrossMove = false;
			let crossDirection: "left" | "right" | null = null;

			if (key === "ArrowUp" && direction === "vertical") {
				newIndex = Math.max(0, index - 1);
				shouldMove = true;
			} else if (key === "ArrowDown" && direction === "vertical") {
				newIndex = Math.min(items.length - 1, index + 1);
				shouldMove = true;
			} else if (key === "ArrowLeft") {
				if (direction === "horizontal") {
					newIndex = Math.max(0, index - 1);
					shouldMove = true;
				} else if (direction === "vertical" && onCrossMove) {
					shouldCrossMove = true;
					crossDirection = "left";
				}
			} else if (key === "ArrowRight") {
				if (direction === "horizontal") {
					newIndex = Math.min(items.length - 1, index + 1);
					shouldMove = true;
				} else if (direction === "vertical" && onCrossMove) {
					shouldCrossMove = true;
					crossDirection = "right";
				}
			}

			if (key.startsWith("Arrow")) {
				e.preventDefault();
				e.stopPropagation();
			}

			if (shouldMove && newIndex !== index) {
				onReorder(index, newIndex);
				setDragState((prev) => ({ ...prev, grabbedIndex: newIndex }));
				announce(`Moved item to position ${newIndex + 1}`);
			} else if (shouldCrossMove && crossDirection && onCrossMove) {
				const item = items[index];
				if (item) {
					onCrossMove(item, crossDirection);
					setDragState((prev) => ({
						...prev,
						grabbedIndex: null,
						isKeyboardMode: false,
					}));
					announce(
						`Moved "${
							(item as any).title || "item"
						}" to the ${crossDirection} column`
					);
				}
			}
		},
		[
			dragState.grabbedIndex,
			direction,
			items.length,
			onReorder,
			onCrossMove,
			items,
			announce,
		]
	);

	return (
		<section
			className={`draggable-list ${className}`}
			ref={listRef}
			aria-label={`${ariaLabel} container`}
		>
			{/* Screen reader announcements */}
			<div
				ref={announcementRef}
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			/>

			<ul
				role="list"
				aria-label={ariaLabel}
				className={`flex ${
					direction === "vertical" ? "flex-col" : "flex-row"
				} gap-2 min-h-[50px]`}
			>
				{items.map((item, index) => {
					const isDragging =
						dragState.isDragging &&
						dragState.draggedIndex === index &&
						draggedItemIdRef.current === item.id;
					const isGrabbed = dragState.grabbedIndex === index;
					const isDraggedOver =
						dragState.draggedOverIndex === index &&
						dragState.draggedIndex !== index;

					return (
						<li
							key={item.id}
							draggable={!dragState.isKeyboardMode}
							onDragStart={(e) => handleDragStart(e, index)}
							onDragEnd={handleDragEnd}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={(e) => handleDrop(e, index)}
							onKeyDown={(e) => handleKeyDown(e, index)}
							onFocus={(e) => handleFocus(e, index)}
							onBlur={handleBlur}
							tabIndex={0}
							aria-grabbed={isGrabbed}
							aria-dropeffect={dragState.isDragging ? "move" : "none"}
							className={`
								draggable-item cursor-move transition-all duration-200 rounded-lg
								${isDragging ? "opacity-50 scale-95" : ""}
								${isGrabbed ? "ring-2 ring-blue-400 shadow-lg" : ""}
								${isDraggedOver && dragState.isDragging ? "border-t-4 border-blue-500" : ""}
								focus:outline-none
							`}
						>
							{renderItem(item, index, isDragging, isGrabbed)}
						</li>
					);
				})}

				{/* Invisible drop zone for end-of-list drops */}
				<div
					className="min-h-[20px] w-full"
					onDragOver={(e) => {
						e.preventDefault();
						e.dataTransfer.dropEffect = "move";
					}}
					onDrop={(e) => {
						e.preventDefault();

						const data = e.dataTransfer.getData("text/plain");
						const [sourceListId, sourceIndexStr] = data.split(":");
						const sourceIndex = parseInt(sourceIndexStr, 10);

						if (sourceListId !== listId && onMove && sourceIndex >= 0) {
							try {
								const itemData = e.dataTransfer.getData("application/json");
								const item = itemData ? JSON.parse(itemData) : null;
								if (item) {
									onMove(item, listId, items.length);
									announce(`Moved item to ${ariaLabel} at end of list`);
								}
							} catch (error) {
								console.error("Failed to parse drag data:", error);
							}
						}
					}}
				/>
			</ul>
		</section>
	);
}

export default DraggableList;
