import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  const [specs, setSpecs] = useState<any>(null);

  useEffect(() => {
    // Get the current origin for API calls
    const currentOrigin = window.location.origin;
    
    // Fetch the OpenAPI spec from our API
    fetch(`${currentOrigin}/api/swagger`)
      .then(res => res.json())
      .then(data => {
        // Update the server URL to use the current origin
        if (data.servers && data.servers.length > 0) {
          data.servers[0].url = `${currentOrigin}/api`;
        }
        setSpecs(data);
      })
      .catch(err => {
        console.error('Failed to load API specs:', err);
        // Fallback to a basic spec if the API is not available
        setSpecs({
          openapi: '3.0.0',
          info: {
            title: 'CookEase API',
            version: '1.0.0',
            description: 'API documentation is loading...',
          },
          servers: [
            {
              url: `${currentOrigin}/api`,
              description: 'Current server',
            },
          ],
          paths: {},
        });
      });
  }, []);

  if (!specs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>CookEase API Documentation</title>
        <meta name="description" content="CookEase API Documentation and Testing Interface" />
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CookEase API</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Interactive API documentation and testing interface
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Server: {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Back to App
                </Link>
                <a
                  href="/api/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Raw JSON
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SwaggerUI
            spec={specs}
            docExpansion="list"
            defaultModelsExpandDepth={2}
            defaultModelExpandDepth={2}
            tryItOutEnabled={true}
            requestInterceptor={(request: any) => {
              // Add authentication token if available
              const token = localStorage.getItem('token');
              if (token) {
                request.headers.Authorization = `Bearer ${token}`;
              }
              return request;
            }}
            responseInterceptor={(response: any) => {
              // Handle responses
              return response;
            }}
          />
        </div>
      </div>
    </>
  );
} 