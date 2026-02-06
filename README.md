# JinnLog

JinnLog is a comprehensive productivity and project management suite designed to bridge the gap between personal task management and small team collaboration. Built with a "Local-First" philosophy, it provides a robust desktop experience powered by a reusable Java Spring Boot backend, designed to be scalable for future cloud synchronization and multi-platform support (Web/Mobile).

## Project Overview

JinnLog aims to provide a consistent user experience across platforms, acting as a central hub for:
- Project and Task Management
- Time Tracking and Focus Sessions
- Team Collaboration and Resource Planning
- Knowledge Management (Contextual Notes)

The architecture separates the frontend (Electron + React) from the backend (Java + Spring Boot), allowing the backend to serve as a headless API that can run embedded locally or hosted on a remote server.

## Key Features

### Core Productivity
- **Advanced Task Management:** Support for priorities, deadlines, status workflows, and rich Markdown notes.
- **Task Dependencies:** Implementation of blocking relationships (Task B cannot be completed if Task A is incomplete).
- **Checklists:** Granular sub-tasks within a main task to track specific steps.
- **Tags & Organization:** Multi-tagging system for cross-project filtering.

### Time Tracking & Analytics
- **Focus Sessions:** Integrated timer for tracking actual work time against estimates.
- **Analytics:** Calculation of estimation deviation (Estimated vs Actual minutes) to improve planning accuracy.
- **Resource View:** Daily capacity management (default 8 hours) with overload detection for team members.

### Team & Collaboration
- **Role-Based Access Control (RBAC):** Granular permissions at the project level (Owner, Editor, Viewer).
- **Team Management:** Creation of teams and management of members.
- **Ghost Users:** Ability to create placeholder users for resource planning and assignment before they have a real account.
- **Notifications:** System for tracking task assignments and updates.

### Technical & Architecture
- **Local-First Database:** Uses SQLite for zero-configuration local storage, with support for migration to PostgreSQL/MySQL.
- **Cloud-Ready Synchronization:**
  - **Soft Delete:** Entities are marked as deleted rather than removed, ensuring deletion propagation during sync.
  - **Optimistic Locking:** Version control on entities to prevent write conflicts in concurrent environments.
  - **Last-Write-Wins (LWW):** Architectural preparation for conflict resolution during data synchronization.
- **Asset Management:** Abstracted file storage service (currently local filesystem, extensible to S3).

## Technology Stack

### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 3
- **Persistence:** Hibernate / Spring Data JPA
- **Database:** SQLite (via JDBC)
- **Migrations:** Flyway
- **Build Tool:** Gradle

### Frontend (Desktop)
- **Runtime:** Electron
- **Framework:** React
- **Styling:** Bootstrap / Custom CSS

## Getting Started

### Prerequisites
- Java Development Kit (JDK) 21 or higher
- Node.js and npm (for the frontend)

### Running the Backend
The backend is a standard Gradle project. You can run it directly from the root directory:

```bash
./gradlew bootRun
```

By default, the application runs with the `desktop` profile, using a local SQLite database located in the user's home directory (or configured path).

### Building the JAR
To create a standalone executable JAR file:

```bash
./gradlew bootJar
```

The output file will be located in `build/libs/`.

## Configuration

The application is configured via `application.yml`. Key configuration properties include:

- `jinnlog.data.path`: The root directory for database and asset storage.
- `jinnlog.assets.allowed-extensions`: Whitelist of file types allowed for upload.
- `spring.profiles.active`: Controls the execution mode (e.g., `desktop`, `web`, `production`).

## Database Schema

The database schema is managed via Flyway migrations located in `src/main/resources/db/migration`. This ensures that the local database schema is always consistent with the code version.

Key tables include:
- `users`: Stores profiles and ghost users.
- `projects` & `tasks`: Core domain entities.
- `focus_sessions`: Time tracking logs.
- `user_settings`: User preferences (theme, language, daily capacity).

## License

Copyright © Lorenzo De Marco 2026

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

See the [LICENSE](LICENSE) file for details.
