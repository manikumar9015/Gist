package com.easyread.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;
import java.sql.SQLException;

@Converter
public class VectorConverter implements AttributeConverter<String, PGobject> {

    @Override
    public PGobject convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            try {
                PGobject pgObject = new PGobject();
                pgObject.setType("vector");
                pgObject.setValue(null);
                return pgObject;
            } catch (SQLException e) {
                return null;
            }
        }
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("vector");
            pgObject.setValue(attribute);
            return pgObject;
        } catch (SQLException e) {
            throw new IllegalArgumentException("Failed to convert string to pgvector PGobject", e);
        }
    }

    @Override
    public String convertToEntityAttribute(PGobject dbData) {
        if (dbData == null) {
            return null;
        }
        return dbData.toString();
    }
}
