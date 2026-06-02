# Invoice Related API

## Testing order
**User side**
- `POST /api/invoices/generate/{booking_id}` - Generate invoice
- `GET /api/invoices` - List my invoices
- `GET /api/invoices/booking/{booking_id}` - Get invoice by booking
- `GET /api/invoices/{invoice_id}/download` - Download PDF

**Admin side**
- `GET /api/admin/bookings/invoices` - List all invoices
- `GET /api/admin/bookings/invoices?payment_status=paid` - Filter by status
- `GET /api/admin/bookings/invoices?date_from=2025-01-01&date_to=2025-01-31` - Filter by date
- `GET /api/invoices/{invoice_id}/download` - Download any invoice
- `POST /api/invoices/generate/{booking_id}` - Generate for any booking

**Common headers for all requests**
- `Authorization: Bearer {token}`
- `Content-Type: application/json` (for POST requests)

**Invoice API endpoints**
Base URL: `http://localhost:3000`

---

## User endpoints

### 1. List my invoices
- **Method:** `GET`
- **URL:** `/api/invoices`
- **Response:** List of user's invoices

### 2. Get invoice by booking ID
- **Method:** `GET`
- **URL:** `/api/invoices/booking/{booking_id}`
- **Example:** `/api/invoices/booking/27`
- **Response:** Invoice details for the booking

### 3. Download invoice PDF
- **Method:** `GET`
- **URL:** `/api/invoices/{invoice_id}/download`
- **Example:** `/api/invoices/1/download`
- **Response:** PDF file download

### 4. Generate invoice for paid booking
- **Method:** `POST`
- **URL:** `/api/invoices/generate/{booking_id}`
- **Example:** `/api/invoices/generate/27`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Invoice generated successfully",
    "invoice_id": 1,
    "invoice_number": "KILA-INV-2025-0001"
  }
  ```

---

## Admin endpoints

### 1. List all invoices (with filters)
- **Method:** `GET`
- **URL:** `/api/admin/bookings/invoices`
- **Query parameters (optional):**
  - `payment_status` - Filter by status (e.g., paid)
  - `date_from` - Start date (format: YYYY-MM-DD)
  - `date_to` - End date (format: YYYY-MM-DD)
  - `user_id` - Filter by user ID (integer)
- **Response:** List of all invoices with details

### 2. List all invoices (alternative endpoint)
- **Method:** `GET`
- **URL:** `/api/invoices`
- **Note:** Admin sees all invoices (users see only their own)
- **Response:** List of all invoices

### 3. Download any invoice (admin)
- **Method:** `GET`
- **URL:** `/api/invoices/{invoice_id}/download`
- **Response:** PDF file download (admin can download any invoice)

### 4. Generate invoice for any paid booking (admin)
- **Method:** `POST`
- **URL:** `/api/invoices/generate/{booking_id}`
- **Response:** Same as user endpoint (admin can generate for any booking)

### 5. Get invoice by booking ID (admin)
- **Method:** `GET`
- **URL:** `/api/invoices/booking/{booking_id}`
- **Response:** Invoice details (admin can view any invoice)
