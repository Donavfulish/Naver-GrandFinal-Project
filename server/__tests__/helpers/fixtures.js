/**
 * Test data fixtures for Space CRUD tests
 */

export const fixtures = {
  /**
   * Valid space creation payload
   */
  validCreateSpacePayload(userId, tagIds) {
    return {
      user_id: userId,
      name: 'My Awesome Space',
      tags: tagIds,
      description: 'A beautiful space for relaxation',
    };
  },

  /**
   * Minimal valid space creation payload
   */
  minimalCreateSpacePayload(userId, tagIds) {
    return {
      user_id: userId,
      name: 'Minimal Space',
      tags: tagIds,
    };
  },

  /**
   * Complete space creation payload with all optional fields
   */
  completeCreateSpacePayload(userId, tagIds, backgroundId, clockFontId, textFontId, playlistIds = []) {
    return {
      user_id: userId,
      name: 'Complete Space',
      tags: tagIds,
      description: 'A space with all features',
      background_id: backgroundId,
      clock_font_id: clockFontId,
      text_font_name: textFontId,
      playlist_ids: playlistIds,
      widget_positions: [
        { widget_id: 'clock', x: 100, y: 200 },
        { widget_id: 'player', x: 300, y: 400, metadata: { volume: 50 } },
      ],
    };
  },

  /**
   * Invalid space payload - missing name
   */
  invalidPayloadMissingName(userId, tagIds) {
    return {
      user_id: userId,
      tags: tagIds,
      description: 'No name provided',
    };
  },

  /**
   * Invalid space payload - missing tags
   */
  invalidPayloadMissingTags(userId) {
    return {
      user_id: userId,
      name: 'No Tags Space',
      description: 'Missing tags',
    };
  },

  /**
   * Invalid space payload - empty tags array
   */
  invalidPayloadEmptyTags(userId) {
    return {
      user_id: userId,
      name: 'Empty Tags Space',
      tags: [],
      description: 'Empty tags array',
    };
  },

  /**
   * Valid update payload - metadata only
   */
  validUpdateMetadata() {
    return {
      metadata: {
        name: 'Updated Space Name',
        description: 'Updated description',
      },
    };
  },

  /**
   * Valid update payload - appearance only
   */
  validUpdateAppearance(backgroundId, clockFontId, textFontId) {
    return {
      appearance: {
        background_id: backgroundId,
        clock_font_id: clockFontId,
        text_font_name: textFontId,
      },
    };
  },

  /**
   * Valid update payload - tags only
   */
  validUpdateTags(tagIds) {
    return {
      tags: tagIds,
    };
  },

  /**
   * Valid update payload - playlist links
   */
  validUpdatePlaylistLinks(addIds = [], removeIds = []) {
    return {
      playlist_links: {
        add: addIds,
        remove: removeIds,
      },
    };
  },

  /**
   * Valid update payload - widgets
   */
  validUpdateWidgets() {
    return {
      widgets: [
        { widget_id: 'clock', x: 150, y: 250 },
        { widget_id: 'weather', x: 350, y: 450, metadata: { unit: 'celsius' } },
      ],
    };
  },

  /**
   * Complete update payload
   */
  completeUpdatePayload(tagIds, backgroundId, playlistAddIds = [], playlistRemoveIds = []) {
    return {
      metadata: {
        name: 'Fully Updated Space',
        description: 'Everything has been updated',
      },
      appearance: {
        background_id: backgroundId,
      },
      tags: tagIds,
      playlist_links: {
        add: playlistAddIds,
        remove: playlistRemoveIds,
      },
      widgets: [
        { widget_id: 'clock', x: 200, y: 300 },
      ],
    };
  },

  /**
   * Invalid update payload - empty tags
   */
  invalidUpdateEmptyTags() {
    return {
      tags: [],
    };
  },

  /**
   * Invalid update payload - no fields
   */
  invalidUpdateNoFields() {
    return {};
  },
};
