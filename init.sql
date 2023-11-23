CREATE TABLE Book (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

INSERT INTO Book (title)
VALUES
    ('Book A'),
    ('Book B'),
    ('Book C'),
    ('Book D');