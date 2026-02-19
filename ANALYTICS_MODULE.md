# Analytics & Dashboard Module - Complete Documentation

## 📋 Overview

The Analytics & Dashboard Module is the **final piece** that closes the loop of your Manufacturing Inventory System. It integrates data from:

- **Manufacturing Module** (Inputs) - `manufacturing_orders` table
- **Batch Module** (Inventory) - `batches` table  
- **Stock-Out Module** (Outputs) - `stock_out_transactions` table
- **Products Module** (Master Data) - `products` table

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Inertia)                 │
├─────────────────────────────────────────────────────────────┤
│  Pages/Analytics/                  Components/Analytics/     │
│  ├─ Dashboard.jsx                  ├─ MetricsCards.jsx      │
│  └─ BatchTraceability.jsx          ├─ ExpiryAlertsTable.jsx │
│                                    ├─ LowStockAlertsTable    │
│                                    ├─ BatchTraceabilitySearch│
│                                    └─ DashboardChart.jsx     │
└─────────────────────────────────────────────────────────────┘
                           ↓ (API Calls)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Laravel PHP) Routes                    │
├─────────────────────────────────────────────────────────────┤
│  /dashboard                    → dashboard()                 │
│  /analytics/batch/{id}         → batchTraceability()        │
│  /api/analytics/metrics        → apiMetrics()               │
│  /api/analytics/expiring-batch → apiExpiringBatches()      │
│  /api/analytics/low-stock      → apiLowStockAlerts()       │
│  /api/analytics/batch/{id}     → searchBatch()              │
│  /api/analytics/report         → exportReport()             │
└─────────────────────────────────────────────────────────────┘
                           ↓ (DB Queries)
┌─────────────────────────────────────────────────────────────┐
│          CONTROLLER: AnalyticsController.php                 │
├─────────────────────────────────────────────────────────────┤
│  ✅ Efficient Aggregation Queries (using Laravel Eloquent)  │
│     - SUM, COUNT, GROUP BY operations at DB level            │
│     - LEFT JOINs for relationship-based aggregations        │
│     - WHERE clauses with date filtering                      │
└─────────────────────────────────────────────────────────────┘
                           ↓ (Eloquent ORM)
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                          │
├─────────────────────────────────────────────────────────────┤
│  Tables: batches, stock_out_transactions, products,          │
│          manufacturing_orders                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Backend API Endpoints

### 1. **Dashboard Page** (Server-Side Rendering)
```
GET /dashboard
Renders: Analytics/Dashboard.jsx
Props Passed:
  - metrics: { totalManufacturedToday, liveStoreStock, salesToday, lowStockCount }
  - expiringBatches: [...]
  - lowStockAlerts: [...]
```

### 2. **API Endpoints** (JSON Responses)

#### Get All Dashboard Metrics
```javascript
GET /api/analytics/metrics
Response:
{
  "success": true,
  "data": {
    "totalManufacturedToday": {
      "count": 5,
      "quantity": 1250
    },
    "liveStoreStock": {
      "total_batches": 42,
      "total_quantity": 45680,
      "initial_quantity": 48000,
      "sold_quantity": 2320
    },
    "salesToday": {
      "count": 12,
      "quantity": 450
    },
    "lowStockCount": 3
  }
}
```

#### Get Expiring Batches (Next 7 Days)
```javascript
GET /api/analytics/expiring-batches
Response:
{
  "success": true,
  "data": [
    {
      "id": 5,
      "batch_number": "JUICE-20260217-001",
      "product_id": 1,
      "product_name": "Orange Juice",
      "product_sku": "OJ-001",
      "manufacturing_date": "Feb 10, 2026",
      "expiry_date": "Feb 20, 2026",
      "days_until_expiry": 2,
      "initial_quantity": 500,
      "remaining_quantity": 320,
      "urgency": "critical"  // Options: critical, warning, normal
    },
    ...
  ]
}
```

#### Get Low Stock Products
```javascript
GET /api/analytics/low-stock
Response:
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Almond Cookies",
      "sku": "AC-1001",
      "current_stock": 45,
      "minimum_stock": 100,
      "stock_deficit": 55,
      "stock_percentage": 45
    },
    ...
  ]
}
```

