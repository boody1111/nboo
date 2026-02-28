# Overview

This is a Facebook Messenger chatbot built using the fca-unofficial (Facebook Chat API) library. The bot provides a wide range of commands for entertainment, games, utilities, currency management, and moderation features. It's designed to interact with Facebook Messenger groups and individual users, offering features like mini-games, image generation, user/thread management, and a virtual currency system.

The bot uses a modular command structure where each command is a separate file in the `modules/commands/` directory. The core system handles event listening, command routing, database operations, and user/thread data management.

# Recent Changes (November 20, 2025)

**Fixed Commands & Features:**
- ✅ **سيم (ذكاء.js)**: Updated to use new SimSimi API v2 (https://simsimi.fun/api/v2/) with fallback responses
- ✅ **هدية (gift.js)**: Fixed 24-hour cooldown system, added safe guards for ADMINBOT config
- ✅ **نقاط (points.js)**: Removed hardcoded permissions, added safe config handling
- ✅ **حماية (حماية.js)**: Fixed protection logic to properly restore group names when enabled
- ✅ **رسائل ترحيب**: Automatic welcome messages with custom image when bot joins groups
- ✅ **رسالة شكر**: "شكرا علي الادمن ✅" message when bot is promoted to admin
- ✅ **نظام الحظر**: Disabled automatic group banning system

**Security & Stability Improvements:**
- Added defensive guards to 12+ commands to handle missing ADMINBOT config: `(global.config && global.config.ADMINBOT) ? global.config.ADMINBOT : []`
- Fixed potential crashes when config.ADMINBOT is undefined
- Improved permission checking across all admin-only commands
- Enhanced error handling for API failures with fallback responses

**Commands Count:**
- 135 active commands loaded successfully
- 10 event handlers running

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Components

**Main Entry Point**
- `index.js` and `main.js` serve as the bot's startup files (obfuscated)
- Initializes the bot, loads configuration, and starts the Facebook Chat API listener
- Handles login using stored app state (cookies) from `appstate.json`

**Configuration Management**
- `config.json`: Central configuration file containing bot settings, admin IDs, prefixes, database configuration, and feature toggles
- `fca-config.json` and `includes/FastConfigFca.json`: Extended Facebook Chat API configurations
- Supports SQLite as the primary database storage

**Event Handling System**
- `includes/listen.js`: Core event listener that processes incoming Facebook messages and events
- Routes events to appropriate handlers based on event type
- Handles message events, reactions, replies, thread changes, and notifications

**Command System**
- Modular command structure with each command in `modules/commands/`
- Commands support:
  - Permission levels (0=user, 1=group admin, 2=bot admin)
  - Cooldowns
  - Custom usage instructions
  - Multiple language support
  - HandleReply and handleReaction for interactive commands

**Handler Architecture**
- `includes/handle/handleCommand.js`: Processes text commands, checks permissions, manages cooldowns
- `includes/handle/handleCommandEvent.js`: Handles event-based command triggers
- `includes/handle/handleReply.js`: Manages reply-based interactions
- `includes/handle/handleReaction.js`: Manages reaction-based interactions
- `includes/handle/handleEvent.js`: Routes events to event-type specific handlers
- `includes/handle/handleRefresh.js`: Updates cached data when thread/user changes occur
- `includes/handle/handleCreateDatabase.js`: Auto-creates database entries for new users/threads
- `includes/handle/handleNotification.js`: Monitors and sends Facebook notifications to admins

## Data Layer

**Database Architecture**
- Uses Sequelize ORM with SQLite backend
- `includes/database/index.js`: Sequelize initialization and connection configuration
- `includes/database/model.js`: Model loader that initializes Users, Threads, and Currencies models
- Located in `includes/database/models/` (files not shown but referenced)

**Data Models**
- **Users**: Stores user information, ban status, experience points, custom data
- **Threads**: Stores group/thread information, settings, admin lists, ban status
- **Currencies**: Manages virtual currency system for users

**Controllers**
- `includes/controllers/users.js`: User data operations (CRUD, name fetching, Facebook API integration)
- `includes/controllers/threads.js`: Thread data operations (CRUD, thread info retrieval)
- `includes/controllers/currencies.js`: Currency data operations (balance management)

**Caching Strategy**
- Global data structure stores frequently accessed data in memory:
  - `global.data.allUserID`: All user IDs
  - `global.data.allThreadID`: All thread IDs
  - `global.data.userName`: Username cache
  - `global.data.threadInfo`: Thread information cache
  - `global.data.userBanned`: Banned users
  - `global.data.threadBanned`: Banned threads
- Reduces database queries for common operations

## Feature Categories

**Entertainment & Games**
- Image manipulation commands (writing on fake social media posts)
- Random image generators (anime characters, movies, series)
- Interactive games (werewolf game, cowboy game, adventure game)
- Virtual currency system with banking features

**Utility Commands**
- Screenshot/website preview
- Movie/series information lookup
- Lyrics lookup
- Translation services (via Google Translate API)
- Text-to-speech
- Facebook video/audio download

**Moderation Tools**
- User/thread banning system
- Auto-create database for new users/threads
- Group management (kick, leave, admin detection)
- Message pinning system
- Rank/level notification toggle

**Currency System**
- Virtual currency with banking operations (deposit, withdraw)
- Experience points and leveling system
- Cooldown-based earning commands
- Interest rate system for savings

## Technical Implementation Details

**Authentication & Session Management**
- Uses Facebook cookies stored in `appstate.json` for authentication
- Supports 2FA bypass mechanisms
- Auto-login and session persistence
- MQTT support for real-time messaging

**Security Considerations**
- Admin-only commands protected by permission checks
- User and thread ban system
- Command-level permission requirements
- Cooldown system to prevent spam
- Developer mode toggle for restricted access

**File Obfuscation**
- Core files (`index.js`, `main.js`, `listen.js`, `utils/`) are obfuscated
- Protects proprietary logic while commands remain readable

**Error Handling**
- Try-catch blocks in command handlers
- Logging system via `utils/log.js`
- Graceful degradation when features fail

# External Dependencies

**Facebook Chat API**
- `@xaviabot/fca-unofficial`: Primary Facebook Chat API wrapper
- `@dongdev/fca-unofficial`: Alternative FCA implementation
- `fca-prjvt`: Additional FCA variant
- Handles login, message sending, event listening, and Facebook graph operations

**Database**
- `sequelize`: ORM for database operations
- SQLite storage (no external database server required)
- File-based storage at configured path

**Media Processing**
- `canvas`: Image manipulation and text rendering
- `jimp`: Additional image processing
- `fluent-ffmpeg`: Video/audio processing
- `@ffmpeg-installer/ffmpeg`: FFmpeg binary
- `gifencoder`: GIF creation

**Web Scraping & APIs**
- `axios`: HTTP client for API requests
- `cheerio`: HTML parsing
- `request`: HTTP requests (legacy)
- Third-party APIs:
  - Google Translate API (unofficial)
  - PopCat API (movies, lyrics)
  - Image hosting (imgur, i.postimg.cc)
  - Wolfram Alpha (math calculations)

**Utilities**
- `moment-timezone`: Date/time handling
- `fs-extra`: Enhanced file system operations
- `adm-zip`: ZIP file handling
- `chalk`/`cfonts`: Terminal styling
- `express`: Web server for status page (index.html)
- `helmet`/`cors`: Express security middleware

**Audio/Speech**
- `gtts`: Google Text-to-Speech
- `@distube/ytdl-core`: YouTube download (if needed)

**Other Services**
- `pastebin-api`: Code sharing
- `fast-speedtest-api`: Speed testing
- `string-similarity`: Command suggestion matching