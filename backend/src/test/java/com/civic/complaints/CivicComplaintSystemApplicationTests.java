package com.civic.complaints;

import com.civic.complaints.dto.ComplaintRequest;
import com.civic.complaints.dto.ComplaintResponse;
import com.civic.complaints.model.User;
import com.civic.complaints.repository.UserRepository;
import com.civic.complaints.service.ComplaintService;
import com.civic.complaints.controller.AIController;
import com.civic.complaints.service.ai.AIAnalysisResult;
import com.civic.complaints.service.ai.AIService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
class CivicComplaintSystemApplicationTests {

    @Autowired
    private AIService aiService;

    @Autowired
    private AIController aiController;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

	@Test
	void contextLoads() {
	}

    @Test
    void testAnalyzeComplaint() {
        AIAnalysisResult res = aiService.analyzeComplaint("Pothole on main road", "Large pothole near bus stand", 17.43, 78.44, null);
        System.out.println("AI RESULT IS: " + res);
    }

    @Test
    void testAnalyzeComplaintEndpoint() {
        Map<String, Object> map = new HashMap<>();
        map.put("title", "Pothole on main road");
        map.put("description", "Large pothole near bus stand");
        map.put("latitude", 17.43);
        map.put("longitude", 78.44);
        ResponseEntity<AIAnalysisResult> res = aiController.analyzeComplaint(map);
        System.out.println("CONTROLLER RESULT: " + res.getBody());
    }

    @Test
    void testCreateComplaint() {
        User citizen = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.civic.complaints.model.Role.CITIZEN)
                .findFirst()
                .orElseThrow();
        ComplaintRequest req = new ComplaintRequest();
        req.setTitle("Pothole on main road");
        req.setDescription("Large pothole near bus stand");
        req.setLatitude(17.43);
        req.setLongitude(78.44);
        ComplaintResponse resp = complaintService.createComplaint(req, citizen, null);
        System.out.println("COMPLAINT CREATED: #" + resp.getId() + " - " + resp.getTitle());
    }

    @Autowired
    private com.civic.complaints.repository.ComplaintRepository complaintRepository;

    @Test
    void testFindActiveComplaintsInBounds() {
        System.out.println("TESTING findActiveComplaintsInBounds...");
        var list = complaintRepository.findActiveComplaintsInBounds(17.0, 18.0, 78.0, 79.0);
        System.out.println("FOUND COMPLAINTS IN BOUNDS: " + list.size());
    }
}

