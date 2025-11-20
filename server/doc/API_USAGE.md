# Space API Endpoints Documentation

This document provides comprehensive information about all Space-related API endpoints, including request/response formats, validations, and expected behaviors.

---

## Base URL
```
/api/space
```

---

## Table of Contents
1. [Create Space](#1-create-space)
2. [Get All Spaces](#2-get-all-spaces)
3. [Get Space by ID](#3-get-space-by-id)
4. [Update Space](#4-update-space)
5. [Delete Space](#5-delete-space)
6. [Error Codes](#error-codes)

---

## 1. Create Space

### Endpoint
```
POST /api/space
```

### Description
Creates a new space with metadata, appearance settings, tags, optional playlists, and widget positions.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "user_id": "uuid",           // Required: User ID (UUID format)
  "name": "string",            // Required: Space name (1-200 characters)
  "tags": ["uuid"],            // Required: Array of tag IDs (min 1 tag, UUID format)
  "description": "string",     // Optional: Space description (max 1000 characters)
  "background_id": "uuid",     // Optional: Background ID (UUID format, nullable)
  "clock_font_id": "uuid",     // Optional: Clock font ID (UUID format, nullable)
  "text_font_name": "string",  // Optional: Text font name (max 100 characters)
  "playlist_ids": ["uuid"],    // Optional: Array of playlist IDs to link
  "widget_positions": [        // Optional: Array of widget positions
    {
      "widget_id": "string",   // Required: Widget identifier
      "x": 0,                  // Required: X coordinate (number)
      "y": 0,                  // Required: Y coordinate (number)
      "metadata": {}           // Optional: Additional widget data
    }
  ]
}
```

### Validation Rules
- **user_id**: Must be a valid UUID
- **name**: Required, 1-200 characters
- **tags**: Required, minimum 1 tag, all must be valid UUIDs
- **description**: Optional, max 1000 characters
- **background_id**: Optional, must be valid UUID if provided
- **clock_font_id**: Optional, must be valid UUID if provided
- **text_font_name**: Optional, max 100 characters
- **playlist_ids**: Optional array of valid UUIDs
- **widget_positions**: Optional array with required widget_id, x, y fields

### Business Logic Validations
- All tag IDs must exist in the database and not be soft-deleted
- background_id must exist in database if provided
- clock_font_id must exist in database if provided
- text_font_name must exist in database if provided
- All playlist IDs must exist and not be soft-deleted
- Playlists will be linked to the created space

### Success Response
**Status Code:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Space",
    "description": "A beautiful space",
    "background_id": "uuid",
    "clock_font_id": "uuid",
    "text_font_name": "Arial",
    "is_deleted": false,
    "created_at": "2025-11-16T10:30:00Z",
    "updated_at": "2025-11-16T10:30:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "background": { /* background object */ },
    "clock": { /* clock font object */ },
    "text": { /* text font object */ },
    "widget_positions": [
      {
        "id": "uuid",
        "space_id": "uuid",
        "widget_id": "widget_1",
        "position": {
          "x": 100,
          "y": 200,
          "metadata": {}
        },
        "is_deleted": false
      }
    ],
    "playlists": [
      {
        "id": "uuid",
        "space_id": "uuid",
        "name": "My Playlist",
        "playlist_tracks": [
          {
            "track_order": 1,
            "track": { /* track object */ }
          }
        ]
      }
    ],
    "space_tags": [
      {
        "id": "uuid",
        "space_id": "uuid",
        "tag_id": "uuid",
        "tag": {
          "id": "uuid",
          "name": "Relaxing"
        }
      }
    ]
  }
}
```

### Error Responses

**400 Bad Request - Validation Failed**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

**422 Unprocessable Entity - Business Logic Validation Failed**
```json
{
  "success": false,
  "error": {
    "code": "SPACE_1206",
    "message": "Invalid or deleted tag ID: <uuid>"
  }
}
```

---

## 2. Get All Spaces

### Endpoint
```
GET /api/space
```

### Description
Retrieves a list of all non-deleted spaces with optional filtering by user ID.

### Query Parameters
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | No       | Filter spaces by user ID (UUID)|

### Request Examples
```
GET /api/space
GET /api/space?user_id=550e8400-e29b-41d4-a716-446655440000
```

### Validation Rules
- **user_id**: Must be a valid UUID format if provided

### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Space",
      "description": "A beautiful space",
      "background_id": "uuid",
      "clock_font_id": "uuid",
      "text_font_name": "Arial",
      "is_deleted": false,
      "created_at": "2025-11-16T10:30:00Z",
      "updated_at": "2025-11-16T10:30:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "background": { /* background object */ },
      "space_tags": [
        {
          "id": "uuid",
          "tag": {
            "id": "uuid",
            "name": "Relaxing"
          }
        }
      ]
    }
  ]
}
```

### Error Responses

**400 Bad Request - Invalid user_id format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "user_id",
        "message": "Invalid user ID format"
      }
    ]
  }
}
```

### Notes
- Only returns non-deleted spaces (`is_deleted = false`)
- Includes related user, background, and tags information
- Returns empty array if no spaces match the filter

---

## 3. Get Space by ID

### Endpoint
```
GET /api/space/:id
```

### Description
Retrieves detailed information about a specific space by its ID, including all relations (playlists, widgets, tags, etc.).

### URL Parameters
| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Space ID (UUID) |

### Request Example
```
GET /api/space/550e8400-e29b-41d4-a716-446655440000
```

### Validation Rules
- **id**: Must be a valid UUID format

### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Space",
    "description": "A beautiful space",
    "background_id": "uuid",
    "clock_font_id": "uuid",
    "text_font_name": "Arial",
    "is_deleted": false,
    "created_at": "2025-11-16T10:30:00Z",
    "updated_at": "2025-11-16T10:30:00Z",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "background": { /* background object */ },
    "clock": { /* clock font object */ },
    "text": { /* text font object */ },
    "widget_positions": [
      {
        "id": "uuid",
        "widget_id": "widget_1",
        "position": {
          "x": 100,
          "y": 200,
          "metadata": {}
        }
      }
    ],
    "playlists": [
      {
        "id": "uuid",
        "name": "My Playlist",
        "playlist_tracks": [
          {
            "track_order": 1,
            "track": {
              "id": "uuid",
              "title": "Song Title",
              "artist": "Artist Name",
              "duration": 240
            }
          }
        ]
      }
    ],
    "space_tags": [
      {
        "id": "uuid",
        "tag": {
          "id": "uuid",
          "name": "Relaxing"
        }
      }
    ]
  }
}
```

### Error Responses

**400 Bad Request - Invalid ID format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "id",
        "message": "Invalid space ID format"
      }
    ]
  }
}
```

