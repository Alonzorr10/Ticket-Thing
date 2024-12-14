-- @block
CREATE TABLE Users
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    pw VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber INT NOT NULL
);

-- @block
ALTER TABLE Users MODIFY COLUMN phoneNumber VARCHAR(20);


-- @block
INSERT INTO USERS (email, username, pw, phoneNumber)
VALUES ('test@gmail.com', 'Alonzorr10', 'Nugg3t5!', '999-888-9350');

-- @block
INSERT INTO USERS (email, username, pw, phoneNumber)
VALUES ('test@example.us', 'Alonzorr10', '2024summer', '9998889350');

-- @block
INSERT INTO USERS (email, username, pw, phoneNumber)
VALUES ('teste@exemplo.us', 'Iloveboobs', 'summer2024', '9998889350');

-- @block
ALTER TABLE users ADD CONSTRAINT unique_username_email UNIQUE (username, email);


-- @block
CREATE INDEX email_index ON Users(email);


-- @block
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Nugg3t5!Alonzo';
FLUSH PRIVILEGES;

-- @block
SELECT * FROM users;