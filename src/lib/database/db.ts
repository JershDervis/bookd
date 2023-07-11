import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { DB_NAME, AWS_PROFILE_NAME, AWS_ARN_SECRET, AWS_ARN } from '$env/static/private';

let rdsClient = undefined;

if (import.meta.env.DEV) {
	rdsClient = new RDSDataClient({
		credentials: fromIni({
			profile: AWS_PROFILE_NAME,
			filepath: '.aws/credentials'
		}),
		region: 'ap-southeast-2'
	});
} else {
	rdsClient = new RDSDataClient({
		credentials: fromEnv(),
		region: 'ap-southeast-2'
	});
}

export const db = drizzle(rdsClient, {
	database: DB_NAME,
	resourceArn: AWS_ARN,
	secretArn: AWS_ARN_SECRET
});
