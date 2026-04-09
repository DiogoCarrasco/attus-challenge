# Desafio Tecnico Attus — Gerenciamento de Usuarios

Aplicacao Angular de gerenciamento de usuarios desenvolvida como resposta ao desafio tecnico da Attus, cobrindo os requisitos funcionais, as perguntas teoricas e os criterios de qualidade de codigo.

---

## Stack Tecnologica

- Angular 20 (Standalone Components, Signals, Control Flow)
- Angular Material (tema M3)
- RxJS 7 (debounceTime, switchMap, catchError, finalize, distinctUntilChanged)
- TypeScript 5 (strict mode)
- Jasmine + Karma (testes unitarios)

---

## Como Executar

```bash
# Instalar dependencias
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Executar os testes
npm test
```

A aplicacao estara disponivel em `http://localhost:4200`.

---

## Estrutura de Pastas

```
src/app/
  core/                        # Futuros servicos singleton e configuracoes globais
  shared/
    components/
      loading-spinner/         # Indicador de carregamento
      error-message/           # Componente de erro reutilizavel com retry
    pipes/
      cpf-mask.pipe.ts         # Formatacao de CPF (000.000.000-00)
      phone-mask.pipe.ts       # Formatacao de telefone ((00) 0000-0000)
    utils/
      pagination.utils.ts      # Funcao generica filtrarEPaginar<T>
    validators/
      cpf.validator.ts         # ValidatorFn com algoritmo de validacao de CPF
      phone.validator.ts       # ValidatorFn para telefone (10 ou 11 digitos)
  features/
    users/
      models/
        user.model.ts          # Interfaces User, CreateUserPayload, UpdateUserPayload
      services/
        user.service.ts        # Mock API com latencia simulada (Observable)
      state/
        user-state.service.ts  # Gerenciamento de estado com Signals
      components/
        user-card/             # Card individual de usuario (OnPush)
        user-form-dialog/      # Modal de criacao e edicao (formulario reativo)
      pages/
        user-list/             # Pagina principal com busca, listagem e paginacao
```

---

## Decisoes Arquiteturais

### Gerenciamento de Estado: Signals

Optou-se por Angular Signals em vez de NgRx por tres razoes principais:

1. O escopo da feature e restrito (uma unica pagina com operacoes CRUD simples), tornando o overhead do NgRx desnecessario.
2. Signals sao nativos do Angular, sem dependencias adicionais, e tem melhor integracao com OnPush e o modelo de reatividade do framework.
3. A API de `computed()` elimina a necessidade de selectors complexos, mantendo o codigo enxuto e legivel.

Se a aplicacao crescesse para multiplas features com estados compartilhados e efeitos assincronos complexos, NgRx seria a escolha mais adequada.

### Mock API

O `UserService` simula uma API REST com latencia (`delay(700ms)`), retornando `Observable<T>` em todos os metodos. Isso permite que toda a camada de consumo (componentes, pipes RxJS) seja identica ao que seria usado com `HttpClient`, facilitando a substituicao futura.

### Busca Reativa com switchMap

O campo de busca usa o seguinte pipeline:

```
valueChanges
  -> debounceTime(300ms)      aguarda o usuario parar de digitar
  -> distinctUntilChanged()   evita chamadas duplicadas para o mesmo valor
  -> tap(setLoading)          ativa o indicador de carregamento
  -> switchMap(searchByName)  cancela a requisicao anterior (evita race condition)
  -> catchError               trata falhas sem encerrar o stream
  -> finalize(clearLoading)   desativa o loading em qualquer resultado
  -> takeUntilDestroyed()     evita memory leak quando o componente e destruido
```

### Paginacao

A paginacao e controlada no `UserStateService` via signal (`currentPage`, `pageSize`) e um `computed` (`paginatedUsers`) que fatia o array atual. Isso mantem a logica fora dos componentes e garante que qualquer alteracao no estado (nova busca, nova pagina) propague automaticamente pela reatividade dos Signals.

### Performance

- `ChangeDetectionStrategy.OnPush` em todos os componentes.
- `track user.id` no `@for` para evitar re-renderizacoes desnecessarias de DOM.
- Lazy loading do `UserListComponent` via rota (`loadComponent`).

---

## Respostas as Perguntas Teoricas

---

### 1.1 — Refatoracao da classe Produto / Verdureira

Problemas identificados no codigo original:

- Uso de `any` em todos os campos e parametros, perdendo toda a seguranca de tipos.
- Comparacao com `==` em vez de `===`.
- Logica de busca duplicada em `getDescricaoProduto` e `hasEstoqueProduto`.
- Nenhum tratamento para produto nao encontrado (poderia causar `TypeError` em runtime).
- Concatenacao de strings em vez de template literals.

