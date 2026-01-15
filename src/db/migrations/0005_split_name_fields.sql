-- Split name fields into first_name and last_name for instructors table
ALTER TABLE instructors ADD COLUMN first_name TEXT;
ALTER TABLE instructors ADD COLUMN last_name TEXT;

-- Migrate existing name data (split on first space)
UPDATE instructors
SET
  first_name = CASE
    WHEN name IS NULL THEN NULL
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM 1 FOR POSITION(' ' IN name) - 1)
    ELSE name
  END,
  last_name = CASE
    WHEN name IS NULL THEN NULL
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE name IS NOT NULL;

-- Drop old name column
ALTER TABLE instructors DROP COLUMN name;

-- Split studentName into studentFirstName and studentLastName for student_sessions table
ALTER TABLE student_sessions ADD COLUMN student_first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE student_sessions ADD COLUMN student_last_name TEXT NOT NULL DEFAULT '';

-- Migrate existing studentName data
UPDATE student_sessions
SET
  student_first_name = CASE
    WHEN POSITION(' ' IN student_name) > 0 THEN SUBSTRING(student_name FROM 1 FOR POSITION(' ' IN student_name) - 1)
    ELSE student_name
  END,
  student_last_name = CASE
    WHEN POSITION(' ' IN student_name) > 0 THEN SUBSTRING(student_name FROM POSITION(' ' IN student_name) + 1)
    ELSE ''
  END;

-- Drop old student_name column
ALTER TABLE student_sessions DROP COLUMN student_name;
