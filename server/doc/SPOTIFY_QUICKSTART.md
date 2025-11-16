# Spotify Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Spotify Credentials
1. Go to https://developer.spotify.com/dashboard
2. Click "Create an App"
3. Fill in app name and description
4. Copy your **Client ID** and **Client Secret**
5. Click "Edit Settings"
6. Add Redirect URI: `http://localhost:5000/api/spotify/callback`
7. Save

### 2. Configure Environment
Add to your `.env` file:
```env
SPOTIFY_CLIENT_ID=your_client_id_from_step_1
SPOTIFY_CLIENT_SECRET=your_client_secret_from_step_1
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/spotify/callback
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test It!

**Option A: Using Browser**
1. Open: `http://localhost:5000/api/spotify/login`
2. Copy the `authUrl` from the response
3. Visit that URL in your browser
4. Login to Spotify and authorize
5. You'll be redirected with tokens in the URL

**Option B: Using curl/Postman**
```bash
# Get auth URL
curl http://localhost:5000/api/spotify/login

# After authorization, play a track
curl -X POST http://localhost:5000/api/spotify/play \
  -H "Content-Type: application/json" \
  -d '{
    "trackUri": "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 📋 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/spotify/login` | Get authorization URL |
| GET | `/api/spotify/callback` | OAuth callback (automatic) |
| POST | `/api/spotify/play` | Play a track |
| POST | `/api/spotify/refresh` | Refresh access token |
| GET | `/api/spotify/playback` | Get current playback |
| GET | `/api/spotify/devices` | Get available devices |
| PUT | `/api/spotify/pause` | Pause playback |
| PUT | `/api/spotify/resume` | Resume playback |
| POST | `/api/spotify/next` | Skip to next |
| POST | `/api/spotify/previous` | Skip to previous |

## 🎵 Popular Track URIs for Testing

```javascript
const testTracks = {
  mrBrightside: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp',
  bohemianRhapsody: 'spotify:track:6l8GvAyoUZwWDgF1e4822w',
  stairwayToHeaven: 'spotify:track:5CQ30WqJwcep0pYcV4AMNc',
  blankSpace: 'spotify:track:1p80LdxRV74UKvL8gnD7ky',
  shape0fYou: 'spotify:track:7qiZfU4dY1lWllzX7mPBI'
};
```

## ⚠️ Common Issues

**"No active device found"**
- Solution: Open Spotify app and play any song first, then try API call

**"Invalid redirect URI"**
- Solution: Make sure redirect URI in Spotify Dashboard EXACTLY matches your .env

**Token expired**
- Solution: Always include `refreshToken` in play requests (auto-refreshes)

## 📖 Full Documentation
- See `SPOTIFY_API_USAGE.md` for complete API documentation
- See `SPOTIFY_EXAMPLES.js` for JavaScript client code examples

## 🔒 Production Checklist
- [ ] Use HTTPS redirect URI
- [ ] Store tokens in database
- [ ] Implement rate limiting
- [ ] Add user authentication
- [ ] Use environment-specific configs
- [ ] Add error monitoring

