import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Travel events and logistics
export const travelEvents = pgTable('travel_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid('event_id').notNull().unique(), // References events(id)
  departureTime: timestamp('departure_time', { withTimezone: true }),
  returnTime: timestamp('return_time', { withTimezone: true }),
  departureLocation: text('departure_location'),
  destinationLocation: text('destination_location'),
  transportationType: text('transportation_type').$type<'bus' | 'van' | 'car' | 'flight' | 'train'>(),
  transportationDetails: jsonb('transportation_details').default({}),
  accommodation: jsonb('accommodation').default({}), // Hotel, rooming lists
  mealArrangements: jsonb('meal_arrangements').default({}),
  requiredDocuments: text('required_documents').array().default(sql`ARRAY[]::text[]`),
  packingList: text('packing_list').array().default(sql`ARRAY[]::text[]`),
  emergencyContacts: jsonb('emergency_contacts').default([]),
  budgetInfo: jsonb('budget_info').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Travel itinerary items
export const travelItinerary = pgTable('travel_itinerary', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  sequenceOrder: integer('sequence_order').notNull(),
  activityTime: timestamp('activity_time', { withTimezone: true }),
  activityType: text('activity_type').$type<'departure' | 'arrival' | 'meal' | 'practice' | 'match' | 'meeting' | 'free_time' | 'return'>(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  durationMinutes: integer('duration_minutes'),
  responsiblePerson: text('responsible_person'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Travel participant tracking
export const travelParticipants = pgTable('travel_participants', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  userId: uuid('user_id').notNull(), // References profiles(id)
  participationStatus: text('participation_status').default('invited').$type<'invited' | 'confirmed' | 'declined' | 'attended'>(),
  roomAssignment: text('room_assignment'),
  dietaryRestrictions: text('dietary_restrictions'),
  emergencyContact: jsonb('emergency_contact'),
  travelDocumentsSubmitted: boolean('travel_documents_submitted').default(false),
  notes: text('notes'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Transportation vehicles and assignments
export const travelVehicles = pgTable('travel_vehicles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  vehicleType: text('vehicle_type').$type<'bus' | 'van' | 'car'>(),
  vehicleIdentifier: text('vehicle_identifier'), // License plate, bus number, etc.
  capacity: integer('capacity').notNull(),
  driverId: uuid('driver_id'), // References profiles(id)
  driverLicense: text('driver_license'),
  insuranceInfo: jsonb('insurance_info'),
  fuelCard: text('fuel_card'),
  emergencyKit: boolean('emergency_kit').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Vehicle passenger assignments
export const vehicleAssignments = pgTable('vehicle_assignments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid('vehicle_id').notNull(), // References travel_vehicles(id)
  participantId: uuid('participant_id').notNull(), // References travel_participants(id)
  seatNumber: text('seat_number'),
  isDriver: boolean('is_driver').default(false),
  specialNeeds: text('special_needs'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
})

// Travel expenses tracking
export const travelExpenses = pgTable('travel_expenses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  category: text('category').$type<'transportation' | 'accommodation' | 'meals' | 'equipment' | 'miscellaneous'>(),
  description: text('description').notNull(),
  amount: integer('amount'), // Amount in cents to avoid decimal precision issues
  currency: text('currency').default('USD'),
  paidBy: uuid('paid_by'), // References profiles(id)
  reimbursable: boolean('reimbursable').default(true),
  receiptUrl: text('receipt_url'),
  approvedBy: uuid('approved_by'), // References profiles(id)
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Travel documents and forms
export const travelDocuments = pgTable('travel_documents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  participantId: uuid('participant_id'), // References travel_participants(id), null for team-wide docs
  documentType: text('document_type').$type<'waiver' | 'medical_form' | 'emergency_contact' | 'travel_roster' | 'itinerary' | 'insurance'>(),
  documentName: text('document_name').notNull(),
  fileUrl: text('file_url'),
  isRequired: boolean('is_required').default(true),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedBy: uuid('approved_by'), // References profiles(id)
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Travel check-ins for attendance tracking
export const travelCheckIns = pgTable('travel_check_ins', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  travelEventId: uuid('travel_event_id').notNull(), // References travel_events(id)
  participantId: uuid('participant_id').notNull(), // References travel_participants(id)
  checkInType: text('check_in_type').$type<'departure' | 'arrival' | 'meal' | 'activity' | 'return'>(),
  checkInTime: timestamp('check_in_time', { withTimezone: true }).defaultNow(),
  location: text('location'),
  notes: text('notes'),
  checkedInBy: uuid('checked_in_by'), // References profiles(id)
})

export type TravelEvent = typeof travelEvents.$inferSelect
export type NewTravelEvent = typeof travelEvents.$inferInsert
export type TravelItinerary = typeof travelItinerary.$inferSelect
export type NewTravelItinerary = typeof travelItinerary.$inferInsert
export type TravelParticipant = typeof travelParticipants.$inferSelect
export type NewTravelParticipant = typeof travelParticipants.$inferInsert
export type TravelVehicle = typeof travelVehicles.$inferSelect
export type NewTravelVehicle = typeof travelVehicles.$inferInsert
export type VehicleAssignment = typeof vehicleAssignments.$inferSelect
export type NewVehicleAssignment = typeof vehicleAssignments.$inferInsert
export type TravelExpense = typeof travelExpenses.$inferSelect
export type NewTravelExpense = typeof travelExpenses.$inferInsert
export type TravelDocument = typeof travelDocuments.$inferSelect
export type NewTravelDocument = typeof travelDocuments.$inferInsert
export type TravelCheckIn = typeof travelCheckIns.$inferSelect
export type NewTravelCheckIn = typeof travelCheckIns.$inferInsert