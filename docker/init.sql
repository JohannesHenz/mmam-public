CREATE DATABASE mmam;
\c mmam;

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

CREATE TABLE haltepunkte (
    id SERIAL PRIMARY KEY,
    StopID INTEGER,
    DIVA INTEGER,
    StopText VARCHAR(255) NOT NULL,
    Municipality VARCHAR(255),
    MunicipalityID INTEGER,
    Longitude FLOAT,
    Latitude FLOAT
);

CREATE TABLE stationoebb (
    id SERIAL PRIMARY KEY,
    stationID varchar(255) NOT NULL,
    stationName varchar(255) NOT NULL,
    longitude FLOAT,          -- Adding longitude column
    latitude FLOAT            -- Adding latitude column
);

CREATE TABLE settings (
    id serial PRIMARY KEY,
    latitude float NOT NULL,
    longitude float NOT NULL,
    zoom float NOT NULL
);

-- Add unique constraint on stationID for station table
ALTER TABLE stationoebb ADD CONSTRAINT station_id_unique UNIQUE (stationID);

-- Add unique constraint for weather table to avoid duplicate weather data
ALTER TABLE weather ADD CONSTRAINT weather_timestamp_longitude_latitude_unique UNIQUE (timestamp, longitude, latitude);

-- Insert default settings for the map
INSERT INTO settings (latitude, longitude, zoom) VALUES (48.23944, 16.37725, 16);

/*
-- Enable the pg_trgm extension for text similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index for faster similarity searches on haltepunkte table
CREATE INDEX IF NOT EXISTS idx_haltepunkte_name_trgm ON haltepunkte USING gin ("StopText" gin_trgm_ops);
*/