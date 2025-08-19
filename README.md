# GitHub Bridge

A secure, client-side web application that allows developers to seamlessly upload their Bolt.new projects directly to GitHub repositories.

## Features

- 🔐 **Secure GitHub OAuth Authentication** - No manual token management required
- 📁 **Direct Repository Integration** - Browse and select from your existing repositories or create new ones
- 🚀 **Smart File Processing** - Automatic ZIP extraction and file comparison
- 🔄 **Intelligent Change Detection** - See exactly what files are new, modified, or unchanged
- 🎯 **Selective File Upload** - Choose which files to include in your commit
- 🔒 **Privacy-First Design** - All processing happens in your browser, no data stored on servers
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A GitHub account
- A Firebase project (for OAuth authentication)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Configuration (required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# GitHub OAuth (configured in Firebase)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret

# Application Configuration
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=GitHub Bridge
VITE_APP_DESCRIPTION=Upload Bolt.new projects to GitHub repositories

# Environment
NODE_ENV=production
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/github-bridge.git
cd github-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see above)

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and configure GitHub as a sign-in provider
3. Add your domain to the authorized domains list
4. Copy the Firebase configuration to your `.env` file

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set the Authorization callback URL to your Firebase Auth domain
4. Copy the Client ID and Client Secret to your Firebase project settings

## Deployment

The application is configured for deployment on Netlify with the included `netlify.toml` configuration. You can also deploy to other platforms like Vercel, Firebase Hosting, or any static hosting service.

### Netlify Deployment

1. Connect your repository to Netlify
2. Set your environment variables in the Netlify dashboard
3. Deploy!

## Security Features

- **Client-side Processing**: All file processing happens in your browser
- **No Data Storage**: We don't store any personal data or project files
- **Secure Authentication**: OAuth through Firebase with GitHub
- **Privacy-First**: Your code never touches our servers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/github-bridge/issues) on GitHub.