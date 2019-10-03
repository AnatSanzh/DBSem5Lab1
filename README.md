# Лабораторна робота №1
### Тема: Ознайомлення з базовими операціями СУБД PostgreSQL
Варіант: 19

База даних "навчального процесу в університеті".

![ER diagram](https://github.com/AnatSanzh/DBSem5Lab1/blob/master/Untitled%20Diagram.png)

| ВІДНОШЕННЯ | АТРИБУТ | ТИП (РОЗМІР) |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| Groups | ID - ідентифікатор сутності групи <br>Faculty - факультет, до якого належить група <br>Name - назва групи | uuid <br>text <br>text |
| Journal Entries | ID - ідентифікатор сутності запису "про відвідування студентом заняття" <br>Student_ID - ідентифікатор сутності студента, факт присутності(відсутності) якого зберігається в записі <br>Class_ID - ідентифікатор сутності заняття, на якому був пристутній(відсутній) студент <br>Date - дата проведення заняття <br>Did Attended - чи був пристутній студент, чи - відсутній | uuid <br>uuid <br>uuid <br>date <br>boolean |
| Students | Name - ПІБ студента <br>Student_ID - ідентифікатор сутності студента <br>Privileges - чи є студент старостою, чи ні <br>Last Location - координати останньго записаного положення студента <br>Last Location Time - час, коли координати останнього положення були записані <br>Password - зашифрований пароль <br>Group_ID - ідентифікатор сутності групи, до якої належить студент | text <br>uuid <br>boolean <br>point timestamp(0) without timezone <br>text <br>uuid |
| Teachers | ID - ідентифікатор сутності викладача <br>Name - ПІБ викладача <br>Password - зашифрований пароль викладача | uuid <br>text <br>text |
| TheClasses | ID - ідентифікатор сутності заняття <br>Name - назва заняття <br>Time - на котрій парі під час тижня проводиться заняття <br>Location - координати аудиторії в якій проводиться заняття <br>Teacher - ідентифікатор сутності викладача, який проводить заняття <br>Group - ідентифікатор сутності групи, для якої проводиться заняття | uuid <br>text <br>integer <br>point <br>uuid <br>uuid |
