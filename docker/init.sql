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

CREATE TABLE journeys (
    id SERIAL PRIMARY KEY,
    head_text VARCHAR(255),
    station_name VARCHAR(255),
    station_eva_id VARCHAR(10),
    board_type VARCHAR(10),
    img_path VARCHAR(255),
    icon_products_sub_path VARCHAR(50),
    rt_info BOOLEAN,
    journey_id INTEGER REFERENCES journey(id),
    max_j INTEGER
);

CREATE TABLE journey (
    id PRIMARY KEY,
    journey_id INTEGER REFERENCES journeys(id),
    ti TIME,
    da DATE,
    pr VARCHAR(10),
    st VARCHAR(255),
    last_stop VARCHAR(255),
    ati TIME,
    tr VARCHAR(10),
    tr_chg BOOLEAN,
    rt BOOLEAN,
    rta BOOLEAN
);


CREATE TABLE settings (
    id serial PRIMARY KEY,
    latitude float NOT NULL,
    longitude float NOT NULL,
    zoom float NOT NULL
);

INSERT INTO settings (latitude, longitude, zoom) VALUES (48.23944, 16.37725, 16);

