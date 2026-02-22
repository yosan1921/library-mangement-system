package com.example.lms.service;

import com.example.lms.model.Book;
import com.example.lms.model.BorrowRecord;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.BorrowRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowService {
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
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
        return borrowRecordRepository.save(record);
    }
    
    public BorrowRecord rejectBorrowRequest(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"PENDING".equals(record.getStatus())) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        record.setStatus("REJECTED");
        return borrowRecordRepository.save(record);
    }
    
    public List<BorrowRecord> getPendingRequests() {
        return borrowRecordRepository.findByStatus("PENDING");
    }
    
    public BorrowRecord returnBook(String recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (!"APPROVED".equals(record.getStatus())) {
            throw new RuntimeException("Only approved borrows can be returned");
        }
        
        Book book = bookRepository.findById(record.getBookID())
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        book.setCopiesAvailable(book.getCopiesAvailable() + 1);
        bookRepository.save(book);
        
        record.setReturnDate(LocalDate.now());
        record.setStatus("RETURNED");
        return borrowRecordRepository.save(record);
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
