# API Documentation - Sharpened Platform

## Overview
This document provides comprehensive API documentation for all Sharpened applications. All APIs follow RESTful principles and return JSON responses.

## Base URLs

| Environment | Feel Sharper | Study Sharper | Website |
|------------|--------------|---------------|---------|
| Development | http://localhost:3000/api | http://localhost:3001/api | http://localhost:3002/api |
| Production | https://api.feelsharper.com | https://api.studysharper.com | https://api.sharpened.dev |

## Authentication

### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "timestamp": "2025-01-13T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2025-01-13T12:00:00Z"
}
```

## Feel Sharper API

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "weight": 70,
    "height": 175,
    "goal": "muscle-gain"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "profile": {...}
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Workouts

#### GET /api/workouts
Get user's workouts with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "workout_123",
        "name": "Push Day",
        "date": "2025-01-13",
        "duration": 60,
        "exercises": [
          {
            "name": "Bench Press",
            "sets": 4,
            "reps": [12, 10, 8, 6],
            "weight": [60, 70, 80, 85]
          }
        ],
        "totalVolume": 8640,
        "caloriesBurned": 450
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### POST /api/workouts
Create a new workout.

**Request Body:**
```json
{
  "name": "Push Day",
  "date": "2025-01-13",
  "exercises": [
    {
      "exerciseId": "ex_123",
      "sets": [
        {
          "reps": 12,
          "weight": 60,
          "rpe": 7
        }
      ]
    }
  ],
  "notes": "Felt strong today"
}
```

#### POST /api/workouts/parse
Parse natural language workout description.

**Request Body:**
```json
{
  "text": "Bench press 4x12 @ 60kg, Squats 3x8 @ 100kg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": 12,
        "weight": 60,
        "unit": "kg"
      },
      {
        "name": "Squats",
        "sets": 3,
        "reps": 8,
        "weight": 100,
        "unit": "kg"
      }
    ]
  }
}
```

### Nutrition

#### GET /api/nutrition/diary
Get nutrition diary entries.

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format
- `startDate` (string): Start date for range
- `endDate` (string): End date for range

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_123",
        "date": "2025-01-13",
        "meals": [
          {
            "type": "breakfast",
            "foods": [
              {
                "foodId": "food_123",
                "name": "Oatmeal",
                "quantity": 100,
                "unit": "g",
                "nutrition": {
                  "calories": 389,
                  "protein": 16.9,
                  "carbs": 66.3,
                  "fat": 6.9
                }
              }
            ]
          }
        ],
        "totals": {
          "calories": 2150,
          "protein": 150,
          "carbs": 250,
          "fat": 75
        }
      }
    ]
  }
}
```

#### POST /api/nutrition/diary
Add food entry to diary.

**Request Body:**
```json
{
  "date": "2025-01-13",
  "mealType": "breakfast",
  "foods": [
    {
      "foodId": "food_123",
      "quantity": 100,
      "unit": "g"
    }
  ]
}
```

#### GET /api/foods/search
Search food database.

**Query Parameters:**
- `q` (string): Search query
- `limit` (number): Results limit (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "id": "food_123",
        "name": "Chicken Breast",
        "brand": "Generic",
        "nutrition": {
          "calories": 165,
          "protein": 31,
          "carbs": 0,
          "fat": 3.6
        },
        "servingSize": 100,
        "servingUnit": "g"
      }
    ]
  }
}
```

### Body Metrics

#### GET /api/body-measurements
Get body measurements history.

**Query Parameters:**
- `startDate` (string): Start date
- `endDate` (string): End date
- `metric` (string): Specific metric (weight, bodyFat, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "measurements": [
      {
        "id": "measurement_123",
        "date": "2025-01-13",
        "weight": 70.5,
        "bodyFat": 15.2,
        "muscleMass": 58.5,
        "measurements": {
          "chest": 100,
          "waist": 80,
          "arms": 35
        }
      }
    ]
  }
}
```

#### POST /api/body-measurements
Record new body measurements.

**Request Body:**
```json
{
  "date": "2025-01-13",
  "weight": 70.5,
  "bodyFat": 15.2,
  "measurements": {
    "chest": 100,
    "waist": 80,
    "arms": 35
  },
  "photos": ["photo_url_1", "photo_url_2"]
}
```

