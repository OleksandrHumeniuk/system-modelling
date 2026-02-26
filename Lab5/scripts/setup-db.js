const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const PG_HOST = process.env.PG_HOST || '127.0.0.1';
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PORT = process.env.PG_PORT || '5432';
const PG_PASS = process.env.PG_PASS || 'pass1234';
const PG_DB = process.env.PG_DB || 'webdess';

async function setup() {
  const maintenance = new Client({
    host: PG_HOST,
    user: PG_USER,
    port: PG_PORT,
    password: PG_PASS,
    database: 'postgres',
  });

  try {
    await maintenance.connect();
    const { rows } = await maintenance.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [PG_DB]
    );
    if (rows.length === 0) {
      await maintenance.query(`CREATE DATABASE "${PG_DB}"`);
      console.log(`Created database "${PG_DB}".`);
    } else {
      console.log(`Database "${PG_DB}" already exists.`);
    }
  } finally {
    await maintenance.end();
  }

  const client = new Client({
    host: PG_HOST,
    user: PG_USER,
    port: PG_PORT,
    password: PG_PASS,
    database: PG_DB,
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(
      path.join(__dirname, '../db/config.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('Schema applied from db/config.sql.');
  } catch (err) {
    if (err.code === '42P07' || err.code === '42710') {
      console.log('Schema already applied (tables/types exist).');
    } else {
      throw err;
    }
  } finally {
    await client.end();
  }
}

setup().catch(err => {
  console.error(err);
  process.exit(1);
});
