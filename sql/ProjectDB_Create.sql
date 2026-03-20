---------------------------------------------------------
-- 1) DESTRUCTION & CLEANING PHASE
---------------------------------------------------------
USE master;
GO

IF EXISTS (SELECT [name]
FROM sys.databases
WHERE [name] = N'ProjectDB')
BEGIN
    ALTER DATABASE ProjectDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ProjectDB;
END
GO

---------------------------------------------------------
-- 2) CREATION PHASE
---------------------------------------------------------
CREATE DATABASE ProjectDB;
GO

USE ProjectDB;
GO

CREATE TABLE users
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(MAX) NOT NULL,
    age INT NULL,
    country NVARCHAR(100) NULL,
    image_url NVARCHAR(MAX) DEFAULT 'https://em-content.zobj.net/source/google/439/distorted-face_1faea.png',
    join_date DATE DEFAULT CAST(GETDATE() AS DATE)
);
GO

---------------------------------------------------------
-- 3) INSERT DATA: USERS
---------------------------------------------------------
INSERT INTO users
    (full_name, email, password, age, country)
VALUES
    ('Alice Johnson', 'alice@example.com', 'hash123', 28, 'USA'),
    ('Bob Smith', 'bob@test.net', 'hash456', 35, 'UK'),
    ('Charlie Davis', 'charlie@gmail.com', 'hash789', 22, 'Canada'),
    ('Diana Prince', 'diana@wonder.com', 'hash000', 30, 'Themyscira'),
    ('Edward Norton', 'edward@fightclub.com', 'hash999', 42, 'USA');
GO





-- Step 1: Create the lookup table for difficulty levels
CREATE TABLE game_levels (
    id INT PRIMARY KEY, -- Manual ID (1, 2, 3, 4)
    level_name NVARCHAR(20) NOT NULL UNIQUE -- Difficulty name
);

-- Step 2: Populate the levels (MUST be done before adding results)
INSERT INTO game_levels (id, level_name) VALUES 
(1, 'Easy'),
(2, 'Medium'),
(3, 'Hard'),
(4, 'Insane');

SELECT * from game_levels;

-- Step 3: Create the main results table
CREATE TABLE game_results (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY, -- Unique game ID
    user_id INT NOT NULL, -- Link to users table
    correct_answers INT NOT NULL, -- Score out of 30
    duration_seconds INT NOT NULL, -- Time in seconds
    level_id INT NOT NULL, -- Link to game_levels table
    played_at DATETIME DEFAULT GETDATE(), -- Auto-timestamp
    
    -- Constraint: Delete results if user is deleted
    CONSTRAINT FK_UserResults FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
        
    -- Constraint: Ensure level_id exists in game_levels
    CONSTRAINT FK_GameLevel FOREIGN KEY (level_id) 
        REFERENCES game_levels(id)
);

-- Disable counting to speed up the batch insert
SET NOCOUNT ON;

-- First, clear all existing results for user 38 to start fresh
DELETE FROM game_results WHERE user_id = 38;

-- 30 Results for EASY (level_id = 1) - Spread from early 2025 to now
INSERT INTO game_results (user_id, correct_answers, duration_seconds, level_id, played_at) VALUES
(38, 15, 600, 1, '2025-01-10 10:00'), (38, 18, 550, 1, '2025-02-15 11:00'),
(38, 20, 500, 1, '2025-03-20 09:00'), (38, 22, 480, 1, '2025-04-05 14:00'),
(38, 25, 450, 1, '2025-05-12 16:00'), (38, 21, 440, 1, '2025-06-18 10:00'),
(38, 26, 420, 1, '2025-07-22 12:00'), (38, 28, 400, 1, '2025-08-30 08:00'),
(38, 24, 390, 1, '2025-09-15 15:00'), (38, 29, 370, 1, '2025-10-05 11:00'),
(38, 30, 350, 1, '2025-11-20 13:00'), (38, 27, 340, 1, '2025-12-01 17:00'),
(38, 29, 330, 1, '2025-12-15 09:00'), (38, 30, 310, 1, '2026-01-05 10:00'),
(38, 30, 300, 1, '2026-01-12 14:00'), (38, 30, 280, 1, '2026-01-20 11:00'),
(38, 30, 270, 1, '2026-01-25 16:00'), (38, 30, 260, 1, '2026-02-01 08:00'),
(38, 30, 250, 1, '2026-02-05 09:00'), (38, 30, 240, 1, '2026-02-10 10:00'),
(38, 30, 230, 1, '2026-02-12 11:00'), (38, 30, 220, 1, '2026-02-15 12:00'),
(38, 30, 210, 1, '2026-02-18 13:00'), (38, 30, 200, 1, '2026-02-22 14:00'),
(38, 30, 190, 1, '2026-02-25 15:00'), (38, 30, 180, 1, '2026-02-28 16:00'),
(38, 30, 175, 1, '2026-03-05 17:00'), (38, 30, 170, 1, '2026-03-08 18:00'),
(38, 30, 165, 1, '2026-03-12 19:00'), (38, 30, 160, 1, '2026-03-14 20:00');