#### Search Batch by ID or Number
```javascript
GET /api/analytics/batch/{batchIdentifier}
Example:
  GET /api/analytics/batch/JUICE-20260217-001
  GET /api/analytics/batch/5

Response:
{
  "success": true,
  "data": {
    "id": 5,
    "batch_number": "JUICE-20260217-001",
    "product": {
      "id": 1,
      "name": "Orange Juice",
      "sku": "OJ-001",
      "category": "Beverages",
      "unit": "liters"
    },
    "manufacturing_date": "Feb 10, 2026",
    "expiry_date": "Feb 20, 2026",
    "initial_quantity": 500,
    "total_sold_quantity": 180,
    "current_quantity": 320,
    "quantity_loss": 0,
    "labels_printed": 2,
    "notes": "Premium batch",
    "stock_out_transactions": [
      {
        "id": 1,
        "sold_quantity": 50,
        "reason": "Store A",
        "notes": "Regular sales",
        "user_name": "John Doe",
        "timestamp": "Feb 15, 2026 10:30 AM",
        "timestamp_iso": "2026-02-15T10:30:00Z"
      },
      ...
    ]
  }
}
```

#### Export Daily Analytics Report
```javascript
GET /api/analytics/report
Response:
{
  "report_date": "Feb 19, 2026",
  "metrics": { ... },
  "expiring_batches_count": 3,
  "expiring_batches": [ ... ],
  "low_stock_alerts_count": 2,
  "low_stock_alerts": [ ... ]
}
```

---

## 📊 Frontend Components

### Page Components

#### 1. **Analytics/Dashboard.jsx** (Main Dashboard)
```jsx
Props:
  - metrics: Key metrics data
  - expiringBatches: List of batches expiring in 7 days
  - lowStockAlerts: List of products below minimum stock

Features:
  ✅ Displays 4 metric cards at top
  ✅ Shows expiry alerts table (sortable by urgency and date)
  ✅ Shows low stock alerts table (sortable by deficit)
  ✅ Quick action buttons to other modules
  ✅ Responsive grid layout
```

#### 2. **Analytics/BatchTraceability.jsx** (Traceability Page)
```jsx
Features:
  ✅ Search interface for batch by ID or number
  ✅ Displays complete batch information
  ✅ Shows manufacturing details and expiry
  ✅ Quantity summary (Initial → Sold → Current)
  ✅ Complete stock-out transaction history in table
  ✅ User tracking for each transaction
  ✅ Leakage detection (negative stock warning)
```

### Component Library

#### 3. **Components/Analytics/MetricsCards.jsx**
```jsx
Displays 4 KPI Cards:
  1. Total Manufactured Today (quantity + batch count)
  2. Live Store Stock (current inventory across all batches)
  3. Sales Today (transactions count + quantity sold)
  4. Low Stock Alerts (products below minimum)

Features:
  ✅ Color-coded by metric type
  ✅ Icons for visual identification
  ✅ Number formatting with commas
  ✅ Responsive grid (1-2-4 columns)
```

#### 4. **Components/Analytics/ExpiryAlertsTable.jsx**
```jsx
Displays batches expiring within 7 days (SORTED BY FIFO)

Columns:
  - Batch ID (code formatted)
  - Product name & SKU
  - Expiry date
  - Days until expiry
  - Current qty / Initial qty
  - Urgency status badge (Critical/Warning/Normal)
  - View Details link

Features:
  ✅ Color-coded rows by urgency
  ✅ FIFO-sorted (soonest expiry first)
  ✅ Only shows batches with remaining quantity > 0
  ✅ Quick link to batch traceability
```

#### 5. **Components/Analytics/LowStockAlertsTable.jsx**
```jsx
Displays products below minimum stock level

Columns:
  - Product name
  - SKU
  - Current stock
  - Minimum stock needed
  - Stock deficit (how much below minimum)
  - Stock percentage bar
  - Status badge (Out/Critical/Low/Medium/Adequate)
  - Manufacture button

Features:
  ✅ Sorted by stock deficit (highest first)
  ✅ Visual progress bar showing stock level
  ✅ Color-coded by severity
  ✅ Direct link to manufacturing module
```

