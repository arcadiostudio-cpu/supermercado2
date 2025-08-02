-- Script adicional para garantir que os relacionamentos estejam corretos
-- Execute este script se ainda houver problemas

-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'orders', 'order_items');

-- Verificar as foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND tc.table_name IN ('products', 'orders', 'order_items');

-- Se necessário, recriar a foreign key
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
-- ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
--   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
