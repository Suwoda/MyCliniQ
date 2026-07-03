-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create supplier_bills table
CREATE TABLE IF NOT EXISTS public.supplier_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL,
    total_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    amount_paid NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    payment_status TEXT DEFAULT 'credit' NOT NULL CHECK (payment_status IN ('paid', 'credit', 'partially_paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create supplier_payments table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES public.supplier_bills(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL,
    payment_mode TEXT DEFAULT 'cash' NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    is_main BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create location_stock table
CREATE TABLE IF NOT EXISTS public.location_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.stock_batches(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(location_id, drug_id, batch_id)
);

-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS public.stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
    to_location_id TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stock_transfer_items table
CREATE TABLE IF NOT EXISTS public.stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
    drug_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.stock_batches(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default locations
INSERT INTO public.locations (id, name, is_main)
VALUES 
('main', 'Main Pharmacy', true),
('branch_1', 'Affiliated Branch Pharmacy A', false)
ON CONFLICT (id) DO NOTHING;

-- Add bill_id to stock_batches for tracing back to supplier bills
ALTER TABLE public.stock_batches ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES public.supplier_bills(id) ON DELETE SET NULL;
