
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 🔐 Admin check helper
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 🔐 Editor check helper
    function isEditor() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isEditor == true;
    }

    // 🔐 User check helper
    function isUser(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // ✅ User profile access - users can read/write their own profile, admins can access all
    match /users/{userId} {
      // Allow users to read their own profile without checking admin status
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to create their own profile during registration
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to update their own profile (but not role/admin fields)
      allow update: if request.auth != null && request.auth.uid == userId &&
        (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['isAdmin', 'isEditor', 'role']));
      
      // Admins can read and write all user profiles
      allow read, write: if request.auth != null && isAdmin();
    }

    // ✅ Public collections: read by all authenticated users, write only by admin or editor
    match /signals/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /news/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /analysis/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /vipChat/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /banners/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /plans/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    match /settings/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    // ✅ Uploads: only authenticated users can read, only admin can write
    match /uploads/{uploadId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (isAdmin() || isEditor());
    }

    // ✅ Chats: users can access their own chat, admin can access all
    match /chats/{chatId} {
      allow read, write: if request.auth != null && (
        isAdmin() || 
        chatId.matches('.*_' + request.auth.uid + '.*') ||
        chatId.matches('.*' + request.auth.uid + '_.*')
      );
    }

    // ✅ Messages: proper access control for chat messages
    match /messages/{messageId} {
      allow read: if request.auth != null && (
        isAdmin() || 
        resource.data.userId == request.auth.uid ||
        resource.data.recipientId == request.auth.uid
      );

      allow create: if request.auth != null && (
        isAdmin() || 
        request.resource.data.userId == request.auth.uid
      );

      allow update, delete: if request.auth != null && (
        isAdmin() ||
        resource.data.userId == request.auth.uid
      );
    }
  }
}
