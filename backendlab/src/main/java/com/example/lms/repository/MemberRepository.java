package com.example.lms.repository;

import com.example.lms.model.Member;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface MemberRepository extends MongoRepository<Member, String> {
    Optional<Member> findByMembershipID(String membershipID);
    Optional<Member> findByUsername(String username);
    Optional<Member> findByEmail(String email);
    List<Member> findByActive(Boolean active);
    List<Member> findByRole(String role);
}
