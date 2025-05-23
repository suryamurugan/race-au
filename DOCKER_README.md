# Docker Deployment Guide

This guide explains how to deploy the Next.js application using Docker with the necessary environment variables.

## Environment Variables

The following environment variables can be passed at runtime:

### Required Variables

| Variable               | Description                           | Example                                      |
| ---------------------- | ------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL database connection string | `postgresql://user:pass@localhost:5432/race` |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                | `123456789-abc.apps.googleusercontent.com`   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret            | `GOCSPX-abcd1234...`                         |
| `NEXT_PUBLIC_APP_URL`  | Public URL of your application        | `https://your-domain.com`                    |
| `RESEND_API_KEY`       | Resend email service API key          | `re_abc123...`                               |

### Optional Variables

| Variable               | Description                                   | Example           |
| ---------------------- | --------------------------------------------- | ----------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID (if using GitHub auth) | `Iv1.abc123...`   |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret                    | `abc123def456...` |

## Deployment Options

### Option 1: Docker Run with Environment Variables

```bash
docker build -t race-app .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/race" \
  -e GOOGLE_CLIENT_ID="your_google_client_id" \
  -e GOOGLE_CLIENT_SECRET="your_google_client_secret" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  -e RESEND_API_KEY="your_resend_api_key" \
  race-app
```

### Option 2: Docker Run with Environment File

Create a `.env.production` file:

```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/race

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email Service Configuration
RESEND_API_KEY=your_resend_api_key_here

# Optional: GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

Then run:

```bash
docker run -p 3000:3000 --env-file .env.production race-app
```

### Option 3: Docker Compose (Recommended)

Use the provided `docker-compose.yml`:

1. Create a `.env` file in the project root with your variables
2. Run: `docker-compose up -d`

This will start both the app and a PostgreSQL database.

## Production Considerations

1. **Security**: Never commit actual environment variables to version control
2. **Database**: Ensure your database is accessible from the Docker container
3. **URLs**: Update `NEXT_PUBLIC_APP_URL` to your actual domain in production
4. **SSL**: Use HTTPS URLs for production deployments
5. **Secrets**: Consider using Docker secrets or external secret management for sensitive data

## Troubleshooting

- If the app fails to start, check the logs: `docker logs <container_id>`
- Ensure all required environment variables are set
- Verify database connectivity
- Check that OAuth redirect URIs match your `NEXT_PUBLIC_APP_URL`