Codigo refatorado:

```typescript
interface Produto {
  readonly id: number;
  readonly descricao: string;
  readonly quantidadeEstoque: number;
}

class Verdureira {
  private readonly produtos: Produto[] = [
    { id: 1, descricao: 'Maca', quantidadeEstoque: 20 },
    { id: 2, descricao: 'Laranja', quantidadeEstoque: 0 },
    { id: 3, descricao: 'Limao', quantidadeEstoque: 20 },
  ];

  private findProduto(produtoId: number): Produto {
    const produto = this.produtos.find((p) => p.id === produtoId);
    if (!produto) {
      throw new Error(`Produto ${produtoId} nao encontrado.`);
    }
    return produto;
  }

  getDescricaoProduto(produtoId: number): string {
    const { id, descricao, quantidadeEstoque } = this.findProduto(produtoId);
    return `${id} - ${descricao} (${quantidadeEstoque}x)`;
  }

  hasEstoqueProduto(produtoId: number): boolean {
    return this.findProduto(produtoId).quantidadeEstoque > 0;
  }
}
```

---

### 1.2 — Funcao generica filtrarEPaginar

Implementada em `src/app/shared/utils/pagination.utils.ts`:

```typescript
export interface PaginaParams {
  page: number;
  pageSize: number;
}

export interface Pagina<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams,
): Pagina<T> {
  const filtered = data.filter(filterFn);
  const totalPages = Math.max(1, Math.ceil(filtered.length / params.pageSize));
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);
  return { items, total: filtered.length, page: params.page, totalPages };
}

// Uso com array de usuarios:
const resultado = filtrarEPaginar(
  usuarios,
  (u) => u.nome.toLowerCase().includes('ana'),
  { page: 1, pageSize: 8 },
);
// resultado.items -> usuarios da pagina 1 cujo nome contem 'ana'
// resultado.total -> total de registros filtrados
```

---

### 2.1 — Change Detection e OnPush

Problema: com `ChangeDetectionStrategy.OnPush`, o Angular so executa a deteccao de mudancas para o componente quando:

1. Uma referencia de `@Input()` muda.
2. Um evento DOM se origina dentro do componente.
3. Um Observable emite via `async` pipe.

No codigo original, a subscription ao Observable atualiza `this.texto` de forma imperativa, fora de qualquer gatilho reconhecido pelo `OnPush`. O `setInterval` tambem modifica `this.contador` sem notificar o Angular.

Correcao (sem alterar `PessoaService` ou remover `setInterval`):

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto }}</h1>`,
})
export class AppComponent implements OnInit, OnDestroy {
  texto = '';
  contador = 0;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    this.pessoaService
      .buscarPorId(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pessoa) => {
        this.texto = `Nome: ${pessoa.nome}`;
        this.cdr.markForCheck(); // notifica o OnPush para re-renderizar
      });

    setInterval(() => {
      this.contador++;
      this.cdr.markForCheck();
    }, 1000);
  }
}
```

---

### 2.2 — Eliminando subscriptions aninhadas


```typescript
// Com switchMap (quando a segunda chamada depende do resultado da primeira)
ngOnInit(): void {
  this.pessoaService
    .buscarPorId(1)
    .pipe(
      switchMap((pessoa) =>
        this.pessoaService.buscarQuantidadeFamiliares(1).pipe(
          map((qtd) => ({ pessoa, qtd })),
        ),
      ),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(({ pessoa, qtd }) => {
      this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
    });
}

```

---

### 2.3 — Busca com debounce (implementacao pratica)

Implementado em `user-list.component.ts` com o pipeline descrito na secao de decisoes arquiteturais acima. Pontos-chave:

- `debounceTime(300)`: evita requisicoes a cada tecla pressionada.
- `switchMap`: cancela a requisicao anterior se o usuario digitar novamente, eliminando race conditions.
- `takeUntilDestroyed`: garante que a subscription seja encerrada quando o componente e destruido.
- `finalize`: desativa o loading em qualquer cenario (sucesso ou erro).

---

### 2.4 — Performance com OnPush e trackBy

`trackBy` (equivalente ao `track` no novo `@for`):

O Angular, por padrao, re-renderiza todos os itens de uma lista quando o array muda, mesmo que apenas um elemento tenha sido alterado. Ao fornecer `track user.id`, o framework consegue identificar quais elementos do DOM correspondem a quais objetos e re-renderiza apenas os que efetivamente mudaram. Com centenas de itens, isso reduz drasticamente o numero de operacoes no DOM.

`ChangeDetectionStrategy.OnPush` neste cenario:

