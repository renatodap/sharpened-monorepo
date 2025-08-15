# CourtSync Documentation

## Project Overview

**CourtSync** is a mobile-first NCAA Division III tennis team management application designed specifically for Rose Hulman Institute of Technology. Built using the Sharpened brand system, it provides comprehensive team coordination tools for coaches and players.

## 📁 Documentation Structure

### 📋 Product Requirements
- **[PRODUCT_REQUIREMENTS.md](./prd/PRODUCT_REQUIREMENTS.md)** - Complete PRD with features, user stories, and success metrics

### 🏗️ Technical Architecture
- **[TECHNICAL_ARCHITECTURE.md](./architecture/TECHNICAL_ARCHITECTURE.md)** - System design, database schema, and infrastructure

### 🚀 Development
- **[SPRINT_PLAN.md](./development/SPRINT_PLAN.md)** - 2-week development timeline with daily breakdown

### 🎨 Design System
- **[COMPONENT_LIBRARY.md](./design/COMPONENT_LIBRARY.md)** - UI components, design tokens, and mobile patterns

### 🔌 API Reference
- **[API_DOCUMENTATION.md](./api/API_DOCUMENTATION.md)** - Complete REST API documentation
- **[DATABASE_SCHEMA.sql](./api/DATABASE_SCHEMA.sql)** - PostgreSQL schema with sample data

## 🎯 Quick Start

### For Developers
1. **Read the CLAUDE.md** - Contains all development instructions and constraints
2. **Review the Sprint Plan** - Understand the 2-week development timeline
3. **Study the Component Library** - Learn the design system and UI patterns
4. **Check the API Docs** - Understand data structures and endpoints

### For Stakeholders
1. **Start with Product Requirements** - Complete feature overview and business case
2. **Review Technical Architecture** - Understand technology choices and scalability
3. **Check Sprint Plan** - See development timeline and deliverables

## 📱 Core Features

### 1. **Centralized Scheduling & Calendar Integration**
- Mobile-responsive calendar (daily/weekly/monthly views)
- External calendar sync (Google Calendar, iCal)
- Class schedule conflict detection
- Court availability tracking

### 2. **Facility & Court Management**
- Real-time court booking (6 outdoor + 6 indoor courts)
- Conflict prevention and validation
- Weather-based recommendations
- Visual facility allocation

### 3. **Team Communication Hub**
- In-app messaging (group + direct)
- Push notifications
- File and image sharing
- Channel organization

### 4. **Travel Logistics & Event Management**
- Travel itinerary creation
- GPS integration for directions
- Document sharing (forms, rosters)
- Transportation coordination

### 5. **Video Recording & Analysis**
- iPad video upload integration
- Video library with event tagging
- Time-stamped annotations
- Player-specific access controls

### 6. **Opponent Scouting System**
- Opponent database and profiles
- Scouting reports with strategy notes
- Match preparation summaries
- Historical performance tracking

### 7. **User Roles & Engagement**
- Role-based access (Coach/Captain/Player)
- Daily check-in workflows
- Mobile-optimized interfaces
- Admin dashboard for coaches

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS 4** with Sharpened brand system
- **PWA** capabilities for mobile installation

### Backend
- **Supabase** for database, auth, and real-time features
- **PostgreSQL** with Row-Level Security
- **Next.js API Routes** for server logic
- **Vercel** for hosting and deployment

### Mobile Features
- **Progressive Web App** (PWA) with offline support
- **Push notifications** via service workers
- **Touch-optimized** interfaces and gestures
- **Home screen installation** on mobile devices

## 📊 Success Metrics

### User Adoption
- **90% team adoption** within 2 weeks
- **Daily active users**: 80% of roster
- **Feature engagement**: All 7 core features used weekly

### Performance
- **Mobile load time**: <3 seconds on 3G
- **Offline functionality**: Core features work without internet
- **Push notifications**: >95% delivery rate

### Business Impact
- **Coach time savings**: 50% reduction in admin tasks
- **Communication efficiency**: 75% reduction in missed info
- **Schedule conflicts**: 90% reduction in double-bookings

## 💰 Budget & Pricing

### Operating Costs
- **Target**: $10/month per team
- **Supabase Pro**: $25/month (platform-wide)
- **Vercel Pro**: $20/month (hosting)
- **Total platform cost**: $50/month
- **Break-even**: 5 teams minimum

### Development Investment
- **Total development**: $5,000 (80 hours)
- **2-week sprint**: Rapid MVP delivery
- **Scalable architecture**: Ready for multi-institution growth

## 🎨 Brand Guidelines

### Sharpened Brand System
- **Primary**: Navy `#0B2A4A`
- **Background**: Black `#0A0A0A`
- **Text**: White `#FFFFFF`
- **Secondary**: Gray `#C7CBD1`
- **Muted**: Gray `#8B9096`

### Design Principles
- **Mobile-first**: Touch-optimized interfaces
- **Dark theme**: Reduce eye strain during evening use
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals >90

## 🔒 Security & Privacy

### Data Protection
- **FERPA Compliance**: Student data protection
- **Row-Level Security**: Database-enforced isolation
- **JWT Authentication**: Secure session management
- **TLS 1.3**: Encrypted data transmission

### Privacy Features
- **Minimal data collection**: Only essential information
- **User consent**: Clear privacy controls
- **Data retention**: Configurable retention policies
- **Audit logging**: Track sensitive operations

## 📞 Support & Development

### Development Team
- **Primary Developer**: Full-stack development with Claude Code assistance
- **Timeline**: 2-week MVP sprint
- **Methodology**: Agile with daily progress tracking

### Claude Code Integration
- **Autonomous Development**: Claude Code agents for specialized tasks
- **Code Quality**: TypeScript, testing, and performance standards
- **Documentation**: Self-updating docs and API references

### Future Roadmap
- **Advanced Analytics**: Performance tracking and insights
- **AI Features**: Automated video analysis and scheduling optimization
- **Multi-Institution**: Scale to other NCAA D3 programs
- **Tournament Management**: Bracket and event coordination

## 📄 License & Usage

CourtSync is designed specifically for NCAA Division III tennis programs. The codebase uses modern web technologies and follows industry best practices for scalability and maintainability.

For technical questions or development support, refer to the detailed documentation in each section or the comprehensive CLAUDE.md instructions file.

---

**Built with ❤️ for Rose Hulman Tennis**  
*Powered by the Sharpened brand system and modern web technologies*