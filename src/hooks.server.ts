import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/database/db';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { NEXTAUTH_SECRET, GITHUB_ID, GITHUB_SECRET } from '$env/static/private';
import { pgDrizzleAdapter } from '$lib/database/auth-adapter';
import type { CallbacksOptions } from '@auth/core/types';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
const authHandler = SvelteKitAuth(async () => {
	return {
		adapter: pgDrizzleAdapter(db),
		secret: NEXTAUTH_SECRET,
		session: {
			strategy: 'database'
		},
		callbacks: {
			session: ({ session, user }) => ({
				...session,
				user: {
					...session?.user,
					id: user?.id
				}
			})
		} satisfies Partial<CallbacksOptions>,
		debug: import.meta.env.DEV,
		trustHost: true,
		providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })]
	} as SvelteKitAuthConfig;
}) satisfies Handle;

export const handle = sequence(authHandler);
