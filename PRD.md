# Project Title
FlipWish – AI Powered Smart Wishlist E-Commerce Platform

# Project Overview
FlipWish is a modern, AI-powered e-commerce platform that allows users to discover, wish list, and purchase products. The platform incorporates a smart recommendation engine and a responsive user interface to provide a seamless shopping experience.

# Problem Statement
Traditional e-commerce platforms often lack intelligent product recommendations and real-time inventory updates for wishlisted items, leading to missed purchase opportunities and poor user engagement.

# Objectives
- Provide a robust e-commerce shopping experience.
- Implement an intelligent AI-based product recommendation system.
- Enable users to maintain a wishlist with real-time stock polling.
- Ensure high performance, scalability, and security.

# Scope
The project covers user registration and authentication, product browsing, searching and filtering, wishlist and cart management, stock validation, and AI-powered recommendations.

# Target Users
- Online shoppers looking for an intuitive platform.
- Users who frequently use wishlists and want real-time updates.

# User Personas
1. **The Bargain Hunter**: Looks for discounts and relies heavily on wishlists to track price changes and stock availability.
2. **The Impulse Buyer**: Relies on AI recommendations to discover new products quickly.
3. **The Casual Shopper**: Browses categories, uses filters to narrow down choices, and eventually adds items to the cart.

# Functional Requirements
- User Registration
- User Login
- JWT Authentication
- Product Listing
- Product Search
- Category Filter
- Brand Filter
- Rating Filter
- Price Filter
- Sorting
- Pagination
- Wishlist
- Cart
- Quantity Update
- Checkout
- Stock Validation
- Optimistic UI
- Wishlist Stock Polling every 30 seconds
- Gemini AI Product Recommendation
- Responsive UI

# Non Functional Requirements
- **Performance**: Fast page loads and optimistic UI updates for instantaneous feedback.
- **Security**: JWT-based authentication, password hashing with bcrypt, secure API endpoints.
- **Availability**: 99.9% uptime target via robust cloud deployment.
- **Scalability**: Stateless backend using Express and scalable database via MongoDB Atlas.
- **Reliability**: Graceful error handling and retry mechanisms.
- **Maintainability**: Modular architecture (MVC pattern) and clean code practices.
- **Usability**: Responsive design adaptable to mobile, tablet, and desktop screens.

# User Stories
1. As a customer, I want to register for an account, so that I can have a personalized experience.
2. As a customer, I want to log in using my email and password, so that I can access my wishlist and cart.
3. As a customer, I want to browse all available products, so that I can see what is for sale.
4. As a customer, I want to search for products by keyword, so that I can quickly find specific items.
5. As a customer, I want to filter products by category, so that I can browse specific types of items.
6. As a customer, I want to filter products by brand, so that I can find products from my favorite brands.
7. As a customer, I want to filter products by rating, so that I can see the highest-rated items.
8. As a customer, I want to filter products by price, so that I can stay within my budget.
9. As a customer, I want to sort products (e.g., by price), so that I can find the cheapest or most expensive items.
10. As a customer, I want to navigate through pages of products using pagination, so that I don't see too many items at once.
11. As a customer, I want to add products to my wishlist, so that I can purchase them later.
12. As a customer, I want to add products to my cart, so that I can proceed to checkout.
13. As a customer, I want to update the quantity of items in my cart, so that I can buy multiple units of a product.
14. As a customer, I want to see real-time stock updates on my wishlisted items, so that I know when they are running out of stock.
15. As a customer, I want to receive AI-powered product recommendations, so that I can discover new items I might like.

# Acceptance Criteria
- Users can successfully register and login, receiving a valid JWT token.
- Product catalog displays items with accurate details, supporting search, filter, sort, and pagination.
- Wishlist and cart operations work accurately with optimistic UI updates.
- Stock validation prevents adding unavailable items to the cart.
- Wishlist polling fetches stock updates every 30 seconds without disrupting the user experience.
- Gemini AI provides relevant recommendations based on input/context.

# Assumptions
- Users have modern web browsers with JavaScript enabled.
- The Gemini AI service and MongoDB Atlas remain accessible with minimal downtime.

# Constraints
- AI recommendations depend on Gemini API latency.
- Wishlist polling must be optimized to prevent excessive API calls.

# Success Metrics
- Increase in user registration and daily active users.
- High conversion rate from wishlist to cart.
- Low latency for page load and API response times.
