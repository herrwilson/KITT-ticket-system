import { Droppable } from '@hello-pangea/dnd';
import KanbanTicket from './KanbanTicket.jsx';

function KanbanColumn({ id, title, tickets, openModal }) {
	return (
		<section>
			<h1>{title}</h1>
			<Droppable droppableId={id}>
				{(provided) => (
					<ul ref={provided.innerRef} {...provided.droppableProps}>
						{tickets.map((ticket, index) => (
							<KanbanTicket
								key={ticket.id}
								ticket={ticket}
								index={index}
								openModal={openModal}
							/>
						))}
						{provided.placeholder}
					</ul>
				)}
			</Droppable>
		</section>
	);
}

export default KanbanColumn;
