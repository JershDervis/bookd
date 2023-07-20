<script lang="ts">
	import type { PageData } from './$types';
	import { signIn, signOut } from '@auth/sveltekit/client';

	export let data: PageData;
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">Test</h1>
		<h1>Welcome {data.session?.user?.name}</h1>
		<button on:click={() => signIn('github')}>Login</button>
		<button on:click={signOut}>Logout</button>
	</div>
</div>
