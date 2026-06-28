package com.easyread;
import org.hibernate.annotations.JdbcTypeCode;
import java.sql.Types;

public class TestTypes {
    @JdbcTypeCode(Types.OTHER)
    private String testField;
}
