<h1>CrmApp — Guia de execução</h1>

<p>Essa aplicacao foi inspirada no Flow, uma aplicacao que trabalhei para gerenciamento de Leads e seus projetos no ramo de energia solar, onde as informacoes eram apresentadas em cards separados por etapa, como proposal, installation, etc... seguindo um modelo Kanban</p>

<p>Passos necessários para executar a API <strong>CrmApp</strong> localmente usando as migrations do Entity Framework Core com SQLite. Pressupõe-se que o repositório já esteja clonado e que as migrations tenham sido criadas no projeto.</p>

<img width="1293" height="784" alt="Captura de tela 2025-10-27 171639" src="https://github.com/user-attachments/assets/df2d496c-e95f-4b37-b27c-e2b88c37c59f" />

<h2>1. Pré-requisitos</h2>
<ul>
  <li>.NET SDK compatível (verifique <code>global.json</code> quando presente). Instale o SDK em <code>https://dotnet.microsoft.com/</code>.</li>
  <li>Git (para clonar o repositório).</li>
  <li>Ferramenta <code>dotnet-ef</code> (para aplicar migrations): <code>dotnet tool install --global dotnet-ef</code> ou <code>dotnet tool update --global dotnet-ef</code>.</li>
  <li>Editor (VS Code / Visual Studio) — recomendado.</li>
</ul>

<img width="312" height="369" alt="Captura de tela 2025-10-27 165506" src="https://github.com/user-attachments/assets/5c29c6e8-0ade-4368-9b16-e47e99028961" />


<h2>2. Clonar o repositório</h2>
<pre><code>git clone https://github.com/ricichien/crm-app
cd crm-app
</code></pre>

<h2>3. Restaurar e compilar</h2>
<pre><code>dotnet restore
dotnet build --configuration Release
</code></pre>