### AI Features

#### POST /api/ask
Ask the AI assistant a question.

**Request Body:**
```json
{
  "question": "How can I improve my bench press?",
  "context": {
    "currentMax": 100,
    "goal": 120
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "To improve your bench press from 100kg to 120kg...",
    "suggestions": [
      "Progressive overload program",
      "Focus on tricep accessories",
      "Improve form and technique"
    ],
    "resources": [
      {
        "title": "Bench Press Guide",
        "url": "/blog/bench-press-guide"
      }
    ]
  }
}
```

## Study Sharper API

### Content Management

#### POST /api/content/upload
Upload study materials for processing.

**Request Body (multipart/form-data):**
- `file`: PDF, DOCX, or TXT file
- `courseId`: Associated course ID
- `title`: Content title

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content_123",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

#### GET /api/content/status/:id
Check content processing status.

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "content_123",
    "status": "completed",
    "chunks": 45,
    "embeddings": 45,
    "summary": "This document covers..."
  }
}
```

### Study Planning

#### POST /api/study-plan
Generate personalized study plan.

**Request Body:**
```json
{
  "courses": ["course_123", "course_456"],
  "examDates": {
    "course_123": "2025-02-15",
    "course_456": "2025-02-20"
  },
  "hoursPerDay": 3,
  "preferences": {
    "morningPerson": true,
    "breakDuration": 15
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan_123",
      "schedule": [
        {
          "date": "2025-01-14",
          "sessions": [
            {
              "time": "09:00-10:30",
              "course": "course_123",
              "topics": ["Chapter 1", "Chapter 2"],
              "activities": ["Read", "Practice problems"]
            }
          ]
        }
      ]
    }
  }
}
```

### Flashcards

#### GET /api/flashcards
Get flashcard decks for user.

**Response:**
```json
{
  "success": true,
  "data": {
    "decks": [
      {
        "id": "deck_123",
        "name": "Biology Chapter 1",
        "cards": 45,
        "mastered": 20,
        "learning": 15,
        "new": 10
      }
    ]
  }
}
```

#### POST /api/flashcards/review
Submit flashcard review results.

**Request Body:**
```json
{
  "cardId": "card_123",
  "difficulty": 3,
  "timeSpent": 15
}
```

## Rate Limiting

All API endpoints are rate limited:
- **Anonymous**: 60 requests per hour
- **Authenticated**: 1000 requests per hour
- **Premium**: 5000 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1673612400
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `AUTH_INVALID` | Invalid credentials | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT` | Rate limit exceeded | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

## Webhooks

### Webhook Events
- `user.created`
- `user.updated`
- `workout.completed`
- `goal.achieved`
- `subscription.created`
- `subscription.cancelled`

### Webhook Payload
```json
{
  "event": "workout.completed",
  "data": {
    "workoutId": "workout_123",
    "userId": "user_123",
    "completedAt": "2025-01-13T12:00:00Z"
  },
  "timestamp": "2025-01-13T12:00:00Z",
  "signature": "sha256=..."
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { SharpenedAPI } from '@sharpened/sdk';

const api = new SharpenedAPI({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Get workouts
const workouts = await api.workouts.list({
  page: 1,
  limit: 10
});

// Create workout
const workout = await api.workouts.create({
  name: 'Push Day',
  exercises: [...]
});
```

### Python
```python
from sharpened import SharpenedAPI

api = SharpenedAPI(
    api_key='your_api_key',
    environment='production'
)

# Get workouts
workouts = api.workouts.list(page=1, limit=10)

# Create workout
workout = api.workouts.create(
    name='Push Day',
    exercises=[...]
)
```

## Testing

### Test Endpoints
All endpoints have test versions available at:
- Development: http://localhost:3000/api/test/*
- Staging: https://staging-api.feelsharper.com/test/*

### Test Credentials
```json
{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "apiKey": "test_key_123"
}
```

---

*Last Updated: 2025-01-13*
*API Version: 1.0.0*
*Support: api-support@sharpened.dev*