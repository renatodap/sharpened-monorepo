# CourtSync API Documentation

## API Overview

CourtSync provides a RESTful API built with Next.js API routes and Supabase backend. All endpoints follow REST conventions and return JSON responses. Authentication is handled via Supabase Auth with JWT tokens.

**Base URL**: `https://courtsync.vercel.app/api`
**Authentication**: Bearer JWT token in Authorization header
**Content-Type**: `application/json`

## Authentication

### Sign Up
```
POST /api/auth/signup
```

**Request Body**:
```json
{
  "email": "player@rosehulman.edu",
  "password": "securePassword123",
  "full_name": "John Smith",
  "role": "player"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "player@rosehulman.edu",
    "role": "player"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Sign In
```
POST /api/auth/signin
```

**Request Body**:
```json
{
  "email": "player@rosehulman.edu",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "player@rosehulman.edu",
    "role": "player",
    "team_id": "team_uuid"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Get Current User
```
GET /api/auth/user
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "player@rosehulman.edu",
  "full_name": "John Smith",
  "role": "player",
  "team_id": "team_uuid",
  "avatar_url": "https://...",
  "class_schedule": [...]
}
```

## Teams

### Get Team Details
```
GET /api/teams/{team_id}
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "id": "team_uuid",
  "name": "Rose-Hulman Engineers",
  "gender": "men",
  "season_year": 2024,
  "institution": "Rose-Hulman Institute of Technology",
  "conference": "HCAC",
  "head_coach_id": "coach_uuid",
  "members": [
    {
      "id": "player_uuid",
      "full_name": "John Smith",
      "role": "player",
      "class_year": 2025
    }
  ]
}
```

### Update Team
```
PUT /api/teams/{team_id}
Authorization: Bearer jwt_token
Role: coach, assistant_coach
```

**Request Body**:
```json
{
  "name": "Rose-Hulman Engineers",
  "captains": ["player_uuid_1", "player_uuid_2"]
}
```

## Events & Calendar

### Get Events
```
GET /api/events?team_id=uuid&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer jwt_token
```

**Query Parameters**:
- `team_id` (required): Team UUID
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `event_type` (optional): practice, match, meeting, travel
- `limit` (optional): Number of events to return (default: 50)

**Response** (200):
```json
{
  "events": [
    {
      "id": "event_uuid",
      "title": "Practice - Doubles Focus",
      "description": "Working on doubles strategy and positioning",
      "start_time": "2024-03-15T15:00:00Z",
      "end_time": "2024-03-15T17:00:00Z",
      "event_type": "practice",
      "facility": {
        "id": "facility_uuid",
        "name": "Outdoor Courts 1-3",
        "type": "outdoor_court"
      },
      "required_attendance": true,
      "max_participants": 12,
      "attendance_count": 8,
      "created_by": {
        "id": "coach_uuid",
        "full_name": "Coach Wilson"
      }
    }
  ],
  "total": 45,
  "has_more": true
}
```

### Create Event
```
POST /api/events
Authorization: Bearer jwt_token
Role: coach, assistant_coach, captain
```

**Request Body**:
```json
{
  "title": "Practice - Serve and Volley",
  "description": "Focus on serve and volley technique",
  "start_time": "2024-03-20T15:00:00Z",
  "end_time": "2024-03-20T17:00:00Z",
  "event_type": "practice",
  "facility_id": "facility_uuid",
  "required_attendance": true,
  "max_participants": 12,
  "recurrence_rule": "FREQ=WEEKLY;BYDAY=MO,WE,FR"
}
```

**Response** (201):
```json
{
  "id": "new_event_uuid",
  "title": "Practice - Serve and Volley",
  "start_time": "2024-03-20T15:00:00Z",
  "end_time": "2024-03-20T17:00:00Z",
  "event_type": "practice",
  "ical_url": "https://courtsync.vercel.app/api/calendar/events/new_event_uuid.ics"
}
```

### Update Event
```
PUT /api/events/{event_id}
Authorization: Bearer jwt_token
Role: coach, assistant_coach, creator
```

### Delete Event
```
DELETE /api/events/{event_id}
Authorization: Bearer jwt_token
Role: coach, assistant_coach, creator
```

### Get Event Availability
```
GET /api/events/{event_id}/availability
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "event_id": "event_uuid",
  "responses": [
    {
      "user_id": "player_uuid",
      "user_name": "John Smith",
      "status": "confirmed",
      "response_notes": "Will be there early",
      "updated_at": "2024-03-10T10:00:00Z"
    }
  ],
  "summary": {
    "confirmed": 8,
    "unavailable": 2,
    "pending": 3
  }
}
```

### Update Availability
```
POST /api/events/{event_id}/availability
Authorization: Bearer jwt_token
```

**Request Body**:
```json
{
  "status": "confirmed",
  "response_notes": "Looking forward to it!"
}
```

## Facilities

### Get Facilities
```
GET /api/facilities?team_id=uuid
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "facilities": [
    {
      "id": "facility_uuid",
      "name": "Outdoor Court 1",
      "type": "outdoor_court",
      "capacity": 1,
      "surface_type": "hard",
      "weather_dependent": true,
      "current_condition": "excellent",
      "is_available": true
    }
  ]
}
```

### Check Facility Availability
```
GET /api/facilities/availability?date=2024-03-15&start_time=15:00&end_time=17:00
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "date": "2024-03-15",
  "time_slot": {
    "start": "15:00",
    "end": "17:00"
  },
  "available_facilities": [
    {
      "id": "facility_uuid",
      "name": "Outdoor Court 1",
      "type": "outdoor_court",
      "recommended": true,
      "weather_suitable": true
    }
  ],
  "conflicts": [
    {
      "facility_id": "other_facility_uuid",
      "conflicting_event": "Team Practice",
      "event_time": "15:00-17:00"
    }
  ]
}
```

## Communication

### Get Channels
```
GET /api/channels?team_id=uuid
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "channels": [
    {
      "id": "channel_uuid",
      "name": "Team Chat",
      "type": "team",
      "description": "General team communication",
      "member_count": 15,
      "unread_count": 3,
      "last_message": {
        "content": "Great practice today!",
        "sender_name": "John Smith",
        "created_at": "2024-03-15T18:30:00Z"
      }
    }
  ]
}
```

### Create Channel
```
POST /api/channels
Authorization: Bearer jwt_token
Role: coach, assistant_coach, captain
```

**Request Body**:
```json
{
  "name": "Doubles Strategy",
  "type": "team",
  "description": "Discussion about doubles tactics",
  "is_private": false,
  "member_roles": ["coach", "captain", "player"]
}
```

### Get Messages
```
GET /api/channels/{channel_id}/messages?limit=50&before=message_id
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "messages": [
    {
      "id": "message_uuid",
      "content": "Don't forget practice is moved to indoor courts tomorrow due to rain",
      "message_type": "announcement",
      "sender": {
        "id": "coach_uuid",
        "full_name": "Coach Wilson",
        "avatar_url": "https://..."
      },
      "attachments": [],
      "reactions": {
        "👍": ["player_uuid_1", "player_uuid_2"],
        "👌": ["player_uuid_3"]
      },
      "created_at": "2024-03-15T14:00:00Z"
    }
  ],
  "has_more": true
}
```

### Send Message
```
POST /api/channels/{channel_id}/messages
Authorization: Bearer jwt_token
```

**Request Body**:
```json
{
  "content": "Great practice today everyone!",
  "message_type": "text",
  "attachments": [
    {
      "type": "image",
      "url": "https://storage.url/image.jpg",
      "filename": "team_photo.jpg"
    }
  ],
  "mentions": ["player_uuid_1"]
}
```

### React to Message
```
POST /api/messages/{message_id}/reactions
Authorization: Bearer jwt_token
```

**Request Body**:
```json
{
  "emoji": "👍",
  "action": "add"
}
```

## Travel Management

### Get Travel Events
```
GET /api/travel?team_id=uuid&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "travel_events": [
    {
      "id": "travel_uuid",
      "event": {
        "id": "event_uuid",
        "title": "Match vs DePauw",
        "start_time": "2024-03-20T14:00:00Z"
      },
      "departure_time": "2024-03-20T10:00:00Z",
      "return_time": "2024-03-20T19:00:00Z",
      "departure_location": "Athletic Center",
      "destination_location": "DePauw University Tennis Courts",
      "transportation_type": "bus",
      "participants_confirmed": 12,
      "participants_total": 15
    }
  ]
}
```

### Create Travel Event
```
POST /api/travel
Authorization: Bearer jwt_token
Role: coach, assistant_coach
```

**Request Body**:
```json
{
  "event_id": "event_uuid",
  "departure_time": "2024-03-20T10:00:00Z",
  "return_time": "2024-03-20T19:00:00Z",
  "departure_location": "Athletic Center Parking Lot",
  "transportation_type": "bus",
  "transportation_details": {
    "vehicle_number": "Bus #3",
    "capacity": 25,
    "driver": "Coach Wilson"
  },
  "required_documents": ["ID", "Medical Form"],
  "packing_list": ["Tennis gear", "Uniform", "Water bottle"]
}
```

### Get Travel Itinerary
```
GET /api/travel/{travel_id}/itinerary
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "travel_event_id": "travel_uuid",
  "itinerary": [
    {
      "sequence_order": 1,
      "activity_time": "2024-03-20T10:00:00Z",
      "activity_type": "departure",
      "title": "Bus Departure",
      "description": "Depart from Athletic Center",
      "location": "Athletic Center Parking Lot"
    },
    {
      "sequence_order": 2,
      "activity_time": "2024-03-20T12:00:00Z",
      "activity_type": "arrival",
      "title": "Arrive at DePauw",
      "location": "DePauw University Tennis Complex"
    }
  ]
}
```

## Video Management

### Get Videos
```
GET /api/videos?team_id=uuid&event_id=uuid&video_type=practice
Authorization: Bearer jwt_token
```

**Query Parameters**:
- `team_id` (optional): Filter by team
- `event_id` (optional): Filter by event
- `video_type` (optional): practice, match, drill, analysis
- `player_id` (optional): Filter by featured player
- `limit` (optional): Number of videos (default: 20)

**Response** (200):
```json
{
  "videos": [
    {
      "id": "video_uuid",
      "title": "Singles Practice - Backhand Focus",
      "description": "Working on backhand technique and consistency",
      "thumbnail_url": "https://storage.url/thumbnail.jpg",
      "duration_seconds": 1800,
      "video_type": "practice",
      "visibility": "team",
      "featured_players": [
        {
          "id": "player_uuid",
          "name": "John Smith"
        }
      ],
      "uploader": {
        "id": "coach_uuid",
        "name": "Coach Wilson"
      },
      "upload_status": "ready",
      "view_count": 15,
      "annotation_count": 8,
      "created_at": "2024-03-15T17:30:00Z"
    }
  ]
}
```

### Upload Video
```
POST /api/videos/upload
Authorization: Bearer jwt_token
Content-Type: multipart/form-data
```

**Request Body** (multipart):
```
video: [video file]
title: "Singles Practice Session"
description: "Focus on serve technique"
event_id: "event_uuid"
video_type: "practice"
featured_players: ["player_uuid_1", "player_uuid_2"]
visibility: "team"
```

**Response** (201):
```json
{
  "id": "video_uuid",
  "upload_status": "processing",
  "file_url": "https://storage.url/video.mp4",
  "estimated_processing_time": 300
}
```

### Get Video Details
```
GET /api/videos/{video_id}
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "id": "video_uuid",
  "title": "Singles Practice - Backhand Focus",
  "file_url": "https://storage.url/video.mp4",
  "duration_seconds": 1800,
  "annotations": [
    {
      "id": "annotation_uuid",
      "timestamp_seconds": 120,
      "annotation_type": "technique",
      "title": "Backhand Form",
      "content": "Good follow-through on this shot. Keep this form consistent.",
      "author": {
        "id": "coach_uuid",
        "name": "Coach Wilson"
      }
    }
  ]
}
```

### Add Video Annotation
```
POST /api/videos/{video_id}/annotations
Authorization: Bearer jwt_token
```

**Request Body**:
```json
{
  "timestamp_seconds": 120,
  "annotation_type": "technique",
  "title": "Serve Technique",
  "content": "Great toss height and contact point on this serve",
  "tagged_players": ["player_uuid"]
}
```

## Opponent Scouting

### Get Opponents
```
GET /api/opponents?search=depauw&conference=NCAC
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "opponents": [
    {
      "id": "opponent_uuid",
      "name": "DePauw Tigers",
      "institution": "DePauw University",
      "conference": "NCAC",
      "division": "III",
      "location": "Greencastle, IN",
      "head_coach": "John Doe",
      "recent_results": {
        "wins": 8,
        "losses": 3
      },
      "last_played": "2023-04-15"
    }
  ]
}
```

### Create Opponent
```
POST /api/opponents
Authorization: Bearer jwt_token
Role: coach, assistant_coach
```

**Request Body**:
```json
{
  "name": "Wabash Little Giants",
  "institution": "Wabash College",
  "conference": "NCAC",
  "division": "III",
  "location_city": "Crawfordsville",
  "location_state": "IN",
  "head_coach": "Jane Smith",
  "website": "https://athletics.wabash.edu"
}
```

### Get Scouting Reports
```
GET /api/scouting-reports?opponent_id=uuid&team_id=uuid
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "reports": [
    {
      "id": "report_uuid",
      "opponent": {
        "id": "opponent_uuid",
        "name": "DePauw Tigers"
      },
      "match_date": "2024-03-15",
      "report_type": "pre_match",
      "overall_assessment": "Strong singles lineup, weaker in doubles",
      "team_strengths": ["Powerful serves", "Good court coverage"],
      "team_weaknesses": ["Inconsistent doubles communication"],
      "recommended_strategy": "Target their #3 and #4 singles players",
      "confidence_level": 4,
      "author": {
        "id": "coach_uuid",
        "name": "Coach Wilson"
      },
      "created_at": "2024-03-10T14:00:00Z"
    }
  ]
}
```

### Create Scouting Report
```
POST /api/scouting-reports
Authorization: Bearer jwt_token
Role: coach, assistant_coach, captain
```

**Request Body**:
```json
{
  "opponent_id": "opponent_uuid",
  "match_date": "2024-03-20",
  "report_type": "pre_match",
  "overall_assessment": "Well-balanced team with strong doubles",
  "team_strengths": ["Excellent doubles play", "Deep roster"],
  "team_weaknesses": ["Weaker backhand side in singles"],
  "recommended_strategy": "Focus on aggressive net play",
  "individual_matchups": [
    {
      "position": 1,
      "opponent_player": "Mike Johnson",
      "our_player": "John Smith",
      "strategy": "Attack his backhand, come to net often"
    }
  ],
  "confidence_level": 4,
  "is_confidential": false
}
```

## Analytics & Statistics

### Get Team Statistics
```
GET /api/analytics/team/{team_id}/stats?season_year=2024
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "season_record": {
    "wins": 12,
    "losses": 5,
    "win_percentage": 0.706
  },
  "singles_record": {
    "wins": 68,
    "losses": 34,
    "win_percentage": 0.667
  },
  "doubles_record": {
    "wins": 31,
    "losses": 20,
    "win_percentage": 0.608
  },
  "top_performers": [
    {
      "player_id": "player_uuid",
      "name": "John Smith",
      "position": 1,
      "record": "11-3",
      "win_percentage": 0.786
    }
  ]
}
```

### Get Player Statistics
```
GET /api/analytics/players/{player_id}/stats?season_year=2024
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "player": {
    "id": "player_uuid",
    "name": "John Smith"
  },
  "season_stats": {
    "singles_record": "11-3",
    "doubles_record": "8-2",
    "total_matches": 14,
    "average_position": 1.2,
    "sets_won": 22,
    "sets_lost": 8,
    "games_won": 142,
    "games_lost": 98
  },
  "recent_form": [
    {
      "date": "2024-03-15",
      "opponent": "DePauw",
      "result": "win",
      "score": "6-3, 6-2"
    }
  ]
}
```

## Notifications

### Get Notifications
```
GET /api/notifications?unread_only=true&limit=20
Authorization: Bearer jwt_token
```

**Response** (200):
```json
{
  "notifications": [
    {
      "id": "notification_uuid",
      "type": "schedule_change",
      "title": "Practice Moved Indoors",
      "message": "Tomorrow's practice has been moved to indoor courts due to rain",
      "data": {
        "event_id": "event_uuid",
        "new_location": "Indoor Courts 1-3"
      },
      "read_at": null,
      "created_at": "2024-03-15T16:00:00Z"
    }
  ],
  "unread_count": 3
}
```

### Mark Notification as Read
```
PUT /api/notifications/{notification_id}/read
Authorization: Bearer jwt_token
```

### Update Notification Preferences
```
PUT /api/notifications/preferences
Authorization: Bearer jwt_token
```

**Request Body**:
```json
{
  "email_notifications": true,
  "push_notifications": true,
  "notification_types": {
    "schedule_changes": true,
    "new_messages": true,
    "travel_updates": true,
    "video_uploads": false,
    "match_results": true
  },
  "quiet_hours": {
    "start": "22:00",
    "end": "07:00"
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "issue": "Email address is required"
    }
  },
  "request_id": "req_uuid"
}
```

### Common Error Codes
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Invalid or missing authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists or conflict
- `422` - Unprocessable Entity: Validation errors
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

### Rate Limiting
- **General API**: 100 requests per minute per user
- **File Upload**: 10 uploads per minute per user
- **Messages**: 60 messages per minute per user
- **Auth Endpoints**: 5 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks (Future)

CourtSync will support webhooks for real-time integrations:

### Available Events
- `event.created` - New event scheduled
- `event.updated` - Event details changed
- `message.sent` - New message in channel
- `video.uploaded` - New video available
- `travel.updated` - Travel plans changed

### Webhook Configuration
```
POST /api/webhooks
Authorization: Bearer jwt_token
Role: coach, admin
```

**Request Body**:
```json
{
  "url": "https://your-app.com/webhooks/courtsync",
  "events": ["event.created", "event.updated"],
  "secret": "your_webhook_secret"
}
```

This comprehensive API documentation provides all necessary endpoints for building and integrating with the CourtSync tennis team management platform.