import KanbanBoard from "./components/kanban/KanbanBoard";
import "./index.css";

function App() {
	return (
		<main
			className="w-full min-h-screen"
			role="application"
			aria-label="Kanban Board Application"
		>
			<KanbanBoard title="Drag-and-Drop Kanban Board" />
		</main>
	);
}

export default App;
