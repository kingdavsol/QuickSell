/**
 * eBay API Integration
 * Uses the Inventory API to create and publish listings
 */

import eBayApi from 'ebay-api';
import { logger } from '../config/logger';

// eBay API configuration
const getEbayClient = (accessToken: string) => {
  return new eBayApi({
    appId: process.env.EBAY_APP_ID || '',
    certId: process.env.EBAY_CERT_ID || '',
    sandbox: process.env.EBAY_SANDBOX === 'true',
    siteId: eBayApi.SiteId.EBAY_US,
    marketplaceId: eBayApi.MarketplaceId.EBAY_US,
    authToken: accessToken,
  });
};

interface ListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  brand?: string;
  photos: string[];
  fulfillmentType: 'local' | 'shipping' | 'both';
  sku?: string;
}

interface EbayListingResult {
  success: boolean;
  listingId?: string;
  offerId?: string;
  error?: string;
}

/**
 * Create an inventory item on eBay
 */
export const createInventoryItem = async (
  accessToken: string,
  sku: string,
  listingData: ListingData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const ebay = getEbayClient(accessToken);

    const inventoryItem = {
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
      condition: mapCondition(listingData.condition),
      product: {
        title: listingData.title,
        description: listingData.description,
        imageUrls: listingData.photos,
        brand: listingData.brand || 'Unbranded',
      },
    };

    await ebay.sell.inventory.createOrReplaceInventoryItem(sku, inventoryItem);

    logger.info(`Created eBay inventory item: ${sku}`);
    return { success: true };
  } catch (error: any) {
    logger.error('eBay createInventoryItem error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create inventory item' 
    };
  }
};

/**
 * Create an offer for the inventory item
 */
export const createOffer = async (
  accessToken: string,
  sku: string,
  listingData: ListingData,
  merchantLocationKey: string,
  fulfillmentPolicyId: string,
  paymentPolicyId: string,
  returnPolicyId: string
): Promise<{ success: boolean; offerId?: string; error?: string }> => {
  try {
    const ebay = getEbayClient(accessToken);

    const offer = {
      sku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      listingDescription: listingData.description,
      availableQuantity: 1,
      pricingSummary: {
        price: {
          value: listingData.price.toString(),
          currency: 'USD',
        },
      },
      listingPolicies: {
        fulfillmentPolicyId,
        paymentPolicyId,
        returnPolicyId,
      },
      categoryId: await getCategoryId(listingData.category),
      merchantLocationKey,
    };

    // Add local pickup if applicable
    if (listingData.fulfillmentType === 'local' || listingData.fulfillmentType === 'both') {
      (offer as any).pickupAtLocationAvailability = [{
        quantity: 1,
        merchantLocationKey,
      }];
    }

    const response = await ebay.sell.inventory.createOffer(offer);

    logger.info(`Created eBay offer: ${response.offerId}`);
    return { success: true, offerId: response.offerId };
  } catch (error: any) {
    logger.error('eBay createOffer error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create offer' 
    };
  }
};

/**
 * Publish the offer to make it a live listing
 */
export const publishOffer = async (
  accessToken: string,
  offerId: string
): Promise<{ success: boolean; listingId?: string; error?: string }> => {
  try {
    const ebay = getEbayClient(accessToken);

    const response = await ebay.sell.inventory.publishOffer(offerId);

    logger.info(`Published eBay listing: ${response.listingId}`);
    return { success: true, listingId: response.listingId };
  } catch (error: any) {
    logger.error('eBay publishOffer error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to publish offer' 
    };
  }
};

/**
 * Full flow: Create inventory item, offer, and publish
 */
export const createAndPublishListing = async (
  accessToken: string,
  listingData: ListingData,
  policies: {
    merchantLocationKey: string;
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    returnPolicyId: string;
  }
): Promise<EbayListingResult> => {
  const sku = listingData.sku || `QS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Step 1: Create inventory item
  const inventoryResult = await createInventoryItem(accessToken, sku, listingData);
  if (!inventoryResult.success) {
    return { success: false, error: inventoryResult.error };
  }

  // Step 2: Create offer
  const offerResult = await createOffer(
    accessToken,
    sku,
    listingData,
    policies.merchantLocationKey,
    policies.fulfillmentPolicyId,
    policies.paymentPolicyId,
    policies.returnPolicyId
  );
  if (!offerResult.success || !offerResult.offerId) {
    return { success: false, error: offerResult.error };
  }

  // Step 3: Publish offer
  const publishResult = await publishOffer(accessToken, offerResult.offerId);
  if (!publishResult.success) {
    return { success: false, error: publishResult.error };
  }

  return {
    success: true,
    listingId: publishResult.listingId,
    offerId: offerResult.offerId,
  };
};

/**
 * Map condition string to eBay condition enum
 */
function mapCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'new': 'NEW',
    'like-new': 'LIKE_NEW',
    'like new': 'LIKE_NEW',
    'excellent': 'VERY_GOOD',
    'very good': 'VERY_GOOD',
    'good': 'GOOD',
    'fair': 'ACCEPTABLE',
    'acceptable': 'ACCEPTABLE',
    'used': 'GOOD',
    'poor': 'FOR_PARTS_OR_NOT_WORKING',
  };
  return conditionMap[condition.toLowerCase()] || 'GOOD';
}

/**
 * Get eBay category ID from category name
 * This is a simplified mapping - in production you'd use eBay's Taxonomy API
 */
async function getCategoryId(category: string): Promise<string> {
  const categoryMap: Record<string, string> = {
    'Electronics': '293',
    'Computers & Accessories': '58058',
    'Cell Phones & Accessories': '15032',
    'Video Games & Consoles': '1249',
    'Cameras & Photo': '625',
    'TV & Video': '32852',
    'Audio': '293',
    'Clothing': '11450',
    'Shoes': '93427',
    'Jewelry': '281',
    'Watches': '14324',
    'Home & Garden': '11700',
    'Sporting Goods': '888',
    'Toys & Hobbies': '220',
    'Books': '267',
    'Music': '11233',
    'Movies & TV': '11232',
    'Collectibles': '1',
    'Art': '550',
    'Crafts': '14339',
    'Baby': '2984',
    'Pet Supplies': '1281',
    'Health & Beauty': '26395',
    'Musical Instruments': '619',
    'Business & Industrial': '12576',
    'Automotive': '6000',
  };

  // Find best match
  for (const [key, value] of Object.entries(categoryMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default to general category
  return '99'; // Everything Else
}

/**
 * Get OAuth URL for eBay authentication
 */
export const getOAuthUrl = (state: string): string => {
  const clientId = process.env.EBAY_APP_ID;
  const redirectUri = process.env.EBAY_REDIRECT_URI || 'https://quicksell.monster/api/v1/oauth/ebay/callback';
  const scope = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.marketing',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  ].join(' ');

  const sandbox = process.env.EBAY_SANDBOX === 'true';
  const baseUrl = sandbox
    ? 'https://auth.sandbox.ebay.com/oauth2/authorize'
    : 'https://auth.ebay.com/oauth2/authorize';

  return `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> => {
  try {
    const ebay = new eBayApi({
      appId: process.env.EBAY_APP_ID || '',
      certId: process.env.EBAY_CERT_ID || '',
      sandbox: process.env.EBAY_SANDBOX === 'true',
    });

    const token = await ebay.OAuth2.getToken(code);

    return {
      success: true,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
    };
  } catch (error: any) {
    logger.error('eBay token exchange error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createAndPublishListing,
  createInventoryItem,
  createOffer,
  publishOffer,
  getOAuthUrl,
  exchangeCodeForToken,
};
