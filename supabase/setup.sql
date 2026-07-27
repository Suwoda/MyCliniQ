-- MyCliniQ - Hospital Management System Database Setup Script
-- Run this in the Supabase SQL Editor to initialize all tables, relationships, and triggers.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Profiles Table (Staff profiles linked to Supabase Auth)
-- ==========================================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    role text not null check (role in ('assistant', 'doctor', 'pharmacist', 'mlt', 'manager')),
    phone text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- ==========================================
-- 2. Patients Table (Demographics and medical history)
-- ==========================================
create table public.patients (
    id uuid default uuid_generate_v4() primary key,
    nic text unique,
    full_name text not null,
    date_of_birth date not null,
    gender text not null check (gender in ('male', 'female', 'other')),
    phone text not null,
    address text,
    allergies text[] default '{}'::text[],
    chronic_illnesses text[] default '{}'::text[],
    user_id uuid references auth.users(id) on delete set null, -- Linked if they sign up as a patient
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patients enable row level security;

-- ==========================================
-- 3. Appointments Table (Future and phone bookings)
-- ==========================================
create table public.appointments (
    id uuid default uuid_generate_v4() primary key,
    patient_id uuid references public.patients(id) on delete cascade not null,
    doctor_id uuid references public.profiles(id) on delete set null,
    appointment_date date not null,
    queue_number integer not null,
    status text not null default 'scheduled' check (status in ('scheduled', 'attended', 'cancelled')),
    booked_by text not null default 'walk_in' check (booked_by in ('phone', 'online', 'walk_in')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

-- ==========================================
-- 4. Visits Table (Daily patient check-ins and vital signs)
-- ==========================================
create table public.visits (
    id uuid default uuid_generate_v4() primary key,
    patient_id uuid references public.patients(id) on delete cascade not null,
    appointment_id uuid references public.appointments(id) on delete set null,
    visit_date date default current_date not null,
    queue_number integer not null,
    doctor_id uuid references public.profiles(id) on delete set null,
    status text not null default 'waiting' check (status in ('waiting', 'in_consultation', 'completed', 'cancelled')),
    systolic_bp integer,
    diastolic_bp integer,
    temperature numeric(4,1), -- e.g. 37.5
    weight_kg numeric(5,2),   -- e.g. 70.50
    chief_complaint text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.visits enable row level security;

-- ==========================================
-- 5. Consultations Table (Clinical documentation by Doctor)
-- ==========================================
create table public.consultations (
    id uuid default uuid_generate_v4() primary key,
    visit_id uuid references public.visits(id) on delete cascade not null unique,
    doctor_id uuid references public.profiles(id) on delete set null,
    symptoms text,
    diagnosis text,
    clinical_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.consultations enable row level security;

-- ==========================================
-- 6. Drugs Table (Medicine Catalog / Directory)
-- ==========================================
create table public.drugs (
    id uuid default uuid_generate_v4() primary key,
    brand_name text not null,
    generic_name text not null,
    form text not null, -- e.g. tablet, syrup, capsule, injection, cream, drops
    route text, -- e.g. oral, topical, intravenous
    manufacturer text, -- e.g. GSK
    strength text not null, -- e.g. 500mg, 10mg, 120mg/5ml
    total_stock integer default 0 not null,
    reorder_level integer default 50 not null,
    unit_price numeric(10,2) not null,   -- Purchase price per unit
    selling_price numeric(10,2) not null, -- Selling price per unit
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drugs enable row level security;

-- ==========================================
-- 7. Stock Batches Table (Expiry dates and batch control)
-- ==========================================
create table public.stock_batches (
    id uuid default uuid_generate_v4() primary key,
    drug_id uuid references public.drugs(id) on delete cascade not null,
    batch_number text not null,
    expiry_date date not null,
    quantity_received integer not null,
    quantity_remaining integer not null,
    purchase_price numeric(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stock_batches enable row level security;

-- ==========================================
-- 8. Prescriptions Table (Sent from Doctor to Pharmacist)
-- ==========================================
create table public.prescriptions (
    id uuid default uuid_generate_v4() primary key,
    consultation_id uuid references public.consultations(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    status text not null default 'pending' check (status in ('pending', 'dispensed', 'partially_dispensed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.prescriptions enable row level security;

-- ==========================================
-- 9. Prescription Items Table (Medicines inside prescription)
-- ==========================================
create table public.prescription_items (
    id uuid default uuid_generate_v4() primary key,
    prescription_id uuid references public.prescriptions(id) on delete cascade not null,
    drug_id uuid references public.drugs(id) on delete cascade not null,
    dosage text not null, -- e.g. 1 tablet, 5ml, 2 drops
    frequency text not null, -- e.g. TID, BID, OD, QID, PRN
    duration integer not null, -- Number of days
    total_quantity integer not null, -- dosage unit equivalents to dispense
    instructions text, -- e.g. After meals, Before bed
    dispensed_quantity integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.prescription_items enable row level security;

-- ==========================================
-- 10. Lab Tests Table (Lab catalog & pricing)
-- ==========================================
create table public.lab_tests (
    id uuid default uuid_generate_v4() primary key,
    test_name text not null,
    reference_range text,
    unit text,
    cost numeric(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lab_tests enable row level security;

-- ==========================================
-- 11. Lab Requests Table (Requests from Doctor, results from MLT)
-- ==========================================
create table public.lab_requests (
    id uuid default uuid_generate_v4() primary key,
    visit_id uuid references public.visits(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    test_id uuid references public.lab_tests(id) on delete cascade not null,
    doctor_id uuid references public.profiles(id) on delete set null,
    mlt_id uuid references public.profiles(id) on delete set null,
    status text not null default 'requested' check (status in ('requested', 'collected', 'completed')),
    result_value text,
    remarks text,
    attachment_url text, -- Supabase Storage URL for PDF report upload
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lab_requests enable row level security;

-- ==========================================
-- 12. Inventory Transactions Table (Stock movement audit log)
-- ==========================================
create table public.inventory_transactions (
    id uuid default uuid_generate_v4() primary key,
    drug_id uuid references public.drugs(id) on delete cascade not null,
    batch_id uuid references public.stock_batches(id) on delete set null,
    transaction_type text not null check (transaction_type in ('stock_in', 'dispense', 'adjustment')),
    quantity integer not null, -- positive for check-in, negative for dispense/adjustment
    performed_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory_transactions enable row level security;

-- ==========================================
-- TRIGGERS & AUTOMATION
-- ==========================================

-- Automatically create profile row when user registers via auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Staff Member'),
    coalesce(new.raw_user_meta_data->>'role', 'assistant'), -- Default role is assistant
    new.raw_user_meta_data->>'phone',
    true
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Automatic stock calculation trigger when stock batches or transactions occur
create or replace function public.update_drug_total_stock()
returns trigger as $$
declare
  target_drug_id uuid;
begin
  if TG_OP = 'DELETE' then
    target_drug_id := old.drug_id;
  else
    target_drug_id := new.drug_id;
  end if;

  update public.drugs
  set total_stock = coalesce((
    select sum(quantity_remaining) 
    from public.stock_batches 
    where drug_id = target_drug_id
  ), 0)
  where id = target_drug_id;

  return null;
end;
$$ language plpgsql security definer;

create or replace trigger on_batch_change
  after insert or update or delete on public.stock_batches
  for each row execute procedure public.update_drug_total_stock();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ==========================================

-- Helper functions to avoid policy infinite recursion (Security Definer executes with owner privileges)
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer;

create or replace function public.is_active_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() and is_active = true
  );
$$ language sql security definer;

-- Profiles Policies
create policy "Allow public read access to profiles" on public.profiles 
  for select using (true);

create policy "Allow users to update their own profiles" on public.profiles 
  for update using (auth.uid() = id);

create policy "Allow managers to insert/update profiles" on public.profiles
  for all using (
    public.get_my_role() = 'manager'
  );

-- Patients Policies (Accessible by all logged in clinic staff, or the patient themselves)
create policy "Allow staff and self read patients" on public.patients
  for select using (
    public.is_active_staff()
    or auth.uid() = user_id
  );

create policy "Allow staff write patients" on public.patients
  for all using (
    public.is_active_staff()
  );

-- Appointments, Visits, Consultations, and Prescriptions Policies
-- (Active staff can select, insert, update. Specific roles restricted for delete if required)
create policy "Staff access to appointments" on public.appointments
  for all using (
    public.is_active_staff()
  );

create policy "Staff access to visits" on public.visits
  for all using (
    public.is_active_staff()
  );

create policy "Staff access to consultations" on public.consultations
  for all using (
    public.is_active_staff()
  );

create policy "Staff access to prescriptions" on public.prescriptions
  for all using (
    public.is_active_staff()
  );

create policy "Staff access to prescription items" on public.prescription_items
  for all using (
    public.is_active_staff()
  );

-- Drugs & Batches & Transactions (Managers + Pharmacists can write, Doctors & Assistants can read)
create policy "Staff read access to drugs" on public.drugs
  for select using (
    public.is_active_staff()
  );

create policy "Manager & Pharmacist write access to drugs" on public.drugs
  for all using (
    public.get_my_role() in ('manager', 'pharmacist') and public.is_active_staff()
  );

create policy "Staff read access to batches" on public.stock_batches
  for select using (
    public.is_active_staff()
  );

create policy "Manager & Pharmacist write access to batches" on public.stock_batches
  for all using (
    public.get_my_role() in ('manager', 'pharmacist') and public.is_active_staff()
  );

create policy "Staff access to transactions" on public.inventory_transactions
  for all using (
    public.is_active_staff()
  );

-- Lab Tests & Requests Policies
create policy "Staff read access to lab tests" on public.lab_tests
  for select using (
    public.is_active_staff()
  );

create policy "Manager write access to lab tests" on public.lab_tests
  for all using (
    public.get_my_role() = 'manager' and public.is_active_staff()
  );

create policy "Staff access to lab requests" on public.lab_requests
  for all using (
    public.is_active_staff()
  );

-- ==========================================
-- SEED DATA (COMMON MEDICINES & LAB TESTS IN SRI LANKA)
-- ==========================================

-- Seed Drugs
insert into public.drugs (brand_name, generic_name, form, strength, total_stock, reorder_level, unit_price, selling_price) values
('Panadol', 'Paracetamol', 'tablet', '500mg', 0, 500, 1.50, 2.50),
('Alerid', 'Cetirizine', 'tablet', '10mg', 0, 100, 2.00, 4.00),
('Amoxil', 'Amoxicillin', 'capsule', '250mg', 0, 200, 5.00, 8.00),
('Amoxil', 'Amoxicillin', 'capsule', '500mg', 0, 200, 8.00, 12.00),
('Lipitor', 'Atorvastatin', 'tablet', '10mg', 0, 150, 12.00, 18.00),
('Glucophage', 'Metformin', 'tablet', '500mg', 0, 300, 3.00, 5.00),
('Zaart', 'Losartan Potassium', 'tablet', '500mg', 0, 200, 8.00, 12.00),
('Ventolin', 'Salbutamol', 'syrup', '2mg/5ml', 0, 30, 80.00, 120.00),
('Piriton', 'Chlorpheniramine Maleate', 'tablet', '4mg', 0, 200, 0.80, 1.50),
('Zinnat', 'Cefuroxime Axetil', 'tablet', '250mg', 0, 100, 30.00, 45.00);

-- Seed Lab Tests
insert into public.lab_tests (test_name, reference_range, unit, cost) values
('Fasting Blood Sugar (FBS)', '70 - 100', 'mg/dL', 250.00),
('Random Blood Sugar (RBS)', 'Below 140', 'mg/dL', 200.00),
('HbA1c', 'Below 5.7', '%', 1200.00),
('Full Blood Count (FBC)', 'Multiple Parameters', 'cells/uL', 450.00),
('Lipid Profile', 'Multiple Parameters', 'mg/dL', 1500.00),
('Serum Creatinine', '0.6 - 1.2', 'mg/dL', 400.00),
('Urine Full Report (UFR)', 'Normal', 'N/A', 350.00),
('SGPT / ALT', 'Below 45', 'U/L', 500.00);
