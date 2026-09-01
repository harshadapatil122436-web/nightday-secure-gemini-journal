# NightDay — AI-Powered Daily Journal & Reflection Companion

NightDay is a modern, privacy-first daily reflection and journaling application designed to help you capture your thoughts, track your moods, and reflect with an empathetic companion.

---

## 🔒 Security & Secret Management Guide

When deploying or pushing this codebase to GitHub or other public repositories, follow these best practices to ensure **no API keys, tokens, or credentials are leaked**.

### 1. The `.gitignore` Setup
The repository includes a `.gitignore` configured to prevent sensitive files and runtime secrets from being committed:

```gitignore
node_modules/
dist/
build/
.DS_Store
*.log
.env*
!.env.example
service-account*.json
firebase-adminsdk*.json
```

- **Never commit `.env` or `.env.local`**: Real API keys must live only in local `.env` files or platform secret managers.
- **Commit `.env.example` only**: `.env.example` contains placeholder variable names without actual secrets.

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Set your values in `.env` (which is git-ignored):

```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

### 3. Google Cloud Secret Manager (for Production Deployments)

For secure production hosting on Google Cloud Run without environment variable leaks:

```bash
# 1. Create and populate the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant Cloud Run runtime service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🛡️ Cloud Firestore Security Rules

To ensure user reflections and private data remain strictly isolated and accessible only to authenticated authors:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile document isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User interactions & journal entries subcollection
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🚀 How to Safely Push to GitHub

Follow these steps before pushing your code:

### Step 1: Check Git Status & Staged Files
Verify that no secret files (e.g., `.env`, `.env.local`, service account JSONs) are staged:

```bash
git status
```

### Step 2: Check for Accidental API Keys in Code
Run a quick search to ensure no hardcoded keys exist:

```bash
# Ensure no hardcoded keys exist
git diff | grep -iE 'key|secret|token|password'
```

### Step 3: Add, Commit, and Push

```bash
git add .
git commit -m "feat: setup NightDay reflection app with secure environment handling"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## ☁️ Cloud Run Deployment Flow

```bash
# Build and deploy to Cloud Run
gcloud run deploy nightday-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest

# Challenge verification label (if applicable)
gcloud run services update nightday-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
