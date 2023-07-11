import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { migrate } from 'drizzle-orm/aws-data-api/pg/migrator';
import { fromEnv } from '@aws-sdk/credential-providers';
import { drizzle } from 'drizzle-orm/aws-data-api/pg';

import 'dotenv/config';

async function runMigrate() {
	const envVariables = ['DB_NAME', 'AWS_ARN', 'AWS_ARN_SECRET'];
	envVariables.forEach((element) => {
		if (!process.env[element]) {
			throw new Error(`${element} is not defined`);
		}
	});

	const rdsClient = new RDSDataClient({
		credentials: fromEnv(),
		region: 'ap-southeast-2'
	});

	const db = drizzle(rdsClient, {
		database: process.env.DB_NAME as string,
		resourceArn: process.env.AWS_ARN as string,
		secretArn: process.env.AWS_ARN_SECRET as string
	});

	console.log('Running migrations...');

	const start = Date.now();
	await migrate(db, { migrationsFolder: './src/lib/database/migrations' });
	const end = Date.now();

	console.log(`✅ Migrations completed in ${end - start}ms`);

	process.exit(0);
}

runMigrate().catch((err) => {
	console.error('❌ Migration failed');
	console.error(err);
	process.exit(1);
});
