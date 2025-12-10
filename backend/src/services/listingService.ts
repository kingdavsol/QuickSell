import { query } from '../database/connection';
import { logger } from '../config/logger';

export const createListing = async (userId: number, listingData: any) => {
  try {
    const {
      title,
      description,
      category,
      price,
      condition,
      brand,
      model,
      color,
      size,
      fulfillment_type = 'both',
      photos = [],
    } = listingData;

    const result = await query(
      `INSERT INTO listings 
      (user_id, title, description, category, price, condition, brand, model, color, size, fulfillment_type, photos, status, ai_generated) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *`,
      [
        userId,
        title,
        description,
        category,
        price,
        condition,
        brand,
        model,
        color,
        size,
        fulfillment_type,
        JSON.stringify(photos),
        'draft',
        true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create listing error:', error);
    throw error;
  }
};

export const getListings = async (userId: number, page = 1, limit = 10, fulfillmentType?: string) => {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause = 'user_id = $1 AND deleted_at IS NULL';
    const params: any[] = [userId, limit, offset];
    
    if (fulfillmentType && ['local', 'shipping', 'both'].includes(fulfillmentType)) {
      whereClause += ' AND (fulfillment_type = $4 OR fulfillment_type = \'both\')';
      params.push(fulfillmentType);
    }

    const result = await query(
      `SELECT * FROM listings WHERE ${whereClause} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM listings WHERE ${whereClause.replace(/\$2|\$3/g, (m) => m === '$2' ? '$2' : '$3')}`,
      fulfillmentType ? [userId, fulfillmentType] : [userId]
    );

    return {
      listings: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  } catch (error) {
    logger.error('Get listings error:', error);
    throw error;
  }
};

export const getListing = async (id: number, userId: number) => {
  try {
    const result = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Get listing error:', error);
    throw error;
  }
};

export const updateListing = async (id: number, userId: number, updateData: any) => {
  try {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const result = await query(
      `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
      [...values, id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Update listing error:', error);
    throw error;
  }
};

export const publishListing = async (id: number, userId: number, marketplaces: string[]) => {
  try {
    // Get the listing
    const listing = await getListing(id, userId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Update status and track which marketplaces we're publishing to
    const marketplaceListings: Record<string, { status: string; posted_at: string | null; external_id: string | null }> = {};
    for (const marketplace of marketplaces) {
      marketplaceListings[marketplace] = {
        status: 'pending',
        posted_at: null,
        external_id: null,
      };
    }

    const result = await query(
      `UPDATE listings 
       SET status = $1, marketplace_listings = $2, updated_at = NOW() 
       WHERE id = $3 AND user_id = $4 
       RETURNING *`,
      ['publishing', JSON.stringify(marketplaceListings), id, userId]
    );
    
    return result.rows[0];
  } catch (error) {
    logger.error('Publish listing error:', error);
    throw error;
  }
};

export const updateMarketplaceStatus = async (
  listingId: number, 
  marketplace: string, 
  status: string, 
  externalId?: string
) => {
  try {
    const result = await query(
      `UPDATE listings 
       SET marketplace_listings = jsonb_set(
         marketplace_listings, 
         $1::text[], 
         $2::jsonb
       ),
       updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [
        [marketplace],
        JSON.stringify({
          status,
          posted_at: status === 'posted' ? new Date().toISOString() : null,
          external_id: externalId || null,
        }),
        listingId,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Update marketplace status error:', error);
    throw error;
  }
};

export const deleteListing = async (id: number, userId: number) => {
  try {
    const result = await query(
      'UPDATE listings SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Delete listing error:', error);
    throw error;
  }
};

export const getListingsForMarketplace = async (userId: number, fulfillmentType: 'local' | 'shipping' | 'both') => {
  try {
    const result = await query(
      `SELECT * FROM listings 
       WHERE user_id = $1 
       AND deleted_at IS NULL 
       AND (fulfillment_type = $2 OR fulfillment_type = 'both')
       ORDER BY created_at DESC`,
      [userId, fulfillmentType]
    );
    return result.rows;
  } catch (error) {
    logger.error('Get listings for marketplace error:', error);
    throw error;
  }
};
