-- SQL Migration: Cash Shift Registers & Lab Weekly Balances
-- Run this in your Supabase SQL Editor to initialize these tables and policies.

-- =========================================================================
-- 1. cash_sessions Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    opened_by TEXT NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by TEXT,
    opening_balance NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    cash_sales NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    expenses NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    payouts NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    closing_balance_actual NUMERIC(12,2),
    closing_balance_expected NUMERIC(12,2),
    status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'closed')),
    manager_handover_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on cash_sessions
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow active staff access to cash_sessions" 
  ON public.cash_sessions
  FOR ALL 
  USING (public.is_active_staff());

-- =========================================================================
-- 2. cash_transactions Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'payout', 'float_addition')),
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    reference_id TEXT, -- E.g. visit_id or invoice number
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on cash_transactions
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow active staff access to cash_transactions" 
  ON public.cash_transactions
  FOR ALL 
  USING (public.is_active_staff());

-- =========================================================================
-- 3. lab_weekly_balances Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lab_weekly_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    expected_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    actual_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'settled')),
    settled_by TEXT,
    settled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on lab_weekly_balances
ALTER TABLE public.lab_weekly_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow active staff access to lab_weekly_balances" 
  ON public.lab_weekly_balances
  FOR ALL 
  USING (public.is_active_staff());
