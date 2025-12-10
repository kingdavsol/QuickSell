/**
 * Migration: Add encrypted_password field to marketplace_accounts
 * This allows storing encrypted credentials for bulk marketplace signup
 */

export const up = async (knex: any) => {
  return knex.schema.table('marketplace_accounts', (table: any) => {
    // Add encrypted_password column for storing encrypted credentials
    table.text('encrypted_password').nullable();

    // Add index for performance
    table.index(['user_id', 'marketplace_name']);
  });
};

export const down = async (knex: any) => {
  return knex.schema.table('marketplace_accounts', (table: any) => {
    table.dropColumn('encrypted_password');
    table.dropIndex(['user_id', 'marketplace_name']);
  });
};
