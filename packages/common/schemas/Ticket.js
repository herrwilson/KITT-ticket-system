import { z } from 'zod';
import DeviceSchema from './Device.js';

export default z.object({
	id: z.number().nullish(),
	title: z.string().min(1, { message: 'Required' }),
	email: z.string().email().min(1, { message: 'Required' }),
	phone: z.string().min(9, { message: 'Required' }),
	additional_information: z.string().max(255),
	devices: DeviceSchema.array(),
});
