# Лабораторна робота №2
## Завдання
Варіант: 24

Пошук за атрибутами: діапазон чисел, перелічення.<br>
Повнотекстовий пошук: слово не входить, обов’язкове входження слова.
## Нормалізована модель даних

У порівнянні з попередньої лабораторною роботою, було стоврено відношення `cities`,
при приведення відношення `warehouses` до 1НФ: а саме, ключ `address` було поділено
на атомарні частини: місто, та назву вулиці з номером будинку.

Тому у відношеннях зберігаються атомарні дані, у якості `primary key` всюди виступає
лише один атрибут, та транзитивних залежностей другорядних атрибутів від первинних
не знайдено. А отже розроблена БД цілком перебуває у 3НФ.

| ВІДНОШЕННЯ | АТРИБУТ | ТИП (РОЗМІР) |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| Groups | ID - ідентифікатор сутності групи <br>Faculty - факультет, до якого належить група <br>Name - назва групи | uuid <br>text <br>text |
| Journal Entries | ID - ідентифікатор сутності запису "про відвідування студентом заняття" <br>Student_ID - ідентифікатор сутності студента, факт присутності(відсутності) якого зберігається в записі <br>Class_ID - ідентифікатор сутності заняття, на якому був пристутній(відсутній) студент <br>Date - дата проведення заняття <br>Did Attended - чи був пристутній студент, чи - відсутній | uuid <br>uuid <br>uuid <br>date <br>boolean |
| Students | Name - ПІБ студента <br>Student_ID - ідентифікатор сутності студента <br>Privileges - чи є студент старостою, чи ні <br>Last Location - координати останньго записаного положення студента <br>Last Location Time - час, коли координати останнього положення були записані <br>Password - зашифрований пароль <br>Group_ID - ідентифікатор сутності групи, до якої належить студент | text <br>uuid <br>boolean <br>point timestamp(0) without timezone <br>text <br>uuid |
| Teachers | ID - ідентифікатор сутності викладача <br>Name - ПІБ викладача <br>Password - зашифрований пароль викладача | uuid <br>text <br>text |
| TheClasses | ID - ідентифікатор сутності заняття <br>Name - назва заняття <br>Time - на котрій парі під час тижня проводиться заняття <br>Location - координати аудиторії в якій проводиться заняття <br>Teacher - ідентифікатор сутності викладача, який проводить заняття <br>Group - ідентифікатор сутності групи, для якої проводиться заняття | uuid <br>text <br>integer <br>point <br>uuid <br>uuid |

### SQL

```sql
CREATE TABLE public."Groups"
(
    "Name" text COLLATE pg_catalog."default",
    "Faculty" text COLLATE pg_catalog."default",
    "ID" uuid NOT NULL,
    CONSTRAINT "Groups_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT unique_bla1_group UNIQUE ("ID")

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Journal Entries"
(
    "Student_ID" uuid,
    "Date" date,
    "Did Attended" boolean,
    "ID" uuid NOT NULL,
    "Class_ID" uuid,
    CONSTRAINT "Journal Entries_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT je_unique_bla UNIQUE ("ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Class_ID")
        REFERENCES public."TheClasses" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT bla2 FOREIGN KEY ("Student_ID")
        REFERENCES public."Students" ("Student_ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Students"
(
    "Name" text COLLATE pg_catalog."default" NOT NULL,
    "Privileges" boolean,
    "Last Location" point,
    "Password" text COLLATE pg_catalog."default",
    "Group_ID" uuid,
    "Last Location Time" timestamp(0) without time zone,
    "Student_ID" uuid,
    CONSTRAINT "Students_pkey" PRIMARY KEY ("Name"),
    CONSTRAINT unique_bla1 UNIQUE ("Student_ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Group_ID")
        REFERENCES public."Groups" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."Teachers"
(
    "Name" text COLLATE pg_catalog."default" NOT NULL,
    "Password" text COLLATE pg_catalog."default" NOT NULL,
    "ID" uuid NOT NULL,
    CONSTRAINT "Teachers_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT teacher_unique_bla UNIQUE ("ID")

)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE public."TheClasses"
(
    "Time" integer,
    "Location" point,
    "Teacher ID" uuid,
    "Group ID" uuid,
    "ID" uuid NOT NULL,
    "Name" text COLLATE pg_catalog."default",
    CONSTRAINT "TheClasses_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT class_unique_bla UNIQUE ("ID")
,
    CONSTRAINT bla1 FOREIGN KEY ("Teacher ID")
        REFERENCES public."Teachers" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT bla2 FOREIGN KEY ("Group ID")
        REFERENCES public."Groups" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
```

## Лістинги програм з директивами внесення, редагування та вилучення даних у базі даних та результати виконання цих директив

`controller/__init__.py`

