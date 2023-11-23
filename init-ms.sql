CREATE DATABASE [dockerdb]
GO

USE [dockerdb];
GO

CREATE TABLE Book (
    id INT NOT NULL IDENTITY,
    title TEXT NOT NULL,
    PRIMARY KEY (id)
);
GO

INSERT INTO [Book] (title)
VALUES 
('Book A'),
('Book B'),
('Book C'),
('Book D');
GO