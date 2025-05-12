# Stripe Payment Integration

This project demonstrates a full-stack implementation of Stripe payment integration with Express.js (TypeScript) backend and Next.js frontend. It supports subscription-based payments, recurring payments, and includes webhook handling for payment events.

## Features

- Subscription management
- Recurring payments
- Webhook handling for payment events
- Secure payment processing
- Payment reconciliation
- TypeScript support
- Next.js frontend with modern UI
- Express.js backend with TypeScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Stripe account
- MongoDB (for database)

## Environment Variables

Create a `.env` file in both the frontend and backend directories with the following variables:

### Backend (.env)

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (.env.local)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  email: string,
  stripeCustomerId: string,
  subscriptionStatus: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  stripeSubscriptionId: string,
  planId: string,
  status: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  subscriptionId: ObjectId,
  stripePaymentIntentId: string,
  amount: number,
  currency: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
4. Start the development servers:

   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm run dev
   ```

## API Endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login

### Subscriptions

- POST /api/subscriptions/create
- GET /api/subscriptions/:id
- PUT /api/subscriptions/:id/cancel
- GET /api/subscriptions/user/:userId

### Payments

- POST /api/payments/create-payment-intent
- GET /api/payments/:id
- GET /api/payments/user/:userId

### Webhooks

- POST /api/webhooks/stripe

## Security Considerations

1. All API endpoints are protected with JWT authentication
2. Stripe webhook signatures are verified
3. Sensitive data is encrypted
4. Rate limiting is implemented
5. CORS is properly configured
6. Input validation is implemented

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:

   ```bash
   cd backend
   npm run build
   ```

3. Deploy to your preferred hosting platform (e.g., Vercel for frontend, Heroku for backend)

## Monitoring and Reconciliation

1. Use Stripe Dashboard for payment monitoring
2. Implement logging for all payment events
3. Regular reconciliation between Stripe and database records
4. Automated email notifications for failed payments
5. Payment retry mechanism for failed payments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
