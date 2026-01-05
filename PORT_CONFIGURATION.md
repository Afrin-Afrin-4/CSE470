# Port Configuration Guide

This document explains how to change the ports for both the frontend and backend servers in the IntelliLearn LMS platform.

## Backend Port Configuration

The backend server port is configured in `server.js`:

```javascript
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
```

### How to Change the Backend Port:

1. **Using Environment Variable** (Recommended):
   Create a `.env` file in the `lms-backend` directory:
   ```
   PORT=5001
   ```

2. **Direct Code Modification**:
   Change the default port in `server.js`:
   ```javascript
   const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
   ```

## Frontend Port Configuration

The frontend server port is configured in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Must match backend port
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // ... other config
})
```

### How to Change the Frontend Port:

1. **Modify `vite.config.js`**:
   ```javascript
   server: {
     port: 3001, // Changed from 3000 to 3001
     strictPort: true,
     proxy: {
       '/api': {
         target: 'http://localhost:5001', // Update to match new backend port
         changeOrigin: true,
         secure: false,
       }
     }
   }
   ```

## Important Notes:

1. **Proxy Configuration**: When changing ports, ensure the frontend proxy target matches the backend port
2. **Environment Variables**: Using `.env` files is the best practice for port configuration
3. **Port Conflicts**: Make sure the chosen ports are not already in use

## Example .env File:

Create `lms-backend/.env`:
```
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Running with Custom Ports:

1. **Backend**:
   ```bash
   cd lms-backend
   npm start
   # Server will run on http://localhost:5001
   ```

2. **Frontend**:
   ```bash
   cd lms-frontend
   npm run dev
   # Server will run on http://localhost:3001
   ```

## Troubleshooting:

If you encounter port conflicts:
1. Check if another process is using the port:
   ```bash
   # On Windows (PowerShell)
   Get-NetTCPConnection -LocalPort 3000
   
   # Kill process if needed
   Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
   ```

2. Choose an alternative port (e.g., 3001, 3002, etc.)

3. Update both the frontend proxy and backend configurations accordingly