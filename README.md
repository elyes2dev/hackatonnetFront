# HackathonNet Frontend 🌐  
*Modern Angular Web Application for Hackathon Management*

## Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Testing](#-testing)
- [Best Practices](#-best-practices)
- [Team](#-team)
- [License](#-license)

## ✨ Features

### **Core Functionality**
- 🎯 Role-based dashboards (Organizer/Participant/Mentor)
- 💬 Real-time chat with WebSocket integration
- 🤖 AI-powered mentor matching interface
- 📤 Project submission system with file uploads
- 🔔 Live notifications system

### **User Experience**
- 📱 Fully responsive design (mobile-first approach)
- 🌗 Dark/light mode toggle
- 🚀 Optimized performance with lazy loading
- 🛡️ JWT authentication flow
- 📊 Interactive data visualizations

## 🛠️ Tech Stack

| Category        | Technologies                          |
|-----------------|---------------------------------------|
| Framework       | Angular 16+                           |
| Styling         | Tailwind CSS + SCSS                   |
| State Management| NgRx (optional)                       |
| API Handling    | Angular HttpClient + RxJS             |
| Real-time       | WebSocket API                         |
| Testing         | Jasmine + Karma (unit), Cypress (e2e) |
| Build Tool      | Angular CLI                           |

## 🚀 Installation

### Prerequisites
- Node.js v18 or later
- Angular CLI v16 or later
- npm v9 or later

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/elyes2dev/hackatonnetFront.git

# Navigate to project directory
cd hackatonnetFront

# Install dependencies
npm install

# Start development server
ng serve
