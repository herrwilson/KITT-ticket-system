import { Input } from '@mui/joy';
import { useFormContext } from 'react-hook-form';

const FormField = ({ name, placeholder = '', ...restProps }) => {
	/*
	a component for inputs directly inside <form> element
	inputs for an array such as the Device list in Ticket
	use another component (<ArrayFormField />) found in DevicesList.jsx
	*/
	const {
		register,
		formState: { errors },
	} = useFormContext();
	return (
		<label>
			<span className="capitalize">{name.replaceAll('_', ' ')}</span>
			<Input
				color="neutral"
				size="md"
				variant="soft"
				{...register(name)}
				placeholder={placeholder}
				{...restProps}
			/>
			{errors[name]?.message && <p>{errors[name]?.message}</p>}
		</label>
	);
};

export default FormField;
