# Farm Server

This directory contains the server-side components for the smart farm project. The server handles various services including video streaming, sensor data collection, and AI-based plant care advice.

## 📚 Index
- [Services](#services)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Configuration](#configuration)

## Services

### HTTP Proxy Server
The HTTP Proxy Server handles video streaming and image processing.

- **File**: [services/service_server/http-proxy-server.js](services/service_server/http-proxy-server.js)
- **Endpoints**:
  - /timelapse
  - /video
  - /stream
  - /api/sectors
  - /api/sensor/:id
  - /api/sensor/latest/:sectorId
  - /api/sector/:id
  - /api/sub-list/:uid
  - /api/harvest/:sectorId
  - /api/prompt/:sectorId

### Save Local
Handles saving images locally with timestamps.

- **File**: [services/service_server/save_local.js](services/service_server/save_local.js)

### Timelapse
Generates timelapse videos from images.

- **File**: [services/timelapse.sh](services/timelapse.sh)

## Deployment

To deploy the server, follow these steps:

1. **Navigate to the `farm-server` directory**:
    ```bash
    cd farm-server
    ```

2. **Run the deployment script**:
    ```bash
    bash deploy.sh
    ```

### Deployment Script
The deployment script packages and installs the server application.

- **File**: [deploy.sh](deploy.sh)

## Scripts

### `deploy.sh`
Deploys the server and its services.

- **File**: [deploy.sh](deploy.sh)

## Configuration

### `appinfo.json`
Contains metadata for the server application.

- **File**: [farm_control_dashboard/appinfo.json](farm_control_dashboard/appinfo.json)

## Prerequisites

- **ares-cli**: Must be installed on your PC.
- **webOS**: The installation location for the executable file must be based on webOS.

## Features

- **Subscribe to Your Preferred Plants by Sector**: Users can subscribe to grow their desired plants in different sectors of the smart farm.
- **Real-time Monitoring via Web App**: Users can check the status of the smart farm in real-time using cameras.
- **Control Irrigation and LED Lighting**: Watering and LED lighting controls are accessible directly through the web app.
- **Time-lapse of Plant Growth**: The service offers a time-lapse video feature that captures the entire lifecycle of the plants.
- **AI-based Plant Care Advice**: Provides helpful advice on plant care using generative AI.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/perman0519/2024ESWContest_webOS_3016.git smart_farm
    cd smart_farm
    ```

2. **Build the project**:
    ```bash
    cd farm-server
    bash deploy.sh
    ```