```python
class BaseController(ABC):
    def __init__(self, model: BaseModel, view: BaseView):
        self.__model = model
        self.__view = view
        self._cb_show_prev_state = None

    def show(self, pk: int = None):
        pk_not_specified = pk is None
        if pk_not_specified:
            pk = self.__view.get_item_pk('Reading')
        try:
            if isinstance(pk, str):
                pk = int(pk)
            item = self.__model.read(pk)
            self.__view.show_item(item)
        except (Exception, psycopg2.Error) as e:
            exception_handler(e, self.__model.rollback)
            self.__view.show_error(str(e))
        finally:
            if pk_not_specified:
                self.choose_operation()
            else:
                self.show_all()

    def insert(self):
        input_items = self.__get_input_items_form(self._prompt_values_for_input())
        command = self.__view.show_input_item_form(input_items, 'Create')
        if command == ConsoleCommands.GO_BACK:
            return self.choose_operation()
        if command == ConsoleCommands.CONFIRM:
            try:
                pk_name = self.__model.primary_key_name
                item = self.__model.create(self._create_obj_from_input(input_items))
                self.__view.show_created_item(item, pk_name)
            except (Exception, psycopg2.Error) as e:
                exception_handler(e, self.__model.rollback)
                self.__view.show_error(str(e))
            finally:
                self.choose_operation()

    def update(self):
        pk = self.__view.get_item_pk('Updating')
        try:
            if isinstance(pk, str):
                pk = int(pk)
            item = self.__model.read(pk)
            input_items = self.__get_input_items_form(self._prompt_values_for_input(item, True))
            command = self.__view.show_input_item_form(input_items, 'Update')
            if command == ConsoleCommands.GO_BACK:
                return self.choose_operation()
            if command == ConsoleCommands.CONFIRM:
                new_item = self._create_obj_from_input(input_items)
                pk_name = self.__model.primary_key_name
                setattr(new_item, pk_name, getattr(item, pk_name))
                self.__model.update(new_item)
                self.__view.show_updated_item(item, new_item)
        except (Exception, psycopg2.Error) as e:
            exception_handler(e, self.__model.rollback)
            self.__view.show_error(str(e))
        finally:
            self.choose_operation()

    def delete(self):
        pk = self.__view.get_item_pk('Deleting')
        try:
            if isinstance(pk, str):
                pk = int(pk)
            item = self.__model.read(pk)
            confirm = self.__view.confirm_deleting_form(item)
            if confirm.strip().lower() != "yes":
                return self.choose_operation()
            self.__model.delete(pk)
            self.__view.show_success(f"An item {item} was successfully deleted")
        except (Exception, psycopg2.Error) as e:
            exception_handler(e, self.__model.rollback)
            self.__view.show_error(str(e))
        finally:
            self.choose_operation()
```

### Процес внесення даних та його результат

![insert](img/inserting.png)

![insert](img/insert_result.png)

![insert](img/after_insert.png)

### Процес редагування, результат операцій

![update](img/updating.png)

![update](img/update_result.png)

### Процес вилучення даних, результат операцій

![delete](img/deleting.png)

![delete](img/delete_result.png)

![list](img/list_all.png)

## Лістинги програм зі статичними та динамічними запитами пошуку

`model/common.py`

```python
    def filter_items(self, cost_from: int, cost_to: int, sender_name: str = None, recipient_name: str = None):
        query = "SELECT num, date_departure, date_arrival, shipping_cost, c1.name, " \
                "c1.phone_number, c2.name, c2.phone_number from invoices i " \
                "INNER JOIN contragents c1 on i.sender_ipn = c1.ipn " \
                "INNER JOIN contragents c2 on i.recipient_ipn = c2.ipn " \
                "WHERE " \
                "shipping_cost::numeric BETWEEN (%(min)s) AND (%(max)s)"
        if isinstance(sender_name, str):
            query += " AND c1.name = (%(sender)s)"
        if isinstance(recipient_name, str):
            query += " AND c2.name = (%(recipient)s)"
        self.__cursor.execute(query, {'min': cost_from, 'max': cost_to,
                                      'sender': sender_name, 'recipient': recipient_name})
        rows = self.__cursor.fetchall()
        if isinstance(rows, list):
            return rows
        else:
            raise Exception("There are no items")

    def fulltext_search(self, query: str, including: bool):
        if not including:
            words = query.split()
            if len(words) > 0:
                words[0] = "!" + words[0]
            counter = 1
            while counter < len(words):
                words[counter] = "& !" + words[counter]
            query = ' '.join(words)
        query_excluding = "SELECT ts_headline(description, q) " \
                          "FROM goods, to_tsquery('english', %(query)s) AS q " \
                          "WHERE to_tsvector('english', description) @@ q "
        query_including = "SELECT ts_headline(description, q) " \
                          "FROM goods, plainto_tsquery('english', %(query)s) AS q " \
                          "WHERE to_tsvector('english', description) @@ q "
        self.__cursor.execute(query_including if including else query_excluding, {'query': query})
        rows = self.__cursor.fetchall()
        if isinstance(rows, list):
            return rows
        else:
            raise Exception("There are no items")
```

