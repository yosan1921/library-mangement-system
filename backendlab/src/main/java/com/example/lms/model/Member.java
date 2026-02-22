package com.example.lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.util.Date;

@Document(collection = "members")
public class Member {
    @Id
    private String id;
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    private String contact;
    
    @Indexed(unique = true)
    private String membershipID;
    
    private Boolean active;
    private String role;
    private Date createdAt;
    private Date updatedAt;

    // Default constructor for MongoDB
    public Member() {
        this.active = true;
        this.role = "member";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    
    public String getMembershipID() { return membershipID; }
    public void setMembershipID(String membershipID) { this.membershipID = membershipID; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
