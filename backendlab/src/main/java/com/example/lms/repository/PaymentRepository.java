package com.example.lms.repository;

import com.example.lms.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByMemberID(String memberID);
    List<Payment> findByFineID(String fineID);
}
