package ru.s408766.shooter.lab3.utils;

import jakarta.faces.application.FacesMessage;
import jakarta.faces.component.UIComponent;
import jakarta.faces.context.FacesContext;
import jakarta.faces.validator.FacesValidator;
import jakarta.faces.validator.Validator;
import jakarta.faces.validator.ValidatorException;

@FacesValidator("radiusValidator")
public class RadiusValidator implements Validator {
    @Override
    public void validate(FacesContext context, UIComponent component, Object value) throws ValidatorException {
        try {
            double radius = Double.parseDouble(value.toString());
            if ((radius * 100) % 25 != 0) {
                throw new ValidatorException(new FacesMessage("Radius must be in 0.25 increments"));
            }
        } catch (NumberFormatException e) {
            throw new ValidatorException(new FacesMessage("Invalid radius format"));
        }
    }
}