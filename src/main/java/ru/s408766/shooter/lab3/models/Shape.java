package ru.s408766.shooter.lab3.models;

import ru.s408766.shooter.lab3.utils.InvalidParameterException;
import ru.s408766.shooter.lab3.utils.ProjectConstants;

import java.util.Arrays;

public class Shape {
    private final double radius;

    public Shape(double radius) throws InvalidParameterException {
        if (Arrays.stream(ProjectConstants.R_VALUES).noneMatch(allowedR -> allowedR == radius)) {
            throw new InvalidParameterException(String.format("Invalid shape radius, only values from %s are allowed", Arrays.toString(ProjectConstants.R_VALUES)));
        }
        this.radius = radius;
    }

    public boolean containsPoint(Point point) {
        if (point.x() <= 0 && point.y() > 0) {
            // Top left sector
            return point.y() <= Math.sqrt(Math.pow(radius / 2, 2) - Math.pow(point.x(), 2));
        } else if (point.x() <= 0 && point.y() <= 0) {
            // Bottom left sector
            return point.x() >= -radius / 2 && point.y() >= -radius;
        } else if (point.x() > 0 && point.y() <= 0) {
            // Bottom right sector
            return point.y() >= point.x() - radius / 2;
        } else {
            // Top right sector
            return false;
        }
    }

}
