package com.easyread;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

public class TestTypes2 {
    @JdbcTypeCode(SqlTypes.VECTOR)
    private float[] testField;
}
