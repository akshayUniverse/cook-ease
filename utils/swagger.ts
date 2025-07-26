import swaggerJsdoc from 'swagger-jsdoc';

// Determine the base URL based on environment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the current origin
    return window.location.origin + '/api';
  }
  // Server-side: use environment variable or default
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api`
    : process.env.NODE_ENV === 'production'
    ? 'https://aajkakhana-sandy.vercel.app/api'
    : 'http://localhost:3000/api';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CookEase API',
      version: '1.0.0',
      description: 'A comprehensive recipe management and cooking assistance API',
      contact: {
        name: 'CookEase Support',
        email: 'support@cookease.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: getBaseUrl(),
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            dietaryRestrictions: { type: 'array', items: { type: 'string' } },
            allergies: { type: 'array', items: { type: 'string' } },
            cuisinePreferences: { type: 'array', items: { type: 'string' } },
            skillLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          },
        },
        Recipe: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            ingredients: { type: 'array', items: { type: 'object' } },
            instructions: { type: 'array', items: { type: 'string' } },
            cookTime: { type: 'number' },
            prepTime: { type: 'number' },
            servings: { type: 'number' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            cuisine: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            image: { type: 'string' },
            nutrition: { type: 'object' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        PreferencesRequest: {
          type: 'object',
          properties: {
            dietaryRestrictions: { type: 'array', items: { type: 'string' } },
            allergies: { type: 'array', items: { type: 'string' } },
            cuisinePreferences: { type: 'array', items: { type: 'string' } },
            skillLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          },
        },
        ShoppingListItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            quantity: { type: 'string' },
            category: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./pages/api/**/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options); 