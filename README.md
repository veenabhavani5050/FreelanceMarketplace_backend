# FreelanceMarketplace_backend

# User Authentication

Use JWT for auth and bcrypt for password hashing.

Register/Login:

Role-based: Freelancer / Client

Profile Pages:

Freelancer: skills, portfolio, availability

Client: company name, business details

Password Reset:

Use email with token or OTP (optional for assessment)

Freelancer Features
Service Listings CRUD with categories and pricing.

Upload portfolio samples (use Cloudinary or similar).

Profile showcasing:

Skills, previous work, ratings

Contract Management:

Proposals, acceptance, milestones (status updates)

Payment Integration (Stripe or Razorpay):

Milestone-based or on completion

Review system:

Read/Reply to client reviews

🧑‍💼 Client Features
Post Jobs with full description, budget, deadline.

Filter freelancers (by skill, rating, budget).

Hire freelancers & manage contracts.

View freelancer ratings before hiring.

Payment & Reviews:

Escrow or direct payment

Leave ratings/reviews after job completion

💳 Payment System
Integrate Stripe or Razorpay:

Use test keys for development.

Payment scheduling:

Manual or automated via milestones.

Display transaction history.

⭐ Reviews and Ratings
Leave rating + written review.

Freelancers can respond.

Display average ratings in profiles/job cards.

🔔 Other Features
Notifications (simple email or in-app alert for now)

Advanced Search and Filter using MongoDB queries and frontend controls

Dashboard:

Freelancers: gigs, contracts, payments, reviews

Clients: job posts, hired freelancers, contract progress





// Root project structure
// freelance-marketplace-backend/
// ├── config/
// │   └── db.js
// ├── controllers/
// │   ├── authController.js
// │   ├── contractController.js
// │   ├── dashboardController.js
// │   ├── jobController.js
// │   ├── notificationController.js
// │   ├── paymentController.js
// │   ├── reviewController.js
// │   ├── searchController.js
// │   ├── serviceController.js
// │   └── userController.js
// ├── middleware/
// │   ├── authMiddleware.js
// │   ├── errorHandler.js
// │   └── logger.js
// ├── models/
// │   ├── Contract.js
// │   ├── Job.js
// │   ├── Notification.js
// │   ├── Payment.js
// │   ├── Review.js
// │   ├── Service.js
// │   └── User.js
// ├── routes/
// │   ├── authRoutes.js
// │   ├── contractRoutes.js
// │   ├── dashboardRoutes.js
// │   ├── jobRoutes.js
// │   ├── notificationRoutes.js
// │   ├── paymentRoutes.js
// │   ├── reviewRoutes.js
// │   ├── searchRoutes.js
// │   ├── serviceRoutes.js
// │   └── userRoutes.js
// ├── utils/
// │   ├── stripe.js
// │   └── errorRoute.js
// ├── .env
// ├── app.js
// └── server.js

// This full implementation includes all required routes and logic:
// ✅ Role-based user auth (freelancer/client)
// ✅ Password reset
// ✅ Profiles and dashboards
// ✅ Job/service listings
// ✅ Contracts (with milestones)
// ✅ Payments (Stripe)
// ✅ Reviews and ratings
// ✅ Notifications
// ✅ Advanced search & filtering

User Authentication:

Email/password signup & login + social login (Google, Facebook via OAuth)

Role-based access control (freelancer/client)

Password reset/change (via email tokens)

Profile Management:

User profiles with different schemas for freelancers and clients

Freelancers: skills, portfolio (upload images/files), availability

Clients: business info

Service Listings (Freelancers):

CRUD for service listings: title, description, category, price, samples (files/images)

Job Listings (Clients):

CRUD for job posts: title, description, budget, deadlines

Contracts:

Proposal submissions, contract creation, milestones

Status tracking and communication (messages)

Payments:

Stripe integration (or PayPal)

Milestone-based payment handling and escrow

Transaction history stored per user

Reviews and Ratings:

Clients can leave reviews + ratings after projects complete

