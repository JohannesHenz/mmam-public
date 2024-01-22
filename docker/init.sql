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

CREATE TABLE weather (
    id serial PRIMARY KEY,
    timestamp int NOT NULL,
    timezone int NOT NULL,
    longitude float NOT NULL,
    latitude float NOT NULL,

    weather_id int NOT NULL,
    weather_main varchar(255) NOT NULL,
    weather_description varchar(255) NOT NULL,
    weather_icon varchar(255) NOT NULL,

    main_temp float NOT NULL,
    main_pressure float NOT NULL,
    main_humidity float NOT NULL,
    main_temp_min float NOT NULL,
    main_temp_max float NOT NULL,

    wind_speed float NOT NULL,
    wind_deg float NOT NULL,
    wind_gust float NOT NULL,

    clouds_all int NOT NULL
);

CREATE TABLE station (
    id INT PRIMARY KEY,
    stationName varchar(255) NOT NULL
);

CREATE TABLE settings (
    id serial PRIMARY KEY,
    latitude float NOT NULL,
    longitude float NOT NULL,
    zoom float NOT NULL
);

CREATE TABLE haltepunkte (
    StopID VARCHAR(255) PRIMARY KEY,
    DIVA INTEGER,
    StopText VARCHAR(255) NOT NULL,
    Municipality VARCHAR(255),
    MunicipalityID INTEGER,
    Longitude FLOAT,
    Latitude FLOAT
);

INSERT INTO settings (latitude, longitude, zoom) VALUES (48.23944, 16.37725, 16);

