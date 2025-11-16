# Space Search API Documentation

## Search Spaces

Search for spaces by title, tags, and author with pagination support.

### Endpoint
```
GET /api/search/spaces
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | General search query (searches in title and description) |
| `title` | string | No | Search specifically in space title |
| `tag` | UUID | No | Filter by tag ID |
| `author` | UUID | No | Filter by author (user) ID |
| `limit` | integer | No | Number of results per page (1-100, default: 20) |
| `offset` | integer | No | Number of results to skip (default: 0) |

**Note:** At least one search parameter (q, title, tag, or author) is required.

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Space Title",
      "description": "Space description",
      "background_id": "uuid",
      "clock_font_id": "uuid",
      "text_font_name": "uuid",
      "is_deleted": false,
      "created_at": "2025-11-16T10:00:00.000Z",
      "updated_at": "2025-11-16T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "Author Name",
        "email": "author@example.com",
        "avatar_url": "https://..."
      },
      "background": {
        "id": "uuid",
        "background_url": "https://...",
        "is_deleted": false
      },
      "space_tags": [
        {
          "id": "uuid",
          "space_id": "uuid",
          "tag_id": "uuid",
          "is_deleted": false,
          "tag": {
            "id": "uuid",
            "name": "productivity",
            "is_deleted": false
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Error Response (422 Unprocessable Entity)
```json
{
  "success": false,
  "error": {
    "code": "SPACE_VALIDATION_FAILED",
    "message": "Invalid tag ID"
  }
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "error": {
    "code": "SPACE_NOT_FOUND",
    "message": "Failed to search spaces",
    "details": "Error details"
  }
}
```

### Example Requests

#### Search by general query
```bash
GET /api/search/spaces?q=productivity
```

#### Search by title only
```bash
GET /api/search/spaces?title=workspace
```

#### Search by tag
```bash
GET /api/search/spaces?tag=550e8400-e29b-41d4-a716-446655440000
```

#### Search by author
```bash
GET /api/search/spaces?author=550e8400-e29b-41d4-a716-446655440001
```

#### Combined search with pagination
```bash
GET /api/search/spaces?title=workspace&tag=550e8400-e29b-41d4-a716-446655440000&limit=10&offset=0
```

#### Search by multiple criteria
```bash
GET /api/search/spaces?q=productivity&author=550e8400-e29b-41d4-a716-446655440001&limit=50
```

### Features

1. **General Search (q parameter)**: Searches in both title and description fields (case-insensitive)
2. **Title Search**: Searches specifically in space title (case-insensitive)
3. **Tag Filter**: Filters spaces that have the specified tag
4. **Author Filter**: Filters spaces created by a specific user
5. **Pagination**: Supports limit and offset for paginated results
6. **Soft Delete Awareness**: Only returns spaces and related data that are not soft-deleted
7. **Sorted Results**: Results are ordered by creation date (newest first)

### Notes

- All text searches are case-insensitive
- Multiple search criteria can be combined (AND logic)
- Only non-deleted spaces, users, tags, and backgrounds are returned
- Maximum limit is 100 results per page
- The `hasMore` flag in pagination indicates if there are more results available

