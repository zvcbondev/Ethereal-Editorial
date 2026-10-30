# Ethereal Editorial — запуск на Vercel

Все файлы лежат в одной папке, без подпапок. Сайт — обычные страницы; данные, аккаунты, файлы и письма для входа/сброса пароля — в **Supabase** (бесплатного тарифа хватает).

Займёт ~15 минут. Нужны аккаунты: [supabase.com](https://supabase.com) и [vercel.com](https://vercel.com).

---

## 1. Supabase: база данных

1. Supabase → **New project**. Регион — ближе к читателям (например, `West EU (London)`). Сохраните пароль базы.
2. Откройте **SQL Editor → New query**, вставьте весь файл [`schema.sql`](schema.sql), нажмите **Run**. Должно быть `Success. No rows returned`.
3. **Project Settings → API**: скопируйте
   - `Project URL`
   - `anon public` key
   (`service_role` ключ **никуда не вставляйте** — он даёт полный доступ к базе.)

## 2. Ключи в сайт

Откройте [`app.js`](app.js) и в самом начале впишите оба значения:

```js
supabaseUrl: "https://abcdefgh.supabase.co",
supabaseAnonKey: "eyJhbGciOi...",
```

Anon-ключ рассчитан на то, чтобы лежать в браузере: данные защищают правила доступа в базе (Row Level Security в `schema.sql`).

## 3. Vercel: публикация

Вариант А — перетащить папку: Vercel → **Add New → Project** → загрузите папку `website` (или через GitHub-репозиторий с этими файлами).
Framework Preset: **Other**. Build Command — пусто. Output Directory — пусто.

Вариант Б — из командной строки (нужен Node.js), в папке `website`:
```
npx vercel --prod
```

## 4. Supabase: адрес сайта

Supabase → **Authentication → URL Configuration**:
- **Site URL**: адрес сайта, например `https://ethereal-editorial.vercel.app` (или свой домен).
- **Redirect URLs**: добавьте `https://ваш-адрес/**`

Без этого ссылки из писем (подтверждение почты, сброс пароля) будут вести не туда.

**Для реальной работы:** встроенная почта Supabase отправляет всего несколько писем в час. Подключите свою: **Authentication → Emails → SMTP Settings** (Resend, Brevo, Gmail Workspace и т. п.).

По желанию — вход через Google: **Authentication → Providers → Google** (нужны Client ID/Secret из Google Cloud). Без этого кнопка «Continue with Google» покажет ошибку.

## 5. Сделать владельца администратором

1. Зарегистрируйтесь на сайте с почтой `etherealeditorial2@gmail.com` (как автор) и подтвердите почту.
2. Supabase → **SQL Editor** → выполните:
   ```sql
   update public.profiles set role = 'admin', reader_status = null
   where email = 'etherealeditorial2@gmail.com';
   ```
3. Выйдите и войдите снова — откроется админка.

Новые заявки, заказы и сообщения видны в админке (`admin.html`). Писем о них владельцу сайт не шлёт — заходите в админку.

## 6. Проверка

- [ ] Главная → форма «Request your free sample edit» с файлом → заявка видна в Admin → Sample edits, файл скачивается.
- [ ] Регистрация автора → письмо → вход → «Upload manuscript» с .docx → книга в «My manuscripts».
- [ ] Регистрация читателя (другая почта) → Admin → Reader approvals → Approve.
- [ ] Читатель → Discover → книга → Request to read → автор принимает во вкладке Requests.
- [ ] Читатель читает главу, комментирует, отвечает на вопросы → открывается следующая глава; автор видит аналитику.
- [ ] Автор → My edits → New editing order → в чате появляется сообщение → админ отвечает реквизитами в Admin → Chat → автор отмечает оплату → админ подтверждает.
- [ ] «Forgot password?» → письмо → страница `reset` → новый пароль.

## Файлы

| Файл | Что делает |
|---|---|
| `index.html` | Главная + форма бесплатного образца |
| `signup.html`, `signin.html`, `reset.html` | Регистрация, вход, сброс пароля |
| `dashboard.html`, `new-beta-read.html`, `manuscript.html` | Кабинет автора: рукописи, загрузка, аналитика |
| `edits.html`, `order.html` | Заказы редактуры |
| `discover.html`, `book.html`, `read.html`, `profile.html` | Каталог, страница книги, читалка, профиль |
| `chat.html` | Личный чат с Ethereal Editorial (реквизиты оплаты — только здесь) |
| `admin.html` | Одобрение читателей, образцы, заказы, чаты |
| `legal.html` | Privacy / Terms / Confidentiality / About |
| `app.js` | Общий код; ключи Supabase и контакты (почта, Facebook, Upwork) — в начале файла |
| `styles.css` | Оформление |
| `logo-full.png`, `logo-mark.png`, `favicon.png` | Логотипы и иконка |
| `schema.sql` | Таблицы, права доступа, хранилище файлов — выполняется в Supabase |
| `vercel.json` | Красивые адреса без `.html` и заголовки безопасности |

## Безопасность

- Права проверяет сама база, а не браузер: читатель не может открыть закрытую главу или чужую рукопись, автор — чужие книги, никто, кроме админа, — заявки и заказы других людей.
- Цены заказа пересчитываются в базе; подменить сумму из браузера нельзя.
- Рукописи и файлы образцов лежат в закрытых хранилищах; админ скачивает их по временной ссылке.

## Локальная проверка

После шага 2, в папке `website`:
```
python -m http.server 5517
```
и откройте http://localhost:5517
