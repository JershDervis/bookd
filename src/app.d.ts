/// <reference types="@auth/sveltekit" />
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type { AwsDataApiPgQueryResultHKT } from 'drizzle-orm/aws-data-api/pg';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { DefaultSession } from '@auth/core/types';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	namespace App {
		interface Locals {
			db: PgDatabase<
				AwsDataApiPgQueryResultHKT,
				Record<string, never>,
				ExtractTablesWithRelations<Record<string, never>>
			>;
			getSession(): Promise<Session | null>;
		}
		interface Session extends DefaultSession {
			user: {
				id: string;
				// ...other properties
				// role: UserRole;
			} & DefaultSession['user'];
		}
		interface PageData {
			session: Session | null;
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
