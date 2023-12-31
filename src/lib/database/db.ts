import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { migrate } from 'drizzle-orm/aws-data-api/pg/migrator';
import { DB_NAME, AWS_PROFILE_NAME, AWS_ARN_SECRET, AWS_ARN } from '$env/static/private';

//  Region the AWS rds is on
const region = 'ap-southeast-2';

export const db = drizzle(
	import.meta.env.DEV
		? new RDSDataClient({
				credentials: fromIni({
					profile: AWS_PROFILE_NAME,
					filepath: '.aws/credentials'
				}),
				region: region
		  })
		: new RDSDataClient({
				credentials: fromEnv(),
				region: region
		  }),
	{
		database: DB_NAME,
		resourceArn: AWS_ARN,
		secretArn: AWS_ARN_SECRET
	}
);

//  Migrate db to the latest if possible.
//  For prod, need to only call this once on build
if (import.meta.env.DEV) {
	await migrate(db, {
		migrationsFolder: './src/lib/database/migrations'
	});
}
