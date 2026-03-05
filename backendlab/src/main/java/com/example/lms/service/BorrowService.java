package com.example.lms.service;

import com.example.lms.model.Book;
import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Member;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.BorrowRecordRepository;
import com.example.lms.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

//@Service
public class BorrowService {
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    @Autowired(required = false)
    private FineService fineService;
    
    public BorrowRecord issueBook(String memberID, String bookID) {
        // Validate inputs
        if (memberID == null || memberID.isEmpty()) {
            throw new RuntimeException("Member ID is required");
        }
        if (bookID == null || bookID.isEmpty()) {
            throw new RuntimeException("Book ID is required");
        }
        
        Book book = bookRepository.findById(bookID)
            .orElseThrow(() -> new RuntimeException("Book not found with ID: " + bookID));
        
        if (book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }
        
        BorrowRecord record = new BorrowRecord();
        record.setMemberID(memberID);
        record.setBookID(bookID);
        record.setIssueDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(14));
        record.setOverdue(false);
        record.setStatus("PENDING");
        
        return borrowRecordRepository.save(record);
    }
    
    public BorrowRecord approveBorrowRequest(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"PENDING".equals(record.getStatus())) {
            throw new RuntimeException("Only pending requests can be approved");
        }
        
        // Validate bookID is not null
        if (record.getBookID() == null || record.getBookID().isEmpty()) {
            throw new RuntimeException("Invalid borrow record: Book ID is missing");
        }
        
        Book book = bookRepository.findById(record.getBookID())
            .orElseThrow(() -> new RuntimeException("Book not found with ID: " + record.getBookID() + ". Please check if the book exists in the system."));
        
        if (book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }
        
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepository.save(book);
        
        record.setStatus("APPROVED");
        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        
        // Send borrow approval notification
        if (notificationService != null) {
            try {
                Optional<Member> optMember = memberRepository.findById(record.getMemberID());
                if (optMember.isPresent()) {
                    notificationService.createBorrowApprovalNotification(savedRecord, optMember.get(), book);
                }
            } catch (Exception e) {
                System.err.println("Failed to send borrow approval notification: " + e.getMessage());
            }
        }
        
        return savedRecord;
    }
    
    public BorrowRecord rejectBorrowRequest(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"PENDING".equals(record.getStatus())) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        record.setStatus("REJECTED");
        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        
        // Send borrow rejection notification
        if (notificationService != null) {
            try {
                Optional<Member> optMember = memberRepository.findById(record.getMemberID());
                Optional<Book> optBook = bookRepository.findById(record.getBookID());
                if (optMember.isPresent() && optBook.isPresent()) {
                    notificationService.createBorrowRejectionNotification(savedRecord, optMember.get(), optBook.get());
                }
            } catch (Exception e) {
                System.err.println("Failed to send borrow rejection notification: " + e.getMessage());
            }
        }
        
        return savedRecord;
    }
    
    public List<BorrowRecord> getPendingRequests() {
        return borrowRecordRepository.findByStatus("PENDING");
    }
    
    /**
     * Return book with condition assessment and automatic fine calculation
     */
    public BorrowRecord returnBook(String recordId, String bookCondition, String conditionNotes) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Only approved borrows can be returned");
        }
        
        Book book = bookRepository.findById(record.getBookID())
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Set return details
        record.setReturnDate(LocalDate.now());
        record.setBookCondition(bookCondition != null ? bookCondition : "GOOD");
        record.setConditionNotes(conditionNotes);
        
        // Determine status based on condition and due date
        LocalDate today = LocalDate.now();
        boolean isOverdue = record.getDueDate() != null && today.isAfter(record.getDueDate());
        
        if ("DAMAGED".equals(bookCondition)) {
            record.setStatus("DAMAGED");
        } else if ("LOST".equals(bookCondition)) {
            record.setStatus("LOST");
        } else if (isOverdue) {
            record.setStatus("RETURNED");
            record.setOverdue(true);
        } else {
            record.setStatus("RETURNED");
            record.setOverdue(false);
        }
        
        // Update book availability (except for lost books)
        if (!"LOST".equals(bookCondition)) {
            book.setCopiesAvailable(book.getCopiesAvailable() + 1);
            bookRepository.save(book);
        }
        
        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        
        // Automatically create fine if applicable
        if (fineService != null) {
            try {
                if (isOverdue || "DAMAGED".equals(bookCondition) || "LOST".equals(bookCondition)) {
                    fineService.calculateAndCreateAutomaticFine(recordId);
                }
            } catch (Exception e) {
                System.err.println("Failed to create automatic fine: " + e.getMessage());
            }
        }
        
        // Send return confirmation notification
        if (notificationService != null) {
            try {
                Optional<Member> optMember = memberRepository.findById(record.getMemberID());
                if (optMember.isPresent()) {
                    notificationService.createBookReturnConfirmationNotification(savedRecord, optMember.get(), book);
                }
            } catch (Exception e) {
                System.err.println("Failed to send book return confirmation notification: " + e.getMessage());
            }
        }
        
        return savedRecord;
    }
    
    /**
     * Legacy return method - defaults to good condition
     */
    public BorrowRecord returnBook(String recordId) {
        return returnBook(recordId, "GOOD", null);
    }
    
    /**
     * Mark book as lost and create fine
     */
    public BorrowRecord markBookAsLost(String recordId, String notes) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Only approved borrows can be marked as lost");
        }
        
        // Update record
        record.setStatus("LOST");
        record.setBookCondition("LOST");
        record.setConditionNotes(notes);
        record.setReturnDate(null); // Lost books are not returned
        
        BorrowRecord savedRecord = borrowRecordRepository.save(record);
        
        // Create fine automatically
        if (fineService != null) {
            try {
                fineService.createLostBookFine(recordId, notes);
            } catch (Exception e) {
                System.err.println("Failed to create lost book fine: " + e.getMessage());
            }
        }
        
        // Send notification
        if (notificationService != null) {
            try {
                Optional<Member> optMember = memberRepository.findById(record.getMemberID());
                if (optMember.isPresent()) {
                    // Create a custom notification for lost book
                    notificationService.createCustomNotification(
                        record.getMemberID(),
                        "Lost Book Fine Applied",
                        String.format("A fine has been applied to your account for the lost book. Please contact the library to resolve this matter."),
                        "LOST_BOOK_FINE"
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send lost book notification: " + e.getMessage());
            }
        }
        
        return savedRecord;
    }
    
    public List<BorrowRecord> getMemberBorrowHistory(String memberID) {
        return borrowRecordRepository.findByMemberID(memberID);
    }
    
    public List<BorrowRecord> getActiveBorrows() {
        return borrowRecordRepository.findByReturnDateIsNull();
    }
    
    public List<BorrowRecord> getOverdueBooks() {
        return borrowRecordRepository.findByOverdue(true);
    }


    public List<BorrowRecord> getInvalidBorrowRecords() {
        List<BorrowRecord> allRecords = borrowRecordRepository.findAll();
        List<BorrowRecord> invalidRecords = new java.util.ArrayList<>();

        for (BorrowRecord record : allRecords) {
            // Check if bookID is null or empty
            if (record.getBookID() == null || record.getBookID().isEmpty()) {
                invalidRecords.add(record);
                continue;
            }

            // Check if book exists
            if (!bookRepository.existsById(record.getBookID())) {
                invalidRecords.add(record);
            }
        }

        return invalidRecords;
    }

    public void deleteInvalidBorrowRecord(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        // Verify it's actually invalid before deleting
        if (record.getBookID() == null || record.getBookID().isEmpty() ||
            !bookRepository.existsById(record.getBookID())) {
            borrowRecordRepository.deleteById(recordId);
        } else {
            throw new RuntimeException("Cannot delete valid borrow record");
        }
    }

    public int cleanupAllInvalidRecords() {
        List<BorrowRecord> invalidRecords = getInvalidBorrowRecords();
        int count = invalidRecords.size();

        for (BorrowRecord record : invalidRecords) {
            borrowRecordRepository.deleteById(record.getId());
        }

        return count;
    }

}
