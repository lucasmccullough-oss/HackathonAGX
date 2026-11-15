package farm.orchestrator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Field {
    private String id;
    private String name;
    private double latitude;
    private double longitude;
    private double areaHectares;
}
