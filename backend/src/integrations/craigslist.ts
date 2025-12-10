/**
 * Craigslist Automation
 * Uses Puppeteer to automate posting to Craigslist
 * Note: Craigslist has no official API, this uses browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import { logger } from '../config/logger';

interface CraigslistListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  photos: string[]; // base64 or URLs
  location: {
    city: string;
    area?: string;
    zipcode?: string;
  };
}

interface CraigslistCredentials {
  email: string;
  password: string;
}

interface PostingResult {
  success: boolean;
  postingId?: string;
  error?: string;
  requiresVerification?: boolean;
}

// Craigslist city codes
const CITY_CODES: Record<string, string> = {
  'new york': 'newyork',
  'los angeles': 'losangeles',
  'chicago': 'chicago',
  'houston': 'houston',
  'phoenix': 'phoenix',
  'philadelphia': 'philadelphia',
  'san antonio': 'sanantonio',
  'san diego': 'sandiego',
  'dallas': 'dallas',
  'san jose': 'sfbay',
  'austin': 'austin',
  'jacksonville': 'jacksonville',
  'san francisco': 'sfbay',
  'columbus': 'columbus',
  'indianapolis': 'indianapolis',
  'seattle': 'seattle',
  'denver': 'denver',
  'boston': 'boston',
  'miami': 'miami',
  'atlanta': 'atlanta',
  // Add more as needed
};

// Category mapping
const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'ela', // electronics - by owner
  'Computers': 'sya', // computers - by owner
  'Cell Phones': 'moa', // cell phones - by owner
  'Furniture': 'fua', // furniture - by owner
  'Clothing': 'cla', // clothing - by owner
  'Jewelry': 'jwa', // jewelry - by owner
  'Sporting Goods': 'sga', // sporting goods - by owner
  'Toys & Games': 'taa', // toys & games - by owner
  'Tools': 'tla', // tools - by owner
  'General': 'foa', // general for sale - by owner
};

/**
/**
 * Get Puppeteer browser instance
 * First tries to connect to remote Chromium on host, falls back to local
 */
const getBrowser = async (): Promise<Browser> => {
  // Try to connect to remote Chromium first (running on VPS host)
  const remoteUrl = process.env.CHROME_REMOTE_URL || "http://172.19.0.1:9223";
  try {
    const response = await fetch(remoteUrl + "/json/version");
    const data = await response.json() as { webSocketDebuggerUrl: string };
    if (data.webSocketDebuggerUrl) {
      // Replace localhost with Docker host IP
      const wsUrl = data.webSocketDebuggerUrl.replace("127.0.0.1", "172.19.0.1");
      logger.info("Connecting to remote Chromium browser at " + wsUrl);
      return puppeteer.connect({ browserWSEndpoint: wsUrl });
    }
  } catch (e) {
    logger.warn("Remote Chromium not available, falling back to local: " + e);
  }
  
  // Fallback to local launch (requires Chromium in container)
  const executablePath = process.env.CHROME_PATH || "/usr/bin/chromium-browser";
  
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
};
/**
 * Login to Craigslist account
 */
const loginToCraigslist = async (
  page: Page,
  credentials: CraigslistCredentials
): Promise<boolean> => {
  try {
    await page.goto('https://accounts.craigslist.org/login', {
      waitUntil: 'networkidle2',
    });

    // Fill in login form
    await page.type('#inputEmailHandle', credentials.email);
    await page.type('#inputPassword', credentials.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

    // Check if login was successful
    const url = page.url();
    if (url.includes('login/home')) {
      logger.info('Craigslist login successful');
      return true;
    }

    logger.error('Craigslist login failed - still on login page');
    return false;
  } catch (error) {
    logger.error('Craigslist login error:', error);
    return false;
  }
};

/**
 * Post a listing to Craigslist
 */
export const postToCraigslist = async (
  credentials: CraigslistCredentials,
  listingData: CraigslistListingData
): Promise<PostingResult> => {
  let browser: Browser | null = null;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Login first
    const loggedIn = await loginToCraigslist(page, credentials);
    if (!loggedIn) {
      return { success: false, error: 'Failed to login to Craigslist' };
    }

    // Get city code
    const cityCode = getCityCode(listingData.location.city);

    // Navigate to post page
    await page.goto(`https://${cityCode}.craigslist.org/`, {
      waitUntil: 'networkidle2',
    });

    // Click "post to classifieds"
    await page.click('a[href*="/post"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Select "for sale by owner"
    const forsaleRadio = await page.$('input[value="fso"]');
    if (forsaleRadio) {
      await forsaleRadio.click();
      await page.click('button.pickbutton');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Select category
    const category = getCategoryCode(listingData.category);
    const categoryRadio = await page.$(`input[value="${category}"]`);
    if (categoryRadio) {
      await categoryRadio.click();
      await page.click('button.pickbutton');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Fill in listing details
    await page.type('#PostingTitle', listingData.title);
    await page.type('#PostingPrice', listingData.price.toString());
    await page.type('#PostingBody', listingData.description);

    // Set postal code if available
    if (listingData.location.zipcode) {
      const zipInput = await page.$('#postal_code');
      if (zipInput) {
        await zipInput.type(listingData.location.zipcode);
      }
    }

    // Continue to next page
    await page.click('button.pickbutton');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Handle image upload if photos are provided
    if (listingData.photos && listingData.photos.length > 0) {
      // Craigslist image upload is complex - would need to handle file upload
      // For MVP, skip images
      logger.info('Skipping image upload for Craigslist (not implemented)');
    }

    // Continue past images
    const doneImagesButton = await page.$('button.done');
    if (doneImagesButton) {
      await doneImagesButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Publish the listing
    const publishButton = await page.$('button[name="go"]');
    if (publishButton) {
      await publishButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Check for email verification requirement
    const pageContent = await page.content();
    if (pageContent.includes('check your email') || pageContent.includes('verify')) {
      logger.info('Craigslist posting requires email verification');
      return {
        success: true,
        requiresVerification: true,
        error: 'Please check your email to confirm the posting',
      };
    }

    // Try to extract posting ID from URL or page
    const finalUrl = page.url();
    const postingIdMatch = finalUrl.match(/\/([0-9]+)\.html/);
    const postingId = postingIdMatch ? postingIdMatch[1] : undefined;

    logger.info(`Craigslist posting submitted: ${postingId || 'pending verification'}`);

    return {
      success: true,
      postingId,
      requiresVerification: !postingId,
    };
  } catch (error: any) {
    logger.error('Craigslist posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Craigslist',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Get city code from city name
 */
function getCityCode(city: string): string {
  const normalized = city.toLowerCase().trim();
  return CITY_CODES[normalized] || 'sfbay'; // Default to SF Bay Area
}

/**
 * Get category code from category name
 */
function getCategoryCode(category: string): string {
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'foa'; // General for sale
}

/**
 * Check if Craigslist posting is possible (browser available)
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    const browser = await getBrowser();
    await browser.close();
    return true;
  } catch (error) {
    logger.warn('Craigslist automation not available:', error);
    return false;
  }
};

export default {
  postToCraigslist,
  isAvailable,
};