Com a estrategia `Default`, o Angular verifica TODOS os componentes da arvore a cada evento (click, timer, requisicao). Com `OnPush`, um componente filho como `UserCardComponent` so e verificado quando:

- O `@Input() user` recebe uma nova referencia de objeto.
- Um evento ocorre dentro do proprio card.

Isso significa que, ao receber dados de uma API e atualizar apenas um usuario, somente o card desse usuario sera verificado, e nao toda a lista.

Impacto de usar a estrategia `Default`:

Com centenas de cards renderizados, cada evento (digitacao na busca, hover, qualquer outro evento na pagina) dispararia um ciclo de deteccao completo percorrendo todos os componentes. O resultado seria queda de FPS e UI travada em dispositivos menos potentes.

---

### 3.1 — Contador de carrinho com Signals

```typescript
interface ItemCarrinho {
  readonly id: string;
  readonly nome: string;
  readonly preco: number;
  quantidade: number;
}

@Component({
  selector: 'app-carrinho',
  template: `
    <p>Total: {{ total() | currency:'BRL' }}</p>
    <button (click)="adicionar(novoItem)">Adicionar</button>
  `,
})
export class CarrinhoComponent {
  readonly itens = signal<ItemCarrinho[]>([]);

  readonly total = computed(() =>
    this.itens().reduce((acc, item) => acc + item.preco * item.quantidade, 0),
  );

  readonly totalMudou = output<number>();

  constructor() {
    effect(() => {
      this.totalMudou.emit(this.total());
    });
  }

  adicionar(item: ItemCarrinho): void {
    this.itens.update((lista) => {
      const existente = lista.find((i) => i.id === item.id);
      if (existente) {
        return lista.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }
      return [...lista, { ...item, quantidade: 1 }];
    });
  }

  remover(id: string): void {
    this.itens.update((lista) => lista.filter((i) => i.id !== id));
  }
}
```

---

### 3.2 — NgRx para lista de tarefas (To-do)

```typescript
// models/todo.model.ts
export interface Todo {
  readonly id: number;
  title: string;
  completed: boolean;
}

// actions/todo.actions.ts
export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction(
  '[Todo] Load Todos Success',
  props<{ todos: Todo[] }>(),
);
export const loadTodosError = createAction(
  '[Todo] Load Todos Error',
  props<{ error: string }>(),
);
export const toggleTodoComplete = createAction(
  '[Todo] Toggle Complete',
  props<{ id: number }>(),
);

// reducers/todo.reducer.ts
interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TodoState = { todos: [], isLoading: false, error: null };

export const todoReducer = createReducer(
  initialState,
  on(loadTodos, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos,
    isLoading: false,
  })),
  on(loadTodosError, (state, { error }) => ({
    ...state,
    error,
    isLoading: false,
  })),
  on(toggleTodoComplete, (state, { id }) => ({
    ...state,
    todos: state.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    ),
  })),
);

// selectors/todo.selectors.ts
const selectTodoState = createFeatureSelector<TodoState>('todos');
export const selectAllTodos = createSelector(selectTodoState, (s) => s.todos);
export const selectPendingTodos = createSelector(selectAllTodos, (todos) =>
  todos.filter((t) => !t.completed),
);

// effects/todo.effects.ts
@Injectable()
export class TodoEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  readonly loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTodos),
      switchMap(() =>
        this.http.get<Todo[]>('https://api.example.com/todos').pipe(
          map((todos) => loadTodosSuccess({ todos })),
          catchError((err: Error) =>
            of(loadTodosError({ error: err.message })),
          ),
        ),
      ),
    ),
  );
}
```

---

## Trade-offs

| Decisao | Escolha | Motivo |
|---|---|---|
| State management | Signals | Nativo, sem overhead, adequado ao escopo do projeto |
| Test runner | Jasmine/Karma | Ja configurado no projeto; Jest/Vitest exigiria configuracao adicional sem ganho funcional para o escopo |
| Mock API | In-memory service | Sem dependencia de servidor externo; JSON Server ou MSW seriam opcoes para cenarios mais proximos de producao |
| Paginacao | Client-side | Dados em memoria; paginacao server-side seria necessaria para volumes maiores |

---

## Funcionalidades Implementadas

- Listagem de usuarios em cards responsivos (grid adaptativo)
- Busca por nome com debounce de 300ms e switchMap
- Estado de loading e mensagem de erro com botao de retry
- Modal de cadastro com formulario reativo e validacao completa
- Modal de edicao com preenchimento automatico dos campos
- Validacao de CPF (algoritmo completo), e-mail e telefone
- Mascaras de entrada para CPF e telefone
- Paginacao com controles de navegacao
- Componentes com OnPush para performance otimizada
- Cobertura de testes em servicos, estado e componentes principais
