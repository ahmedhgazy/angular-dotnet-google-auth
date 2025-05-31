# Angular & .NET Google Authentication Project

This project implements a secure authentication system using Angular for the frontend and .NET for the backend, with Google OAuth integration for user login.

## Overview

- **Frontend**: An Angular application (`auth-client`) that provides a user interface for login and interaction with the backend API.
- **Backend**: A .NET API (`AuthApi`) that handles authentication, token generation, and user management, integrated with Google OAuth.

## Features

- User authentication via Google OAuth
- JWT token generation and validation
- User data storage and management

## Project Structure

- `auth-client/`: Angular frontend code
  - `src/app/components/login/`: Login component for user authentication
- `AuthApi/`: .NET backend API
  - `Services/`: Contains services for token generation (`TokenService.cs`) and user storage (`UserStore.cs`)
  - `Models/`: Data models including `User.cs`
  - `appsettings.json`: Configuration file for API settings
  - `Program.cs`: Entry point for the API

## Getting Started

### Prerequisites

- Node.js and Angular CLI for the frontend
- .NET SDK for the backend

### Installation

1. **Frontend Setup**:
   ```bash
   cd auth-client
   npm install
   ng serve
   ```

2. **Backend Setup**:
   ```bash
   cd AuthApi
   dotnet restore
   dotnet run
   ```

### Configuration

- Ensure Google OAuth credentials are set up in `appsettings.json` under the appropriate section.
- Update the client ID and redirect URI in the Angular app to match your Google OAuth setup.

## Usage

1. Start the backend API.
2. Launch the Angular frontend.
3. Navigate to the login page and click on 'Login with Google' to authenticate.

