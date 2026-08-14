"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
exports.pool = new pg_1.Pool({
    connectionString: env_1.ENV.DATABASE_URL
});
exports.pool.on('connect', () => {
    console.log('⚡ Connected to PostgreSQL Database');
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});
//# sourceMappingURL=db.js.map