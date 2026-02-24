import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Models that use soft-delete (have `isDeleted` boolean)
const softDeleteModels = new Set(['User', 'Course', 'Enrollment']);

prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
	// Only modify queries for models that support soft-delete
	if (!params.model || !softDeleteModels.has(params.model)) {
		return next(params);
	}

	// Actions to automatically filter out soft-deleted rows
	const readActions = new Set(['findUnique', 'findFirst', 'findMany', 'count', 'aggregate']);

	try {
		if (readActions.has(params.action)) {
			// Ensure args object exists
			params.args = params.args ?? {};

			// For findUnique, convert to findFirst so a where filter can be combined
			if (params.action === 'findUnique') {
				params.action = 'findFirst';
			}

			// Merge existing where with isDeleted: false
			const where = params.args.where ?? {};
			// Avoid overwriting an explicit isDeleted condition
			if (Object.prototype.hasOwnProperty.call(where, 'isDeleted') === false) {
				params.args.where = { ...where, isDeleted: false };
			}
		}
	} catch (err) {
		// If middleware fails for any reason, continue without modification
		// (do not block queries in production)
		// eslint-disable-next-line no-console
		console.error('Soft-delete middleware error:', err);
	}

	return next(params);
});

export default prisma;
