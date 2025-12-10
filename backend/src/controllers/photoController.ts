import { Request, Response } from 'express';
import OpenAI from 'openai';
import { logger } from '../config/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Analyze photo using OpenAI Vision API
 * Extract product details for marketplace listing
 */
export const analyzePhoto = async (req: Request, res: Response) => {
  try {
    // Log request details for debugging
    logger.info('Photo analysis request received');
    logger.info('Request body keys:', Object.keys(req.body));
    logger.info('Request body:', JSON.stringify(req.body).substring(0, 200));

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured. Please contact administrator.',
        details: 'OpenAI API key is missing from server configuration',
        statusCode: 500
      });
    }

    // Get the image from the request
    // The image should be sent as base64 in the request body
    const { image } = req.body;

    if (!image) {
      logger.error('No image in request body. Body keys:', Object.keys(req.body));
      return res.status(400).json({
        success: false,
        error: 'No image provided',
        details: 'Request must include "image" field with base64 encoded image data',
        receivedFields: Object.keys(req.body),
        statusCode: 400
      });
    }

    logger.info('Analyzing photo with OpenAI Vision API...');

    // Call OpenAI Vision API to analyze the product
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert at analyzing product photos for online marketplace listings.

Analyze this product image and extract the following information in JSON format:
{
  "title": "Clear, descriptive product title (e.g., 'Logitech MX Master 3 Wireless Mouse - Black')",
  "description": "Detailed product description mentioning key features, condition, and any visible details. Write 2-3 paragraphs.",
  "suggestedPrice": "Estimated fair market price in USD (just the number, e.g., 79.99)",
  "category": "Product category (e.g., 'Electronics', 'Computers & Accessories', 'Home & Garden', etc.)",
  "condition": "Product condition based on visible wear (options: 'new', 'like-new', 'good', 'fair', 'poor')",
  "brand": "Brand name if visible",
  "model": "Model name/number if visible",
  "features": ["key feature 1", "key feature 2", "key feature 3"]
}

Be specific and accurate. If you can't determine something, use your best judgment based on similar products.`
            },
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    // Extract the AI response
    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response from AI
    let productData;
    try {
      // Extract JSON from the response (AI might wrap it in markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      productData = JSON.parse(jsonString);
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError);
      logger.error('AI response was:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    logger.info('Photo analysis successful');

    // Return the analyzed data
    res.status(200).json({
      success: true,
      data: productData,
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Photo analysis error:', error);
    logger.error('Error details:', JSON.stringify(error, null, 2));

    // Check for specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        error: 'AI service quota exceeded. Please try again later.',
        details: 'OpenAI API quota has been exceeded. Check your OpenAI account billing.',
        statusCode: 503
      });
    }

    // Check for authentication errors
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(500).json({
        success: false,
        error: 'AI service authentication failed',
        details: 'Invalid OpenAI API key. Please check server configuration.',
        statusCode: 500
      });
    }

    // Check for model access errors
    if (error.status === 403 || error.code === 'model_not_found') {
      return res.status(500).json({
        success: false,
        error: 'AI model access denied',
        details: 'Your OpenAI account may need billing setup or tier upgrade to access GPT-4 Vision. Free tier accounts do not have access to vision models.',
        openaiError: error.message,
        statusCode: 500
      });
    }

    // Check for rate limiting
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        details: 'OpenAI API rate limit exceeded. Please wait and try again.',
        statusCode: 429
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Photo analysis failed',
      details: error.code ? `OpenAI error code: ${error.code}` : 'Unknown error occurred',
      openaiError: error.error?.message || error.message,
      statusCode: 500
    });
  }
};

/**
 * Upload photo (stub - can be implemented with multer/cloudinary later)
 */
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual file upload to cloud storage (Cloudinary, S3, etc.)
    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: 'https://placeholder.com/photo.jpg'
      },
      statusCode: 201
    });
  } catch (error) {
    logger.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Photo upload failed',
      statusCode: 500
    });
  }
};

/**
 * Delete photo (stub)
 */
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement photo deletion from storage
    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      statusCode: 200
    });
  } catch (error) {
    logger.error('Photo deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      statusCode: 500
    });
  }
};