**404 Not Found - Space does not exist**
```json
{
  "success": false,
  "error": {
    "code": "SPACE_1201",
    "message": "Space not found"
  }
}
```

### Notes
- Only returns non-deleted spaces
- Soft-deleted child entities (tags, widgets, playlists) are excluded
- Includes complete playlist information with tracks ordered by `track_order`

---

## 4. Update Space

### Endpoint
```
PATCH /api/space/:id
```

### Description
Updates space properties including metadata, appearance, tags, playlist links, and widget positions. Updates are applied in a transactional manner.

### URL Parameters
| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Space ID (UUID) |

### Request Body
The request body is organized into sections. **At least one section must be provided.**

```json
{
  "metadata": {                    // Optional: Update name and/or description
    "name": "string",              // Optional: New space name (1-200 chars)
    "description": "string"        // Optional: New description (max 1000 chars, nullable)
  },
  "appearance": {                  // Optional: Update appearance settings
    "background_id": "uuid",       // Optional: Background ID (UUID, nullable)
    "clock_font_id": "uuid",       // Optional: Clock font ID (UUID, nullable)
    "text_font_name": "string"     // Optional: Text font name (max 100 chars, nullable)
  },
  "tags": ["uuid"],                // Optional: Replace all tags (min 1 tag, UUID format)
  "playlist_links": {              // Optional: Manage playlist associations
    "add": ["uuid"],               // Optional: Playlist IDs to link
    "remove": ["uuid"]             // Optional: Playlist IDs to unlink
  },
  "widgets": [                     // Optional: Replace all widget positions
    {
      "widget_id": "string",       // Required: Widget identifier
      "x": 0,                      // Required: X coordinate
      "y": 0,                      // Required: Y coordinate
      "metadata": {}               // Optional: Additional data
    }
  ]
}
```

### Validation Rules
- **At least one section** (metadata, appearance, tags, playlist_links, or widgets) must be provided
- **metadata.name**: 1-200 characters if provided
- **metadata.description**: Max 1000 characters, nullable
- **appearance.background_id**: Valid UUID or null
- **appearance.clock_font_id**: Valid UUID or null
- **appearance.text_font_name**: Max 100 characters, nullable
- **tags**: If provided, must contain at least 1 valid UUID
- **playlist_links.add/remove**: Arrays of valid UUIDs
- **widgets**: Each widget requires widget_id, x, and y

### Business Logic Validations
- Space must exist and not be soft-deleted
- All tag IDs must exist and not be deleted
- background_id must exist if provided
- clock_font_id must exist if provided
- text_font_name must exist if provided
- Playlist IDs must exist and not be deleted

### Update Behavior
- **Metadata**: Partial updates supported (can update name only, description only, or both)
- **Appearance**: Partial updates supported (can update individual properties)
- **Tags**: Complete replacement (all existing tags are soft-deleted, new tags are created)
- **Playlist Links**: 
  - `add`: Links specified playlists to this space
  - `remove`: Unlinks specified playlists (sets space_id to null)
  - Both operations can be performed in the same request
- **Widgets**: Complete replacement (all existing widget positions are soft-deleted, new positions are created)

### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Updated Space Name",
    "description": "Updated description",
    // ... complete space object with all relations
  }
}
```

### Error Responses

**400 Bad Request - No update fields provided**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "",
        "message": "At least one update field is required"
      }
    ]
  }
}
```

