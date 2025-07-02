Bookstore REST API
A RESTful API built with Node.js and Express for managing a Bookstore application. It supports user authentication with JWT, CRUD operations on books, and file-based data persistence.
Tech stack used: Node.js Express, JSON Web Token (JWT), uuid, dotenv and fs (File System for persistence) .

Features : User Authentication (/register and /login) with JWT ,Book Management (CRUD), Only authenticated users can manage books, Only the user who added a book can update or delete it, Search by Genre and Pagination, Data stored in JSON files (books.json and users.json), Middleware for logging and authentication and Error handling for clean API responses


Setup Instructions
1️) Clone the Repository: 
    git clone https://github.com/SAIDATTUPUJARI/Bookstore-REST-API-with-File-Based

2️) Install Dependencies:
  npm install
  
3️) Set Up Environment Variables:

  Create a .env file in the root directory:
  JWT_SECRET=your_secret_key
  PORT=5000
  Or copy from the provided template:
  cp example.env .env


4️) Initialize Data Files:

 Create two JSON files in the root directory:

  users.json → []
  
  books.json → []

5️) Run the Server

node server.js
Server will start at: http://localhost:5000

==============================================================

-> Authentication
Method	Endpoint	Description

POST	/register	 (Register a new user)
POST	/login	  (Login and receive JWT token)

-> Authorization Header
All /books endpoints require this header:

Authorization: Bearer <your_token>

-> Book Management Endpoints

--> Method	Endpoint	Description
    GET	/books	Get all books (supports search & pagination)
    GET	/books/:id	Get a book by ID
    POST	/books	Add a new book
    PUT	/books/:id	Update a book (only owner can update)
    DELETE	/books/:id	Delete a book (only owner can delete)

-> Query Parameters
Parameter	Type	Description
genre	String	Filter books by genre
page	Number	Page number for pagination
limit	Number	Number of items per page (default)

Example:

GET /books?genre=Fiction&page=1&limit=5
->Book Object Structure
json:

{
  "id": "auto-generated UUID",
  "title": "String",
  "author": "String",
  "genre": "String",
  "publishedYear": Number,
  "userId": "User ID who added the book"
}

=====================================================

->How to Test with Postman or cURL

--> Register

POST /register

{
  "email": "user@example.com",
  "password": "password123"
}
--> Login
POST /login


{
  "email": "user@example.com",
  "password": "password123"
}

--> Returns token:

{
  "token": "eyJhbGci..."
}

 
 --> Create a Book
 
POST /books with Header:


Authorization: Bearer <your_token>

Body:   

{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Fiction",
  "publishedYear": 2024
}

 
 --> Get All Books

GET /books
Headers:
Authorization: Bearer <your_token>

-->Update a Book

PUT /books/:id
Headers:
Authorization: Bearer <your_token>
Body:

{
  "title": "Updated Title",
  "author": "New Author"
}


-->Delete a Book

DELETE /books/:id
Headers:
Authorization: Bearer <your_token>

--> Example cURL Commands

Register:

curl -X POST http://localhost:5000/register \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123"}'

Login:

curl -X POST http://localhost:5000/login \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123"}'

Get Books:

curl -X GET http://localhost:5000/books \
-H "Authorization: Bearer <your_token>"

-->Error Responses

Status	Message

401	Unauthorized - No token found
403	Forbidden - Not allowed
404	Not Found - Book/User not found
500	Internal Server Error

API Documentation (Optional: Swagger):- 

If needed, Swagger can be added using swagger-ui-express and swagger-jsdoc. i am Not included in this version.

--> Future Improvements

Password encryption (bcrypt)

Validation (express-validator)

Rate limiting and security enhancements

Database integration (MongoDB/PostgreSQL)



Author:
Built by Pujari Saidatthu
GitHub   : https://github.com/SAIDATTUPUJARI
email    : pujarisaidattu6@gmail.com
linkedin : https://www.linkedin.com/in/pujarisaidattu/
