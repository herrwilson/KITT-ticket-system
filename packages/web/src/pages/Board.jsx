import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '../features/kanban/KanbanColumn.jsx';
import {
	selectKanban,
	fetchBoardTickets,
	taskDragged,
} from '../features/kanban/kanbanSlice';

function BoardPage({ openModal }) {
	const tickets = useSelector(selectKanban);
	const dispatch = useDispatch();
	const { sendJsonMessage } = useWebSocket(
		`ws://${location.hostname}:8080/ws`,
		{ share: true }
	);

	// run once when mounted to fetch tickets and start a websocket connection
	useEffect(() => {
		dispatch(fetchBoardTickets());
		// https://stackoverflow.com/questions/59350881/useeffect-missing-dependency-when-using-redux-usedispatch
	}, [dispatch]);

	const didItMove = (source, destination) => {
		// compare source and destination to determine whether a ticket was moved
		// this is because dragging ticket outside of the board also counts as onDragEnd event
		// but nothing is actually supposed to happen
		if (!destination) return false;
		return !(
			source.droppableId === destination.droppableId &&
			source.index === destination.index
		);
	};

	const handleDragEnd = (event) => {
		// when ticket has been moved (after the fact), send related information to server
		// server then distributes the information to all clients
		const { draggableId: id, source, destination } = event;
		// ensure something actually moved
		if (!didItMove(source, destination)) return;
		sendJsonMessage({
			type: 'kanban/taskDragged',
			payload: { id, source, destination },
		});
		dispatch(taskDragged({ id, source, destination }));
	};

	return (
		<div id="board" className="flex flex-row justify-around w-3/5 mx-auto">
			<DragDropContext onDragEnd={handleDragEnd}>
				<KanbanColumn
					id="todo"
					title="Todo"
					tickets={tickets.todo}
					openModal={openModal}
				/>
				<KanbanColumn
					id="inProgress"
					title="In Progress"
					tickets={tickets.inProgress}
					openModal={openModal}
				/>
				<KanbanColumn
					id="waitingCustomer"
					title="Waiting Customer"
					tickets={tickets.waitingCustomer}
					openModal={openModal}
				/>
			</DragDropContext>
		</div>
	);
}

export default BoardPage;
