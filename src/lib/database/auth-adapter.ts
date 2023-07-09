import type { Adapter, AdapterAccount, AdapterUser } from '@auth/core/adapters';
import { eq, and, sql } from 'drizzle-orm';
import type { db } from '$lib/database/db';
import { users, accounts, sessions, verificationTokens } from '$lib/database/schema/auth';

export type DbClient = typeof db;

export function pgDrizzleAdapter(client: DbClient): Adapter {
	return {
		createUser: async (data) => {
			return client
				.insert(users)
				.values({ ...data, id: crypto.randomUUID() })
				.returning()
				.then((res) => res[0]);
		},
		getUser: async (data) => {
			return (
				client
					.select()
					.from(users)
					.where(eq(users.id, data))
					.then((res) => res[0]) ?? null
			);
		},
		getUserByEmail: async (data) => {
			return (
				client
					.select()
					.from(users)
					.where(eq(users.email, data))
					.then((res) => res[0]) ?? null
			);
		},
		createSession: async (data) => {
			const massagedData = {
				...data,
				//  Datetime workaround
				expires: sql`to_timestamp(${data.expires.getTime()})`
			};
			return client
				.insert(sessions)
				.values(massagedData)
				.returning()
				.then((res) => res[0]);
		},
		getSessionAndUser: async (data) => {
			return (
				client
					.select({
						session: sessions,
						user: users
					})
					.from(sessions)
					.where(eq(sessions.sessionToken, data))
					.innerJoin(users, eq(users.id, sessions.userId))
					.then((res) => res[0]) ?? null
			);
		},
		updateUser: async (data) => {
			if (!data.id) {
				throw new Error('No user id.');
			}

			return client
				.update(users)
				.set(data)
				.where(eq(users.id, data.id))
				.returning()
				.then((res) => res[0]);
		},
		updateSession: async (data) => {
			return client
				.update(sessions)
				.set(data)
				.where(eq(sessions.sessionToken, data.sessionToken))
				.returning()
				.then((res) => res[0]);
		},
		linkAccount: async (rawAccount) => {
			const updatedAccount = await client
				.insert(accounts)
				.values(rawAccount)
				.returning()
				.then((res) => res[0]);

			// Drizzle will return `null` for fields that are not defined.
			// However, the return type is expecting `undefined`.
			const account = {
				...updatedAccount,
				access_token: updatedAccount.access_token ?? undefined,
				token_type: updatedAccount.token_type ?? undefined,
				id_token: updatedAccount.id_token ?? undefined,
				refresh_token: updatedAccount.refresh_token ?? undefined,
				scope: updatedAccount.scope ?? undefined,
				expires_at: updatedAccount?.expires_at ?? undefined,
				session_state: updatedAccount.session_state ?? undefined
			} satisfies AdapterAccount | null | undefined;

			return account;
		},
		getUserByAccount: async (account) => {
			const dbAccount = await client
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.providerAccountId, account.providerAccountId),
						eq(accounts.provider, account.provider)
					)
				)
				.leftJoin(users, eq(accounts.userId, users.id))
				.then((res) => res[0]);

			return (dbAccount?.users ?? null) satisfies AdapterUser | null;
		},
		deleteSession: async (sessionToken) => {
			const session = await client
				.delete(sessions)
				.where(eq(sessions.sessionToken, sessionToken))
				.returning()
				.then((res) => res[0] ?? null);

			return session;
		},
		createVerificationToken: async (token) => {
			const massagedData = {
				...token,
				expires: sql`to_timestamp(${token.expires.getTime()})`
			};
			return client
				.insert(verificationTokens)
				.values(massagedData)
				.returning()
				.then((res) => res[0]);
		},
		useVerificationToken: async (token) => {
			try {
				return (
					client
						.delete(verificationTokens)
						.where(
							and(
								eq(verificationTokens.identifier, token.identifier),
								eq(verificationTokens.token, token.token)
							)
						)
						.returning()
						.then((res) => res[0]) ?? null
				);
			} catch (err) {
				throw new Error('No verification token found.');
			}
		},
		deleteUser: async (id) => {
			await client
				.delete(users)
				.where(eq(users.id, id))
				.returning()
				.then((res) => res[0] ?? null);
		},
		unlinkAccount: async (account) => {
			const { type, provider, providerAccountId, userId } = await client
				.delete(accounts)
				.where(
					and(
						eq(accounts.providerAccountId, account.providerAccountId),
						eq(accounts.provider, account.provider)
					)
				)
				.returning()
				.then((res) => res[0] ?? null);

			return { provider, type, providerAccountId, userId };
		}
	};
}
