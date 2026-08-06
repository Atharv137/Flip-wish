# Smart Wishlist E-Commerce API

A robust backend REST API for an E-Commerce application with User Authentication, Product Management, Wishlist, and Cart features.

## Tech Stack
- **Node.js** & **Express.js** - Server Framework
- **MongoDB** & **Mongoose** - Database & Object Data Modeling (ODM)
- **TypeScript** - Static Typing
- **Vite** - Build Tool (with optional SPA serving)

## Architecture
The application uses a standard Model-View-Controller (MVC) approach adapted for APIs:
1. **Models (`/models`)**: Defines Mongoose schemas and relationships (User, Product, Wishlist, Cart). Uses reference ObjectIds instead of embedding for flexibility.
2. **Controllers (`/server/controllers`)**: Contains the business logic for CRUD operations. Interacts directly with the Mongoose models.
3. **Routes (`/server/routes`)**: Maps Express router endpoints to their respective controller functions.

## API Endpoints

### Products
- `GET /api/products` - Fetch all products (supports filtering, searching, pagination)
- `GET /api/products/:id` - Fetch single product by ID
- `POST /api/products` - Create a new product (Admin)
- `PUT /api/products/:id` - Update a product (Admin)
- `DELETE /api/products/:id` - Delete a product (Admin)

### Wishlist
- `GET /api/wishlist` - Get current user's wishlist
- `POST /api/wishlist` - Add a product to the wishlist
- `DELETE /api/wishlist/:id` - Remove a product from the wishlist

### Cart
- `GET /api/cart` - Get current user's cart (populated with product details)
- `POST /api/cart` - Add a product to cart (checks stock availability)
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user and receive a JWT token

## Environment Variables
Create a `.env` file in the root of your project:
```env
MONGO_URI=mongodb://localhost:27017/smart-wishlist
PORT=3000
```

## Setup Instructions
1. **Prerequisites**: Node.js and MongoDB installed locally (or an active MongoDB Atlas cluster).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**: Set your `MONGO_URI` in the `.env` file.
4. **Run the Application**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`.
