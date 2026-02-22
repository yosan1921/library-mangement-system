package com.example.lms.repository;

import com.example.lms.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByMemberID(String memberID);
    List<Reservation> findByBookID(String bookID);
    List<Reservation> findByStatus(String status);
}
