

# Alterar Preço do Produto para €25

## Objetivo
Atualizar o preço do produto "Reset your body! - Ebook" de €12.00 para €25.00 no Stripe.

## Contexto Atual
- **Produto**: Reset your body! - Ebook (`prod_TtxV8xB3ssXlCg`)
- **Preço atual**: €12.00 (`price_1Sw9ahF0e6PD8myF5bogkKpl`)
- **Preço desejado**: €25.00

## Abordagem

No Stripe, os preços são **imutáveis** - não podem ser editados diretamente. A solução é criar um novo preço e atualizar a referência na base de dados.

## Passos de Implementação

### 1. Criar Novo Preço no Stripe
Usar a API do Stripe para criar um novo preço de €25.00 (2500 cêntimos) associado ao produto existente.

### 2. Atualizar Base de Dados
Atualizar a tabela `academy_items` para usar o novo `stripe_price_id` no ebook correspondente.

### 3. (Opcional) Arquivar Preço Antigo
O preço antigo de €12.00 pode ser mantido ou arquivado no Stripe para manter histórico de transações anteriores.

---

## Detalhes Técnicos

**Criação do novo preço via Stripe API:**
- `product_id`: prod_TtxV8xB3ssXlCg
- `unit_amount`: 2500 (€25.00 em cêntimos)
- `currency`: eur

**Migração SQL:**
```sql
UPDATE academy_items 
SET stripe_price_id = 'novo_price_id', price = 25.00
WHERE stripe_product_id = 'prod_TtxV8xB3ssXlCg';
```

