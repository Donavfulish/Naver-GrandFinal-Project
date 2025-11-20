import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI
} from '../config/env.js';
import logger from '../config/logger.js';

class SpotifyService {
  constructor() {
    // Store tokens in memory (in production, use database or session store)
    this.tokens = new Map();
  }

  /**
   * Generate Spotify authorization URL
   * @param {string} state - Random state string for CSRF protection
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state = 'random_state') {
    const scopes = [
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-read-private',
      'user-read-email'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state,
      scope: scopes,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Spotify
   * @returns {Promise<Object>} Token data
   */
  async exchangeCodeForToken(code) {
    try {
      const authString = Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_REDIRECT_URI
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Spotify token exchange failed:', errorData);
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();

      // Store tokens with expiration time
      const tokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000),
        token_type: data.token_type
      };

      logger.info('Successfully exchanged code for Spotify token');
      return tokenData;
    } catch (error) {
      logger.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshAccessToken(refreshToken) {
    try {
      const authString = Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Spotify token refresh failed:', errorData);
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();

      const tokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken, // Keep old if not provided
        expires_at: Date.now() + (data.expires_in * 1000),
        token_type: data.token_type
      };

      logger.info('Successfully refreshed Spotify access token');
      return tokenData;
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Check if token is expired and refresh if needed
   * @param {Object} tokenData - Token data object
   * @returns {Promise<Object>} Valid token data
   */
  async ensureValidToken(tokenData) {
    // Refresh if token expires in less than 5 minutes
    if (Date.now() >= tokenData.expires_at - (5 * 60 * 1000)) {
      logger.info('Token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken(tokenData.refresh_token);
    }
    return tokenData;
  }

  /**
   * Start playback on user's active device
   * @param {string} accessToken - Spotify access token
   * @param {string} trackUri - Spotify track URI (e.g., spotify:track:xxx)
   * @param {string} deviceId - Optional device ID
   * @returns {Promise<void>}
   */
  async playTrack(accessToken, trackUri, deviceId = null) {
    try {
      const endpoint = deviceId
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';

      const body = {
        uris: [trackUri]
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.status === 204) {
        logger.info(`Successfully started playback: ${trackUri}`);
        return { success: true, message: 'Playback started' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Spotify playback failed:', errorData);

        if (response.status === 404) {
          throw new Error('No active device found. Please open Spotify on a device.');
        }

        throw new Error(errorData.error?.message || 'Failed to start playback');
      }

      return { success: true, message: 'Playback started' };
    } catch (error) {
      logger.error('Error playing track:', error);
      throw error;
    }
  }

  /**
   * Get current playback state
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<Object>} Playback state
   */
  async getCurrentPlayback(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        return { is_playing: false, message: 'No playback currently active' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to get playback state:', errorData);
        throw new Error('Failed to get playback state');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error getting current playback:', error);
      throw error;
    }
  }

  /**
   * Get user's available devices
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<Array>} List of devices
   */
  async getDevices(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to get devices:', errorData);
        throw new Error('Failed to get devices');
      }

      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      logger.error('Error getting devices:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<void>}
   */
  async pausePlayback(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        logger.info('Successfully paused playback');
        return { success: true, message: 'Playback paused' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to pause playback:', errorData);
        throw new Error('Failed to pause playback');
      }

      return { success: true, message: 'Playback paused' };
    } catch (error) {
      logger.error('Error pausing playback:', error);
      throw error;
    }
  }

  /**
   * Resume playback
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<void>}
   */
  async resumePlayback(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        logger.info('Successfully resumed playback');
        return { success: true, message: 'Playback resumed' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to resume playback:', errorData);
        throw new Error('Failed to resume playback');
      }

      return { success: true, message: 'Playback resumed' };
    } catch (error) {
      logger.error('Error resuming playback:', error);
      throw error;
    }
  }

  /**
   * Skip to next track
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<void>}
   */
  async skipToNext(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        logger.info('Successfully skipped to next track');
        return { success: true, message: 'Skipped to next track' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to skip to next:', errorData);
        throw new Error('Failed to skip to next track');
      }

      return { success: true, message: 'Skipped to next track' };
    } catch (error) {
      logger.error('Error skipping to next:', error);
      throw error;
    }
  }

  /**
   * Skip to previous track
   * @param {string} accessToken - Spotify access token
   * @returns {Promise<void>}
   */
  async skipToPrevious(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status === 204) {
        logger.info('Successfully skipped to previous track');
        return { success: true, message: 'Skipped to previous track' };
      }

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Failed to skip to previous:', errorData);
        throw new Error('Failed to skip to previous track');
      }

      return { success: true, message: 'Skipped to previous track' };
    } catch (error) {
      logger.error('Error skipping to previous:', error);
      throw error;
    }
  }
}

export default new SpotifyService();

