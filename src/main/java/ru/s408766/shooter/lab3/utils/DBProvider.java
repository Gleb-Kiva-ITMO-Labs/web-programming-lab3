package ru.s408766.shooter.lab3.utils;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.persistence.TypedQuery;
import ru.s408766.shooter.lab3.models.ResultInfo;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class DBProvider {
    private volatile static DBProvider instance;
    private static EntityManagerFactory managerFactory;
    private static final Logger logger = Logger.getLogger(DBProvider.class.getName());

    private DBProvider() {
        try {
            managerFactory = Persistence.createEntityManagerFactory("default");
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error creating EntityManagerFactory", e);
        }
    }

    public static DBProvider getInstance() {
        if (instance == null) instance = new DBProvider();
        return instance;
    }

    public void sendOne(ResultInfo resultInfo) {
        EntityManager manager = null;
        try {
            manager = managerFactory.createEntityManager();
            manager.getTransaction().begin();
            manager.persist(resultInfo);
            manager.getTransaction().commit();
        } catch (Exception e) {
            if (manager != null && manager.getTransaction().isActive()) {
                manager.getTransaction().rollback();
            }
            logger.log(Level.SEVERE, "Error in sendOne", e);
        } finally {
            if (manager != null && manager.isOpen()) {
                manager.close();
            }
        }
    }

    public List<ResultInfo> getAll() {
        EntityManager manager = null;
        List<ResultInfo> results = null;
        try {
            manager = managerFactory.createEntityManager();
            TypedQuery<ResultInfo> query = manager.createQuery("SELECT r FROM ResultInfo r ORDER BY r.timestamp DESC", ResultInfo.class);
            results = query.getResultList();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in getAll", e);
            return List.of();
        } finally {
            if (manager != null && manager.isOpen()) {
                manager.close();
            }
        }
        return results;
    }

    public void clearAll() {
        EntityManager manager = null;
        try {
            manager = managerFactory.createEntityManager();
            manager.getTransaction().begin();
            manager.createQuery("DELETE FROM ResultInfo").executeUpdate();
            manager.getTransaction().commit();
        } catch (Exception e) {
            if (manager != null && manager.getTransaction().isActive()) {
                manager.getTransaction().rollback();
            }
            logger.log(Level.SEVERE, "Error in clearAll", e);
        } finally {
            if (manager != null && manager.isOpen()) {
                manager.close();
            }
        }
    }
}