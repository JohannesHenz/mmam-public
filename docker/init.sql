CREATE DATABASE mmam;
\c mmam;

CREATE TABLE test (
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL
);

INSERT INTO test (name) VALUES ('lorem');
INSERT INTO test (name) VALUES ('ipsum');
INSERT INTO test (name) VALUES ('dolor');
INSERT INTO test (name) VALUES ('sit');
INSERT INTO test (name) VALUES ('amet');
INSERT INTO test (name) VALUES ('consectetur');
INSERT INTO test (name) VALUES ('adipiscing');
INSERT INTO test (name) VALUES ('elit');
INSERT INTO test (name) VALUES ('sed');
INSERT INTO test (name) VALUES ('do');
INSERT INTO test (name) VALUES ('eiusmod');
INSERT INTO test (name) VALUES ('tempor');