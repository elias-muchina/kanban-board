import React, { useState } from "react";

interface ColumnFormProps {
	initialTitle?: string;
	onSubmit: (title: string) => void;
	onCancel: () => void;
	submitLabel: string;
}

function ColumnForm({
	initialTitle = "",
	onSubmit,
	onCancel,
	submitLabel,
}: ColumnFormProps) {
	const [title, setTitle] = useState(initialTitle);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			onSubmit(title.trim());
			setTitle("");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow border"
		>
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Column title..."
				className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				autoFocus
			/>
			<div className="flex gap-2">
				<button
					type="submit"
					disabled={!title.trim()}
					className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
				>
					{submitLabel}
				</button>
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer transition-colors"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

export default ColumnForm;
