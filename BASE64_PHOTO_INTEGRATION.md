# Base64 Profile Photo Integration Guide

## ✅ **SOLUTION IMPLEMENTED: Base64 Database Storage**

Profile photos are now stored as Base64 encoded strings directly in MongoDB, ensuring 100% persistence and reliability.

## **API Endpoints**

### 1. Upload Photo
```
POST /api/admins/{id}/profile-photo
Content-Type: multipart/form-data
Body: photo file
```

### 2. Get Photo Data
```
GET /api/admins/{id}/profile-photo
Returns: { "hasPhoto": true/false, "photoData": "data:image/jpeg;base64,..." }
```

### 3. Delete Photo
```
DELETE /api/admins/{id}/profile-photo
Returns: { "message": "success", "admin": {...} }
```

## **Frontend Integration Code**

### Load Existing Photo
```javascript
async function loadAdminPhoto(adminId) {
    try {
        const response = await fetch(`/api/admins/${adminId}/profile-photo`);
        const data = await response.json();
        
        if (data.hasPhoto && data.photoData) {
            // Set image source directly to Base64 data
            document.getElementById('profilePhoto').src = data.photoData;
        } else {
            // Use placeholder image
            document.getElementById('profilePhoto').src = 'default-avatar.png';
        }
    } catch (error) {
        console.error('Error loading photo:', error);
        document.getElementById('profilePhoto').src = 'default-avatar.png';
    }
}
```

### Upload New Photo
```javascript
async function uploadPhoto(adminId, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
        const response = await fetch(`/api/admins/${adminId}/profile-photo`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert(result.error);
        } else {
            alert('Photo uploaded successfully!');
            loadAdminPhoto(adminId); // Reload photo
        }
    } catch (error) {
        alert('Upload failed: ' + error.message);
    }
}
```

### Delete Photo
```javascript
async function deletePhoto(adminId) {
    if (!confirm('Delete profile photo?')) return;
    
    try {
        const response = await fetch(`/api/admins/${adminId}/profile-photo`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert(result.error);
        } else {
            alert('Photo deleted successfully!');
            document.getElementById('profilePhoto').src = 'default-avatar.png';
        }
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}
```

## **HTML Structure**

```html
<!-- Profile Photo Display -->
<div class="profile-photo-container">
    <img id="profilePhoto" 
         src="default-avatar.png" 
         alt="Profile Photo"
         style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
</div>

<!-- Upload Form -->
<div class="photo-upload-form">
    <input type="file" id="photoInput" accept="image/*">
    <button onclick="uploadPhoto(currentAdminId, document.getElementById('photoInput'))">
        Upload Photo
    </button>
    <button onclick="deletePhoto(currentAdminId)">
        Delete Photo
    </button>
</div>
```

## **Integration Steps**

### 1. In your admin profile page:
```javascript
// On page load
document.addEventListener('DOMContentLoaded', function() {
    const adminId = getCurrentAdminId(); // Your function
    loadAdminPhoto(adminId);
});
```

### 2. In your admin dashboard:
```javascript
// Show photo in admin info
function displayAdminInfo(admin) {
    // Your existing code...
    
    // Load profile photo
    if (admin.profilePhoto) {
        loadAdminPhoto(admin.id);
    }
}
```

### 3. In admin list/table:
```javascript
// For each admin in list
admins.forEach(admin => {
    if (admin.profilePhoto) {
        // Show thumbnail using Base64 data directly
        const img = document.createElement('img');
        img.src = admin.profilePhoto; // This is already Base64 data
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.borderRadius = '50%';
        // Add to your admin row
    }
});
```

## **Testing**

1. **Start your backend**: `./mvnw spring-boot:run`
2. **Open test page**: `admin-photo-test.html`
3. **Enter admin ID**: Use existing admin from database
4. **Upload photo**: Select image and upload
5. **Refresh page**: Photo should persist! ✅
6. **Check database**: Photo stored as Base64 in `profilePhoto` field

## **Advantages of Base64 Storage**

✅ **100% Persistent** - Stored in database, never lost  
✅ **No File System Issues** - Works on any server/deployment  
✅ **Automatic Backups** - Included in database backups  
✅ **Simple Integration** - Direct Base64 data in responses  
✅ **No Static File Serving** - No need for file server configuration  
✅ **Cross-Platform** - Works everywhere MongoDB works  

## **Database Storage**

Photos are stored in the `Admin` document:
```json
{
  "_id": "admin123",
  "username": "admin",
  "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

The `profilePhoto` field contains the complete Base64 data URL that can be used directly as an image source.

## **File Size Considerations**

- **Limit**: 5MB per photo (reasonable for profile pictures)
- **Formats**: JPEG, PNG, GIF, BMP supported
- **Optimization**: Consider client-side image compression for larger files
- **MongoDB**: Base64 increases size by ~33%, but still efficient for profile photos

Your profile photo system is now completely reliable and will persist through any server restart, deployment, or page refresh!