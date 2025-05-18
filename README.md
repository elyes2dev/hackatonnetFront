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
- 🎯 **Role-based dashboards**: Custom interfaces for Organizers (event management), Participants (team collaboration), and Mentors (guidance tools)
- 💬 **Real-time chat**: WebSocket-powered messaging system with read receipts and typing indicators
- 🤖 **AI-powered mentor matching**: Intelligent pairing algorithm with preference filters
- 📤 **Project submission**: Multi-file uploads with progress tracking and validation
- 🔔 **Live notifications**: Toast notifications for important events and deadlines

### **User Experience Enhancements**
- 📱 **Fully responsive**: Mobile-first design with adaptive breakpoints (Tailwind CSS)
- 🌗 **Theme system**: Dark/light mode with OS preference detection
- 🚀 **Performance optimized**: 
  - Lazy-loaded feature modules
  - Route preloading strategy
  - OnPush change detection
- 🛡️ **Secure authentication**:
  - JWT token handling
  - Auto-refresh token flow
  - Protected routes with role guards
- 📊 **Data visualization**: Interactive charts for hackathon statistics

## 🛠️ Tech Stack

| Category        | Technologies                          | Key Packages                             |
|-----------------|---------------------------------------|------------------------------------------|
| Framework       | Angular 16+                           | @angular/core, @angular/router           |
| Styling         | Tailwind CSS + SCSS                   | tailwindcss, @angular/material           |
| State Management| NgRx (optional)                       | @ngrx/store, @ngrx/effects               |
| API Handling    | Angular HttpClient + RxJS             | rxjs, @angular/common/http               |
| Real-time       | WebSocket API                         | @stomp/rx-stomp                          |
| Testing         | Jasmine + Karma (unit), Cypress (e2e) | jasmine-core, cypress                    |
| Build Tool      | Angular CLI                           | @angular/cli                             |
| Internationalization | i18n                          | @angular/localize                        |

## 🚀 Installation

### Prerequisites
- **Node.js** v18 or later ([download](https://nodejs.org/))
- **Angular CLI** v16 or later (`npm install -g @angular/cli`)
- **npm** v9 or later (comes with Node.js)

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/elyes2dev/hackatonnetFront.git

# 2. Navigate to project directory
cd hackatonnetFront

# 3. Install dependencies
npm install

# 4. Configure environment (see Configuration section below)
cp .env.example .env

# 5. Start development server
ng serve

# Access the app at http://localhost:4200
