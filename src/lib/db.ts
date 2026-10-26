import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://account-mahedi245.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTI5OTA4NzEsImlkIjoiMDFhMTc2OTQtNjkwMS03YzMzLWFhMzgtZjNjNGIxZWU3MTVlIiwia2lkIjoiTkZWanc1ZXB6TUNQQ2NRN3RjZE5IQktnaklXb0NOS2RQNExXZXkwVEVtWSIsInJpZCI6IjA0ZGQ2OWMwLTQyMjgtNDVkNC04YTEzLTkxNDdkNmI2NTMxZCJ9.HQloRFey0KMQx8zYzaJdczSprx0TxWLp6veipsHwBqCjylDhVBrxiHGNIYwkdcrwi99_BqcHzunFvkUUTxt5Dg',
});
