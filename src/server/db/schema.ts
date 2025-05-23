import {
    pgTable,
    serial,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

export const hello = pgTable('hello', {
    id: serial('id').primaryKey(),
    greeting: text('greeting').notNull(),
});

// Challenge Platform Schema
export const challenge = pgTable('challenges', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const modules = pgTable('modules', {
    id: uuid('id').primaryKey().defaultRandom(),
    challengeId: uuid('challenge_id')
        .notNull()
        .references(() => challenge.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
        .notNull()
        .references(() => modules.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    points: integer('points').notNull(),
    order: integer('order').notNull(),
    type: text('type').notNull(), // e.g., 'quiz', 'ctf', 'coding'
    answerType: text('answer_type').notNull(), // 'opentext' or 'multiple_choice'
    correctAnswer: jsonb('correct_answer').notNull(), // For multiple choice: array of correct options, For opentext: string or array of accepted answers
    options: jsonb('options'), // For multiple choice: array of all options
    metadata: jsonb('metadata'), // For storing task-specific data like hints, etc.
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teams = pgTable('teams', {
    id: uuid('id').primaryKey().defaultRandom(),
    challengeId: uuid('challenge_id').references(() => challenge.id, {
        onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamMembers = pgTable('team_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // e.g., 'leader', 'member'
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const taskSubmissions = pgTable('task_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    submittedBy: text('submitted_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    answer: jsonb('answer').notNull(), // Can store either string for opentext or array of selected options for multiple choice
    status: text('status').notNull().default('pending'), // e.g., 'pending', 'correct', 'incorrect'
    points: integer('points'),
    feedback: text('feedback'),
    submittedAt: timestamp('submitted_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamProgress = pgTable('team_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
        .notNull()
        .references(() => modules.id, { onDelete: 'cascade' }),
    completedTasks: integer('completed_tasks').notNull().default(0),
    totalPoints: integer('total_points').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Auth schema
export * from './auth-schema';
