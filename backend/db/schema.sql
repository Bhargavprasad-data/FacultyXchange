-- Faculty table
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable table
CREATE TABLE timetable (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SubstituteClass table
CREATE TABLE substitute_class (
  id SERIAL PRIMARY KEY,
  original_faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
  substitute_faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  period INTEGER,
  subject VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification table
CREATE TABLE notification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CompensationClass table
CREATE TABLE compensation_class (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Balance table
CREATE TABLE balance (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
