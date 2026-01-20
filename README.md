# Sixerzone Turf Booking System - Frontend

## 🏟️ Overview

A modern, responsive React frontend for the Sixerzone turf booking system with integrated Razorpay payment gateway. Built with React 19, Vite, and modern JavaScript practices.

## ✨ Features

- **Multi-Step Booking Flow**: Intuitive 4-step process (Date → Time → Ground → Payment)
- **Calendar Interface**: Interactive date selection for next 45 days
- **Real-Time Availability**: Live updates of available slots and grounds
- **Razorpay Integration**: Seamless payment processing with modal interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Error Handling**: User-friendly error messages and validation
- **Loading States**: Visual feedback during data fetching
- **Progress Indicator**: Clear visual progress through booking steps

## 🗂️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # React components
│   │   ├── DateSelection.jsx
│   │   ├── DateSelection.css
│   │   ├── TimeSlotSelection.jsx
│   │   ├── TimeSlotSelection.css
│   │   ├── GroundSelection.jsx
│   │   ├── GroundSelection.css
│   │   ├── BookingForm.jsx
│   │   └── BookingForm.css
│   ├── utils/
│   │   ├── api.js         # API service module
│   │   └── helpers.js     # Utility functions
│   ├── App.jsx            # Main application component
│   ├── App.css            # Main application styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── index.html             # HTML template (includes Razorpay SDK)
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Backend API**: Backend server must be running on port 3000

### Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint** (optional)

   The default API endpoint is `http://localhost:3000/api`.

   To change it, update the `API_BASE_URL` in `src/utils/api.js`

4. **Start development server**

   ```bash
   npm run dev
   ```

   The application will open at `http://localhost:5173`

## 📦 Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build production-ready bundle            |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint for code quality              |

## 🎯 Booking Flow

### Step 1: Date Selection

- Display calendar for next 45 days
- Show availability status for each date
- Disable past dates and fully booked dates
- Navigate between months

### Step 2: Time Slot Selection

- Display 24-hour slots (12:00 AM to 11:59 PM)
- Show availability for each hour
- Disable past slots (with 30-minute buffer)
- Disable fully booked slots

### Step 3: Ground Selection

- Display all available grounds (G1, G2, Mega_Ground)
- Show unavailable grounds (grayed out)
- Display ground location information

### Step 4: Booking Form & Payment

- Collect customer information (Name, Phone, Email)
- Display booking summary
- Open Razorpay payment modal
- Process payment and verify signature
- Show confirmation or error message

## 🎨 Component Overview

### DateSelection Component

**Purpose**: First step - date selection with calendar interface

**Props:**

- `onDateSelect`: Callback when date is selected

**Features:**

- Month-wise calendar display
- Enabled/disabled date highlighting
- Navigation between months
- Loading state during data fetch

### TimeSlotSelection Component

**Purpose**: Second step - time slot selection

**Props:**

- `selectedDate`: Date selected in previous step
- `onSlotSelect`: Callback when slot is selected
- `onBack`: Callback to go back to date selection

**Features:**

- 24-hour slot display in 12-hour format
- Real-time availability checking
- Visual distinction between available/unavailable
- Past slot detection

### GroundSelection Component

**Purpose**: Third step - ground selection

**Props:**

- `selectedDate`: Selected date
- `selectedSlot`: Selected time slot object
- `onGroundSelect`: Callback when ground is selected
- `onBack`: Callback to go back to slot selection

**Features:**

- Display all grounds with details
- Real-time availability for selected slot
- Ground location display
- Visual indication of unavailable grounds

### BookingForm Component

**Purpose**: Fourth step - customer info and payment

**Props:**

- `selectedDate`: Selected date
- `selectedSlot`: Selected slot object
- `selectedGround`: Selected ground object
- `onBookingComplete`: Callback when booking is successful
- `onBack`: Callback to go back to ground selection

**Features:**

- Form validation (name, email, phone)
- Booking summary display
- Razorpay payment modal integration
- Payment success/failure handling
- Error message display

