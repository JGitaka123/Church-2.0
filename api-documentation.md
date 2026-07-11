# API Documentation
## Church 2.0 Integration & REST API v1.0

This document defines the REST API endpoints and data payloads required for integrating external accounting software (e.g., QuickBooks), payment gateways (e.g., Stripe, M-Pesa), bulk SMS providers, and external mobile applications.

---

### 1. Authentication

All requests must contain a valid Bearer token in the `Authorization` header.

```http
Authorization: Bearer <access_token>
```

#### 1.1 Sign In
* **Endpoint**: `POST /api/v1/auth/login`
* **Request Payload**:
```json
{
  "email": "admin@church2.org",
  "password": "securepassword123"
}
```
* **Response Payload (MFA Required)**:
```json
{
  "status": "mfa_required",
  "mfa_token": "mfa_temp_token_abc123",
  "method": "authenticator_app"
}
```
* **Verify MFA**: `POST /api/v1/auth/mfa/verify`
  - Payload: `{"mfa_token": "mfa_temp_token_abc123", "code": "123456"}`
  - Response: `{"access_token": "jwt_token_here", "expires_in": 3600}`

---

### 2. Branch Management

#### 2.1 Get All Branches
* **Endpoint**: `GET /api/v1/branches`
* **Response Payload**:
```json
[
  {
    "id": "b1111111-1111-1111-1111-111111111111",
    "name": "Nairobi HQ",
    "location": "HQ Center, Nairobi",
    "member_count": 1240,
    "created_at": "2024-01-15T08:00:00Z"
  },
  {
    "id": "b2222222-2222-2222-2222-222222222222",
    "name": "Dallas Branch",
    "location": "Plano Rd, Dallas TX",
    "member_count": 450,
    "created_at": "2024-06-10T10:30:00Z"
  }
]
```

#### 2.2 Create New Branch (HQ Only)
* **Endpoint**: `POST /api/v1/branches`
* **Request Payload**:
```json
{
  "name": "London Branch",
  "location": "Hyde Park Corner, London"
}
```
* **Response**: `201 Created` with branch object.

---

### 3. Membership Directory

#### 3.1 List Members (Paginated & Filterable)
* **Endpoint**: `GET /api/v1/members?branch_id=b2222222-2222-2222-2222-222222222222&query=Smith&limit=20`
* **Response Payload**:
```json
{
  "data": [
    {
      "id": "m9999999-9999-9999-9999-999999999999",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john.smith@email.com",
      "phone": "+15550199",
      "family_id": "f5555555-5555-5555-5555-555555555555",
      "spiritual_milestones": ["Baptized: 2024-05-12"],
      "engagement_score": 85
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "page": 1
  }
}
```

#### 3.2 Create Member
* **Endpoint**: `POST /api/v1/members`
* **Request Payload**:
```json
{
  "branch_id": "b2222222-2222-2222-2222-222222222222",
  "first_name": "Sarah",
  "last_name": "Smith",
  "email": "sarah.smith@email.com",
  "phone": "+15550200",
  "family_id": "f5555555-5555-5555-5555-555555555555"
}
```

---

### 4. Financial Ledger

#### 4.1 Record Financial Transaction
* **Endpoint**: `POST /api/v1/financials/transactions`
* **Request Payload**:
```json
{
  "branch_id": "b2222222-2222-2222-2222-222222222222",
  "member_id": "m9999999-9999-9999-9999-999999999999",
  "amount": 250.00,
  "category": "Tithe",
  "payment_method": "Credit Card"
}
```
* **Response Payload**:
```json
{
  "transaction_id": "t8888888-8888-8888-8888-888888888888",
  "receipt_number": "REC-2026-10294",
  "receipt_url": "https://api.church2.org/receipts/REC-2026-10294.pdf",
  "status": "Success"
}
```

---

### 5. AI Services

#### 5.1 Categorize Prayer Request
* **Endpoint**: `POST /api/v1/ai/prayer/categorize`
* **Request Payload**:
```json
{
  "text": "My grandmother is currently in the hospital battling severe pneumonia. Please pray for her recovery and strength for our family."
}
```
* **Response Payload**:
```json
{
  "category": "Healing",
  "confidence": 0.98,
  "action_route": "Counseling & Care Department",
  "tags": ["hospital", "pneumonia", "recovery"]
}
```

#### 5.2 Repurpose Sermon
* **Endpoint**: `POST /api/v1/ai/sermon/repurpose`
* **Request Payload**:
```json
{
  "title": "The Power of Faithful Giving",
  "transcript": "When we look at giving, it is not merely about money. It is an act of trust. In Malachi, we see that trust is tested..."
}
```
* **Response Payload**:
```json
{
  "devotional": {
    "day1": "Reflecting on Trust: Giving is a spiritual index...",
    "day2": "Testing the Windows of Heaven...",
    "day3": "Communities Sustained by Generosity..."
  },
  "social_media_quotes": [
    "\"Giving is not merely about money. It is an act of trust.\"",
    "\"Trust is tested in our stewardship and proven in our community.\""
  ],
  "discussion_questions": [
    "What does trust mean to you when it comes to financial stewardship?",
    "How have you experienced community support in times of testing?"
  ]
}
```
