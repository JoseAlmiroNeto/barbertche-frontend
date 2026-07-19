# Domínios do frontend

Cada pasta representa uma capacidade do produto. Arquivos `*.api.ts` concentram
o contrato HTTP e arquivos `*.types.ts` expõem os tipos do domínio.

- `auth`: autenticação, sessão segura e documentos legais.
- `appointments`: disponibilidade, agendamentos e recorrências.
- `clients`: cadastro administrativo de clientes.
- `services`: serviços oferecidos pela barbearia.
- `settings`: expediente, fechamentos e bloqueios.
- `products`: catálogo de produtos.
- `gallery`: portfólio de imagens.
- `uploads`: envio compartilhado de imagens.
- `admin` e `client`: composição das experiências de cada perfil.
- `app-data`: agregação inicial dos dados necessários para iniciar o app.

Componentes e infraestrutura realmente compartilhados permanecem em
`src/components`, `src/services` e `src/utils`. Novas regras de negócio devem
ser adicionadas ao domínio responsável, não ao `AppContainer`.
