import {
	useForm,
	useFormContext,
	useWatch,
	useFieldArray,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@mui/joy';
import Add from '@mui/icons-material/Add';
import { DeviceSchema } from '@KITT-TS/common';

const DevicesList = () => {
	// since DevicesList is inside a form, we can get and use the context
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const { fields, append, update, remove } = useFieldArray({
		control, // comes from useForm
		name: 'devices',
		// generates unique identifier named fieldId
		// however, defaults to "id" which would replace the device's real id
		keyName: 'fieldId',
	});

	return (
		<>
			<h2 className="text-lg">Devices</h2>
			{/* FIXME:
				in theory, the device list is scrollable due to overflow-scroll
				however, in reality this doesn't work because the modal does not have
				maximum height of any kind
			*/}
			<div className="overflow-y-scroll gap-2 flex flex-col h-[300px]">
				{fields.map((field, index) => (
					<Device
						key={field.fieldId}
						control={control}
						update={update}
						remove={remove}
						errors={errors?.devices && errors?.devices[index]}
						index={index}
						value={field}
					/>
				))}
			</div>
			<Button onClick={() => append({ type: '' })}>
				<Add />
			</Button>
		</>
	);
};

export default DevicesList;

const Display = ({ control, index }) => {
	// component for previewing device's info
	const data = useWatch({
		control: control,
		name: `devices.${index}`,
	});
	return (
		<>
			<span className="text-lg font-bold">{data?.type}</span>
			{data?.brand && <span className=""> {data.brand}</span>}
			{data?.model && <span> ({data.model})</span>}
		</>
	);
};

const Device = ({ control, update, remove, index, value }) => {
	const {
		register,
		handleSubmit,
		formState: { isDirty, errors },
	} = useForm({
		resolver: zodResolver(DeviceSchema),
		defaultValues: value,
	});

	return (
		<div className="border-solid border-black border-2 rounded-lg p-2">
			<div className="justify-between flex">
				<Display control={control} index={index} />
				{/* TODO: add confirmation */}
				<Button
					onClick={() => remove(index)}
					variant="text"
					sx={{ marginRight: '0', marginLeft: 'auto' }}
				>
					Remove
				</Button>
			</div>

			<div className="grid grid-cols-4 gap-2 mb-2">
				<ArrayFormField register={register} errors={errors} name={'type'} />
				<ArrayFormField register={register} errors={errors} name={'brand'} />
				<ArrayFormField register={register} errors={errors} name={'model'} />
				<ArrayFormField register={register} errors={errors} name={'password'} />
				<ArrayFormField register={register} errors={errors} name={'issue'} />
			</div>
			<Button
				disabled={!isDirty}
				onClick={handleSubmit((data) => update(index, data))}
			>
				Submit
			</Button>
		</div>
	);
};

const ArrayFormField = ({ register, errors, name, ...restProps }) => {
	return (
		<label>
			{/* space character is a must for some god forsaken reason to make capitalizing work*/}
			<span className="capitalize"> {name}</span>
			<Input
				color="neutral"
				size="md"
				variant="soft"
				sx={{ border: errors && errors[name] ? 'solid red' : '' }}
				{...register(name)}
				{...restProps}
			/>
			{errors && errors[name] && errors[name]?.message}
		</label>
	);
};
