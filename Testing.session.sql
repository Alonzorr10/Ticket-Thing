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
CREATE INDEX email_index ON Users(email);
