import React, { useState } from "react";
import type { KanbanCardProps, Priority } from "../../types";

interface CardFormProps {
	initialCard?: Partial<KanbanCardProps>;
	columnId: string;
	onSubmit: (card: Omit<KanbanCardProps, "id">) => void;
	onCancel: () => void;
	submitLabel: string;
}

function CardForm({
	initialCard,
	columnId,
	onSubmit,
	onCancel,
	submitLabel,
}: CardFormProps) {
	const [formData, setFormData] = useState({
		title: initialCard?.title || "",
		description: initialCard?.description || "",
		assignee: initialCard?.assignee || "",
		priority: (initialCard?.priority || "Medium") as Priority,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.title.trim() && formData.assignee.trim()) {
			onSubmit({
				...formData,
				columnId,
				title: formData.title.trim(),
				assignee: formData.assignee.trim(),
			});
		}
	};

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			role="dialog"
			aria-modal="true"
			aria-labelledby="card-form-title"
		>
			<form
				onSubmit={handleSubmit}
				className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
			>
				<header>
					<h3 id="card-form-title" className="text-lg font-semibold mb-4">
						{submitLabel} Card
					</h3>
				</header>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Title *
						</label>
						<input
							id="title"
							type="text"
							value={formData.title}
							onChange={(e) => handleChange("title", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							autoFocus
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Description
						</label>
						<textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleChange("description", e.target.value)}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="assignee"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Assignee *
						</label>
						<input
							id="assignee"
							type="text"
							value={formData.assignee}
							onChange={(e) => handleChange("assignee", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="priority"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Priority
						</label>
						<select
							id="priority"
							value={formData.priority}
							onChange={(e) => handleChange("priority", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="Low">Low</option>
							<option value="Medium">Medium</option>
							<option value="High">High</option>
						</select>
					</div>
				</div>

				<div className="flex gap-3 mt-6">
					<button
						type="submit"
						disabled={!formData.title.trim() || !formData.assignee.trim()}
						className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
					>
						{submitLabel}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}

export default CardForm;
