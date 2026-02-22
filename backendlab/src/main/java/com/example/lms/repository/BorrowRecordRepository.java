package com.example.lms.repository;

import com.example.lms.model.BorrowRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends MongoRepository<BorrowRecord, String> {
    List<BorrowRecord> findByMemberID(String memberID);
    List<BorrowRecord> findByBookID(String bookID);
    List<BorrowRecord> findByReturnDateIsNull();
    List<BorrowRecord> findByOverdue(Boolean overdue);
    List<BorrowRecord> findByStatus(String status);
}
