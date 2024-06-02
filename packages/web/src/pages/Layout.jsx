/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import Button from '@mui/joy/Button';

function Layout({ openModal }) {
	const isArchive = window.location.pathname === '/archive';

	return (
		<div className="text-lg flex gap-5 items-center">
			<Button
				variant="solid"
				onClick={() => openModal(null /* no ticket id */)}
			>
				New ticket
			</Button>
			{isArchive ? <BoardLink /> : <ArchiveLink />}
		</div>
	);
}

function BoardLink() {
	return <Button onClick={() => (window.location = '/')}>Board</Button>;
}

function ArchiveLink() {
	return (
		<Button onClick={() => (window.location = '/archive')}>Archive</Button>
	);
}

export default memo(Layout);
