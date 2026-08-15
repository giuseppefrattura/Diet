-- ==============================================================================
-- Dati di Seed basati su dieta_settimanale_1500kcal.txt per Supabase
-- ==============================================================================

insert into public.food_items (id, user_id, name, unit, perishable, category) values
    ('a0000001-0000-0000-0000-000000000001', auth.uid(), 'Yogurt Greco 0%', 'g', true, 'Latticini e Bevande'),
    ('a0000002-0000-0000-0000-000000000002', auth.uid(), 'Fiocchi d''Avena', 'g', false, 'Cereali e Pane'),
    ('a0000003-0000-0000-0000-000000000003', auth.uid(), 'Banana', 'pz', true, 'Frutta e Verdura'),
    ('a0000004-0000-0000-0000-000000000004', auth.uid(), 'Petto di Pollo', 'g', true, 'Carne e Pesce'),
    ('a0000005-0000-0000-0000-000000000005', auth.uid(), 'Riso Integrale', 'g', false, 'Cereali e Pane'),
    ('a0000006-0000-0000-0000-000000000006', auth.uid(), 'Zucchine', 'g', true, 'Frutta e Verdura'),
    ('a0000007-0000-0000-0000-000000000007', auth.uid(), 'Broccoli', 'g', true, 'Frutta e Verdura'),
    ('a0000008-0000-0000-0000-000000000008', auth.uid(), 'Olio EVO', 'g', false, 'Condimenti'),
    ('a0000009-0000-0000-0000-000000000009', auth.uid(), 'Lenticchie Rosse Cotte', 'g', true, 'Legumi e Semi'),
    ('a0000010-0000-0000-0000-000000000010', auth.uid(), 'Fagioli Cannellini Lessati', 'g', true, 'Legumi e Semi'),
    ('a0000011-0000-0000-0000-000000000011', auth.uid(), 'Pane Integrale', 'g', true, 'Cereali e Pane'),
    ('a0000012-0000-0000-0000-000000000012', auth.uid(), 'Insalata Mista', 'g', true, 'Frutta e Verdura'),
    ('a0000013-0000-0000-0000-000000000013', auth.uid(), 'Pomodori', 'g', true, 'Frutta e Verdura'),
    ('a0000014-0000-0000-0000-000000000014', auth.uid(), 'Uova Intere', 'pz', true, 'Uova e Latticini')
on conflict do nothing;
