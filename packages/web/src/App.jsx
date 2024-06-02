import useWebSocket from 'react-use-websocket';
import { lazy, Suspense, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Layout from './pages/Layout.jsx';
import BoardPage from './pages/Board.jsx';
import ArchivePage from './pages/Archive.jsx';
const TicketModal = lazy(() => import('./features/modals/TicketModal'));

function App() {
	// states and handlers for the ticket modal
	const [editTicketId, setEditTicketId] = useState(null);
	const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

	const handleOpenModal = (ticketId) => {
		if (ticketId !== null) setEditTicketId(ticketId);
		setIsTicketModalOpen(true);
	};

	const handleModalClose = () => {
		if (editTicketId !== null) setEditTicketId(null);
		setIsTicketModalOpen(false);
	};

	// main listener for websocket messages
	// dispatches redux actions based on message type and action
	const dispatch = useDispatch();
	useWebSocket(`ws://${location.hostname}:8080/ws`, {
		onMessage: (data) => {
			try {
				const { type, action } = JSON.parse(data.data);
				if (type === 'dispatch') {
					dispatch(action);
				}
			} catch (error) {
				console.error('FAILED TO PARSE WS MESSAGE');
				console.log(data);
			}
		},
		// this is an important option and should be always used
		// tl;dr: setting it true prevents each component from creating a new connection
		// and instead uses the same one
		// https://github.com/robtaussig/react-use-websocket?tab=readme-ov-file#share-boolean
		share: true,
	});

	return (
		<>
			<Layout openModal={handleOpenModal} />
			<Routes>
				<Route path="/" element={<BoardPage openModal={handleOpenModal} />} />
				<Route path="/archive" element={<ArchivePage />} />
			</Routes>
			<Suspense>
				<TicketModal
					isOpen={isTicketModalOpen}
					handleClose={handleModalClose}
					ticketId={editTicketId}
				/>
			</Suspense>
		</>
	);
}

export default App;
