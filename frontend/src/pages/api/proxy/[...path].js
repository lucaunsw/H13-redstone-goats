// /pages/api/proxy/[...path].js
export default async function handler(req, res) {
    // Get the path from the request URL
    const path = req.query.path?.join('/') || '';
  
    // Construct the full URL for the backend API using the captured path
    const url = `http://sushi-invoice-application.ap-southeast-2.elasticbeanstalk.com/${path}`;
  
    try {
      // Forward the incoming request to the backend API
      const proxyRes = await fetch(url, {
        method: req.method,  // Use the same HTTP method (POST, GET, etc.)
        headers: {
          ...req.headers,  // Forward all incoming headers
          host: undefined,  // Remove host to avoid AWS issues
        },
        body: req.method !== 'GET' && req.method !== 'HEAD'  // Only include body if it's a POST/PUT request
          ? JSON.stringify(req.body)
          : undefined,
      });
  
      // Get the content type of the response (e.g., JSON, text)
      const contentType = proxyRes.headers.get('content-type');
  
      // Parse the response accordingly
      const data = contentType?.includes('application/json')
        ? await proxyRes.json()
        : await proxyRes.text();
  
      // Set the status code of the response to match the backend's response
      res.status(proxyRes.status);
  
      // Send the response back to the frontend
      if (typeof data === 'object') {
        res.json(data);  // JSON response
      } else {
        res.send(data);  // Plain text response
      }
    } catch (error) {
      // Handle any errors during the fetch process
      console.error('Error proxying request:', error);
      res.status(500).json({ error: 'Failed to connect to backend API' });
    }
}