<h2>4. Configurar SQLite</h2>
<p>O projeto está configurado para usar SQLite. Edite <code>src/Api/CrmApp.Api/appsettings.Development.json</code> (ou <code>appsettings.json</code>) para definir a connection string. Exemplo recomendado:</p>
<pre><code>{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=./Data/CrmApp.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
</code></pre>

<img width="2541" height="942" alt="Captura de tela 2025-10-27 165022" src="https://github.com/user-attachments/assets/bd8457ca-59be-4328-a68c-645564b13c42" />

<p>Observações:</p>

<img width="1851" height="183" alt="image" src="https://github.com/user-attachments/assets/dad85cea-e961-4808-a6ab-d213f706afa8" />

<ul>
  <li>O caminho <code>./Data/CrmApp.db</code> é relativo ao diretório onde a aplicação for executada. Você pode usar um caminho absoluto se preferir.</li>
  <li>As permissões de arquivo devem permitir leitura e escrita no diretório onde o arquivo .db será criado.</li>
  <li>Confirme que o <code>DbContext</code> está configurado com <code>UseSqlite(Configuration.GetConnectionString("DefaultConnection"))</code> em <code>Program.cs</code> ou <code>Startup.cs</code>.</li>
</ul>

<h2>5. Aplicar migrations</h2>
<p>Para aplicar as migrations e criar o ficheiro SQLite, execute:</p>
<pre><code>dotnet ef database update --project src/Infra/CrmApp.Infrastructure/CrmApp.Infrastructure.csproj --startup-project src/Api/CrmApp.Api/CrmApp.Api.csproj
</code></pre>
<p>Se as migrations já estiverem aplicadas, este comando confirmará que o esquema está atualizado.</p>

<h2>6. Resetando o banco (opcional)</h2>
<p>Se precisar reiniciar o banco durante testes locais, pare a aplicação e remova o ficheiro SQLite:</p>
<pre><code>rm -f ./src/Api/CrmApp.Api/Data/CrmApp.db
# ou em Windows PowerShell:
Remove-Item .\src\Api\CrmApp.Api\Data\CrmApp.db -Force
</code></pre>
<p>Em seguida, reaplique as migrations (ver passo 5).</p>

<h2>7. Rodar a API</h2>
<pre><code>dotnet run --project src/Api/CrmApp.Api/CrmApp.Api.csproj --environment Development
</code></pre>
<p>Ao iniciar, a aplicação exibirá a URL de escuta (por padrão <code>https://localhost:5001</code> ou conforme configurado).</p>

<h2>8. Autenticação</h2>
<p>Os controllers estão protegidos com <code>[Authorize]</code>. Para acessar endpoints protegidos, envie um token JWT no cabeçalho:</p>
<pre><code>Authorization: Bearer &lt;SEU_TOKEN&gt;
</code></pre>
<p>Os endpoints <code>/api/leads/sources</code> e <code>/api/leads/statuses</code> possuem <code>[AllowAnonymous]</code> conforme o código-fonte, para disponibilizar enums sem autenticação.</p>

<h2>9. Exemplos de requisições</h2>
<p>Assumindo a API em <code>https://localhost:5001</code>:</p>
(existe um arquivo de enviroment para configurar seu localhost)

<p>Listar leads (paginação):</p>
<pre><code>curl -X GET "https://localhost:5001/api/leads?page=1&pageSize=10" -H "Authorization: Bearer &lt;SEU_TOKEN&gt;"
</code></pre>

<p>Obter lead por id:</p>
<pre><code>curl -X GET "https://localhost:5001/api/leads/1" -H "Authorization: Bearer &lt;SEU_TOKEN&gt;"
</code></pre>

<p>Criar lead:</p>
<pre><code>curl -X POST "https://localhost:5001/api/leads" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer &lt;SEU_TOKEN&gt;" \
 -d '{
   "firstName": "João",
   "lastName": "Silva",
   "email": "joao.silva@example.com",
   "phone": "11999999999",
   "source": 1,
   "status": 0
 }'
</code></pre>

<p>Obter tasks de um lead (endpoint protegido):</p>
<pre><code>curl -X GET "https://localhost:5001/api/leads/1/tasks" -H "Authorization: Bearer &lt;SEU_TOKEN&gt;"
</code></pre>

<h2>10. Testes</h2>
<pre><code>dotnet test
</code></pre>

<h2>11. Troubleshooting — problemas comuns com SQLite</h2>
<ul>
  <li><strong>Arquivo .db não é criado:</strong> verifique a connection string e se a aplicação tem permissões para criar/escrever no diretório especificado.</li>
  <li><strong>Lock de arquivo ao usar Editor/DB Browser:</strong> feche aplicações que estejam mantendo o arquivo aberto; SQLite bloqueia o ficheiro durante gravações simultâneas.</li>
  <li><strong>Limitações de migrations (alterações de esquema):</strong> SQLite tem limitações para alterar colunas. Em alterações complexas, pode ser necessário recriar a base (remover o .db e reaplicar migrations) ou gerar uma migration que recrie a tabela conforme as recomendações do EF Core para SQLite.</li>
  <li><strong>Erro ao executar <code>dotnet ef</code>:</strong> confirme instalação do <code>dotnet-ef</code> e que os pacotes <code>Microsoft.EntityFrameworkCore.Sqlite</code> e <code>Microsoft.EntityFrameworkCore.Tools</code> estão presentes.</li>
</ul>

<h2>12. Checklist</h2>
<ol>
  <li>Clonar o repositório.</li>
  <li>Atualizar <code>appsettings.Development.json</code> com a connection string SQLite desejada (ex.: <code>Data Source=./Data/CrmApp.db</code>).</li>
  <li>Instalar <code>dotnet-ef</code> globalmente se necessário.</li>
  <li>Rodar <code>dotnet ef database update</code> apontando para os projetos corretos.</li>
  <li>Executar a API com <code>dotnet run --project src/Api/CrmApp.Api/CrmApp.Api.csproj</code>.</li>
  <li>Testar endpoints via Swagger/Postman/curl; use token JWT quando necessário.</li>
</ol>

<h2>13. Contato</h2>
<p>Em caso de dúvidas durante a avaliação, contatar via telefone, e-mail ou LinkedIm.</p>

<hr>
<p>Consulte as pastas correspondentes no repositório para trechos específicos (migrations, configuração do <code>DbContext</code>, seeders e Dockerfile, se houver). Este guia foi preparado para proporcionar uma experiência de avaliação clara, reproduzível e segura.</p>
