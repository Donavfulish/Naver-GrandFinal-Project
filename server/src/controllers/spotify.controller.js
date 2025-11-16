import spotifyService from '../services/spotify.service.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ErrorCodes } from '../constants/errorCodes.js';
import logger from '../config/logger.js';
import { FRONTEND_URL } from '../config/env.js';

const spotifyController = {
  /**
   * GET /api/spotify/login
   * Redirect user to Spotify authorization page
   */
  login: asyncHandler(async (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const authUrl = spotifyService.getAuthorizationUrl(state);

    // Store state in session or send to client for verification
    res.json({
      success: true,
      data: {
        authUrl,
        state
      }
    });
  }),

  /**
   * GET /api/spotify/callback
   * Handle Spotify authorization callback
   */
  callback: asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      logger.error('Spotify authorization error:', error);
      return res.redirect(`${FRONTEND_URL}/error?message=spotify_auth_failed`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Authorization code not provided'
        }
      });
    }

    try {
      const tokenData = await spotifyService.exchangeCodeForToken(code);

      // In production, store tokens in database associated with user
      // For now, we'll send them back to the client
      // You might want to redirect to frontend with tokens or store in session

      res.redirect(
        `${FRONTEND_URL}/spotify/success?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}&expires_in=${Math.floor((tokenData.expires_at - Date.now()) / 1000)}`
      );
    } catch (error) {
      logger.error('Error in Spotify callback:', error);
      res.redirect(`${FRONTEND_URL}/error?message=token_exchange_failed`);
    }
  }),

  /**
   * POST /api/spotify/play
   * Start playback of a track
   * Body: { trackUri: string, accessToken: string, refreshToken?: string, deviceId?: string }
   */
  play: asyncHandler(async (req, res) => {
    const { trackUri, accessToken, refreshToken, deviceId } = req.body;

    if (!trackUri || !accessToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'trackUri and accessToken are required'
        }
      });
    }

    try {
      // Check if we need to refresh the token
      let validToken = accessToken;
      if (refreshToken) {
        const tokenData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Date.now() // Will trigger refresh check
        };
        const validatedTokenData = await spotifyService.ensureValidToken(tokenData);
        validToken = validatedTokenData.access_token;

        // If token was refreshed, send new token back
        if (validToken !== accessToken) {
          res.setHeader('X-New-Access-Token', validToken);
        }
      }

      const result = await spotifyService.playTrack(validToken, trackUri, deviceId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error playing track:', error);

      if (error.message.includes('No active device')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NO_ACTIVE_DEVICE',
            message: error.message
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * POST /api/spotify/refresh
   * Refresh access token
   * Body: { refreshToken: string }
   */
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'refreshToken is required'
        }
      });
    }

    try {
      const tokenData = await spotifyService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: Math.floor((tokenData.expires_at - Date.now()) / 1000)
        }
      });
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Failed to refresh access token'
        }
      });
    }
  }),

  /**
   * GET /api/spotify/playback
   * Get current playback state
   * Query: { accessToken: string }
   */
  getCurrentPlayback: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const playbackState = await spotifyService.getCurrentPlayback(accessToken);

      res.status(200).json({
        success: true,
        data: playbackState
      });
    } catch (error) {
      logger.error('Error getting playback state:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * GET /api/spotify/devices
   * Get available devices
   * Headers: Authorization: Bearer {accessToken}
   */
  getDevices: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const devices = await spotifyService.getDevices(accessToken);

      res.status(200).json({
        success: true,
        data: { devices }
      });
    } catch (error) {
      logger.error('Error getting devices:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * PUT /api/spotify/pause
   * Pause playback
   * Headers: Authorization: Bearer {accessToken}
   */
  pause: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const result = await spotifyService.pausePlayback(accessToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error pausing playback:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * PUT /api/spotify/resume
   * Resume playback
   * Headers: Authorization: Bearer {accessToken}
   */
  resume: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const result = await spotifyService.resumePlayback(accessToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error resuming playback:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * POST /api/spotify/next
   * Skip to next track
   * Headers: Authorization: Bearer {accessToken}
   */
  next: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const result = await spotifyService.skipToNext(accessToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error skipping to next:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  }),

  /**
   * POST /api/spotify/previous
   * Skip to previous track
   * Headers: Authorization: Bearer {accessToken}
   */
  previous: asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Access token required in Authorization header'
        }
      });
    }

    try {
      const result = await spotifyService.skipToPrevious(accessToken);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error skipping to previous:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: error.message
        }
      });
    }
  })
};

export default spotifyController;

