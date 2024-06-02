/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TicketSchema } from '@KITT-TS/common';
import FormField from './FormField.jsx';
import DevicesList from './DevicesList.jsx';
import { Button } from '@mui/joy';

const TicketForm = ({ submitCallback, sendJsonMessage, ticketData }) => {
	const ticketId = ticketData.id ?? null;
	// initiate form, load default values
	const formMethods = useForm({
		resolver: zodResolver(TicketSchema),
		// default values in case creating a new ticket
		// all other fields are empty by default, but define one device to make its form appear
		defaultValues: { devices: [{ type: '' }] },
		// reactively update form when ticketData changes
		values: ticketData,
	});

	const onSubmit = async (data) => {
		if (ticketId !== null) {
			// editing
			try {
				sendJsonMessage({
					type: 'kanban/editTicket',
					payload: { data, id: ticketId },
				});
			} catch (err) {
				console.error(err);
			}
		} else {
			// new ticket
			try {
				sendJsonMessage({
					type: 'kanban/createTicket',
					payload: data,
				});
				submitCallback();
			} catch (err) {
				console.error(err);
			}
		}
		// close modal
		submitCallback();
	};

	return (
		<FormProvider {...formMethods}>
			<form
				className="flex flex-col"
				onSubmit={formMethods.handleSubmit(onSubmit)}
			>
				<div className="flex gap-2 flex-wrap">
					<FormField name={'title'} placeholder={'Title'} />
					<FormField name={'email'} placeholder={'Email'} />
					<FormField name={'phone'} placeholder={'Phone'} />
				</div>
				<FormField
					name={'additional_information'}
					placeholder="Additional information"
				/>
				<DevicesList />
				{/* button is disabled if values haven't been changed */}
				<Button
					variant="solid"
					type="submit"
					disabled={!formMethods?.formState?.isDirty}
				>
					Submit
				</Button>
			</form>
		</FormProvider>
	);
};

export default memo(
	TicketForm,
	(prev, next) => prev.ticketData === next.ticketData
);
