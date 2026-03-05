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
import java.util.Random;

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
        // Validate required fields
        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (member.getEmail() == null || member.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (member.getUsername() == null || member.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        
        // Validate email format
        if (!isValidEmail(member.getEmail())) {
            throw new RuntimeException("Please enter a valid email address (e.g., example@gmail.com)");
        }
        
        // Validate phone format if provided
        if (member.getContact() != null && !member.getContact().trim().isEmpty()) {
            if (!isValidPhoneNumber(member.getContact())) {
                throw new RuntimeException("Please enter a valid phone number (8-15 digits)");
            }
            // Store cleaned phone number (digits only)
            member.setContact(member.getContact().replaceAll("[^0-9]", ""));
        }
        
        // Check if email already exists
        if (memberRepository.findByEmail(member.getEmail().trim().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        // Check if username already exists
        if (memberRepository.findByUsername(member.getUsername().trim()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        
        // Generate unique membership ID
        String membershipID = generateMembershipID();
        member.setMembershipID(membershipID);
        
        // Normalize email to lowercase
        member.setEmail(member.getEmail().trim().toLowerCase());
        member.setUsername(member.getUsername().trim());
        member.setName(member.getName().trim());
        
        // Encrypt password if provided
        if (member.getPassword() != null && !member.getPassword().trim().isEmpty()) {
            if (member.getPassword().length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters");
            }
            member.setPassword(passwordEncoder.encode(member.getPassword()));
        }
        
        // Set defaults
        member.setActive(true);
        member.setRole("member");
        member.setCreatedAt(new Date());
        member.setUpdatedAt(new Date());
        
        return memberRepository.save(member);
    }
    
    // Step 2: Member Authentication (Enhanced to support username or email)
    public Map<String, Object> authenticateMember(String usernameOrEmail, String password) {
        Member member = null;
        
        // Try to find by username first
        Optional<Member> optMember = memberRepository.findByUsername(usernameOrEmail);
        if (optMember.isPresent()) {
            member = optMember.get();
        } else {
            // If not found by username, try by email (normalize to lowercase)
            optMember = memberRepository.findByEmail(usernameOrEmail.toLowerCase());
            if (optMember.isPresent()) {
                member = optMember.get();
            }
        }
        
        if (member == null) {
            throw new RuntimeException("Invalid username/email or password");
        }
        
        if (!member.getActive()) {
            throw new RuntimeException("Account is inactive");
        }
        
        if (member.getPassword() == null || !passwordEncoder.matches(password, member.getPassword())) {
            throw new RuntimeException("Invalid username/email or password");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", member.getId());
        response.put("name", member.getName());
        response.put("username", member.getUsername());
        response.put("email", member.getEmail());
        response.put("contact", member.getContact());
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
        // Validate required fields for new members
        if (member.getName() == null || member.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (member.getEmail() == null || member.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (member.getContact() == null || member.getContact().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }

        // Validate email format
        if (!isValidEmail(member.getEmail())) {
            throw new RuntimeException("Please enter a valid email address (e.g., example@gmail.com)");
        }

        // Validate phone format if provided
        if (member.getContact() != null && !member.getContact().trim().isEmpty()) {
            if (!isValidPhoneNumber(member.getContact())) {
                throw new RuntimeException("Please enter a valid phone number (8-15 digits)");
            }
            // Store cleaned phone number (digits only)
            member.setContact(member.getContact().replaceAll("[^0-9]", ""));
        }

        // Check for duplicate email (normalize to lowercase)
        member.setEmail(member.getEmail().trim().toLowerCase());
        if (memberRepository.findByEmail(member.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Check for duplicate username if provided
        if (member.getUsername() != null && !member.getUsername().trim().isEmpty()) {
            if (memberRepository.findByUsername(member.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
        } else {
            // Auto-generate username from email if not provided
            String emailPrefix = member.getEmail().split("@")[0];
            String baseUsername = emailPrefix.replaceAll("[^a-zA-Z0-9]", "");
            String username = baseUsername;
            int counter = 1;
            
            // Ensure username is unique
            while (memberRepository.findByUsername(username).isPresent()) {
                username = baseUsername + counter;
                counter++;
            }
            member.setUsername(username);
        }

        // Auto-generate membership ID if not provided
        if (member.getMembershipID() == null || member.getMembershipID().trim().isEmpty()) {
            String generatedID;
            do {
                generatedID = generateMembershipID();
            } while (memberRepository.findByMembershipID(generatedID).isPresent());
            member.setMembershipID(generatedID);
        } else {
            // Check for duplicate membership ID if one was provided
            if (memberRepository.findByMembershipID(member.getMembershipID()).isPresent()) {
                throw new RuntimeException("Membership ID already exists");
            }
        }

        // Set defaults for new members
        if (member.getActive() == null) {
            member.setActive(true);
        }
        if (member.getRole() == null || member.getRole().trim().isEmpty()) {
            member.setRole("MEMBER");
        }
        
        // Encrypt password if provided
        if (member.getPassword() != null && !member.getPassword().trim().isEmpty()) {
            member.setPassword(passwordEncoder.encode(member.getPassword()));
        }
        
        member.setCreatedAt(new Date());
        member.setUpdatedAt(new Date());

        return memberRepository.save(member);
    }

    
    public Member updateMember(String id, Member memberDetails) {
        Member member = memberRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        
        // For existing members, only validate if fields are being changed to non-empty values
        if (memberDetails.getName() != null && !memberDetails.getName().trim().isEmpty()) {
            member.setName(memberDetails.getName());
        }
        
        if (memberDetails.getEmail() != null && !memberDetails.getEmail().trim().isEmpty()) {
            // Validate email format if provided
            if (!isValidEmail(memberDetails.getEmail())) {
                throw new RuntimeException("Please enter a valid email address (e.g., example@gmail.com)");
            }
            // Normalize email to lowercase
            String normalizedEmail = memberDetails.getEmail().trim().toLowerCase();
            // Check for duplicate email (excluding current member)
            Optional<Member> existingMember = memberRepository.findByEmail(normalizedEmail);
            if (existingMember.isPresent() && !existingMember.get().getId().equals(id)) {
                throw new RuntimeException("Email already exists");
            }
            member.setEmail(normalizedEmail);
        }
        
        if (memberDetails.getContact() != null && !memberDetails.getContact().trim().isEmpty()) {
            // Validate phone format if provided
            if (!isValidPhoneNumber(memberDetails.getContact())) {
                throw new RuntimeException("Please enter a valid phone number (8-15 digits)");
            }
            // Store cleaned phone number
            member.setContact(memberDetails.getContact().replaceAll("[^0-9]", ""));
        }
        
        if (memberDetails.getMembershipID() != null && !memberDetails.getMembershipID().trim().isEmpty()) {
            // Check for duplicate membership ID (excluding current member)
            Optional<Member> existingMember = memberRepository.findByMembershipID(memberDetails.getMembershipID());
            if (existingMember.isPresent() && !existingMember.get().getId().equals(id)) {
                throw new RuntimeException("Membership ID already exists");
            }
            member.setMembershipID(memberDetails.getMembershipID());
        }
        
        if (memberDetails.getActive() != null) {
            member.setActive(memberDetails.getActive());
        }
        
        if (memberDetails.getRole() != null && !memberDetails.getRole().trim().isEmpty()) {
            member.setRole(memberDetails.getRole());
        }
        
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
    
    // Helper method for email validation
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // Enhanced email regex pattern that matches common email formats
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.trim().toLowerCase().matches(emailRegex);
    }
    
    // Helper method for phone validation
    private boolean isValidPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        // Remove all non-digit characters
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        // Check if it's a valid length (8-15 digits for international compatibility)
        return cleanPhone.length() >= 8 && cleanPhone.length() <= 15;
    }
}
