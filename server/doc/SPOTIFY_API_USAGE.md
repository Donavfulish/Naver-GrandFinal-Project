# Spotify API Integration

This backend provides complete Spotify authentication and playback control functionality.

## Setup

1. **Get Spotify Credentials**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your Client ID and Client Secret
   - Add redirect URI: `http://localhost:5000/api/spotify/callback` (for development)

2. **Environment Variables**:
   Add these to your `.env` file:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback
   FRONTEND_URL=http://localhost:3000
   ```

## API Endpoints

### Authentication

#### 1. Get Authorization URL
```http
GET /api/spotify/login
```

**Response**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.spotify.com/authorize?...",
    "state": "random_state"
  }
}
```

**Usage**: Redirect user to the `authUrl` to authorize your app.

#### 2. OAuth Callback (Automatic)
```http
GET /api/spotify/callback?code=xxx&state=xxx
```

This endpoint is called automatically by Spotify after user authorization. It redirects to your frontend with tokens.

#### 3. Refresh Token
```http
POST /api/spotify/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### Playback Control

#### 4. Play Track
```http
POST /api/spotify/play
Content-Type: application/json

{
  "trackUri": "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
  "accessToken": "your_access_token",
  "refreshToken": "your_refresh_token",  // Optional
  "deviceId": "device_id"                 // Optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Playback started"
  }
}
```

**Note**: If `refreshToken` is provided, the token will be automatically refreshed if expired.

#### 5. Get Current Playback
```http
GET /api/spotify/playback
Authorization: Bearer {accessToken}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "is_playing": true,
    "item": {
      "name": "Song Name",
      "artists": [...],
      ...
    },
    ...
  }
}
```

#### 6. Get Available Devices
```http
GET /api/spotify/devices
Authorization: Bearer {accessToken}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device_id",
        "is_active": true,
        "name": "My Speaker",
        "type": "Speaker",
        ...
      }
    ]
  }
}
```

#### 7. Pause Playback
```http
PUT /api/spotify/pause
Authorization: Bearer {accessToken}
```

#### 8. Resume Playback
```http
PUT /api/spotify/resume
Authorization: Bearer {accessToken}
```

#### 9. Skip to Next Track
```http
POST /api/spotify/next
Authorization: Bearer {accessToken}
```

#### 10. Skip to Previous Track
```http
POST /api/spotify/previous
Authorization: Bearer {accessToken}
```

## Usage Flow

1. **Initial Authentication**:
   ```javascript
   // Frontend: Get auth URL
   const response = await fetch('/api/spotify/login');
   const { authUrl } = response.data;
   
   // Redirect user to Spotify login
   window.location.href = authUrl;
   ```

2. **After Authorization**:
   - User is redirected to your frontend with tokens in URL
   - Store tokens securely (localStorage/sessionStorage for demo, secure httpOnly cookies for production)

3. **Play Music**:
   ```javascript
   // Play a track
   await fetch('/api/spotify/play', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       trackUri: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
       accessToken: storedAccessToken,
       refreshToken: storedRefreshToken
     })
   });
   ```

4. **Control Playback**:
   ```javascript
   // Pause
   await fetch('/api/spotify/pause', {
     method: 'PUT',
     headers: { 'Authorization': `Bearer ${accessToken}` }
   });
   
   // Resume
   await fetch('/api/spotify/resume', {
     method: 'PUT',
     headers: { 'Authorization': `Bearer ${accessToken}` }
   });
   ```

## Scopes Used

The following Spotify scopes are requested:
- `user-modify-playback-state` - Control playback
- `user-read-playback-state` - Read playback state
- `user-read-currently-playing` - Read currently playing track
- `user-read-private` - Read user profile
- `user-read-email` - Read user email

## Error Handling

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common errors:
- `NO_ACTIVE_DEVICE`: No Spotify device is currently active
- `TOKEN_REFRESH_FAILED`: Failed to refresh access token
- `VALIDATION_ERROR`: Missing or invalid parameters

## Security Notes

### Development
- Uses HTTP for local development
- Tokens stored in memory (not persistent)

### Production Recommendations
1. Use HTTPS only
2. Store tokens in database associated with user accounts
3. Use secure session management
4. Implement rate limiting
5. Validate all inputs
6. Use environment-specific redirect URIs
7. Consider using httpOnly cookies instead of sending tokens in response body

## Testing

To test the integration:

1. Start the server: `npm run dev`
2. Call `/api/spotify/login` to get auth URL
3. Visit the auth URL in browser
4. Authorize the app
5. You'll be redirected back with tokens
6. Use the tokens to control playback

## Example: Complete Flow

```javascript
// 1. Get auth URL and redirect user
const loginResponse = await fetch('http://localhost:5000/api/spotify/login');
const { authUrl } = loginResponse.json().data;
window.location.href = authUrl;

// 2. After redirect, extract tokens from URL
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');

// 3. Play a track
await fetch('http://localhost:5000/api/spotify/play', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trackUri: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp', // Mr. Brightside
    accessToken,
    refreshToken
  })
});

// 4. Get current playback
const playbackResponse = await fetch('http://localhost:5000/api/spotify/playback', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const playback = await playbackResponse.json();
console.log('Now playing:', playback.data.item?.name);
```

## Troubleshooting

**"No active device found"**:
- Open Spotify on any device (mobile, desktop, web player)
- Start playing any track
- The device will then be available for API control

**Token expired**:
- Always provide `refreshToken` in `/api/spotify/play` requests
- Or manually call `/api/spotify/refresh` to get a new token

**Authorization failed**:
- Check that redirect URI matches exactly in Spotify Dashboard
- Verify Client ID and Client Secret are correct
- Ensure scopes are properly configured

