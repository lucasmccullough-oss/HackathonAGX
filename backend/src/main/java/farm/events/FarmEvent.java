package farm.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FarmEvent {
    private String id;
    private String type;
    private String sourceId;
    private String message;
    private Instant timestamp;
}
