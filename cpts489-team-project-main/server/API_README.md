# Kanban Online API Documentation

This is the REST API documentation for the Kanban Online webapp backend built with Express.js and Sequelize.

## Base URL

```
http://localhost:5000/api
```

## Data Models

### User
- `username` (string, primary key) - Unique username
- `password` (string) - User password (should be hashed in production)
- `is_admin` (boolean) - Whether the user has admin privileges

### Board
- `id` (integer, primary key) - Unique board identifier
- `title` (string) - Board title

### Category
- `id` (integer, primary key) - Unique category identifier
- `title` (string) - Category title
- `BoardId` (integer, foreign key) - Reference to parent board

### Note
- `id` (integer, primary key) - Unique note identifier
- `title` (string) - Note title
- `content` (text) - Note content
- `CategoryId` (integer, foreign key) - Reference to parent category

### BoardMemberships (Join Table)
- `owns_board` (boolean) - Whether the user owns the board

### Invite
- `id` (integer, primary key) - Unique invite identifier
- `UserUsername` (string, foreign key) - Reference to invited user
- `BoardId` (integer, foreign key) - Reference to board
- `sender` (string) - Username of the user who sent the invite

---

## User Endpoints

### GET /api/users
Get all users with their boards.

**Response:**
```json
[
  {
    "username": "john_doe",
    "is_admin": false,
    "Boards": [
      {
        "id": 1,
        "title": "My Board",
        "BoardMemberships": {
          "owns_board": true
        }
      }
    ]
  }
]
```

### GET /api/users/:username
Get a specific user by username.

**Parameters:**
- `username` (string) - The username to fetch

**Response:**
```json
{
  "username": "john_doe",
  "is_admin": false,
  "Boards": [...]
}
```

### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123",
  "is_admin": false
}
```

**Response:**
```json
{
  "username": "john_doe",
  "is_admin": false
}
```

### PUT /api/users/:username
Update an existing user.

**Parameters:**
- `username` (string) - The username to update

**Request Body:**
```json
{
  "password": "newpassword123",
  "is_admin": true
}
```

### DELETE /api/users/:username
Delete a user.

**Parameters:**
- `username` (string) - The username to delete

### GET /api/users/:username/boards
Get all boards for a specific user.

**Parameters:**
- `username` (string) - The username

---

## Board Endpoints

### GET /api/boards
Get all boards or boards for a specific user.

**Query Parameters:**
- `username` (optional) - Filter boards by user

**Response:**
```json
[
  {
    "id": 1,
    "title": "Project Board",
    "Users": [
      {
        "username": "john_doe",
        "BoardMemberships": {
          "owns_board": true
        }
      }
    ],
    "Categories": [...]
  }
]
```

### GET /api/boards/:id
Get a specific board with all categories and notes.

**Parameters:**
- `id` (integer) - Board ID

### POST /api/boards
Create a new board.

**Request Body:**
```json
{
  "title": "New Board",
  "owner_username": "john_doe"
}
```

### PUT /api/boards/:id
Update a board.

**Parameters:**
- `id` (integer) - Board ID

**Request Body:**
```json
{
  "title": "Updated Board Title"
}
```

### DELETE /api/boards/:id
Delete a board.

**Parameters:**
- `id` (integer) - Board ID

### GET /api/boards/:id/members
Get all members of a board.

**Parameters:**
- `id` (integer) - Board ID

### POST /api/boards/:id/members
Add a member to a board.

**Parameters:**
- `id` (integer) - Board ID

**Request Body:**
```json
{
  "username": "jane_doe",
  "owns_board": false
}
```

### PUT /api/boards/:id/members/:username
Update member permissions.

**Parameters:**
- `id` (integer) - Board ID
- `username` (string) - Username

**Request Body:**
```json
{
  "owns_board": true
}
```

### DELETE /api/boards/:id/members/:username
Remove a member from a board.

**Parameters:**
- `id` (integer) - Board ID
- `username` (string) - Username

---

## Category Endpoints

### GET /api/categories
Get all categories or categories for a specific board.

**Query Parameters:**
- `boardId` (optional) - Filter categories by board

**Response:**
```json
[
  {
    "id": 1,
    "title": "To Do",
    "BoardId": 1,
    "Board": {
      "id": 1,
      "title": "Project Board"
    },
    "Notes": [...]
  }
]
```

### GET /api/categories/:id
Get a specific category with its notes.

**Parameters:**
- `id` (integer) - Category ID

### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "title": "In Progress",
  "boardId": 1
}
```

### PUT /api/categories/:id
Update a category.

**Parameters:**
- `id` (integer) - Category ID

**Request Body:**
```json
{
  "title": "Updated Category title",
  "boardId": 2
}
```

### DELETE /api/categories/:id
Delete a category.

**Parameters:**
- `id` (integer) - Category ID

### GET /api/categories/:id/notes
Get all notes in a specific category.

**Parameters:**
- `id` (integer) - Category ID

---

## Note Endpoints

### GET /api/notes
Get all notes or notes for a specific category.

**Query Parameters:**
- `categoryId` (optional) - Filter notes by category

**Response:**
```json
[
  {
    "id": 1,
    "title": "Fix login bug",
    "content": "The login form is not validating properly...",
    "CategoryId": 1,
    "Category": {
      "id": 1,
      "title": "To Do",
      "Board": {
        "id": 1,
        "title": "Project Board"
      }
    }
  }
]
```

### GET /api/notes/:id
Get a specific note.

**Parameters:**
- `id` (integer) - Note ID

### POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "New Task",
  "content": "Description of the task...",
  "categoryId": 1
}
```

### PUT /api/notes/:id
Update a note completely.

**Parameters:**
- `id` (integer) - Note ID

**Request Body:**
```json
{
  "title": "Updated Task",
  "content": "Updated description...",
  "categoryId": 2
}
```

### PATCH /api/notes/:id
Partially update a note (for quick edits).

**Parameters:**
- `id` (integer) - Note ID

**Request Body:**
```json
{
  "title": "Quick title update"
}
```

### DELETE /api/notes/:id
Delete a note.

**Parameters:**
- `id` (integer) - Note ID

---

## Invite Endpoints

### GET /api/invites
Get all invites for a specific user.

**Query Parameters:**
- `username` (required) - Username to get invites for

**Response:**
```json
[
  {
    "id": 1,
    "UserUsername": "john_doe",
    "BoardId": 1,
    "sender": "jane_doe",
    "User": {
      "username": "john_doe"
    },
    "Board": {
      "id": 1,
      "title": "Project Board"
    }
  }
]
```

### POST /api/invites
Create a new invite.

**Request Body:**
```json
{
  "username": "john_doe",
  "boardId": 1,
  "sender": "jane_doe"
}
```

**Response:**
```json
{
  "id": 1,
  "UserUsername": "john_doe",
  "BoardId": 1,
  "sender": "jane_doe",
  "User": {
    "username": "john_doe"
  },
  "Board": {
    "id": 1,
    "title": "Project Board"
  }
}
```

### DELETE /api/invites/:id
Delete an invite.

**Parameters:**
- `id` (integer) - Invite ID

**Response:**
```json
{
  "message": "Invite deleted successfully"
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "error": "Username and password are required"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**409 Conflict:**
```json
{
  "error": "User already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create user"
}
```
