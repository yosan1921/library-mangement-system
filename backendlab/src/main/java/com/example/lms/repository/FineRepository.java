package com.example.lms.repository;

import com.example.lms.model.Fine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FineRepository extends MongoRepository<Fine, String> {
    List<Fine> findByMemberID(String memberID);
    List<Fine> findByStatus(String status);
    List<Fine> findByBorrowRecordID(String borrowRecordID);
}
