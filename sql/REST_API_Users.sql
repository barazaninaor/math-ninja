use ProjectDB;


---Get All Users (GET)
------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spGetAllUsers]
AS
BEGIN
    SELECT id, full_name, email, age, country, image_url, join_date
    FROM users;
END
GO

------------------------------------------------------------------------

---Get User By ID (GET)
------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spGetUserById]
    @theid INT
AS
BEGIN
    SELECT id, full_name, email, age, country, image_url, join_date
    FROM users
    WHERE id = @theid;
END
GO

EXEC spGetUserById 4
------------------------------------------------------------------------

---Add New User (POST)
------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spAddNewUser]
    @full_name NVARCHAR(255),
    @email VARCHAR(255),
    @password NVARCHAR(MAX),
    @age INT,
    @country NVARCHAR(100)
AS
BEGIN
    INSERT INTO users
        (full_name, email, password, age, country)
    VALUES
        (@full_name, @email, @password, @age, @country);
END
GO

EXEC spAddNewUser 
    'Moshe Levi', 
    'moshe@gmail.com', 
    'mySecurePassword123', 
    25, 
    'Israel';
    
------------------------------------------------------------------------
---Update User (PUT)
------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spUpdateUser]
    @theid INT,
    @full_name NVARCHAR(255),
    @password NVARCHAR(255) = NULL,
    @age INT,
    @country NVARCHAR(100)
AS
BEGIN
    UPDATE users
    SET full_name = @full_name, 
        age = @age, 
        country = @country,
        password = ISNULL(@password, password) 
    WHERE id = @theid;
END
GO

EXEC spUpdateUser 
    4,
    1234, 
    'Dan Biton', 
    26, 
    'Israel';
------------------------------------------------------------------------
---Delete User (DELETE)
------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spDeleteUserById]
    @theid INT
AS
BEGIN
    DELETE FROM users WHERE id = @theid;
END
GO

EXEC spDeleteUserById 6;

---------------------------------------------------------
-- 6) Get User By Email (Required for Login & JWT)
---------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [spGetUserByEmail]
    @email VARCHAR(255)
AS
BEGIN
    SELECT
        id,
        full_name,
        email,
        password,
        age,
        country,
        image_url,
        join_date
    FROM users
    WHERE email = @email;
END
GO

EXEC spGetUserByEmail 'alice@example.com';