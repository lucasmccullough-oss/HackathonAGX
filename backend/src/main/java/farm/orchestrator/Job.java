package farm.orchestrator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Job {
    private String id;
    private String fieldId;
    private String requiredCapability;
    private int priority;
    private String status;
}
