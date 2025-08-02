-- Inserir dados iniciais para o Super Mercado Rocha

-- Inserir categorias
INSERT INTO categories (name) VALUES 
('Frutas e Verduras'),
('Carnes e Aves'),
('Laticínios'),
('Padaria'),
('Bebidas'),
('Limpeza'),
('Higiene'),
('Mercearia')
ON CONFLICT DO NOTHING;

-- Inserir alguns produtos de exemplo
INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, image_url) 
SELECT 
  'Banana Prata', 'Banana prata fresca por kg', 4.99, 3.50, c.id, 50, '/placeholder.svg?height=200&width=200'
FROM categories c WHERE c.name = 'Frutas e Verduras'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, image_url) 
SELECT 
  'Leite Integral 1L', 'Leite integral pasteurizado', 5.49, 4.20, c.id, 30, '/placeholder.svg?height=200&width=200'
FROM categories c WHERE c.name = 'Laticínios'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, image_url) 
SELECT 
  'Pão Francês', 'Pão francês fresquinho por kg', 8.99, 6.50, c.id, 20, '/placeholder.svg?height=200&width=200'
FROM categories c WHERE c.name = 'Padaria'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, image_url) 
SELECT 
  'Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 7.99, 5.80, c.id, 25, '/placeholder.svg?height=200&width=200'
FROM categories c WHERE c.name = 'Bebidas'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, image_url) 
SELECT 
  'Frango Inteiro', 'Frango inteiro congelado por kg', 12.99, 9.50, c.id, 15, '/placeholder.svg?height=200&width=200'
FROM categories c WHERE c.name = 'Carnes e Aves'
ON CONFLICT DO NOTHING;
