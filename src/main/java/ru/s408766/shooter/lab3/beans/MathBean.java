package ru.s408766.shooter.lab3.beans;

import jakarta.annotation.ManagedBean;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;

@Named
@RequestScoped
public final class MathBean {
    private MathBean() {
    }

    public static double roundDecimal(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
