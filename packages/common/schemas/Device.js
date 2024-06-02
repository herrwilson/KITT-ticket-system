import { z } from 'zod';

export default z.object({
	id: z.number().nullish(),
	type: z.string().min(1, { message: 'Required' }),
	brand: z.string(),
	model: z.string(),
	password: z.string(),
	issue: z.string(),
});
