# Firebase Setup Guide for Ignite Day Planner

## Prerequisites
- Google account
- Node.js installed on your machine
- This project cloned/downloaded

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ignite-day-planner` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Toggle "Email link (passwordless sign-in)" to OFF (we're using password-based auth)
   - Click "Save"

## Step 3: Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Select a location closest to your users (e.g., us-central1)
5. Click "Done"

## Step 4: Enable Storage

1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Review the security rules (start in test mode)
4. Choose the same location as your Firestore database
5. Click "Done"

## Step 5: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Enter app nickname: `ignite-day-planner-web`
6. Check "Also set up Firebase Hosting" (optional)
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 6: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration values from Step 5.

## Step 7: Install Dependencies and Start Development

The project already has all necessary dependencies. Simply run:

```bash
npm install
npm run dev
```

## Step 8: Seed Initial Data (Optional)

The application includes a seeding function to create initial data. To use it:

1. Start the development server
2. Open the browser console
3. Run the following command in the console:

```javascript
// Import and run the seed function
import('./src/lib/seedData.js').then(module => module.seedDatabase());
```

This will create:
- An admin user (admin@ignite.edu / admin123)
- Sample brigades (Alpha, Beta, Gamma, Delta, Epsilon)
- Sample students with roll numbers CS2021001-CS2021010
- A sample event with activities

## Step 9: Configure Firestore Security Rules

In the Firebase console, go to Firestore Database > Rules and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all user documents
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Events - Admins can CRUD, Students can read
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Event Plans - Admins can CRUD, Students can read
    match /eventPlans/{planId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Brigades - Admins can CRUD, Students can read
    match /brigades/{brigadeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Submissions - Students can CRUD their own, Admins can read all
    match /submissions/{submissionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.studentId;
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.studentId;
    }
  }
}
```

## Step 10: Configure Storage Security Rules

In the Firebase console, go to Storage > Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Submissions folder - users can upload their own files
    match /submissions/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all submission files
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

## Default Login Credentials

After seeding the database, you can use these credentials:

**Admin Login:**
- Email: admin@ignite.edu
- Password: admin123

**Student Login (examples):**
- Roll Number: CS2021001
- Password: student123

(Roll numbers CS2021001 through CS2021010 are available)

## Troubleshooting

### Common Issues:

1. **Environment variables not loading**: Make sure your `.env` file is in the project root and variables start with `VITE_`

2. **Authentication errors**: Verify that Email/Password authentication is enabled in Firebase Console

3. **Permission denied errors**: Check that Firestore security rules are properly configured

4. **CORS errors**: Make sure your domain is added to Firebase Authentication > Settings > Authorized domains

### Getting Help:

- Check the browser console for detailed error messages
- Verify Firebase configuration in the Firebase Console
- Ensure all Firebase services (Auth, Firestore, Storage) are enabled

## Next Steps

Once Firebase is set up:
1. Test the login functionality with the seeded admin account
2. Create additional users through the admin panel
3. Set up events and activities
4. Test student submissions
5. Review analytics and reports

The application is now ready for development and testing!