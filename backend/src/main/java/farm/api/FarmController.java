package farm.api;

import farm.agents.FleetAgent;
import farm.orchestrator.Assignment;
import farm.orchestrator.Field;
import farm.orchestrator.Job;
import farm.vehicles.Vehicle;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class FarmController {

    private final FleetAgent fleetAgent;
    private final List<Vehicle> vehicles = new ArrayList<>();
    private final List<Field> fields = new ArrayList<>();
    private final List<Job> jobs = new ArrayList<>();
    private final List<Assignment> assignments = new ArrayList<>();

    public FarmController(FleetAgent fleetAgent) {
        this.fleetAgent = fleetAgent;
        vehicles.add(new Vehicle("V-1", "John Deere 8R (Plow/Seed)", List.of("PLOW", "SEED"), 32.2226, -110.9747, "IDLE"));
        vehicles.add(new Vehicle("V-2", "Case IH Patriot (Sprayer)", List.of("SPRAY"), 32.2230, -110.9752, "IDLE"));
        fields.add(new Field("F-1", "North Pivot Field", 32.2240, -110.9760, 45.0));
        fields.add(new Field("F-2", "South Valley Plot", 32.2210, -110.9735, 30.0));
    }

    @GetMapping("/vehicles")
    public List<Vehicle> getVehicles() { return vehicles; }

    @GetMapping("/fields")
    public List<Field> getFields() { return fields; }

    @GetMapping("/jobs")
    public List<Job> getJobs() { return jobs; }

    @GetMapping("/assignments")
    public List<Assignment> getAssignments() { return assignments; }

    @PostMapping("/jobs")
    public Job createJob(@RequestBody Job job) {
        if (job.getId() == null || job.getId().isBlank()) {
            job.setId("J-" + UUID.randomUUID().toString().substring(0, 6));
        }
        job.setStatus("PENDING");
        jobs.add(job);
        fleetAgent.assignJob(job, vehicles).ifPresent(assignments::add);
        return job;
    }
}
