package ru.s408766.shooter.lab3.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
public class ResultInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private double shotX;
    @Column(nullable = false)
    private double shotY;
    @Column(nullable = false)
    private double shapeRadius;
    @Column(nullable = false)
    private boolean result;
    @Column(nullable = false)
    private Date timestamp;
    @Column(nullable = false)
    private long executionTime;

    public ResultInfo(double shotX, double shotY, double shapeRadius, boolean result, Date timestamp, long executionTime) {
        this.shotX = shotX;
        this.shotY = shotY;
        this.shapeRadius = shapeRadius;
        this.result = result;
        this.timestamp = timestamp;
        this.executionTime = executionTime;
    }

    public static ResultInfo calculate(double shotX, double shotY, double shapeRadius) {
        long startTime = System.nanoTime();
        Date timestamp = new Date();
        boolean result = new Shape(shapeRadius).containsPoint(new Point(shotX, shotY));
        return new ResultInfo(shotX, shotY, shapeRadius, result, timestamp, System.nanoTime() - startTime);
    }
}
