import { mysqlTable, varchar, int, timestamp, text, mysqlEnum, json, unique } from 'drizzle-orm/mysql-core';

// Doctors Table
export const doctors = mysqlTable('doctors', {
  id: int('id').primaryKey().autoincrement(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  licenseNumber: varchar('license_number', { length: 100 }).notNull().unique(),
  specialization: varchar('specialization', { length: 100 }).notNull(),
  hospital: varchar('hospital', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Patients Table
export const patients = mysqlTable('patients', {
  id: int('id').primaryKey().autoincrement(),
  doctorId: int('doctor_id').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  age: int('age'),
  gender: mysqlEnum('gender', ['Male', 'Female', 'Other']),
  address: text('address'),
  notes: text('notes'),
  status: mysqlEnum('status', ['active', 'pending', 'inactive']).default('active'),
  lastVisit: timestamp('last_visit').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// MBTI Questions Table
export const mbtiQuestions = mysqlTable('mbti_questions', {
  id: int('id').primaryKey().autoincrement(),
  questionText: varchar('question_text', { length: 300 }).notNull(),
  quizId: int('quiz_id').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// MBTI Options Table
export const mbtiOptions = mysqlTable('mbti_options', {
  id: int('id').primaryKey().autoincrement(),
  optionText: varchar('option_text', { length: 300 }).notNull(),
  analyticId: int('analytic_id').notNull(), // 1=E, 2=I, 3=S, 4=N, 5=T, 6=F, 7=J, 8=P
  questionId: int('question_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Test Progress Table
export const testProgress = mysqlTable('test_progress', {
  id: int('id').primaryKey().autoincrement(),
  patientId: int('patient_id').notNull(),
  doctorId: int('doctor_id').notNull(),
  testType: mysqlEnum('test_type', ['MBTI', 'RIASEC']).notNull(),
  status: mysqlEnum('status', ['not_started', 'in_progress', 'completed']).default('not_started'),
  currentQuestion: int('current_question').default(1),
  answers: json('answers'), // Stores answers as JSON array
  testToken: varchar('test_token', { length: 255 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  uniquePatientTest: unique('unique_patient_test').on(table.patientId, table.testType),
}));

// MBTI Results Table
export const mbtiResults = mysqlTable('mbti_results', {
  id: int('id').primaryKey().autoincrement(),
  patientId: int('patient_id').notNull(),
  doctorId: int('doctor_id').notNull(),
  personalityType: varchar('personality_type', { length: 4 }).notNull(), // e.g., INTJ, ENFP
  dimensions: json('dimensions'), // Detailed scores for E/I, S/N, T/F, J/P
  testProgressId: int('test_progress_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// RIASEC Questions Table
export const riasecQuestions = mysqlTable('riasec_questions', {
  id: int('id').primaryKey().autoincrement(),
  questionText: varchar('question_text', { length: 500 }).notNull(),
  quizId: int('quiz_id').notNull().default(2),
  personalityTypeId: int('personality_type_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// RIASEC Types Table (R, I, A, S, E, C)
export const riasecTypes = mysqlTable('riasec_types', {
  id: int('id').primaryKey().autoincrement(),
  typeName: varchar('type_name', { length: 50 }).notNull(),
  typeCode: varchar('type_code', { length: 1 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// RIASEC Options Table (Likert Scale 1-5)
export const riasecOptions = mysqlTable('riasec_options', {
  id: int('id').primaryKey().autoincrement(),
  optionText: varchar('option_text', { length: 100 }).notNull(),
  scoreValue: int('score_value').notNull(), // 0, 0, 0, 1, 2
  createdAt: timestamp('created_at').defaultNow(),
});

// RIASEC Results Table
export const riasecResults = mysqlTable('riasec_results', {
  id: int('id').primaryKey().autoincrement(),
  patientId: int('patient_id').notNull(),
  doctorId: int('doctor_id').notNull(),
  riasecCode: varchar('riasec_code', { length: 6 }).notNull(), // Full code: RIASEC
  scores: json('scores'), // Scores for each type: {R: 8, I: 5, A: 3, S: 6, E: 4, C: 2}
  topThree: varchar('top_three', { length: 3 }).notNull(), // Top 3 letters: RIS, SAE, etc.
  testProgressId: int('test_progress_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Test Results Table (generic for all test types)
export const testResults = mysqlTable('test_results', {
  id: int('id').primaryKey().autoincrement(),
  patientId: int('patient_id').notNull(),
  doctorId: int('doctor_id').notNull(),
  testType: mysqlEnum('test_type', ['MBTI', 'RIASEC']).notNull(),
  testData: text('test_data'), // JSON data for test questions and answers
  result: text('result'), // JSON data for test results
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
