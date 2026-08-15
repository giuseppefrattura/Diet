-- ==============================================================================
-- Dati di Seed dimostrativi per Supabase
-- ==============================================================================

-- Nota: Sostituire '00000000-0000-0000-0000-000000000000' con il proprio user_id reale se eseguito via SQL editor
-- oppure questo set verrà utilizzato dal provider demo locale.

insert into public.food_items (id, user_id, name, unit, perishable, category) values
    ('a0000001-0000-0000-0000-000000000001', auth.uid(), 'Fiocchi d''Avena', 'g', false, 'Cereali e Pane'),
    ('a0000002-0000-0000-0000-000000000002', auth.uid(), 'Latte di Mandorla', 'ml', true, 'Latticini e Bevande'),
    ('a0000003-0000-0000-0000-000000000003', auth.uid(), 'Mandorle', 'g', false, 'Snack e Frutta Secca'),
    ('a0000004-0000-0000-0000-000000000004', auth.uid(), 'Petto di Pollo', 'g', true, 'Carne e Pesce'),
    ('a0000005-0000-0000-0000-000000000005', auth.uid(), 'Riso Basmati', 'g', false, 'Cereali e Pane'),
    ('a0000006-0000-0000-0000-000000000006', auth.uid(), 'Zucchine', 'g', true, 'Frutta e Verdura'),
    ('a0000007-0000-0000-0000-000000000007', auth.uid(), 'Olio Extravergine d''Oliva', 'ml', false, 'Condimenti'),
    ('a0000008-0000-0000-0000-000000000008', auth.uid(), 'Yogurt Greco 0%', 'g', true, 'Latticini e Bevande'),
    ('a0000009-0000-0000-0000-000000000009', auth.uid(), 'Mela', 'pz', true, 'Frutta e Verdura'),
    ('a0000010-0000-0000-0000-000000000010', auth.uid(), 'Salmone Fresco', 'g', true, 'Carne e Pesce'),
    ('a0000011-0000-0000-0000-000000000011', auth.uid(), 'Broccoli', 'g', true, 'Frutta e Verdura'),
    ('a0000012-0000-0000-0000-000000000012', auth.uid(), 'Pasta Integrale', 'g', false, 'Cereali e Pane'),
    ('a0000013-0000-0000-0000-000000000013', auth.uid(), 'Uova', 'pz', true, 'Uova e Latticini'),
    ('a0000014-0000-0000-0000-000000000014', auth.uid(), 'Parmigiano Reggiano', 'g', true, 'Latticini e Bevande')
on conflict do nothing;