## 🔧 Configuration

### Razorpay Setup

The Razorpay SDK is loaded via script tag in `index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

The Razorpay key is fetched from the backend API response when creating an order.

### API Configuration

Update `src/utils/api.js` for production:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
```

Create `.env` file:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

## 🎨 Styling

### CSS Architecture

- Component-specific styles in separate `.css` files
- Global styles in `index.css`
- Main app styles in `App.css`
- Responsive design with media queries
- CSS variables for consistent theming

### Color Scheme

```css
--primary-color: #007bff;
--success-color: #28a745;
--danger-color: #dc3545;
--warning-color: #ffc107;
--disabled-color: #6c757d;
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🐛 Error Handling

### User-Facing Errors

- Form validation errors (inline)
- API connection errors (alerts)
- Payment failures (modal)
- Slot unavailability (disabled state)

### Developer Errors

- Console logging for debugging
- Error boundaries (future enhancement)
- Network error detection

## 🧪 Testing

### Manual Testing Checklist

**Date Selection:**

- [ ] Can navigate between months
- [ ] Past dates are disabled
- [ ] Fully booked dates show as disabled
- [ ] Available dates are clickable

**Time Slot Selection:**

- [ ] Past slots are disabled
- [ ] Booked slots show as unavailable
- [ ] Can go back to date selection

**Ground Selection:**

- [ ] Unavailable grounds are grayed out
- [ ] Can select available grounds
- [ ] Ground information is displayed

**Booking & Payment:**

- [ ] Form validation works
- [ ] Razorpay modal opens
- [ ] Test card payment succeeds
- [ ] Payment failure is handled
- [ ] Success message shows booking details

### Test Payment Cards

Use Razorpay test cards:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 📊 Performance

### Optimization Techniques

- Lazy loading of components (future)
- Debounced API calls
- Memoization of expensive calculations
- Vite's built-in optimization

### Build Output

```bash
npm run build
# Output in dist/ folder
# Gzipped size: ~50-60 KB
```

## 🔐 Security

- **No sensitive data in frontend**: Razorpay keys come from backend
- **HTTPS recommended**: For production deployment
- **Input sanitization**: All user inputs are validated
- **CORS protection**: Backend handles CORS policies

## 📦 Dependencies

### Core

- **React** 19.2.0: UI library
- **React DOM** 19.2.0: React renderer

### Development

- **Vite** 7.2.4: Build tool
- **ESLint** 9.17.0: Code quality
- **@vitejs/plugin-react** 4.4.2: React support for Vite

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=your_api_url`

### Deploy to Custom Server

```bash
# Build
npm run build

# Copy dist/ folder to your server
scp -r dist/* user@server:/var/www/html/
```

## 🔄 API Integration

### Endpoints Used

| Method | Endpoint                                              | Purpose                 |
| ------ | ----------------------------------------------------- | ----------------------- |
| GET    | `/api/grounds/get-available-dates`                    | Fetch available dates   |
| GET    | `/api/grounds/get-available-slots?date=`              | Fetch available slots   |
| GET    | `/api/grounds/get-available-grounds?date=&startHour=` | Fetch available grounds |
| POST   | `/api/payments/create-order`                          | Create Razorpay order   |
| POST   | `/api/payments/verify`                                | Verify payment          |
| POST   | `/api/payments/failure`                               | Record payment failure  |

## 🆘 Troubleshooting

### API Connection Errors

```
Error: Failed to fetch
```

**Solution**: Ensure backend server is running on port 3000

### Razorpay Not Loading

```
ReferenceError: Razorpay is not defined
```

**Solution**: Check Razorpay script in index.html

### Build Errors

```
Error: Cannot find module
```

**Solution**: Delete node_modules and package-lock.json, run `npm install`

## 📝 License

This project is part of Sixerzone Turf Booking System.

## 🤝 Support

For issues and questions, please refer to the inline documentation in the code.

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Built with:** React + Vite + Razorpay
