use ProjectDB;


---Get All Scores By ID [GET]
------------------------------------------------------------------------

GO
ALTER PROCEDURE spGetPlayerScores
    @UserId INT,
    @LevelId INT,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        FORMAT(played_at, 'dd/MM/yyyy') AS [DATE],
        
        RIGHT('0' + CAST(duration_seconds / 60 AS VARCHAR), 2) + ':' + 
        RIGHT('0' + CAST(duration_seconds % 60 AS VARCHAR), 2) AS [DURATION],
        
        CAST(ROUND((CAST(correct_answers AS FLOAT) / 30) * 100, 0) AS INT) AS [SUCCESS_RATE],
        
        CASE 
            WHEN (100 - ((30 - correct_answers) * 3) - 
                  CASE WHEN duration_seconds > 300 THEN (duration_seconds - 300) / 10 ELSE 0 END) < 10 
            THEN 10 
            ELSE (100 - ((30 - correct_answers) * 3) - 
                  CASE WHEN duration_seconds > 300 THEN (duration_seconds - 300) / 10 ELSE 0 END)
        END AS [SCORE]

    FROM game_results
    WHERE user_id = @UserId 
      AND level_id = @LevelId
      AND (@StartDate IS NULL OR played_at >= @StartDate)
      AND (@EndDate IS NULL OR played_at <= @EndDate)
    ORDER BY played_at DESC;
END;
GO


---Save Game Results [POST]

CREATE PROCEDURE spSaveGameResult
    @UserId INT,
    @CorrectAnswers INT,
    @DurationSeconds INT,
    @LevelId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Inserting the game data with a server-side timestamp
    INSERT INTO game_results (user_id, correct_answers, duration_seconds, level_id, played_at)
    VALUES (@UserId, @CorrectAnswers, @DurationSeconds, @LevelId, GETDATE());

    -- Return the ID of the new record
    SELECT SCOPE_IDENTITY() AS NewResultId;
END;
GO