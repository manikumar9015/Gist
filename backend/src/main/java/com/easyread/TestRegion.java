package com.easyread;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

public class TestRegion {
    private static final List<String> REGIONS = List.of(
        "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
        "us-east-1", "us-east-2", "us-west-1", "us-west-2",
        "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
        "ca-central-1", "sa-east-1"
    );

    public static void main(String[] args) {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("PostgreSQL Driver not found: " + e.getMessage());
            System.exit(1);
        }

        String username = "postgres.jcocujuujnnoqrkkvejm";
        String password = "SaviDina@025*";

        for (String region : REGIONS) {
            String host = "aws-0-" + region + ".pooler.supabase.com";
            String url = "jdbc:postgresql://" + host + ":6543/postgres?connectTimeout=5";
            System.out.println("Trying region: " + region + " (" + host + ")...");
            try (Connection conn = DriverManager.getConnection(url, username, password)) {
                System.out.println("SUCCESS! Region is: " + region);
                System.exit(0);
            } catch (SQLException e) {
                String msg = e.getMessage();
                if (msg.contains("not found")) {
                    // Tenant not found in this region, continue
                    System.out.println("  Failed: tenant not found");
                } else if (msg.contains("password authentication failed")) {
                    System.out.println("  SUCCESS (Region found, password failed): " + region);
                    System.exit(0);
                } else {
                    System.out.println("  Error: " + msg);
                }
            }
        }
        System.out.println("All regions failed.");
    }
}
