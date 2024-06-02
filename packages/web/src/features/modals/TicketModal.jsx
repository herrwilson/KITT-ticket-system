/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import useWebSocket from 'react-use-websocket';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import TicketForm from '../forms/TicketForm';
import { getTicketById } from '../kanban/kanbanSlice';
import { useSelector, useDispatch } from 'react-redux';
import { taskDragged } from '../kanban/kanbanSlice';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function TicketModal({ isOpen = false, ticketId = null, handleClose }) {
	const dispatch = useDispatch();
	// create a websocket connection
	const { sendJsonMessage } = useWebSocket(
		`ws://${location.hostname}:8080/ws`,
		{ share: true }
	);

	const ticketData = useSelector((state) =>
		getTicketById(state.kanban, ticketId)
	);

	const handleStatusChange = (event) => {
		const newStatus = event.target.value;
		// cancel if nothing happened
		if (ticketData?.status === newStatus) return;

		// if souce index is not defined, it looks it up from the column in the action
		const source = { index: null, droppableId: ticketData.status };
		const destination = { index: 0, droppableId: newStatus };

		// sync others and self
		sendJsonMessage({
			type: 'kanban/taskDragged',
			payload: { id: ticketData.id, source, destination },
		});
		dispatch(taskDragged({ id: ticketData.id, source, destination }));
	};

	return (
		<Modal
			open={isOpen}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-desciption"
		>
			<div className="mx-auto h-full">
				<Grid container className="gap-6 justify-center">
					<Grid item xs={4} className="bg-white rounded-lg p-4">
						<Typography id="modal-modal-title" variant="h6" component="h1">
							{ticketId ? 'Edit ticket' : 'New Ticket'}
						</Typography>
						<TicketForm
							submitCallback={handleClose}
							sendJsonMessage={sendJsonMessage}
							ticketData={ticketData}
						/>
					</Grid>
					<Grid item xs={3} className="ml-2 bg-white rounded-lg p-4">
						<Typography id="modal-modal-title" variant="h6" component="h1">
							Actions
						</Typography>

						<FormControl>
							<InputLabel id="status-dropdown-label">Status</InputLabel>
							<Select
								labelId="status-dropdown-label"
								id="status-dropdown"
								value={ticketData?.status ?? 'todo'}
								label="status"
								onChange={handleStatusChange}
								disabled={!ticketData?.id}
							>
								<MenuItem value={'todo'}>Todo</MenuItem>
								<MenuItem value={'inProgress'}>In Progress</MenuItem>
								<MenuItem value={'waitingCustomer'}>Waiting Customer</MenuItem>
								<MenuItem value={'archive'}>Archived</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</div>
		</Modal>
	);
}

// ensure ticketmodal is only re-rendered when actually needed;
// see KanbanTicket.jsx component for more detailed explanation on memoization
export default memo(
	TicketModal,
	(prevProps, nextProps) =>
		prevProps.isOpen === nextProps.isOpen &&
		prevProps.ticketId === nextProps.ticketId
);
