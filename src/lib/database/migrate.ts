import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { migrate } from 'drizzle-orm/aws-data-api/pg/migrator';
import { fromEnv } from '@aws-sdk/credential-providers';
import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { DB_NAME, AWS_ARN, AWS_ARN_SECRET } from '$env/static/private';

async function runMigrate() {
	const rdsClient = new RDSDataClient({
		credentials: fromEnv(),
		region: 'ap-southeast-2'
	});

	const db = drizzle(rdsClient, {
		database: DB_NAME,
		resourceArn: AWS_ARN,
		secretArn: AWS_ARN_SECRET
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
