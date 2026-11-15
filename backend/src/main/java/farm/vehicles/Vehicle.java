package farm.vehicles;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Vehicle {
    private String id;
    private String name;
    private List<String> capabilities;
    private double latitude;
    private double longitude;
    private String status;
}
