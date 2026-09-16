package com.civic.complaints.config;

import com.civic.complaints.dto.ComplaintRequest;
import com.civic.complaints.dto.FeedbackRequest;
import com.civic.complaints.model.*;
import com.civic.complaints.repository.*;
import com.civic.complaints.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final AssignmentRepository assignmentRepository;
    private final ComplaintImageRepository imageRepository;
    private final PasswordEncoder passwordEncoder;
    private final ComplaintService complaintService;

    @Override
    @Transactional
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }

        log.info("Initializing Civic Complaint Management System seed data...");

        // 1. Seed Departments
        Department roadDept = departmentRepository.save(Department.builder()
                .name("Road & Infrastructure Department")
                .description("Responsible for asphalt repair, potholes, sidewalks, road dividers, and highway maintenance.")
                .icon("Road")
                .contactEmail("roads@civic.gov")
                .contactPhone("+91 20 2550 1101")
                .headName("Eng. Rajesh Gupta")
                .build());

        Department waterDept = departmentRepository.save(Department.builder()
                .name("Water Supply & Sewerage")
                .description("Oversees drinking water pipelines, leakage rectification, water supply pressure, and main connections.")
                .icon("Droplets")
                .contactEmail("water@civic.gov")
                .contactPhone("+91 20 2550 1102")
                .headName("Dr. Anita Kulkarni")
                .build());

        Department electricDept = departmentRepository.save(Department.builder()
                .name("Electricity & Street Lighting")
                .description("Maintains streetlights, power poles, electrical transformers, cable safety, and public illumination.")
                .icon("Zap")
                .contactEmail("electricity@civic.gov")
                .contactPhone("+91 20 2550 1103")
                .headName("Er. Nitin Shinde")
                .build());

        Department wasteDept = departmentRepository.save(Department.builder()
                .name("Solid Waste Management & Sanitation")
                .description("Handles community dustbins, waste collection trucks, illegal garbage dumping, and street sweeping.")
                .icon("Trash2")
                .contactEmail("waste@civic.gov")
                .contactPhone("+91 20 2550 1104")
                .headName("Smt. Vandana Chavan")
                .build());

        Department drainageDept = departmentRepository.save(Department.builder()
                .name("Stormwater & Drainage Department")
                .description("Maintains roadside storm gutters, open manholes, flood drain cleaning, and sewage channels.")
                .icon("Waves")
                .contactEmail("drainage@civic.gov")
                .contactPhone("+91 20 2550 1105")
                .headName("Er. Dilip Jadhav")
                .build());

        // 2. Seed Users
        // Admin
        User admin = userRepository.save(User.builder()
                .name("Civic Administrator")
                .email("admin@civic.gov")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 98220 11223")
                .role(Role.ADMIN)
                .build());

        // Employees
        User roadOfficer = userRepository.save(User.builder()
                .name("Ramesh Sharma")
                .email("road.officer@civic.gov")
                .password(passwordEncoder.encode("officer123"))
                .phone("+91 98221 22334")
                .role(Role.EMPLOYEE)
                .department(roadDept)
                .build());

        User waterOfficer = userRepository.save(User.builder()
                .name("Priya Patil")
                .email("water.officer@civic.gov")
                .password(passwordEncoder.encode("officer123"))
                .phone("+91 98222 33445")
                .role(Role.EMPLOYEE)
                .department(waterDept)
                .build());

        User electricOfficer = userRepository.save(User.builder()
                .name("Suresh Deshmukh")
                .email("electric.officer@civic.gov")
                .password(passwordEncoder.encode("officer123"))
                .phone("+91 98223 44556")
                .role(Role.EMPLOYEE)
                .department(electricDept)
                .build());

        User wasteOfficer = userRepository.save(User.builder()
                .name("Sunita More")
                .email("waste.officer@civic.gov")
                .password(passwordEncoder.encode("officer123"))
                .phone("+91 98224 55667")
                .role(Role.EMPLOYEE)
                .department(wasteDept)
                .build());

        // Citizens
        User ganesh = userRepository.save(User.builder()
                .name("Ganesh Borade")
                .email("ganesh@citizen.org")
                .password(passwordEncoder.encode("citizen123"))
                .phone("+91 98900 12345")
                .role(Role.CITIZEN)
                .build());

        User aarav = userRepository.save(User.builder()
                .name("Aarav Mehta")
                .email("citizen@civic.org")
                .password(passwordEncoder.encode("citizen123"))
                .phone("+91 98901 67890")
                .role(Role.CITIZEN)
                .build());

        // 3. Seed Realistic Complaints with full lifecycles, map coordinates & visual proof
        // Complaint 1: Pothole (HIGH, IN_PROGRESS)
        ComplaintRequest req1 = new ComplaintRequest();
        req1.setTitle("Large pothole near school entrance causing accidents");
        req1.setDescription("There is a large pothole near the primary school gate. School buses and two-wheelers are losing balance and vehicles are having severe difficulty passing.");
        req1.setLatitude(18.5204);
        req1.setLongitude(73.8567);
        req1.setAddress("FC Road, near Modern High School, Shivajinagar, Pune");
        complaintService.createComplaint(req1, ganesh, null);

        Complaint c1 = complaintRepository.findAll().get(0);
        c1.setStatus(ComplaintStatus.IN_PROGRESS);
        Assignment a1 = Assignment.builder()
                .complaint(c1)
                .department(roadDept)
                .employee(roadOfficer)
                .assignedAt(LocalDateTime.now().minusHours(4))
                .notes("Dispatched road maintenance asphalt mixer crew.")
                .build();
        assignmentRepository.save(a1);
        c1.setAssignment(a1);
        complaintService.recordStatusChange(c1, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.ASSIGNED, admin, "Assigned to Road Dept (Ramesh Sharma).");
        complaintService.recordStatusChange(c1, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, roadOfficer, "Road patch work started on site.");
        complaintRepository.save(c1);

        imageRepository.save(ComplaintImage.builder().complaint(c1).imageUrl("/uploads/pothole_before.svg").imageType(ImageType.BEFORE).build());
        imageRepository.save(ComplaintImage.builder().complaint(c1).imageUrl("/uploads/pothole_after.svg").imageType(ImageType.AFTER).build());

        // Complaint 2: Burst Water Pipe (CRITICAL, ASSIGNED)
        ComplaintRequest req2 = new ComplaintRequest();
        req2.setTitle("Major water pipeline has burst and water is flooding houses");
        req2.setDescription("High pressure drinking water line ruptured under pavement. Huge volume of water is gushing onto the street and flooding nearby ground floor houses and shops.");
        req2.setLatitude(18.5314);
        req2.setLongitude(73.8446);
        req2.setAddress("Senapati Bapat Road, near ICC Tech Park, Pune");
        complaintService.createComplaint(req2, aarav, null);

        Complaint c2 = complaintRepository.findAll().get(1);
        c2.setStatus(ComplaintStatus.ASSIGNED);
        Assignment a2 = Assignment.builder()
                .complaint(c2)
                .department(waterDept)
                .employee(waterOfficer)
                .assignedAt(LocalDateTime.now().minusHours(1))
                .notes("EMERGENCY: Valve shut-off ordered, repair crew dispatched.")
                .build();
        assignmentRepository.save(a2);
        c2.setAssignment(a2);
        complaintService.recordStatusChange(c2, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.ASSIGNED, admin, "Emergency high priority dispatch to Water Dept.");
        complaintRepository.save(c2);

        imageRepository.save(ComplaintImage.builder().complaint(c2).imageUrl("/uploads/water_leak_before.svg").imageType(ImageType.BEFORE).build());

        // Complaint 3: Street Light (RESOLVED, 5-Star Feedback, BEFORE & AFTER Evidence)
        ComplaintRequest req3 = new ComplaintRequest();
        req3.setTitle("Street light has not been working for the last 5 days");
        req3.setDescription("Four consecutive street light poles are dark near the community garden. Pedestrians and women feel unsafe walking after 8 PM.");
        req3.setLatitude(18.5089);
        req3.setLongitude(73.8260);
        req3.setAddress("Paud Road, near Joggers Park, Kothrud, Pune");
        complaintService.createComplaint(req3, ganesh, null);

        Complaint c3 = complaintRepository.findAll().get(2);
        c3.setStatus(ComplaintStatus.RESOLVED);
        Assignment a3 = Assignment.builder()
                .complaint(c3)
                .department(electricDept)
                .employee(electricOfficer)
                .assignedAt(LocalDateTime.now().minusDays(2))
                .completedAt(LocalDateTime.now().minusDays(1))
                .notes("Faulty underground cable spliced and LED drivers replaced on poles #12 to #15.")
                .build();
        assignmentRepository.save(a3);
        c3.setAssignment(a3);
        complaintService.recordStatusChange(c3, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, electricOfficer, "Electrical lineman team deployed with hydraulic lift.");
        complaintService.recordStatusChange(c3, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, electricOfficer, "Streetlights restored and tested.");
        complaintRepository.save(c3);

        imageRepository.save(ComplaintImage.builder().complaint(c3).imageUrl("/uploads/streetlight_before.svg").imageType(ImageType.BEFORE).build());
        imageRepository.save(ComplaintImage.builder().complaint(c3).imageUrl("/uploads/streetlight_after.svg").imageType(ImageType.AFTER).build());

        // Add feedback for Complaint 3
        FeedbackRequest fb = new FeedbackRequest();
        fb.setRating(5);
        fb.setComments("Prompt and effective repair! The lights are fully working now. Great work team!");
        complaintService.addFeedback(c3.getId(), ganesh, fb);

        // Complaint 4: Garbage Overflow (UNDER_REVIEW)
        ComplaintRequest req4 = new ComplaintRequest();
        req4.setTitle("Garbage container overflowing with street waste near vegetable market");
        req4.setDescription("The green community waste bins have not been emptied for 3 days. Animals are scattering the waste across the road causing severe stench.");
        req4.setLatitude(18.5074);
        req4.setLongitude(73.8077);
        req4.setAddress("Karve Nagar Market, Pune");
        complaintService.createComplaint(req4, aarav, null);

        Complaint c4 = complaintRepository.findAll().get(3);
        imageRepository.save(ComplaintImage.builder().complaint(c4).imageUrl("/uploads/garbage_before.svg").imageType(ImageType.BEFORE).build());

        // Complaint 5: Open Drain Hazard (HIGH, UNDER_REVIEW)
        ComplaintRequest req5 = new ComplaintRequest();
        req5.setTitle("Open storm drain manhole lid missing near bus stop");
        req5.setDescription("Cement cover of roadside stormwater drain broken and collapsed. It poses an immediate fall risk for commuters boarding the PMT bus.");
        req5.setLatitude(18.5362);
        req5.setLongitude(73.8300);
        req5.setAddress("Aundh Road, near Bremen Chowk, Pune");
        complaintService.createComplaint(req5, ganesh, null);

        Complaint c5 = complaintRepository.findAll().get(4);
        imageRepository.save(ComplaintImage.builder().complaint(c5).imageUrl("/uploads/drain_before.svg").imageType(ImageType.BEFORE).build());

        log.info("Seed data initialized successfully with 5 departments, 6 users, and 5 complaints with visual evidence across all lifecycle states.");
    }
}
