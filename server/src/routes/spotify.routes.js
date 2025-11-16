import express from "express";
import spotifyController from "../controllers/spotify.controller.js";

const router = express.Router();

// GET /api/spotify/login - Get Spotify authorization URL
router.get("/login", spotifyController.login);

// GET /api/spotify/callback - Handle Spotify OAuth callback
router.get("/callback", spotifyController.callback);

// POST /api/spotify/play - Start playback
// Body: { trackUri, accessToken, refreshToken?, deviceId? }
router.post("/play", spotifyController.play);

// POST /api/spotify/refresh - Refresh access token
// Body: { refreshToken }
router.post("/refresh", spotifyController.refreshToken);

// GET /api/spotify/playback - Get current playback state
// Headers: Authorization: Bearer {accessToken}
router.get("/playback", spotifyController.getCurrentPlayback);

// GET /api/spotify/devices - Get available devices
// Headers: Authorization: Bearer {accessToken}
router.get("/devices", spotifyController.getDevices);

// PUT /api/spotify/pause - Pause playback
// Headers: Authorization: Bearer {accessToken}
router.put("/pause", spotifyController.pause);

// PUT /api/spotify/resume - Resume playback
// Headers: Authorization: Bearer {accessToken}
router.put("/resume", spotifyController.resume);

// POST /api/spotify/next - Skip to next track
// Headers: Authorization: Bearer {accessToken}
router.post("/next", spotifyController.next);

// POST /api/spotify/previous - Skip to previous track
// Headers: Authorization: Bearer {accessToken}
router.post("/previous", spotifyController.previous);

export default router;

