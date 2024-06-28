DROP TABLE IF EXISTS userinfo CASCADE;
CREATE TABLE IF NOT EXISTS userinfo (
  user_id SERIAL PRIMARY KEY NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL
);

INSERT INTO userinfo (first_name, last_name, username, password, email) 
VALUES ('Lucas', 'Chernoff', 'mich8112', '1234', 'mich8112@colorado.edu');

