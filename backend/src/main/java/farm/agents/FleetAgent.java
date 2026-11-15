package farm.agents;

import farm.orchestrator.Assignment;
import farm.orchestrator.Job;
import farm.vehicles.Vehicle;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FleetAgent {

    public Optional<Assignment> assignJob(Job job, List<Vehicle> fleet) {
        return fleet.stream()
                .filter(v -> "IDLE".equalsIgnoreCase(v.getStatus()))
                .filter(v -> v.getCapabilities() != null && v.getCapabilities().contains(job.getRequiredCapability()))
                .findFirst()
                .map(vehicle -> {
                    vehicle.setStatus("BUSY");
                    job.setStatus("ASSIGNED");
                    return new Assignment(
                            UUID.randomUUID().toString().substring(0, 8),
                            job.getId(),
                            vehicle.getId(),
                            Instant.now(),
                            "Matched capability: " + job.getRequiredCapability()
                    );
                });
    }
}