#### 6. **Components/Analytics/BatchTraceabilitySearch.jsx**
```jsx
Search form for batch lookup

Features:
  ✅ Search by batch number (JUICE-20260217-001)
  ✅ Search by batch ID (numeric)
  ✅ Error handling and validation
  ✅ Loading state during API call
  ✅ Format examples and hints
```

#### 7. **Components/Analytics/DashboardChart.jsx**
```jsx
Placeholder for data visualization

Recommended Implementation:
  - Use Recharts or ApexCharts
  - Show manufacturing trends over time
  - Display sales by hour/day
  - Show stock levels trend
```

---

## 🗄️ Database Queries Reference

### Query 1: Total Manufactured Today
```php
// Sums quantity of all batches created today
Batch::selectRaw('COUNT(*) as batch_count, SUM(quantity) as total_quantity')
    ->whereDate('manufacturing_date', today())
    ->first();
```

### Query 2: Live Store Stock
```php
// Current stock = Total batches - Total sold quantity
$total = Batch::sum('quantity');
$sold = StockOutTransaction::sum('quantity');
$current = $total - $sold;
```

### Query 3: Sales Today
```php
// Count and sum stock-out transactions today
StockOutTransaction::selectRaw('COUNT(*) as transaction_count, SUM(quantity) as total_quantity')
    ->whereDate('created_at', today())
    ->first();
```

### Query 4: Low Stock Alerts
```php
// Using Product scope: lowStock()
Product::lowStock()->count();
// WHERE current_stock <= minimum_stock
```

### Query 5: Expiring Batches (Next 7 Days)
```php
// Join with stock_out_transactions to calculate remaining quantity
Batch::with(['product'])
    ->selectRaw('batches.id, batches.batch_number, ...
                 (batches.quantity - COALESCE(SUM(stock_out_transactions.quantity), 0)) as remaining_quantity')
    ->leftJoin('stock_out_transactions', 'batches.id', '=', 'stock_out_transactions.batch_id')
    ->whereDate('batches.expiry_date', '>=', today())
    ->whereDate('batches.expiry_date', '<=', today()->addDays(7))
    ->whereRaw('(batches.quantity - COALESCE(SUM(stock_out_transactions.quantity), 0)) > 0')
    ->groupBy('batches.id', ...)
    ->orderBy('batches.expiry_date', 'asc')
    ->get();
```

### Query 6: Batch Traceability
```php
// Get complete batch history with all transactions
$batch = Batch::with(['product', 'manufacturingOrder', 'stockOutTransactions.user'])
    ->where('id', $id)
    ->orWhere('batch_number', $number)
    ->first();

$transactions = $batch->stockOutTransactions()
    ->with('user')
    ->orderBy('created_at', 'asc')
    ->get();
```

---

## 🎯 Key Implementation Details

### Efficiency Metrics

✅ **Single Database Hit for Each Metric**
- Metrics cards use direct aggregation queries (COUNT, SUM)
- No N+1 query problems
- Database does the heavy lifting, not PHP

✅ **LEFT JOIN Strategy for Relationships**
- Expiring batches query uses LEFT JOIN to include batches with NO sales yet
- Single query instead of looping through each batch

✅ **Indexed Columns for Fast Lookups**
```sql
-- Already defined in migrations:
batches.index(['product_code', 'manufacturing_date'])
stock_out_transactions.index(['batch_id', 'created_at'])
stock_out_transactions.index(['created_at'])
```

### Data Integrity Features

✅ **Leakage Detection**
- Compares: current_quantity vs initial_quantity
- Detects theft, loss, or data inconsistency
- Shows negative stock warning

✅ **FIFO Implementation**
- Expiring batches sorted by expiry date ASC
- Store manager knows which batches to sell first
- Minimizes waste by selling oldest first

✅ **Transaction Traceability**
- Each stock-out transaction linked to user
- Timestamp for complete audit trail
- Reason and notes for context

---

## 📱 UI/UX Features

### Responsive Design
- 4 metric cards → 2 columns on tablet → 1 column on mobile
- Tables scroll horizontally on mobile
- Touch-friendly buttons and links

### Color Coding System
- 🟦 Blue: Information (manufacturing, actions)
- 🟩 Green: Positive (adequate stock, good status)
- 🟨 Yellow: Warning (medium urgency)
- 🟧 Orange: Alert (high urgency)
- 🟥 Red: Critical (immediate action needed)

