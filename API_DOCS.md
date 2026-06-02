# 🗺️ Quick API Guide for Frontend

Base URL (dev): `http://localhost:5000`

New base url:
https://overhappily-nonfeloniously-roseann.ngrok-free.dev/

New aws base url: main
https://kothipalace.com/api

> JSON everywhere. If **Auth: Yes**, add `Authorization: Bearer <access_token>`.

---

## Auth

### Google Login
- **POST** `/api/auth/google`
- **Body:** `{ "id_token": "<google-id-token>" }`
- **Success 200:** `{ success: true, access_token, user }`
- **Errors:** 400 (missing id_token), 401 (invalid token)

### Refresh token
- **POST** `/api/auth/referesh`
- **Body:** None
- **Success 200:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "success": true
}
```

### Get Profile
- **GET** `/api/auth/profile`
- **Auth:** Yes
- **Success 200:** `{ success: true, user }`
- **Errors:** 401 (bad token)

### Delete Account
- **DELETE** `/api/auth/delete-account`

### Update profile
- **PUT** `/api/auth/profile`
- **Auth:** Yes
- **Body:**
```json
{
    "first_name": "Anil",
    "last_name": "Kumar",
    "phone": "9876543210",
    "profile":"",
    "gender": "male",
    "birthday": "1990-05-21",
    "address": "Street, City",
    "country": "India",
    "zipcode": "123456"
}
```
*Note: birthday must be YYYY-MM-DD*

- **Success 200:**
```json
{
    "message": "Profile updated successfully",
    "success": true,
    "user": {
        "address": "Street, City",
        "birthday": "1990-05-21",
        "country": "India",
        "created_at": "2025-11-08T09:56:13",
        "email": "anil.panchal@symconverge.com",
        "first_name": "Anil",
        "gender": "male",
        "google_id": "102323665788684943208",
        "id": 11,
        "last_login": "2025-12-08T10:32:57",
        "last_name": "Kumar",
        "name": "Anil k",
        "phone": "9876543210",
        "profile_picture": "https://lh3.googleusercontent.com/a/ACg8ocInjs8V7qA04Y9kJb5S6BkX2vrPyZrk58tY9taVLvS26NE2Lg=s96-c",
        "zipcode": "123456"
    }
}
```
- **Errors:** 
  - 400 if no updatable fields or invalid birthday format
  - 404 if user not found
  - 500 on server error

---

## Rooms

### List Rooms
- **GET** `/api/rooms/`
- **Success 200:** `{ success: true, rooms: [...] }`

### Search Rooms (availability)
- **GET** `/api/rooms/search`
- **Query:** `check_in`, `check_out` *(YYYY-MM-DD)*, optional `adults`, `children`, `guests`, `room_id`, `coupon_code`
- **Success 200:** `{ success: true, rooms: [{ ..., pricing: {...} }] }`
- **Errors:** 400 (missing/bad dates)

### Room Detail
- **GET** `/api/rooms/:id`
- **Success 200:** `{ success: true, room }`
- **Errors:** 404 (not found)

---

## Bookings

### Create Booking
- **POST** `/api/bookings`
- **Auth:** Yes
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body:**
```json
{
   "room_id": 5,
   "check_in_date": "2025-11-21",
   "check_out_date": "2025-11-23",
   "number_of_adults": 3,
   "number_of_children": 1,
   "guests": [
       {
           "first_name": "anil",
           "last_name": "abc",
           "phone": 8273627372,
           "email":"anil@gmail.com"
       },
       {
           "first_name": "jay",
           "last_name": "Patel",
           "phone":8383828328,
           "email":"jay@gmail.com"
       }
   ],
   "coupon_code":"NEWS500"
}
```
- **Success 201:**
```json
{
    "booking": {
        "base_price": 17600.0,
        "cancellation_policy": null,
        "check_in_date": "2025-11-21",
        "check_in_time": "11:00:00",
        "check_out_date": "2025-11-23",
        "check_out_time": "10:00:00",
        "coupon_code": "NEWS500",
        "created_at": "2025-11-12T17:50:12",
        "discount_amount": 500.0,
        "guests": [...],
        "id": 6,
        "number_of_adults": 3,
        "number_of_children": 1,
        "number_of_nights": 2,
        "payment_status": "pending",
        "room_id": 5,
        "service_charges": 500.0,
        "status": "pending",
        "total_price": 17600.0,
        "updated_at": "2025-11-12T17:50:12",
        "user_id": 9
    },
    "message": "Booking created successfully",
    "success": true
}
```
- **Errors:** 
  - 400 (bad data/capacity - e.g. "At least one guest is required" or "Room capacity exceeded")
  - 409 (dates already booked - e.g. "Room is not available for the selected dates")

### My Bookings
- **GET** `/api/bookings`
- **Auth:** Yes
- **Success 200:** `{ success: true, bookings: [...] }`

### Booking Detail
- **GET** `/api/bookings/:id`
- **Auth:** Yes
- **Success 200:** `{ success: true, booking }`
- **Errors:** 404 (not found)

### Cancel Booking
- **PUT** `/api/bookings/:id/cancel`
- **Auth:** Yes
- **Success 200:** `{ success: true, message, booking }`
- **Errors:** 404 (not found), 400 (already cancelled)

---

## Payments

**Payment Flow Summary:**
User creates booking → Gets booking_id → User clicks "Pay Now" → Call /initiate → Get order_id, amount_paise, key_id → Open Razorpay checkout with order details → User completes payment → Razorpay returns payment response → Call /verify with payment response → Booking updated to paid/confirmed → Show success message and redirect.

### Initiate Payment
- **POST** `/api/payment/bookings/<booking_id>/initiate`
- **Auth:** Yes
- **Body:** `{}`
- **Success 200:** `{ success: true, message: "Payment initiated", payment: { order_id, amount, amount_paise, currency, key_id, customer, booking_details } }`
- **Errors:** 404 (Booking not found), 403 (Unauthorized access), 400 (Booking already paid)

### Verify Payment
- **POST** `/api/payment/bookings/<booking_id>/verify`
- **Auth:** Yes
- **Body:**
```json
{
  "razorpay_payment_id": "pay_xyz789abc",
  "razorpay_order_id": "order_abc123xyz",
  "razorpay_signature": "signature_from_razorpay_response"
}
```
- **Success 200:** `{ success: true, message: "Payment verified...", booking: {...} }`
- **Errors:** 400 (Missing details / Amount mismatch / Invalid signature)

### Check Payment Status
- **GET** `/api/payment/bookings/<booking_id>/status`
- **Auth:** Yes
- **Success 200:** `{ success: true, payment_status, booking_status, amount, payment_id, payment_order_id }`
- **Errors:** 404 (Booking not found), 403 (Unauthorized access)

---

## WishList
- **GET** `/api/wishlist`
- **POST** `/api/wishlist` (Body: `{ "room_id": <id> }`)
- **DELETE** `/api/wishlist/<room_id>`
- **Auth:** Yes (JWT in Authorization header)

---

## Coupons
- **GET** `/api/coupons`
- **Success 200:** `{ count: 1, coupons: [...], success: true }`

---

## Reviews

### Get User Reviews
- **GET** `/api/reviews`
- **Auth:** Yes
- **Success 200:** Returns the user’s own reviews (includes admin response if any).

### Submit Review
- **POST** `/api/reviews`
- **Auth:** Yes
- **Body:** `{ "rating" : 5, "review_text" : "Wonderful Experience" }`
- **Success 200:** Created with `is_displayed=false` until admin approves.

### Update Review
- **PUT** `/api/reviews/:id`
- **Auth:** Yes
- **Body:** `{ "rating" : 3, "review_text" : "Wonderful Experience" }`
- **Success 200:** Sets `is_displayed=false` again; needs re-approval.

### Delete Review
- **DELETE** `/api/reviews/:id`
- **Auth:** Yes
- **Success 200:** `{ message: "Review deleted successfully", success: true }`

### General Reviews
- **GET** `/reviews` (or maybe `/api/reviews` without auth)
- **Auth:** No
- **Success 200:** Returns paginated list of all displayed reviews.

---

## Status Codes
- `200` OK
- `201` Created
- `400` Bad request
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `409` Conflict (overlap)
- `500` Server error

## Tips
- Store `access_token` from login and reuse it.
- Always call `/api/rooms/search` before showing “Book Now”.
- After creating/cancelling a booking, refresh `/api/bookings` to sync UI.