**400 Bad Request - Empty tags array**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "tags",
        "message": "At least one tag is required"
      }
    ]
  }
}
```

**404 Not Found - Space does not exist**
```json
{
  "success": false,
  "error": {
    "code": "SPACE_1201",
    "message": "Space not found"
  }
}
```

**422 Unprocessable Entity - Invalid asset reference**
```json
{
  "success": false,
  "error": {
    "code": "SPACE_1206",
    "message": "Invalid background ID"
  }
}
```

### Example Requests

**Update only metadata:**
```json
{
  "metadata": {
    "name": "My Updated Space"
  }
}
```

**Update only appearance:**
```json
{
  "appearance": {
    "background_id": "550e8400-e29b-41d4-a716-446655440000",
    "clock_font_id": null
  }
}
```

**Replace all tags:**
```json
{
  "tags": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Add and remove playlists:**
```json
{
  "playlist_links": {
    "add": ["550e8400-e29b-41d4-a716-446655440003"],
    "remove": ["550e8400-e29b-41d4-a716-446655440004"]
  }
}
```

**Update multiple sections at once:**
```json
{
  "metadata": {
    "name": "New Name",
    "description": "New description"
  },
  "appearance": {
    "background_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "tags": ["550e8400-e29b-41d4-a716-446655440001"]
}
```

---

## 5. Delete Space

### Endpoint
```
DELETE /api/space/:id
```

### Description
Performs a soft delete on a space and cascades to related entities. The space and its relations are marked as deleted but remain in the database.

### URL Parameters
| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | Space ID (UUID) |

### Request Example
```
DELETE /api/space/550e8400-e29b-41d4-a716-446655440000
```

### Validation Rules
- **id**: Must be a valid UUID format

### Soft Delete Behavior
When a space is deleted, the following occurs in a single transaction:
1. **Space**: `is_deleted` set to `true`
2. **Space Tags**: All associated space_tags are soft-deleted
3. **Widget Positions**: All widget positions are soft-deleted
4. **Playlists**: Playlists are **detached** (space_id set to null, NOT deleted)
5. **Playlist Tracks**: Remain unchanged and associated with the detached playlist

### Success Response
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Space deleted successfully"
  }
}
```

### Error Responses

**400 Bad Request - Invalid ID format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_2001",
    "message": "Validation failed",
    "details": [
      {
        "field": "id",
        "message": "Invalid space ID format"
      }
    ]
  }
}
```

**404 Not Found - Space does not exist or already deleted**
```json
{
  "success": false,
  "error": {
    "code": "SPACE_1201",
    "message": "Space not found"
  }
}
```

### Notes
- Deleting an already deleted space returns 404 (idempotent behavior)
- Soft-deleted spaces will not appear in GET endpoints
- Playlists remain accessible after space deletion (space_id becomes null)
- All delete operations occur within a database transaction

---

## Error Codes

### Validation Errors (400)
| Code           | Description                          |
|----------------|--------------------------------------|
| VALIDATION_2001| General validation failed            |

### Space Errors (404, 422, 500)
| Code           | Status | Description                          |
|----------------|--------|--------------------------------------|
| SPACE_1201     | 404    | Space not found                      |
| SPACE_1202     | 500    | Space creation failed                |
| SPACE_1203     | 500    | Space update failed                  |
| SPACE_1204     | 500    | Space deletion failed                |
| SPACE_1206     | 422    | Space validation failed (assets)     |

### Common HTTP Status Codes
- **200 OK**: Successful GET, PATCH, DELETE operations
- **201 Created**: Successful POST operation
- **400 Bad Request**: Validation errors (Joi schema validation)
- **404 Not Found**: Resource not found or soft-deleted
- **422 Unprocessable Entity**: Business logic validation failed
- **500 Internal Server Error**: Server or database errors

---

## General Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ /* Optional: validation details */ ]
  }
}
```

---

## Notes

### Soft Delete Pattern
All delete operations use soft deletes. Records are marked with `is_deleted: true` instead of being removed from the database. This allows for:
- Data recovery
- Audit trails
- Referential integrity

### Transactional Operations
All write operations (CREATE, UPDATE, DELETE) use database transactions to ensure data consistency. If any step fails, all changes are rolled back.

### UUID Format
All IDs use UUID v4 format:
```
550e8400-e29b-41d4-a716-446655440000
```

### Authentication & Authorization
**Note**: Authentication and authorization middleware are not yet implemented (marked as TODO in routes). Once implemented:
- All endpoints will require valid authentication
- Users can only access/modify their own spaces
- Admin roles may have additional permissions

---

## Testing
Comprehensive test coverage exists for all endpoints:
- **57 tests total** covering success cases, validation errors, and edge cases
- Tests located in: `server/__tests__/space/`
- Run tests: `npm test`

---

**Last Updated**: November 16, 2025  
**API Version**: 1.0  
**Base Path**: `/api/space`
