# Docker Desktop Integration Guide

## Building and Managing Your Coffee Shop Queue Image in Docker Desktop

### Step 1: Build the Docker Image

```bash
# Build the main application image
docker build -t coffee-shop-queue:latest .

# Optional: Build with a specific version tag
docker build -t coffee-shop-queue:v1.0.0 .

# Build with detailed output
docker build -t coffee-shop-queue:latest . --progress=plain
```

### Step 2: Verify Image Creation

```bash
# List all Docker images to confirm your image was created
docker images

# Look for your image in the output:
# REPOSITORY           TAG       IMAGE ID       CREATED         SIZE
# coffee-shop-queue    latest    abc123def456   2 minutes ago   200MB
```

### Step 3: View in Docker Desktop

Once built, your image will automatically appear in Docker Desktop:

1. **Open Docker Desktop Application**
2. **Navigate to "Images" tab** in the left sidebar
3. **Find your image**: Look for `coffee-shop-queue` with tag `latest`
4. **Actions available**:
   - Run container
   - Inspect image layers
   - Delete image
   - Push to registry

### Step 4: Run the Complete Stack

```bash
# Start all services (app, MongoDB, LocalStack)
docker-compose up -d

# View running containers in Docker Desktop
# Go to "Containers" tab to see:
# - to-do-queue-app-1
# - to-do-queue-mongodb-1
# - to-do-queue-localstack-1
# - to-do-queue-mongo-express-1
```

### Step 5: Manage Containers in Docker Desktop

In Docker Desktop's "Containers" tab, you can:
- **Start/Stop** individual containers
- **View logs** for each service
- **Access terminal** inside containers
- **Monitor resource usage**
- **Port mappings** and network configuration

### Step 6: Export/Share Image (Optional)

```bash
# Save image to tar file for sharing
docker save coffee-shop-queue:latest -o coffee-shop-queue.tar

# Load image from tar file (on another machine)
docker load -i coffee-shop-queue.tar

# Tag for Docker Hub (if you want to push)
docker tag coffee-shop-queue:latest yourusername/coffee-shop-queue:latest

# Push to Docker Hub
docker push yourusername/coffee-shop-queue:latest
```

### Useful Docker Desktop Features

1. **Container Logs**: Click on any container to view real-time logs
2. **Resource Monitoring**: See CPU, memory, and network usage
3. **Volume Management**: View and manage persistent data
4. **Network Inspection**: See how containers communicate
5. **Image History**: View image layers and build history

### Troubleshooting

If you don't see your image in Docker Desktop:
1. **Refresh** the Images tab
2. **Check build success**: Look for "Successfully tagged" message
3. **Restart Docker Desktop** if needed
4. **Verify Docker daemon**: Ensure Docker Desktop is running

### Quick Commands Reference

```bash
# Build image
docker build -t coffee-shop-queue:latest .

# Run single container
docker run -p 3000:3000 coffee-shop-queue:latest

# Run complete stack
docker-compose up -d

# Stop everything
docker-compose down

# Clean up
docker-compose down -v --rmi all
```