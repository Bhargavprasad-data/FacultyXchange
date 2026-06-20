-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "facultyId" VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Faculty',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  day VARCHAR(50) NOT NULL,
  period INTEGER NOT NULL,
  subject VARCHAR(255) NOT NULL,
  section VARCHAR(255) NOT NULL,
  room VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_faculty_day_period UNIQUE (faculty_id, day, period)
);

-- SubstituteClass table
CREATE TABLE IF NOT EXISTS substitute_class (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  section VARCHAR(255) NOT NULL,
  period INTEGER NOT NULL,
  classroom VARCHAR(255) NOT NULL,
  original_faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
  substitute_faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
  compensation_status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification table
CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'System',
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CompensationClass table
CREATE TABLE IF NOT EXISTS compensation_class (
  id SERIAL PRIMARY KEY,
  original_faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  substitute_faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  substitute_class_reference_id INTEGER NOT NULL REFERENCES substitute_class(id) ON DELETE CASCADE,
  class_date DATE NOT NULL,
  period INTEGER NOT NULL,
  subject VARCHAR(255) NOT NULL,
  section VARCHAR(255) NOT NULL,
  room VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