### Interactive Elements
- Hover effects on table rows
- Click-to-expand batch details
- Quick action buttons to related modules
- Real-time search without page reload

---

## 🚀 Usage Instructions

### For Store Managers

1. **Check Dashboard Daily**
   - View today's manufacturing and sales
   - Identify expiring batches (red flags)
   - Check low stock products

2. **Handle Expiring Batches**
   - Click on "View Details" in expiry alert
   - See complete transaction history
   - Plan stock-out (sales) to minimize waste

3. **Restock When Needed**
   - Check "Low Stock Alerts" section
   - Click "Manufacture" to create new batches
   - Return to dashboard to confirm new stock

4. **Investigate Discrepancies**
   - Use "Batch Traceability" search
   - Compare initial vs current quantity
   - Review all transactions for that batch
   - Identify loss or theft

### For Administrators

1. **Monitor System Health**
   - Check if low stock alerts are processed quickly
   - Verify manufacturing orders are completed
   - Ensure labeling is done for all batches

2. **Audit Transactions**
   - Search specific batch using Batch Traceability
   - Review user who performed sales
   - Check for unusual patterns

3. **Generate Reports**
   - Use `/api/analytics/report` endpoint
   - Export daily/weekly/monthly summaries
   - Track trends and KPIs

---

## 📈 API Usage Examples

### JavaScript (Fetch)
```javascript
// Fetch all metrics
const response = await fetch('/api/analytics/metrics');
const { data } = await response.json();
console.log(data.totalManufacturedToday);

// Search batch
const batch = await fetch('/api/analytics/batch/JUICE-20260217-001');
const { data: batchData } = await batch.json();
console.log(batchData.stock_out_transactions);
```

### cURL
```bash
# Get metrics
curl http://localhost:8000/api/analytics/metrics

# Search batch
curl http://localhost:8000/api/analytics/batch/5

# Export report
curl http://localhost:8000/api/analytics/report > report.json
```

---

## 🔮 Future Enhancements

### Charts & Visualizations
- [ ] Daily manufacturing trend (Chart.js / Recharts)
- [ ] Sales by hour/day visualization
- [ ] Stock level trend over time
- [ ] Product category distribution

### Advanced Filtering
- [ ] Date range reports
- [ ] Filter by product category
- [ ] Filter by warehouse/store location
- [ ] Custom metric definitions

### Notifications
- [ ] Email alerts for expiring batches
- [ ] SMS alerts for critically low stock
- [ ] Push notifications for urgent actions
- [ ] Daily digest reports

### Integration
- [ ] Export to Excel/PDF
- [ ] Integration with accounting system
- [ ] Integration with e-commerce platform
- [ ] Third-party dashboard tools

---

## 🐛 Troubleshooting

### "Batch not found" Error
- Check batch number format: PRODUCT-YYYYMMDD-###
- Verify batch exists in database: `SELECT * FROM batches WHERE batch_number = '...';`

### Metrics showing incorrect values
- Ensure `current_stock` in products is updated when batches are created
- Check if stock_out transactions are properly recorded

### Performance Issues
- Ensure database indexes are created (see migrations)
- Check database query logs: `EXPLAIN SELECT ...`
- Optimize slow queries using `whereRaw()` or raw SQL

---

## 📝 File Structure

```
Manufacturing-Stock-System/
├── app/Http/Controllers/
│   └── AnalyticsController.php          ← Main backend logic
├── routes/
│   └── web.php                          ← API routes added here
├── resources/js/Pages/Analytics/
│   ├── Dashboard.jsx                    ← Main dashboard page
│   └── BatchTraceability.jsx            ← Traceability page
├── resources/js/Components/Analytics/
│   ├── MetricsCards.jsx
│   ├── ExpiryAlertsTable.jsx
│   ├── LowStockAlertsTable.jsx
│   ├── BatchTraceabilitySearch.jsx
│   └── DashboardChart.jsx
└── docs/
    └── ANALYTICS_MODULE.md              ← This file
```

---

## 🎓 Learning Resources

- **Laravel Aggregation:** https://laravel.com/docs/eloquent
- **Inertia.js:** https://inertiajs.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Hooks:** https://react.dev/reference/react

---

**Last Updated:** February 19, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