-- 30 Results for MEDIUM (level_id = 2)
INSERT INTO game_results (user_id, correct_answers, duration_seconds, level_id, played_at) VALUES
(38, 10, 650, 2, '2025-01-15 10:00'), (38, 12, 630, 2, '2025-02-20 11:00'),
(38, 15, 600, 2, '2025-03-25 09:00'), (38, 17, 580, 2, '2025-04-10 14:00'),
(38, 20, 550, 2, '2025-05-15 16:00'), (38, 18, 540, 2, '2025-06-20 10:00'),
(38, 22, 520, 2, '2025-07-25 12:00'), (38, 24, 500, 2, '2025-08-15 08:00'),
(38, 21, 490, 2, '2025-09-20 15:00'), (38, 25, 470, 2, '2025-10-10 11:00'),
(38, 28, 450, 2, '2025-11-25 13:00'), (38, 26, 440, 2, '2025-12-05 17:00'),
(38, 27, 430, 2, '2025-12-20 09:00'), (38, 29, 410, 2, '2026-01-08 10:00'),
(38, 30, 400, 2, '2026-01-15 14:00'), (38, 28, 380, 2, '2026-01-25 11:00'),
(38, 30, 370, 2, '2026-01-30 16:00'), (38, 30, 360, 2, '2026-02-02 08:00'),
(38, 30, 350, 2, '2026-02-06 09:00'), (38, 30, 340, 2, '2026-02-11 10:00'),
(38, 30, 330, 2, '2026-02-13 11:00'), (38, 30, 320, 2, '2026-02-16 12:00'),
(38, 30, 310, 2, '2026-02-19 13:00'), (38, 30, 300, 2, '2026-02-23 14:00'),
(38, 30, 290, 2, '2026-02-26 15:00'), (38, 30, 280, 2, '2026-03-01 16:00'),
(38, 30, 270, 2, '2026-03-04 17:00'), (38, 30, 260, 2, '2026-03-09 18:00'),
(38, 30, 250, 2, '2026-03-12 19:00'), (38, 30, 240, 2, '2026-03-14 20:00');

-- 30 Results for HARD (level_id = 3)
INSERT INTO game_results (user_id, correct_answers, duration_seconds, level_id, played_at) VALUES
(38, 5, 700, 3, '2025-01-20 10:00'), (38, 8, 680, 3, '2025-02-25 11:00'),
(38, 10, 650, 3, '2025-03-30 09:00'), (38, 12, 630, 3, '2025-04-15 14:00'),
(38, 15, 600, 3, '2025-05-20 16:00'), (38, 14, 590, 3, '2025-06-25 10:00'),
(38, 18, 570, 3, '2025-07-30 12:00'), (38, 20, 550, 3, '2025-08-20 08:00'),
(38, 17, 540, 3, '2025-09-25 15:00'), (38, 22, 520, 3, '2025-10-15 11:00'),
(38, 25, 500, 3, '2025-11-30 13:00'), (38, 23, 490, 3, '2025-12-10 17:00'),
(38, 24, 480, 3, '2025-12-25 09:00'), (38, 26, 460, 3, '2026-01-10 10:00'),
(38, 28, 450, 3, '2026-01-18 14:00'), (38, 27, 430, 3, '2026-01-28 11:00'),
(38, 29, 420, 3, '2026-02-04 16:00'), (38, 30, 410, 3, '2026-02-08 08:00'),
(38, 30, 400, 3, '2026-02-12 09:00'), (38, 30, 390, 3, '2026-02-15 10:00'),
(38, 30, 380, 3, '2026-02-18 11:00'), (38, 30, 370, 3, '2026-02-21 12:00'),
(38, 30, 360, 3, '2026-02-24 13:00'), (38, 30, 350, 3, '2026-02-27 14:00'),
(38, 30, 340, 3, '2026-03-02 15:00'), (38, 30, 330, 3, '2026-03-05 16:00'),
(38, 30, 320, 3, '2026-03-08 17:00'), (38, 30, 310, 3, '2026-03-11 18:00'),
(38, 30, 300, 3, '2026-03-13 19:00'), (38, 30, 290, 3, '2026-03-14 20:00');

