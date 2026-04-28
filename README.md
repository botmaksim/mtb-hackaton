# MTCity — Banking Empire Tycoon

**MTCity** — это стратегическая Idle-игра, разработанная для хакатона MTBank. Игроки примеряют на себя роль градостроителей-банкиров: строят филиалы, управляют ресурсами и соревнуются за звание самого успешного инвестора.

---

## Стек технологий

* **Backend:** Python 3.12, Django 6.0, Django Rest Framework (DRF)
* **Authentication:** JWT (SimpleJWT)
* **Frontend:** React 18, Vite, Tailwind CSS
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

---

## Основные механики

* **Постройка и развитие:** Размещение зданий на карте по координатам `(x, y)`. Каждое здание имеет уровень и тип.
* **Сбор дохода:** Система пассивного заработка — монеты начисляются в зависимости от времени, прошедшего с последнего сбора.
* **Экономика:** * `Coins` — основная валюта.
    * `MTCoins` — премиум-валюта (кейсы, обмен).
    * `Marketplace` — покупка и продажа ресурсов между игроками.
* **Социальный слой:** Глобальный лидерборд и система синдикатов.

---

## Старт

1.  **Клонирование и запуск:**
    ```bash
    git clone github.com/mtb-hackaton/mt-city
    cd mt-city
    docker compose up --build
    ```

2.  **Инициализация БД (в новом терминале):**
    ```bash
    docker compose exec backend python manage.py migrate
    docker compose exec backend python manage.py createsuperuser
    ```

3.  **Доступ к сервисам:**
    * **Frontend:** `http://localhost:5173`
    * **API Root:** `http://localhost:8000/api/`
    * **Admin Panel:** `http://localhost:8000/admin/`

---

## 🔌 Основные API Эндпоинты

| Метод | Путь | Описание |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Создание аккаунта и получение JWT |
| `GET` | `/api/game/city/` | Данные о зданиях и балансе игрока |
| `POST` | `/api/game/build/` | Постройка здания (требует `type_id`, `pos_x`, `pos_y`) |
| `POST` | `/api/game/collect-income/` | Сбор накопившихся монет |
| `GET` | `/api/market/listings/` | Просмотр лотов на рынке |

---

## Структура проекта

* `/api` — Сердце бэкенда: модели (Profile, Building), сериализаторы и вьюхи.
* `/src/assets` — Статика фронтенда: `/entities` (здания), `/icons` (валюта).

---

## Разработчики
* **Малышев Виктор** — Lead Backend Developer
* **Монастырский Максим** — Frontend Developer

---
*Developed for MTBank Hackathon 2026*
