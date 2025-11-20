# Background Upload API Documentation

## Overview
API hỗ trợ upload hình ảnh background cho Space thông qua POST (create) và PATCH (update).

## Supported Features
- ✅ Upload binary data của file hình ảnh
- ✅ Upload base64 encoded image
- ✅ Hỗ trợ các định dạng: jpg, jpeg, png, gif, webp, bmp
- ✅ Giới hạn kích thước file: 10MB
- ✅ Tự động tạo unique filename
- ✅ Soft delete (is_deleted = true)
- ✅ File được lưu tại: `storage/background/`

---

## POST /api/spaces - Create Space with Background Upload

### Request Body Options

#### Option 1: Upload với Base64
```json
{
  "user_id": "uuid",
  "name": "My Space",
  "description": "Space description",
  "tags": ["tag-id-1", "tag-id-2"],
  "backgroundBase64": "iVBORw0KGgoAAAANS...",
  "backgroundFileFormat": "png"
}
```

#### Option 2: Upload với Binary Data (Array)
```json
{
  "user_id": "uuid",
  "name": "My Space",
  "description": "Space description",
  "tags": ["tag-id-1"],
  "backgroundFileData": [255, 216, 255, 224, ...],
  "backgroundFileFormat": "jpg"
}
```

#### Option 3: Sử dụng Background có sẵn
```json
{
  "user_id": "uuid",
  "name": "My Space",
  "tags": ["tag-id-1"],
  "background_id": "existing-background-uuid"
}
```

### Response Success (201)
```json
{
  "success": true,
  "data": {
    "id": "space-uuid",
    "user_id": "user-uuid",
    "name": "My Space",
    "description": "Space description",
    "background_id": "background-uuid",
    "clock_font_id": "clock-font-uuid",
    "text_font_name": "text-font-uuid",
    "is_deleted": false,
    "created_at": "2025-11-18T10:00:00.000Z",
    "updated_at": "2025-11-18T10:00:00.000Z",
    "background": {
      "id": "background-uuid",
      "background_url": "/storage/background/1731924000000-abc123def456.png",
      "is_deleted": false
    }
  }
}
```

### Error Responses

#### Invalid Image Format (400)
```json
{
  "success": false,
  "error": {
    "code": "SPACE_VALIDATION_FAILED",
    "message": "Failed to upload background: Invalid image format. Allowed formats: .jpg, .jpeg, .png, .gif, .webp, .bmp"
  }
}
```

#### File Too Large (400)
```json
{
  "success": false,
  "error": {
    "code": "SPACE_VALIDATION_FAILED",
    "message": "Failed to upload background: File size exceeds maximum allowed size of 10MB"
  }
}
```

---

## PATCH /api/spaces/:id - Update Space Background

### Request Body Options

#### Option 1: Upload Background mới với Base64
```json
{
  "appearance": {},
  "backgroundBase64": "iVBORw0KGgoAAAANS...",
  "backgroundFileFormat": "png"
}
```

#### Option 2: Upload Background mới với Binary Data
```json
{
  "appearance": {},
  "backgroundFileData": [255, 216, 255, 224, ...],
  "backgroundFileFormat": "jpg"
}
```

#### Option 3: Thay đổi sang Background có sẵn
```json
{
  "appearance": {
    "background_id": "existing-background-uuid"
  }
}
```

#### Option 4: Update cả Background và các thuộc tính khác
```json
{
  "metadata": {
    "name": "Updated Space Name",
    "description": "Updated description"
  },
  "appearance": {
    "clock_font_id": "clock-font-uuid",
    "text_font_name": "text-font-uuid"
  },
  "backgroundBase64": "iVBORw0KGgoAAAANS...",
  "backgroundFileFormat": "png"
}
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": "space-uuid",
    "name": "Updated Space Name",
    "background_id": "new-background-uuid",
    "updated_at": "2025-11-18T10:30:00.000Z",
    "background": {
      "id": "new-background-uuid",
      "background_url": "/storage/background/1731925800000-xyz789.png"
    }
  }
}
```

---

## GET /storage/background/:filename - Serve Background Image

### Request
```
GET /storage/background/1731924000000-abc123def456.png
```

### Response
Returns the image file with appropriate Content-Type headers.

### Error (404)
```json
{
  "success": false,
  "message": "File not found"
}
```

---

## File Upload Details

### Supported Formats
- `.jpg`, `.jpeg` - JPEG images
- `.png` - PNG images
- `.gif` - GIF images
- `.webp` - WebP images
- `.bmp` - Bitmap images

### File Size Limit
- Maximum: 10MB (10,485,760 bytes)

### Storage Location
- Local path: `server/storage/background/`
- URL path: `/storage/background/{filename}`

### Filename Format
Generated automatically:
```
{timestamp}-{random-32-chars}.{extension}
Example: 1731924000000-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.png
```

### Security Features
- ✅ Filename validation (no directory traversal)
- ✅ Format whitelist
- ✅ Size limit enforcement
- ✅ Unique filename generation (prevents overwrite)

---

## Integration Examples

### JavaScript/Fetch with Base64
```javascript
// Convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload
const uploadBackground = async (file, spaceData) => {
  const base64 = await fileToBase64(file);
  const extension = file.name.split('.').pop();
  
  const response = await fetch('/api/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...spaceData,
      backgroundBase64: base64,
      backgroundFileFormat: extension
    })
  });
  
  return response.json();
};
```

### Node.js with Binary Data
```javascript
const fs = require('fs');
const axios = require('axios');

const uploadBackground = async (filePath, spaceData) => {
  const fileBuffer = fs.readFileSync(filePath);
  const extension = filePath.split('.').pop();
  
  const response = await axios.post('/api/spaces', {
    ...spaceData,
    backgroundFileData: Array.from(fileBuffer),
    backgroundFileFormat: extension
  });
  
  return response.data;
};
```

---

## Notes

1. **Background Upload Priority:**
   - `backgroundFileData` + `backgroundFileFormat` → Upload binary
   - `backgroundBase64` + `backgroundFileFormat` → Upload base64
   - `background_id` → Use existing background
   - None → Use default background

2. **Background Records:**
   - Mỗi lần upload tạo 1 record mới trong bảng `backgrounds`
   - Background cũ KHÔNG bị xóa (soft delete only)
   - File vật lý được giữ lại cho đến khi clean up

3. **Update Behavior:**
   - Upload background mới → Tạo background record mới
   - Space sẽ trỏ đến background_id mới
   - Background cũ vẫn tồn tại trong database

4. **Soft Delete:**
   - DELETE `/api/spaces/:id` → set `is_deleted = true`
   - Background files không bị xóa
   - Có thể restore bằng cách set `is_deleted = false`

