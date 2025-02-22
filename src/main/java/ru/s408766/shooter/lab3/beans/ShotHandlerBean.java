package ru.s408766.shooter.lab3.beans;


import com.google.gson.Gson;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.SessionScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.component.UIComponent;
import jakarta.faces.context.FacesContext;
import jakarta.faces.event.AjaxBehaviorEvent;
import jakarta.faces.validator.ValidatorException;
import jakarta.inject.Named;
import lombok.Getter;
import lombok.Setter;
import org.primefaces.PrimeFaces;

import ru.s408766.shooter.lab3.models.ResultInfo;
import ru.s408766.shooter.lab3.utils.DBProvider;
import ru.s408766.shooter.lab3.utils.ProjectConstants;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Named
@SessionScoped
@Getter
@Setter
public class ShotHandlerBean implements Serializable {
    private double shotXHidden;
    private double shotYHidden;
    private double shotX;
    private List<Double> shotXRange;
    private Map<Double, Boolean> xSelectionMap = new HashMap<>();
    private String xValidationMessage = "X is not selected";
    private double shotY;
    private double shapeRadius;
    private ArrayList<ResultInfo> shots;

    @PostConstruct
    public void init() {
        System.out.println("ShotHandlerBean.init() - START");
        shotX = Double.NaN;
        shotY = Double.NaN;
        shotXRange = new ArrayList<>();
        for (double current = ProjectConstants.MIN_X; current <= ProjectConstants.MAX_X; current += 1.0) {
            shotXRange.add(current);
            xSelectionMap.put(current, false);
        }
        shotX = Double.NaN;
        shotY = 0;
        shapeRadius = 3;
        List<ResultInfo> fetchedShots = DBProvider.getInstance().getAll();
        if (fetchedShots == null) {
            shots = new ArrayList<>();
        } else {
            shots = new ArrayList<>(fetchedShots);
        }
    }

    public void addShot(double shotX, double shotY) {
        try {
            PrimeFaces.current().executeScript("console.log(document.getElementById('graph-view').innerHTML);");
            ResultInfo resultInfo = ResultInfo.calculate(shotX, shotY, this.shapeRadius);
            shots.add(resultInfo);
            DBProvider.getInstance().sendOne(resultInfo);
            executeRenderAll();
            PrimeFaces.current().ajax().update("result");
        } catch (Exception e) {
            addErrorMessage("Error while calculation", e.getMessage());
            showErrorDialog();
        }
    }

    public void updateSvg() {
        PrimeFaces.current().ajax().update("graph-component");
    }

    public void handleXSelectionChange(AjaxBehaviorEvent event) {
        boolean fl = false;
        for (Map.Entry<Double, Boolean> entry : xSelectionMap.entrySet()) {
            if (entry.getValue() && entry.getKey() != shotX) {
                fl = true;
                shotX = entry.getKey();
                xSelectionMap.forEach((k, v) -> xSelectionMap.put(k, false));
                xSelectionMap.put(shotX, true);
                xValidationMessage = "";
                break;
            }
        }
        if (fl) return;
        xValidationMessage = "X is not selected";
        shotX = Double.NaN;
    }

    public void validateXSelection(FacesContext context, UIComponent component, Object value) {
        if (xSelectionMap.containsValue(true)) return;
        FacesMessage message = new FacesMessage("Please select at least one X coordinate");
        message.setSeverity(FacesMessage.SEVERITY_ERROR);
        throw new ValidatorException(message);
    }

    public void setShapeRadius(double shapeRadius) {
        if (this.shapeRadius == shapeRadius) return;
        this.shapeRadius = shapeRadius;
        executeRenderAll();
    }

    private void executeRenderAll() {
        String script = String.format("renderAll(%s, '%s');", shapeRadius, getShotsAsJson());
        PrimeFaces.current().executeScript(script);
    }

    public String getShotsAsJson() {
        return new Gson().toJson(shots);
    }

    public void reset() {
        DBProvider.getInstance().clearAll();
        this.shots.clear();
        executeRenderAll();
    }

    private void addErrorMessage(String summary, String detail) {
        FacesMessage message = new FacesMessage(FacesMessage.SEVERITY_ERROR, summary, detail);
        FacesContext.getCurrentInstance().addMessage(null, message);
    }

    private void showErrorDialog() {
        PrimeFaces.current().executeScript("PF('errorDialog').show()");
    }


}
