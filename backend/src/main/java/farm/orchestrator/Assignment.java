package farm.orchestrator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Assignment {
    private String id;
    private String jobId;
    private String vehicleId;
    private Instant assignedAt;
    private String reason;
}