Freelancers can respond to reviews

Notifications:

Push or in-app notifications for contracts, payments, reviews, etc.

Search and Filtering:

Text search + filters for skills, location, ratings, budget, availability

Dashboard APIs:

Endpoints to get user-specific summaries and lists

2. Frontend (React + TailwindCSS)
UI/UX Features:
Authentication UI (signup, login, social login)

Profile creation and editing forms for freelancers and clients

Service and Job listings pages:

Freelancer dashboard for managing services, viewing contracts, payments, reviews

Client dashboard for managing job posts, contracts, payments, reviews

Search/filter UI components (with debounce, pagination)

Contract management UI with milestones and communication threads

Payment UI integrated with Stripe checkout/session

Reviews & Ratings UI (leave & respond to reviews)

Notifications panel (bell icon + dropdown)

Responsive design with TailwindCSS

Role-based routes and protected routes (React Router)

Loading spinners, error handling UI, toast notifications

3. Payment Integration
Use Stripe API (recommended for ease and features)

Set up Stripe Checkout or Payment Intents for:

Full project payments

Milestone payments (partial, scheduled)

Show payment history and status in user dashboards

Webhooks for payment success/failure notifications to update contract/payment status

Microsoft Windows [Version 10.0.19045.5854]
(c) Microsoft Corporation. All rights reserved.

C:\Users\ELCOT>cd "C:\Users\ELCOT\Downloads\stripe_1.27.0_windows_x86_64 (1)"

C:\Users\ELCOT\Downloads\stripe_1.27.0_windows_x86_64 (1)>stripe.exe --version
stripe version 1.27.0

C:\Users\ELCOT\Downloads\stripe_1.27.0_windows_x86_64 (1)>stripe login
Your pairing code is: works-proven-eases-cheery
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser or visit https://dashboard.stripe.com/stripecli/confirm_auth?t=V7Woc1Cf4NpjD6PXTjIsbnx1XdljRpPf (^C to quit)
@ Waiting for confirmation...exceeded max attempts

C:\Users\ELCOT\Downloads\stripe_1.27.0_windows_x86_64 (1)>













Backend Folder Structure Overview
bash
Copy
Edit
FreelanceMarketplace_backend/
├── config/
│   ├── db.js
│   └── passport.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── chatController.js
│   ├── contractController.js
│   ├── dashboardController.js
│   ├── jobController.js
│   ├── messageController.js
│   ├── milestoneController.js
│   ├── notificationController.js
│   ├── paymentController.js
│   ├── proposalController.js
│   ├── reviewController.js
│   ├── searchController.js
│   ├── serviceController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── isAdmin.js
│   └── logger.js
├── models/
│   ├── Contract.js
│   ├── Job.js
│   ├── Milestone.js
│   ├── Notification.js
│   ├── Proposal.js
│   ├── Review.js
│   ├── Service.js
│   ├── User.js
│   └── messageModel.js
│   └── paymentModel.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   ├── contractRoutes.js
│   ├── dashboardRoutes.js
│   ├── jobRoutes.js
│   ├── messageRoutes.js
│   ├── milestoneRoutes.js
│   ├── notificationRoutes.js
│   ├── paymentRoutes.js
│   ├── proposalRoutes.js
│   ├── reviewRoutes.js
│   ├── searchRoutes.js
│   ├── serviceRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── config.js
│   ├── errorRoute.js
│   ├── generateToken.js
│   ├── sendEmail.js
│   └── stripe.js
├── .git/...
├── node_modules/...
├── .env               # (should contain credentials)
├── package.json
├── server.js
└── README.md (expected if documentation is included)

Features Implemented:
Based on file inspection:

User Auth (authController, passport.js, generateToken.js)

Google OAuth via Passport (passport-google-oauth20)

Profile Management (userRoutes, userController)

Password Reset (authController, sendEmail.js)

Service Listings (serviceController)

Job Listings (jobController)

Contract/Milestone (contractController, milestoneController)

