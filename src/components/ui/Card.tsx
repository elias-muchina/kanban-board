import type { CardProps } from "../../types";

function Card({ children }: CardProps) {
	return (
		<article className="bg-gray-200 rounded-lg shadow p-4 cursor-pointer hover:bg-gray-300 transition">
			{children}
		</article>
	);
}

export default Card;
