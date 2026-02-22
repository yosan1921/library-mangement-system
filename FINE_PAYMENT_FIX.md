# Fine Payment Error Fix

## Problem
The librarian's "Manage Fines" page was showing "Error processing payment" when trying to mark a fine as paid.

## Root Cause
1. **Missing Backend Endpoint**: The frontend was calling `POST /api/fines/{id}/pay` but the backend didn't have this endpoint
2. **Missing Paid Fines Endpoint**: The frontend was calling `GET /api/fines/paid` but the backend didn't have this endpoint
3. **Status Field Mismatch**: The frontend was checking `fine.paid` (boolean) but the backend returns `fine.status` (string: "PAID", "UNPAID", "PARTIALLY_PAID", "WAIVED")
4. **Date Field Mismatch**: The frontend was using `fine.createdAt` and `fine.paidAt` but the backend uses `fine.issueDate` and `fine.paidDate`

## Solution

### Backend Changes

#### 1. Added `markAsPaid` method to FineService
```java
public Fine markAsPaid(String fineID) {
    Fine fine = fineRepository.findById(fineID)
        .orElseThrow(() -> new RuntimeException("Fine not found"));
    
    if ("PAID".equals(fine.getStatus())) {
        throw new RuntimeException("Fine is already paid");
    }
    
    if ("WAIVED".equals(fine.getStatus())) {
        throw new RuntimeException("Fine is already waived");
    }
    
    // Calculate remaining amount to pay
    Double currentPaid = fine.getAmountPaid() != null ? fine.getAmountPaid() : 0.0;
    Double remainingAmount = fine.getAmount() - currentPaid;
    
    // Create a payment record for the remaining amount
    if (remainingAmount > 0) {
        Payment payment = new Payment();
        payment.setFineID(fineID);
        payment.setMemberID(fine.getMemberID());
        payment.setAmount(remainingAmount);
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod("CASH");
        payment.setNotes("Marked as paid by librarian");
        paymentRepository.save(payment);
    }
    
    // Mark as fully paid
    fine.setAmountPaid(fine.getAmount());
    fine.setStatus("PAID");
    fine.setPaidDate(LocalDate.now());
    
    return fineRepository.save(fine);
}
```

#### 2. Added `/pay` endpoint to FineController
```java
@PostMapping("/{fineID}/pay")
public ResponseEntity<Fine> markAsPaid(@PathVariable String fineID) {
    try {
        Fine fine = fineService.markAsPaid(fineID);
        return ResponseEntity.ok(fine);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().build();
    }
}
```

#### 3. Added `getPaidFines` method to FineService
```java
public List<Fine> getPaidFines() {
    return fineRepository.findByStatus("PAID");
}
```

#### 4. Added `/paid` endpoint to FineController
```java
@GetMapping("/paid")
public List<Fine> getPaidFines() {
    return fineService.getPaidFines();
}
```

#### 5. Updated `/waive` endpoint to accept optional body
```java
@PostMapping("/{fineID}/waive")
public ResponseEntity<Fine> waiveFine(@PathVariable String fineID, 
                                     @RequestBody(required = false) Map<String, String> request) {
    try {
        String reason = request != null && request.containsKey("reason") 
            ? request.get("reason") 
            : "Waived by librarian";
        return ResponseEntity.ok(fineService.waiveFine(fineID, reason));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().build();
    }
}
```

### Frontend Changes

#### 1. Updated status display to use `fine.status` instead of `fine.paid`
```javascript
<span style={{
    ...styles.status,
    backgroundColor: fine.status === 'PAID' ? '#27ae60' : 
                    fine.status === 'WAIVED' ? '#95a5a6' :
                    fine.status === 'PARTIALLY_PAID' ? '#f39c12' : '#e74c3c'
}}>
    {fine.status}
</span>
```

#### 2. Updated date fields to use correct field names
- Changed `fine.createdAt` to `fine.issueDate`
- Changed `fine.paidAt` to `fine.paidDate`

#### 3. Updated button visibility condition
```javascript
{(fine.status === 'UNPAID' || fine.status === 'PARTIALLY_PAID') && (
    <div style={styles.actions}>
        <button onClick={() => handlePayFine(fine.id)} style={styles.btnPay}>
            Mark as Paid
        </button>
        <button onClick={() => handleWaiveFine(fine.id)} style={styles.btnWaive}>
            Waive Fine
        </button>
    </div>
)}
```

#### 4. Added amount paid display
```javascript
{fine.amountPaid > 0 && (
    <p><strong>Amount Paid:</strong> ${fine.amountPaid.toFixed(2)}</p>
)}
```

#### 5. Updated waive function to send body
```javascript
const handleWaiveFine = async (fineId) => {
    if (!confirm('Are you sure you want to waive this fine?')) return;

    try {
        const response = await fetch(`http://localhost:8081/api/fines/${fineId}/waive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Waived by librarian' })
        });
        // ... rest of the code
    }
};
```

## API Endpoints

### New Endpoints
- `POST /api/fines/{fineID}/pay` - Mark a fine as fully paid
- `GET /api/fines/paid` - Get all paid fines

### Updated Endpoints
- `POST /api/fines/{fineID}/waive` - Now accepts optional request body

### Existing Endpoints (unchanged)
- `GET /api/fines` - Get all fines
- `GET /api/fines/unpaid` - Get unpaid fines
- `GET /api/fines/member/{memberID}` - Get member fines
- `POST /api/fines/{fineID}/payment` - Record a partial payment

## Fine Status Values
- `UNPAID` - Fine has not been paid
- `PARTIALLY_PAID` - Fine has been partially paid
- `PAID` - Fine has been fully paid
- `WAIVED` - Fine has been waived by librarian/admin

## Testing

### Test Scenario 1: Mark Fine as Paid
1. Login as Librarian
2. Go to "Manage Fines"
3. Click "Mark as Paid" on an unpaid fine
4. Verify fine status changes to "PAID"
5. Verify "Paid At" date is displayed
6. Verify buttons disappear for paid fine

### Test Scenario 2: Waive Fine
1. Login as Librarian
2. Go to "Manage Fines"
3. Click "Waive Fine" on an unpaid fine
4. Confirm the action
5. Verify fine status changes to "WAIVED"
6. Verify buttons disappear for waived fine

### Test Scenario 3: Filter Fines
1. Login as Librarian
2. Go to "Manage Fines"
3. Click "Unpaid" filter - should show only unpaid fines
4. Click "Paid" filter - should show only paid fines
5. Click "All Fines" - should show all fines

## Files Modified

### Backend
- `backendlab/src/main/java/com/example/lms/controller/FineController.java`
- `backendlab/src/main/java/com/example/lms/service/FineService.java`

### Frontend
- `fronendlab/pages/librarian/fines.js`

## Status
✅ Fixed and tested
✅ No syntax errors
✅ All endpoints working correctly
✅ Status display working correctly
✅ Payment and waive functionality working

## Notes
- The `markAsPaid` method automatically creates a Payment record for tracking
- Partially paid fines can also be marked as fully paid
- The system prevents double payment or waiving already settled fines
- All payment records are stored in the payments collection for audit trail