Payment via Stripe (stripe.js, paymentController)

Review/Rating (reviewController)

Proposals (proposalController)

Chat/Real-time Messaging (chatController, messageController)

Notifications (notificationController)

Search/Filtering (searchController)

Admin Panel Support (adminRoutes, adminController)

Dashboard Stats (dashboardController)

Middleware for Auth, Admin, Error Handling


✅ User Authentication
Feature	Status	Notes
Email/password registration/login	✅	authController.js, User.js
Google OAuth login	✅	passport.js, authRoutes.js
Role-based authentication	✅	User model includes roles
Password reset & change	✅	sendEmail.js, authController.js

✅ Profile Management
Feature	Status	Notes
View/update profile	✅	userController.js
Freelancer: skills, portfolio, etc.	✅	User model has relevant fields
Client: business info	✅	Included in User model

✅ Freelancer Features
Feature	Status	Notes
Service listings	✅	serviceController.js, Service.js
Upload samples, set availability	✅	Service.js includes sample, availability
Profile & portfolio	✅	Built into profile and service model
Contract management	✅	contractController.js, milestoneController.js
Payment on milestone	✅	paymentController.js, Milestone.js
Ratings & reviews	✅	reviewController.js, Review.js

✅ Client Features
Feature	Status	Notes
Job posting	✅	jobController.js, Job.js
Edit/manage jobs	✅	Supported in controller
Search/filter freelancers	✅	searchController.js
Contract creation	✅	contractController.js
Payment to freelancers	✅	paymentController.js, stripe.js
Reviews/ratings	✅	reviewController.js

✅ Payment Processing
Feature	Status	Notes
Stripe integration	✅	stripe.js
Milestone/scheduled payments	✅	Milestone.js, Contract.js
Transaction history	✅	paymentModel.js, routes handled

✅ Reviews & Ratings
Feature	Status	Notes
Clients review freelancers	✅	reviewController.js
Freelancers respond to reviews	✅	reply support present
Ratings shown on profile	✅	Logic in reviewRoutes.js and userController.js

✅ Additional Features
Feature	Status	Notes
Notifications	✅	notificationController.js, Notification.js
Real-time updates (socket.io)	✅	server.js, chat implemented
Dashboards (client & freelancer)	✅	dashboardController.js
Admin panel	✅	adminRoutes.js, adminController.js
Admin moderation (jobs/contracts/users)	✅	CRUD ops for users/jobs/contracts

✅ Code Organization & Coverage
Area	Status	Notes
RESTful API design	✅	Consistent across all routes
Middleware for auth/admin	✅	auth.js, isAdmin.js
Error handling	✅	errorHandler.js
Email sending (reset/verify)	✅	sendEmail.js


freelance-marketplace-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleRoute.jsx
│   │   ├── Message.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useSocket.js
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── ResendVerification.jsx
│   │   ├── Common/
│   │   │   ├── Home.jsx
│   │   │   └── CompleteProfile.jsx
│   │   ├── Client/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JobPost.jsx
│   │   │   ├── JobsList.jsx
│   │   │   ├── ContractsList.jsx
│   │   │   ├── ViewFreelancer.jsx
│   │   │   └── SubmitReview.jsx
│   │   ├── Freelancer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateService.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── Proposals.jsx
│   │   │   ├── Contracts.jsx
│   │   │   └── Milestones.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Jobs.jsx
│   │   │   └── Contracts.jsx
│   │   ├── Notifications/
│   │   │   └── Notifications.jsx
│   │   ├── Transactions/
│   │   │   └── Transactions.jsx
│   │   ├── Chat/
│   │   │   └── ChatRoom.jsx
│   ├── routes/
│   │   └── index.jsx
│   ├── services/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── jobs.js
│   │   ├── services.js
│   │   ├── contracts.js
│   │   ├── proposals.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── utils/
│   │   └── axiosInstance.js
│   ├── App.jsx
│   ├── main.jsx
├── .env
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── vite.config.js