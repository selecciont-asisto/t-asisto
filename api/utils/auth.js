// Helper function to validate API key from request headers
export function validateApiKey(req) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('API_KEY environment variable is not configured');
    return false;
  }

  return apiKey === validApiKey;
}

// Helper function to send unauthorized response
export function sendUnauthorizedResponse(res, setCorsHeaders) {
  setCorsHeaders(res);
  return res.status(401).json({ message: "No autorizado. API key inválida o faltante." });
}

