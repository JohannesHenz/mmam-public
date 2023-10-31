CREATE DATABASE mmam;
\c mmam;

CREATE TABLE test (
    id serial PRIMARY KEY,
    name varchar(255) NOT NULL,
    value varchar(255) NOT NULL,
    DATE date NOT NULL
);

INSERT INTO test (name, value, DATE) VALUES ('name1', 'value1', '2018-01-01');
INSERT INTO test (name, value, DATE) VALUES ('name2', 'value2', '2018-01-02');
INSERT INTO test (name, value, DATE) VALUES ('name3', 'value3', '2018-01-03');
INSERT INTO test (name, value, DATE) VALUES ('name4', 'value4', '2018-01-04');
INSERT INTO test (name, value, DATE) VALUES ('name5', 'value5', '2018-01-05');
INSERT INTO test (name, value, DATE) VALUES ('name6', 'value6', '2018-01-06');
INSERT INTO test (name, value, DATE) VALUES ('name7', 'value7', '2018-01-07');
INSERT INTO test (name, value, DATE) VALUES ('name8', 'value8', '2018-01-08');
