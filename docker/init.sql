CREATE DATABASE mmam;
\c mmam;

CREATE TABLE test (
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL
);

INSERT INTO test (name) VALUES ('Hello World');