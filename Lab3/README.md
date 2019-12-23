# Лабораторна робота №3
## Умова завдання
Варіант: 24

Види індексів: GIN(students.Name), BRIN(journal_entries.Date).<br>
Умови для тригерів: after update, insert.
## Завдання

## Завдання №2: команди створення індексів, тексти і час виконання запитів SQL

### Команди SQL створення індексів

```sql
CREATE INDEX IF NOT EXISTS students_name_index ON public.students USING gin(name_tsv);

CREATE INDEX journal_entry_date_index ON public.journal_entries USING brin("Date");
``` 

### SQL запити
```sql
Explain analyze SELECT * FROM public.students t WHERE t.name_tsv @@ to_tsquery('english','Petrovuch');
```

![lab](img/GIN_querry.png)

```sql
Explain analyze SELECT * FROM public.journal_entries t WHERE t."Date" BETWEEN '2001-01-01' AND '2015-09-23';
```

![lab](img/BRIN_query.png)

## Завдання №3: команди, що ініціюють виконання тригера, текст тригера та скріншоти зі змінами у таблицях бази даних

### Код тригеру

![lab](img/trigger_code.png)

### При додаванні/оновленні студентів в базі даних, оновлюється поли, призначене для індексування

![lab](img/beforeupdate.png)  
![lab](img/updationg.png)  
![lab](img/afterupdate.png)  

## Завдання №4: скріншоти з ходом виконання запитів та їх результатів у обох транзакціях по кожному рівню ізоляції

### READ COMMITTED

<table>
    <tr>
        <td>Transction #1</td>
        <td>Transction #2</td>
    </tr>
    <tr>
        <td>
            <pre lang="sql">
-- #1
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT name FROM "Doctor" WHERE id = 6;
-- #2
<br>
<br>
-- #3
SELECT name FROM "Doctor" WHERE id = 6;
-- #4
<br>
-- #5
SELECT name FROM "Doctor" WHERE id = 6;
            </pre>
        </td>
        <td>
            <pre lang="sql">
-- #1
<br>
<br>
-- #2
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
UPDATE "Doctor" SET name = 'Bogdan' WHERE id = 6;
-- #3
<br>
-- #4
COMMIT;
<br>
<br>
            </pre>
        </td>
    </tr>
</table>

| Transaction #1      | Transaction #2      |
|---------------------|---------------------|
| ![lab](screens/rc1.png) |                     |
|                     | ![lab](screens/rc2.png) |
| ![lab](screens/rc3.png) |                     |
|                     | ![lab](screens/rc4.png) |
| ![lab](screens/rc5.png) |                     |

### REPEATABLE READ

<table>
    <tr>
        <td>Transction #1</td>
        <td>Transction #2</td>
    </tr>
    <tr>
        <td>
            <pre lang="sql">
-- #1
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT name FROM "Doctor" WHERE id = 6;
-- #2
<br>
<br>
<br>
-- #3
SELECT name FROM "Doctor" WHERE id = 6;
-- #4
COMMIT;
SELECT name FROM "Doctor" WHERE id = 6;
            </pre>
        </td>
        <td>
            <pre lang="sql">
-- #1
<br>
<br>
-- #2
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
UPDATE "Doctor" SET name = 'Andrii' WHERE id = 6;
COMMIT;
-- #3
<br>
-- #4
<br>
<br>
            </pre>
        </td>
    </tr>
</table>

| Transaction #1      | Transaction #2      |
|---------------------|---------------------|
| ![lab](screens/rr1.png) |                     |
|                     | ![lab](screens/rr2.png) |
| ![lab](screens/rr3.png) |                     |
| ![lab](screens/rr4.png) |                     |

### SERIALIZABLE

<table>
    <tr>
        <td>Transction #1</td>
        <td>Transction #2</td>
    </tr>
    <tr>
        <td>
            <pre lang="sql">
-- #1
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM "Doctor";
-- #2
<br>
<br>
<br>
<br>
-- #3
SELECT COUNT(*) FROM "Doctor";
-- #4
COMMIT;
SELECT COUNT(*) FROM "Doctor";
            </pre>
        </td>
        <td>
            <pre lang="sql">
-- #1
<br>
<br>
-- #2
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
INSERT INTO "Doctor" (name, surname, speciality, qualification, 
	clinic_id) VALUES ('Ihor', 'Vens', 'Surgeon', 'Master', null);
COMMIT;
-- #3
<br>
-- #4
<br>
<br>
            </pre>
        </td>
    </tr>
</table>

| Transaction #1      | Transaction #2      |
|---------------------|---------------------|
| ![lab](screens/sz1.png)  |                     |
|                     | ![lab](screens/sz2.png)  |
| ![lab](screens/sz3.png)  |                     |
| ![lab](screens/sz4.png)  |                     |