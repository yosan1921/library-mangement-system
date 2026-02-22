package com.example.lms.service;

import com.example.lms.model.Member;
import com.example.lms.model.Book;
import com.example.lms.model.BorrowRecord;
import com.example.lms.model.Fine;
import com.example.lms.repository.MemberRepository;
import com.example.lms.repository.BookRepository;
import com.example.lms.repository.BorrowRecordRepository;
import com.example.lms.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private BorrowRecordRepository borrowRecordRepository;
    
    @Autowired
    private FineRepository fineRepository;
    
    @Autowired
    private SystemSettingsService systemSettingsService;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // Step 1: Member Registration
    public Member registerMember(Member member) {
        // Check if email already exists
        if (memberRepository.findByEmail(member.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        // Generate unique membership ID
        String membershipID = generateMembershipID();
        member.setMembershipID(membershipID);
        
        // Encrypt password
        member.setPassword(passwordEncoder.encode(member.getPassword()));
        
        // Set defaults
        member.setActive(true);
        member.setRole("member");
        member.setCreatedAt(new Date());
        member.setUpdatedAt(new Date());
        
        return memberRepository.save(member);
    }
    
    // Step 2: Member Authentication
    public Map<String, Object> authenticateMember(String email, String password) {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!member.getActive()) {
            throw new RuntimeException("Account is inactive");
        }
        
        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", member.getId());
        response.put("name", member.getName());
        response.put("email", member.getEmail());
        response.put("membershipID", member.getMembershipID());
        response.put("role", "member");
        
        return response;
    }
    
    // Step 3: Search Books
    public List<Book> searchBooks(String title, String author, String category) {
        List<Book> allBooks = bookRepository.findAll();
        
        return allBooks.stream()
            .filter(book -> {
                boolean matches = true;
                if (title != null && !title.isEmpty()) {
                    matches = matches && book.getTitle().toLowerCase().contains(title.toLowerCase());
                }
                if (author != null && !author.isEmpty()) {
                    matches = matches && book.getAuthor().toLowerCase().contains(author.toLowerCase());
                }
                if (category != null && !category.isEmpty()) {
                    matches = matches && book.getCategory().toLowerCase().contains(category.toLowerCase());
                }
                return matches;
            })
            .collect(Collectors.toList());
    }
    
    // Step 4: Borrow Book
    public BorrowRecord borrowBook(String memberId, String bookId) {
        // Validate member
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        
        if (!member.getActive()) {
            throw new RuntimeException("Member account is inactive");
        }
        
        // Validate book
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (book.getCopiesAvailable() <= 0) {
            throw new RuntimeException("Book is not available");
        }
        
        // Check if member has unpaid fines
        List<Fine> allFines = fineRepository.findByMemberID(memberId);
        List<Fine> unpaidFines = allFines.stream()
            .filter(fine -> "UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus()))
            .collect(Collectors.toList());
        
        if (!unpaidFines.isEmpty()) {
            throw new RuntimeException("Cannot borrow books with unpaid fines");
        }
        
        // Check if member already has this book (active borrows only)
        List<BorrowRecord> activeRecords = borrowRecordRepository.findByMemberID(memberId).stream()
            .filter(record -> record.getReturnDate() == null && "APPROVED".equals(record.getStatus()))
            .collect(Collectors.toList());
        
        boolean alreadyBorrowed = activeRecords.stream()
            .anyMatch(record -> record.getBookID().equals(bookId));
        
        if (alreadyBorrowed) {
            throw new RuntimeException("You have already borrowed this book");
        }
        
        // Create borrow record
        BorrowRecord record = new BorrowRecord();
        record.setMemberID(memberId);
        record.setBookID(bookId);
        record.setIssueDate(LocalDate.now());
        
        // Calculate due date (default 14 days)
        int borrowPeriod = systemSettingsService.getSettings().getBorrowDurationDays();
        record.setDueDate(LocalDate.now().plusDays(borrowPeriod));
        record.setStatus("PENDING");
        record.setOverdue(false);
        
        // Decrease available copies
        book.setCopiesAvailable(book.getCopiesAvailable() - 1);
        bookRepository.save(book);
        
        return borrowRecordRepository.save(record);
    }
    
    // Step 5: Return Book
    public Map<String, Object> returnBook(String borrowId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        if (record.getReturnDate() != null) {
            throw new RuntimeException("Book already returned");
        }
        
        // Mark as returned
        LocalDate returnDate = LocalDate.now();
        record.setReturnDate(returnDate);
        record.setStatus("RETURNED");
        borrowRecordRepository.save(record);
        
        // Increase available copies
        Book book = bookRepository.findById(record.getBookID())
            .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setCopiesAvailable(book.getCopiesAvailable() + 1);
        bookRepository.save(book);
        
        // Calculate fine if overdue
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Book returned successfully");
        response.put("borrowRecord", record);
        
        if (returnDate.isAfter(record.getDueDate())) {
            // Calculate overdue days
            long overdueDays = ChronoUnit.DAYS.between(record.getDueDate(), returnDate);
            
            // Calculate fine
            double finePerDay = systemSettingsService.getSettings().getFinePerDay();
            double fineAmount = overdueDays * finePerDay;
            
            // Create fine record
            Fine fine = new Fine();
            fine.setMemberID(record.getMemberID());
            fine.setBorrowRecordID(record.getId());
            fine.setAmount(fineAmount);
            fine.setAmountPaid(0.0);
            fine.setReason("Overdue return - " + overdueDays + " days late");
            fine.setStatus("UNPAID");
            fine.setIssueDate(LocalDate.now());
            fineRepository.save(fine);
            
            response.put("fine", fine);
            response.put("overdueDays", overdueDays);
            response.put("fineAmount", fineAmount);
        }
        
        return response;
    }
    
    // Step 6: Get Member History
    public List<BorrowRecord> getMemberHistory(String memberId) {
        return borrowRecordRepository.findByMemberID(memberId);
    }
    
    // Step 6: Get Member Notifications
    public List<Map<String, Object>> getMemberNotifications(String memberId) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        // Get active borrows (no return date and approved status)
        List<BorrowRecord> activeRecords = borrowRecordRepository.findByMemberID(memberId).stream()
            .filter(record -> record.getReturnDate() == null && "APPROVED".equals(record.getStatus()))
            .collect(Collectors.toList());
        
        for (BorrowRecord record : activeRecords) {
            Map<String, Object> notification = new HashMap<>();
            
            // Check if due soon (within 3 days)
            LocalDate today = LocalDate.now();
            LocalDate dueDate = record.getDueDate();
            long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);
            
            if (daysUntilDue <= 3 && daysUntilDue >= 0) {
                notification.put("type", "DUE_SOON");
                notification.put("message", "Book due in " + daysUntilDue + " days");
                notification.put("bookID", record.getBookID());
                notification.put("dueDate", record.getDueDate());
                notification.put("priority", "medium");
                notifications.add(notification);
            } else if (daysUntilDue < 0) {
                notification.put("type", "OVERDUE");
                notification.put("message", "Book is " + Math.abs(daysUntilDue) + " days overdue");
                notification.put("bookID", record.getBookID());
                notification.put("dueDate", record.getDueDate());
                notification.put("priority", "high");
                notifications.add(notification);
            }
        }
        
        // Get unpaid fines
        List<Fine> allFines = fineRepository.findByMemberID(memberId);
        List<Fine> unpaidFines = allFines.stream()
            .filter(fine -> "UNPAID".equals(fine.getStatus()) || "PARTIALLY_PAID".equals(fine.getStatus()))
            .collect(Collectors.toList());
        
        for (Fine fine : unpaidFines) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "UNPAID_FINE");
            notification.put("message", "You have an unpaid fine of $" + fine.getAmount());
            notification.put("amount", fine.getAmount());
            notification.put("reason", fine.getReason());
            notification.put("priority", "high");
            notifications.add(notification);
        }
        
        return notifications;
    }
    
    // Helper method to generate unique membership ID
    private String generateMembershipID() {
        String prefix = "MEM";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
        Random random = new Random();
        int randomNum = 1000 + random.nextInt(9000);
        return prefix + timestamp + randomNum;
    }
    
    // Existing methods
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public Optional<Member> getMemberById(String id) {
        return memberRepository.findById(id);
    }
    
    public Member addMember(Member member) {
        return memberRepository.save(member);
    }
    
    public Member updateMember(String id, Member memberDetails) {
        Member member = memberRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setName(memberDetails.getName());
        member.setContact(memberDetails.getContact());
        member.setEmail(memberDetails.getEmail());
        member.setMembershipID(memberDetails.getMembershipID());
        member.setActive(memberDetails.getActive());
        member.setRole(memberDetails.getRole());
        member.setUpdatedAt(new Date());
        return memberRepository.save(member);
    }
    
    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }
    
    public List<Member> getActiveMembers() {
        return memberRepository.findByActive(true);
    }
    
    public Optional<Member> getMemberByMembershipID(String membershipID) {
        return memberRepository.findByMembershipID(membershipID);
    }
}