-- 30 Results for INSANE (level_id = 4)
INSERT INTO game_results (user_id, correct_answers, duration_seconds, level_id, played_at) VALUES
(38, 2, 800, 4, '2025-01-25 10:00'), (38, 4, 780, 4, '2025-02-28 11:00'),
(38, 6, 750, 4, '2025-03-31 09:00'), (38, 8, 730, 4, '2025-04-20 14:00'),
(38, 10, 700, 4, '2025-05-25 16:00'), (38, 9, 690, 4, '2025-06-30 10:00'),
(38, 12, 670, 4, '2025-07-15 12:00'), (38, 15, 650, 4, '2025-08-25 08:00'),
(38, 13, 640, 4, '2025-09-30 15:00'), (38, 16, 620, 4, '2025-10-20 11:00'),
(38, 18, 600, 4, '2025-11-15 13:00'), (38, 17, 590, 4, '2025-12-15 17:00'),
(38, 20, 580, 4, '2025-12-30 09:00'), (38, 22, 560, 4, '2026-01-15 10:00'),
(38, 24, 550, 4, '2026-01-22 14:00'), (38, 23, 530, 4, '2026-01-29 11:00'),
(38, 25, 520, 4, '2026-02-05 16:00'), (38, 27, 510, 4, '2026-02-09 08:00'),
(38, 28, 500, 4, '2026-02-13 09:00'), (38, 30, 490, 4, '2026-02-16 10:00'),
(38, 30, 480, 4, '2026-02-19 11:00'), (38, 30, 470, 4, '2026-02-22 12:00'),
(38, 30, 460, 4, '2026-02-25 13:00'), (38, 30, 450, 4, '2026-02-28 14:00'),
(38, 30, 440, 4, '2026-03-03 15:00'), (38, 30, 430, 4, '2026-03-06 16:00'),
(38, 30, 420, 4, '2026-03-09 17:00'), (38, 30, 410, 4, '2026-03-12 18:00'),
(38, 30, 400, 4, '2026-03-14 19:00'), (38, 30, 390, 4, '2026-03-15 01:00');


DECLARE @SelectedLevel INT = 1;

SELECT 
    FORMAT(played_at, 'dd/MM/yyyy') AS [DATE],
    RIGHT('0' + CAST(duration_seconds / 60 AS VARCHAR), 2) + ':' + 
    RIGHT('0' + CAST(duration_seconds % 60 AS VARCHAR), 2) AS [DURATION],
    CAST(ROUND((CAST(correct_answers AS FLOAT) / 30) * 100, 0) AS INT) AS [SUCCESS RATE],
    
    -- SCORE CALCULATION with Min Score of 10
    CASE 
        WHEN (100 - ((30 - correct_answers) * 3) - 
             CASE WHEN duration_seconds > 300 THEN (duration_seconds - 300) / 10 ELSE 0 END) < 10 
        THEN 10 -- Minimum Score
        ELSE (100 - ((30 - correct_answers) * 3) - 
             CASE WHEN duration_seconds > 300 THEN (duration_seconds - 300) / 10 ELSE 0 END)
    END AS [SCORE]

FROM game_results
WHERE user_id = 38 AND level_id =2
ORDER BY played_at DESC;

-- Replace 38 with the actual PlayerID you want to check
SELECT * FROM game_results
WHERE [user_id] = 38
ORDER BY played_at DESC;

DELETE FROM game_results 
WHERE [user_id] = 38;