import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchBoardTickets = createAsyncThunk(
	'kanban/fetchActiveTickets',
	async () => {
		const response = await fetch(
			`http://${location.hostname}:8080/api/board`
		).then((data) => data.json());
		return response.data;
	}
);

const kanbanSlice = createSlice({
	name: 'kanban',
	initialState: {
		todo: [],
		inProgress: [],
		waitingCustomer: [],
		idToStatusMap: {}, // for quickly identifying ticket status from id
	},
	reducers: {
		taskDragged: (state, action) => {
			const { id, source, destination } = action.payload;
			// in case source index has not been defined find the index in the column
			if (source.index === null)
				source.index = state[source.droppableId].findIndex(
					(ticket) => ticket.id === id
				);
			// return if not found
			if (source.index === -1) return;

			const itemMoved = {
				...state[source.droppableId][source.index],
				status: destination.droppableId,
			};
			// if the item straight up doesnt exist or the id's don't match, abort
			if (!itemMoved || itemMoved.id !== Number(id)) return;

			// remove from original column
			state[source.droppableId].splice(source.index, 1);
			// add to new column
			state[destination.droppableId].splice(destination.index, 0, itemMoved);
			state.idToStatusMap[id] = destination.droppableId;
			return state;
		},
		createTicket: (state, action) => {
			// submitting form sends the data to the backend, where it's saved to db
			// after that backend loops through clients and activates this action for each client
			// yoink the index and delete the original value from the payload
			// to prevent it from being saved to state. Having it there would lead to confusion
			const index = action.payload.indexInCol;
			delete action.payload.indexInCol;
			state[action.payload.status].splice(index, 0, action.payload);
			state.idToStatusMap[action.payload.id] = action.payload.status;
			return state;
		},
		editTicket: (state, action) => {
			const index = state[action.payload.status].findIndex(
				(ticket) => ticket.id === action.payload.id
			);
			if (index === -1)
				throw `ticket with id ${action.payload.id} does not exist with status ${action.payload.status}`;

			// replace old data
			state[action.payload.status].splice(index, 1, action.payload);
			state.idToStatusMap[action.payload.id] = action.payload.status;
			return state;
		},
		deleteDevice: (state, action) => {
			const { deviceId, ticketId, ticketStatus } = action.payload;
			const ticketIndex = state[ticketStatus].findIndex(
				(ticket) => ticket.id === ticketId
			);
			if (ticketIndex === -1)
				throw `ticket with id ${ticketId} does not exist with status ${ticketStatus}`;

			const deviceIndex = state[ticketStatus][ticketIndex].devices.findIndex(
				(device) => device.id === deviceId
			);
			if (deviceIndex === -1)
				throw `device with id ${deviceId} does not exist for ticket id ${ticketId}`;

			// remove one device at index deviceIndex
			state[ticketStatus][ticketIndex].devices.splice(deviceIndex, 1);
			delete state.idToStatusMap[ticketId];
			return state;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBoardTickets.fulfilled, (_state, action) => {
			// generate a map of ticket ids and statuses for easy checking
			const flatTicketList = Object.values(action.payload).flat();
			const idToStatusMap = {};
			for (const ticket of flatTicketList) {
				idToStatusMap[ticket.id] = ticket.status;
			}
			// return the new state
			return {
				...action.payload,
				idToStatusMap,
			};
		});
	},
});

export const { taskDragged, createTicket } = kanbanSlice.actions;
export default kanbanSlice.reducer;

// SELECTORS
// all active tickets
export const selectKanban = (state) => state.kanban;
export const getTicketById = (state, ticketId) => {
	if (!ticketId) return null;
	const status = state.idToStatusMap[ticketId];
	const index = state[status]?.findIndex((ticket) => ticket.id === ticketId);
	return state[status][index];
};
