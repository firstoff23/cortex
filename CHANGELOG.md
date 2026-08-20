# Notas de versão

Este ficheiro regista alterações relevantes para quem utiliza, avalia ou contribui para o Córtex Digital. O projeto adota uma convenção simples: as alterações são reunidas em **Não publicado** e recebem uma etiqueta de versão quando um marco está estável, validado no CI e acompanhado de notas de atualização.

## Não publicado

### Adicionado

- Um painel colapsável de **transparência da sessão** apresenta os participantes efetivamente reportados, a presença de fontes externas e os limites do indicador de confiança.
- Testes unitários para a normalização de metadados de participantes e fontes, sem armazenar ou expor raciocínio intermédio dos modelos.

### Corrigido

- A ordem dos hooks do componente de notificações deixou de depender da presença de um provider React.
- Foram removidas variáveis e imports não utilizados que impediam a validação de lint.

## Política de versões

| Tipo de alteração | Próxima versão recomendada |
|---|---|
| Correção compatível, documentação ou melhoria interna | Patch (`x.y.Z`) |
| Nova funcionalidade compatível, como um painel ou integração opt-in | Minor (`x.Y.0`) |
| Mudança incompatível na persistência, autenticação ou API pública | Major (`X.0.0`) |

Antes de uma release, devem passar `npm test`, `npm run lint` e `npm run build`. As notas devem indicar limitações, alterações de dados e qualquer ação necessária por parte de quem utiliza a aplicação.
