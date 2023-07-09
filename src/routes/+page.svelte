<script lang="ts">
	import type { PageData } from './$types';
	import { signIn, signOut } from '@auth/sveltekit/client';

	export let data: PageData;
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">Let's get cracking bones!</h1>
		<h1>Welcome {data.session?.user?.name}</h1>
		<button on:click={() => signIn('github')}>Login</button>
		<button on:click={signOut}>Logout</button>
		<p>Start by exploring:</p>
		<ul>
			<li>
				<code class="code">/src/routes/+layout.svelte</code> - barebones layout, the CSS import order
				is critical!
			</li>
			<li>
				<code class="code">/src/app.postcss</code> - minimal css to make the page full screen, may not
				be relevant for your project
			</li>
			<li>
				<code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents
			</li>
		</ul>
	</div>
</div>