## Лістинг модуля «модель» згідно із шаблоном MVC

`model/__init__.py`

```python
class BaseModel(ABC):
    def __init__(self, connection, insert_query, select_query, update_query,
                 delete_query, select_all_query, count_query, primary_key_name):
        self._connection = connection
        self._cursor = connection.cursor(cursor_factory=DictCursor)
        self.__insert_query = insert_query
        self.__select_query = select_query
        self.__update_query = update_query
        self.__delete_query = delete_query
        self.__select_all_query = select_all_query
        self.__count_query = count_query
        self.__primary_key_name = primary_key_name

    def create(self, item: object):
        should_return_id = "returning" in self.__insert_query.lower()
        if not self._is_valid_item_dict(item.__dict__, not should_return_id):
            raise Exception("Item is not valid")
        self._cursor.execute(self.__insert_query, item.__dict__)
        self._connection.commit()
        if should_return_id:
            row = self._cursor.fetchone()
            if row is not None and isinstance(row[self.__primary_key_name], int):
                self.__insert_pk_in_item(item, row[self.__primary_key_name])
                return item
            else:
                raise Exception("No rows received from DB")

    def read(self, pk: int):
        if not isinstance(pk, int):
            raise Exception("Primary key should be an integer")
        self._cursor.execute(self.__select_query, [pk])
        row = self._cursor.fetchone()
        if row is not None and self._is_valid_item_dict(row):
            return self._get_item_from_row(row)
        else:
            raise Exception(f"No item with such primary key {pk} was found")

    def read_all(self, offset: int = 0, limit: int = None):
        self._cursor.execute(self.__select_all_query, {'limit': limit, 'offset': offset})
        rows = self._cursor.fetchall()
        if isinstance(rows, list) and all(self._is_valid_item_dict(row) for row in rows):
            return [self._get_item_from_row(row) for row in rows]
        else:
            raise Exception("There are no items")

    def update(self, item: object):
        if not self._is_valid_item_dict(item.__dict__):
            raise Exception("Item is not valid")
        self._cursor.execute(self.__update_query, item.__dict__)
        self._connection.commit()

    def delete(self, pk: int):
        if not isinstance(pk, int):
            raise Exception("Primary key should be an integer")
        self._cursor.execute(self.__delete_query, [pk])
        self._connection.commit()
```

`model/goods.py`

```python
class Goods:
    def __init__(self, height: int, width: int, depth: int, weight: int,
                 invoice_num: int,  description: str = None, g_id: int = None):
        self.id = g_id
        self.height = height
        self.width = width
        self.depth = depth
        self.weight = weight
        self.description = description
        self.invoice_num = invoice_num

    def __str__(self):
        return f"Goods [id={self.id}, height={self.height}, width={self.width}, depth={self.depth}, " \
               f"weight={self.weight}, description={self.description}, invoice_num={self.invoice_num}]"


class GoodsModel(BaseModel):
    def __init__(self, connection):
        insert_query = "INSERT INTO goods (height, width, depth, weight, description, invoice_num) " \
                       "VALUES (%(height)s, %(width)s, %(depth)s, %(weight)s, %(description)s, %(invoice_num)s)" \
                       "RETURNING id"
        select_query = "SELECT * FROM goods WHERE id = %s"
        update_query = "UPDATE goods SET height = %(height)s, width = %(width)s, depth = %(depth)s, " \
                       "weight = %(weight)s, description = %(description)s, invoice_num = %(invoice_num)s " \
                       "WHERE id = %(id)s"
        delete_query = "DELETE FROM goods WHERE id = %s"
        select_all_query = "SELECT * FROM goods ORDER BY id OFFSET %(offset)s LIMIT %(limit)s"
        count_query = "SELECT COUNT(*) FROM goods"
        primary_key_name = "id"
        super().__init__(connection, insert_query, select_query, update_query,
                         delete_query, select_all_query, count_query, primary_key_name)
```

## Скріншоти результатів виконання операції вилучення запису батьківської таблиці та виведення вмісту дочірньої таблиці після цього вилучення, а якщо воно неможливе, то результат перехоплення помилки з виведенням повідомлення про неможливість видалення за наявності залежних даних

Список накладних:

![invoices](img/invoices_list.png)

Список товарів:

![goods](img/goods_list.png)

Як бачимо, тільки накладна №4 немає товарів

Видалимо цю накладну:

![invoice delete](img/invoice_delete.png)

Як бачимо результат успішний:

![operation delete invoice result](img/invoice_success.png)

Спробуємо видалити іншу накладну:

![invoice delete another](img/invoice_another_delete.png)

Отримуємо помилку:

![invoice delete error](img/invoice_error.png)

Список накладних після зроблених операцій:

![invoice list after all](img/invoice_list_after.png)
