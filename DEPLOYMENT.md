# Raspberry Pi 3B+ Deployment Guide

This guide explains how to deploy the Mensa Menu application on a Raspberry Pi 3B+.

## Prerequisites

- Raspberry Pi 3B+ with Raspberry Pi OS (64-bit recommended)
- At least 2GB microSD card (4GB+ recommended)
- Internet connection
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Option 1: Docker Deployment (Recommended)

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose

# Reboot to apply changes
sudo reboot
```

### Step 2: Clone the Repository

```bash
# Clone to home directory
cd ~
git clone <your-repo-url> mensa-menu
cd mensa-menu
```

### Step 3: Configure Environment

```bash
# Create environment file
cp .env.example .env.local

# Edit with your Gemini API key
nano .env.local
```

Add your API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 4: Build and Run

```bash
# Build and start in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

The application will be available at `http://<raspberry-pi-ip>:3000`

### Step 5: Auto-start on Boot (Optional)

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Docker Compose containers with restart policy will auto-start
```

---

## Option 2: Direct Node.js Deployment

### Step 1: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Clone and Install

```bash
cd ~
git clone <your-repo-url> mensa-menu
cd mensa-menu

# Install dependencies
npm ci

# Create environment file
cp .env.example .env.local
nano .env.local  # Add your GEMINI_API_KEY
```

### Step 3: Build for Production

```bash
npm run build
```

### Step 4: Create systemd Service

```bash
sudo nano /etc/systemd/system/mensa-menu.service
```

Add the following content:

```ini
[Unit]
Description=Mensa Menu Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/mensa-menu
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/home/pi/mensa-menu/.env.local

[Install]
WantedBy=multi-user.target
```

### Step 5: Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable mensa-menu

# Start the service
sudo systemctl start mensa-menu

# Check status
sudo systemctl status mensa-menu
```

---

## Accessing the Application

Once running, access the application from any device on the same network:

```
http://<raspberry-pi-ip>:3000
```

To find your Raspberry Pi's IP address:

```bash
hostname -I
```

---

## Troubleshooting

### Check if the application is running

```bash
# Docker
docker-compose ps
docker-compose logs --tail=50

# Node.js service
sudo systemctl status mensa-menu
sudo journalctl -u mensa-menu -f
```

### Memory issues on Pi 3B+

The Pi 3B+ has 1GB RAM. If you experience memory issues:

1. Increase swap space:

```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Change CONF_SWAPSIZE=100 to CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

2. Build on a more powerful machine and deploy the pre-built image.

### Port already in use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

---

## Updating the Application

### Docker

```bash
cd ~/mensa-menu
git pull
docker-compose down
docker-compose up -d --build
```

### Node.js

```bash
cd ~/mensa-menu
git pull
npm ci
npm run build
sudo systemctl restart mensa-menu
```
