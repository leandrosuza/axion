-- Verificar se a tabela credit_purchases existe e tem dados
SELECT * FROM credit_purchases ORDER BY created_at DESC LIMIT 10;

-- Verificar se o usuário tem créditos
SELECT id, email, credits_balance, credits_available, credits_used 
FROM users 
WHERE credits_balance > 0 OR credits_available > 0;
