package com.telenor.sw.minion.eye;
import static spark.Spark.*;

public class Main {
    public static void main(String[] args) {
	staticFileLocation("/html");
	
	get("/hello", (req, res) -> "Hello World");
    }
}
