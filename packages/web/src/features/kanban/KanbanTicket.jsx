/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';

function KanbanTicket({ ticket, index, openModal }) {
	return (
		<Draggable draggableId={String(ticket.id)} index={index}>
			{(provided) => (
				<div
					onClick={() => openModal(ticket.id)}
					className="border-2 border-black p-2 mt-2"
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					<h1>{ticket.title}</h1>
					<h1>{ticket.creation_date}</h1>
					<h1>Devices: {ticket.devices.length}</h1>
				</div>
			)}
		</Draggable>
	);
}

// memoize the ticket component to only re-render them if the ticket's data or its position changes
// this is to avoid rerenders caused by changes in parent elements
// for example, normally, adding a new ticket would rerender literally ALL the tickets even though only one changed
export default memo(
	KanbanTicket,
	(prevProps, nextProps) =>
		prevProps.ticket === nextProps.ticket && prevProps.index === nextProps.index
);
