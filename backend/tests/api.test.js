import {
  randomUUID,
} from "crypto";

import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/database.js";

const testId =
  randomUUID();

const testUser = {
  name:
    "AzureDrop Test User",

  email:
    `azuredrop-test-${testId}@example.com`,

  password:
    "AzureDropTest123!",
};

let token;
let userId;

describe(
  "AzureDrop API",
  () => {
    describe(
      "General API",
      () => {
        test(
          "GET / returns AzureDrop information",
          async () => {
            const response =
              await request(
                app
              ).get("/");

            expect(
              response.statusCode
            ).toBe(200);

            expect(
              response.body
                .success
            ).toBe(true);

            expect(
              response.body
                .name
            ).toBe(
              "AzureDrop API"
            );

            expect(
              response.body
                .version
            ).toBe("1.0.0");
          }
        );

        test(
          "GET /health returns healthy dependency status",
          async () => {
            const response =
              await request(
                app
              ).get(
                "/health"
              );

            expect(
              response.statusCode
            ).toBe(200);

            expect(
              response.body
                .success
            ).toBe(true);

            expect(
              response.body
                .status
            ).toBe(
              "healthy"
            );

            expect(
              response.body
                .database
            ).toBe(
              "healthy"
            );

            expect(
              response.body
                .storage
            ).toBe(
              "healthy"
            );

            expect(
              response.body
                .storageProvider
            ).toBe(
              "azure_blob"
            );
          }
        );

        test(
          "Unknown route returns 404",
          async () => {
            const response =
              await request(
                app
              ).get(
                "/api/this-route-does-not-exist"
              );

            expect(
              response.statusCode
            ).toBe(404);

            expect(
              response.body
                .success
            ).toBe(false);

            expect(
              response.body
                .message
            ).toBe(
              "Route not found"
            );
          }
        );
      }
    );

    describe(
      "CORS",
      () => {
        test(
          "Configured frontend origin is allowed",
          async () => {
            const response =
              await request(
                app
              )
                .get("/")
                .set(
                  "Origin",
                  "http://localhost:5173"
                );

            expect(
              response.statusCode
            ).toBe(200);

            expect(
              response.headers[
                "access-control-allow-origin"
              ]
            ).toBe(
              "http://localhost:5173"
            );
          }
        );

        test(
          "Unconfigured browser origin is rejected",
          async () => {
            const response =
              await request(
                app
              )
                .get("/")
                .set(
                  "Origin",
                  "https://malicious.example"
                );

            expect(
              response.statusCode
            ).toBe(403);

            expect(
              response.body
                .success
            ).toBe(false);

            expect(
              response.body
                .message
            ).toBe(
              "Origin not allowed by CORS"
            );
          }
        );
      }
    );

    describe(
      "Authentication",
      () => {
        test(
          "Protected route rejects unauthenticated request",
          async () => {
            const response =
              await request(
                app
              ).get(
                "/api/auth/me"
              );

            expect(
              response.statusCode
            ).toBe(401);

            expect(
              response.body
                .success
            ).toBe(false);

            expect(
              response.body
                .message
            ).toBe(
              "Authentication required"
            );
          }
        );

        test(
          "POST /api/auth/register creates a user",
          async () => {
            const response =
              await request(
                app
              )
                .post(
                  "/api/auth/register"
                )
                .send(
                  testUser
                );

            expect(
              response.statusCode
            ).toBe(201);

            expect(
              response.body
                .success
            ).toBe(true);

            expect(
              response.body
                .message
            ).toBe(
              "Account created successfully"
            );

            expect(
              response.body
                .data.user
                .email
            ).toBe(
              testUser.email
            );

            expect(
              response.body
                .data.user
                .name
            ).toBe(
              testUser.name
            );

            expect(
              response.body
                .data.user
            ).not.toHaveProperty(
              "password_hash"
            );

            expect(
              response.body
                .data.token
            ).toBeDefined();

            token =
              response.body
                .data.token;

            userId =
              response.body
                .data.user.id;
          }
        );

        test(
          "Duplicate registration is rejected",
          async () => {
            const response =
              await request(
                app
              )
                .post(
                  "/api/auth/register"
                )
                .send(
                  testUser
                );

            expect(
              response.statusCode
            ).toBe(409);

            expect(
              response.body
                .success
            ).toBe(false);
          }
        );

        test(
          "Invalid login is rejected",
          async () => {
            const response =
              await request(
                app
              )
                .post(
                  "/api/auth/login"
                )
                .send({
                  email:
                    testUser.email,

                  password:
                    "DefinitelyWrong123!",
                });

            expect(
              response.statusCode
            ).toBe(401);

            expect(
              response.body
                .success
            ).toBe(false);

            expect(
              response.body
                .message
            ).toBe(
              "Invalid email or password"
            );
          }
        );

        test(
          "Valid login returns JWT",
          async () => {
            const response =
              await request(
                app
              )
                .post(
                  "/api/auth/login"
                )
                .send({
                  email:
                    testUser.email,

                  password:
                    testUser.password,
                });

            expect(
              response.statusCode
            ).toBe(200);

            expect(
              response.body
                .success
            ).toBe(true);

            expect(
              response.body
                .message
            ).toBe(
              "Login successful"
            );

            expect(
              response.body
                .data.token
            ).toBeDefined();

            expect(
              response.body
                .data.user
                .email
            ).toBe(
              testUser.email
            );

            token =
              response.body
                .data.token;
          }
        );

        test(
          "Authenticated user can access /api/auth/me",
          async () => {
            const response =
              await request(
                app
              )
                .get(
                  "/api/auth/me"
                )
                .set(
                  "Authorization",
                  `Bearer ${token}`
                );

            expect(
              response.statusCode
            ).toBe(200);

            expect(
              response.body
                .success
            ).toBe(true);

            expect(
              response.body
                .data.user
                .email
            ).toBe(
              testUser.email
            );

            expect(
              response.body
                .data.user.id
            ).toBe(
              userId
            );
          }
        );
      }
    );

    describe(
      "File API security",
      () => {
        test(
          "File listing requires authentication",
          async () => {
            const response =
              await request(
                app
              ).get(
                "/api/files"
              );

            expect(
              response.statusCode
            ).toBe(401);

            expect(
              response.body
                .success
            ).toBe(false);
          }
        );

        test(
          "File upload requires authentication",
          async () => {
            const response =
              await request(
                app
              ).post(
                "/api/files"
              );

            expect(
              response.statusCode
            ).toBe(401);

            expect(
              response.body
                .success
            ).toBe(false);
          }
        );
      }
    );
  }
);

afterAll(
  async () => {
    if (
      testUser.email
    ) {
      await pool.query(
        `
          DELETE FROM users
          WHERE email = $1
        `,
        [
          testUser.email,
        ]
      );
    }

    await pool.end();
  }
);
