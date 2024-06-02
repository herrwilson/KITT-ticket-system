import { useRef } from 'react';
import { FormControl, FormLabel, Input, Button } from '@mui/joy';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';

const Archive = () => {
	// essentially state for the input value
	const searchRef = useRef(null);
	// needed to use Tabulator methods
	let tableRef = useRef(null);

	const tabulatorOptions = {
		pagination: true,
		paginationSize: 6,
		paginationMode: 'remote',
		ajaxURL: `http://${location.hostname}:8080/api/archive`,
		ajaxParams: () => {
			// include search keyword if there is one
			const keyword = searchRef?.current?.value;
			if (!keyword) return {};
			return { search: keyword };
		},
		ajaxError: function (error) {
			console.log('ajaxError', error);
		},
	};

	const handleSearch = () => {
		// trigger re-fetch; don't ask why it's done like this
		// https://tabulator.info/docs/6.0/data#ajax
		tableRef.current.setData(`http://${location.hostname}:8080/api/archive`);
	};

	return (
		<div>
			<FormControl className="w-1/5">
				<FormLabel>Search</FormLabel>
				<Input
					slotProps={{
						input: {
							ref: searchRef,
						},
					}}
					placeholder="Placeholder"
				/>
			</FormControl>
			<Button onClick={handleSearch}>Search</Button>

			<ReactTabulator
				onRef={(r) => {
					tableRef.current = r.current;
				}}
				columns={[
					{ title: 'Status', field: 'status', hozAlign: 'center' },
					{ title: 'Name', field: 'title', hozAlign: 'center' },
					{ title: 'Created', field: 'creation_date', hozAlign: 'center' },
					{ title: 'Completed', field: 'completion_date', hozAlign: 'center' },
					{ title: 'Device type', field: 'type', hozAlign: 'center' },
				]}
				layout={'fitData'}
				options={tabulatorOptions}
				events={{
					dataLoaded: function (data) {
						return data;
					},
					ajaxError: function (error) {
						console.log('ajaxError', error);
					},
				}}
			/>
		</div>
	);
};

export default Archive;
