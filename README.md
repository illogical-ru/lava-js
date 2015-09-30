lava-js
=======

**Контекст:** querySelector, onload  
**Работа с набором:** children, each, end, eq, filter, find, first, fork, get, gt, last, lt, merge, not, next, nextAll, parent, prev, prevAll, size, sort, unique  
**Атрибуты:** addClass, delClass, hasClass, html, toggleClass  
**События:** bind, one, trigger, unbind  
**Утилиты:** copy, each, escapeHTML, exists, extend, grep, map, merge, trim, type  
**Расширение:** filter, fn  


## Контекст


### lava("selector") : api

CSS селектор, возможна выборка по `#id`, `tagName`, `.className`, `[attr]`

**Комбинированные селекторы:**

* `first, second...` - элементы удовлетворяющие любому из селекторов
* `outer inner` - элементы inner, которые являются потомками элементов outer
* `parent > child` - элементы child, которые являются непосредственными потомками элементов parent
* `prev + next` - элементы next, которые следуют непосредственно за элементами prev
* `prev ~ next` - элементы next, которые следуют за элементами prev

```
lava("#bar");         // элемент с id=bar
lava("div.foo");      // элементы div с классом foo
lava("a[href$=.js]"); // все ссылки на js файлы
lava("div >:odd");    // нечетные потомки div
lava("#bar a:first"); // первая ссылка из элемента с id=bar
```

**Фильтры:**

* first - первый элемент
* last - последний элемент
* odd - нечетные элементы
* even - четные элементы
* eq - элемент с указаным индексом
* lt - элементы с индексом меньше
* gt - элементы с индексом больше
* not - элементы не соответствующие селектору
* has - элементы которые имеют элементы соответствующие селектору
* parent - непустые элементы
* empty - пустые элементы
* selected - выбранные элементы


### lava(fn(lava)) : api

Выполняет функцию fn при готовности DOM

```
lava(function() {alert("ready")});
```


## Работа с набором


### api.children([filter]) : api

Возвращает непосредственных потомков

```
lava("div").children(); // выбрать все элементы, которые являются потомками div
```


### api.each(fn(index, el, api)) : api

Выполняет функцию fn для каждого отдельного элемента  
В fn передаются 3 параметра: индекс, элемент и api

```
lava("div").each(function() {
    this.style.border = "1px solid red";
});
// установить border для каждого div
```


### api.end() : api

Возвращает предыдущий набор, если его нет, то текущий

```
lava("div").filter(".foo").do_something...
           .end()
           .filter(".bar").do_something...
```


### api.eq(index) : api

Возвращает элемент, индекс которого равен index

```
lava("div").eq(5); // шестой div
```


### api.filter(filter) : api

Возвращает элементы соответствующие фильтру  
Комбинированная часть фильтра, работает как has

```
lava("div").filter(":odd");       // нечетные div

lava("div").filter(".foo > bar"); // div с классом foo имеющих потомков bar
```


### api.find(context) : api

Поиск в каждом элементе в наборе

```
lava("div").find("a"); // найти ссылки в найденных div
```


### api.first() : api

Возвращает первый элемент в наборе

```
lava("div").first(); // первый div
```


### api.fork([context]) : api

Возвращает новый набор, который будет дочерным для текущего  
Получить предыдущий набор можно с помощью end()  
Первая часть фильтра выбирает из набора, комбинированная выбирает из DOM

```
lava("div").fork  (".foo > bar");
// bar которые являются потомками div.foo
// без комбинированой части, работает как filter

lava("div").find  (".foo > bar");
// bar которые являются потомками элементов с классом foo найденных в div
// всегда происходит поиск в DOM

lava("div").filter(".foo > bar");
// div.foo имеющих хотя бы одного потомка bar
// комбинированная часть фильтра работает как has
```


### api.get() : array

Массив всех элементов в наборе

```
lava("div").get(); // [elements]
```


### api.gt(index) : api

Возвращает элементы, индекс которых больше index

```
lava("div").gt(5);
```


### api.last() : api

Возвращает последний элемент в наборе

```
lava("div").last(); // последний div
```


### api.lt(index) : api

Возвращает элементы, индекс которых меньше index

```
lava("div").lt(5); // пять первых div
```


### api.merge(context) : api

Добавляет в набор новые элементы

```
lava("div").merge("span");
lava("div").merge(document.getElementsByTagName("span"));
// все div и span на странице
```


### api.not(filter) : api

Возвращает элементы не соответствующие фильтру

```
lava("div").not(".foo");
// все div, которые не имеют класс foo
```


### api.next([filter]) : api

Возвращает следующий родственный элемент

```
lava("div").next();
```


### api.nextAll([filter]) : api

Возвращает все следующие родственные элементы

```
lava("div").nextAll();
```


### api.parent([filter]) : api

Возвращает родительские элементы

```
lava("div").parent();       // родители всех div
lava("div").parent(".foo"); // родители с классом foo
```


### api.prev([filter]) : api

Возвращает предыдущий родственный элемент

```
lava("div").prev();
```


### api.prevAll([filter]) : api

Возвращает все предыдущие родственные элементы

```
lava("div").prevAll();
```


### api.size() : api.length

Возвращает количество элементов содержащихся в наборе

```
lava("div").size(); // количество div на странице
```


### api.sort([fn]) : api

Сортировка элементов с помощью функции fn  
По умолчанию: document, узлы в документе в порядке обхода, остальные элементы

```
lava("div").sort(function() {return Math.random() - 0.5});
// сортировать случайно

lava("body")  .merge(document)  // [body, document]
              .merge("html")    // [body, document, html]
              .sort ()          // [document, html, body]
// сортировать по позиции в DOM
```


### api.unique() : api

Возвращает набор из уникальных элементов

```
lava([document, window, document]).unique(); // [document, window]
```


## Атрибуты


### api.addClass(name) : api

Добавляет класс name

```
lava("div").addClass("foo");
```


### api.delClass(name) : api

Удаляет класс name

```
lava("div").delClass("foo");
```


### api.hasClass(name) : boolean

Возвращает true, если в наборе есть хотя бы один элемент с классом name

```
lava("div").hasClass("foo");
```


### api.html([text]) : (api|html)

Возвращает или изменяет html-содержимое

```
lava("div").html("text");
```


### api.toggleClass(name) : api

Переключает класс name

```
lava("div").toggleClass("foo");
```


## События


### api.bind(type, fn(event)) : api

Устанавливает функцию fn, как обработчик для события type

```
lava("a").bind("click", function() {
    alert(this.href);
});

// или

lava("a").click(function() {
    alert(this.href);
});
```

**Алиасы для type:**
click, dblclick, mousedown, mouseup, mouseover, mouseout, mousemove, keypress, keydown, keyup, focus, blur, submit, change

**Содержимое объекта event:**

* type - тип события
* originalEvent - оригинальное событие
* isTrigger - устанавливается в true, если событие было вызвано триггером
* target - источник события
* currentTarget - совпадает с this
* relatedTarget - другой элемент участвующий в событии
* timeStamp - таймстамп события
* clientX, clientY, offsetX, offsetY, pageX, pageY, screenX, screenY - мышь
* which, button, altKey, ctrlKey, shiftKey, metaKey - клавиатура
* preventDefault() - отменить действие по умолчанию
* stopPropagation() - отменить всплытие события
* stopImmediatePropagation() - отменить всплытие и выполнение остальных обработчиков
* isDefaultPrevented() - флаг для preventDefault
* isPropagationStopped() - флаг для stopPropagation
* isImmediatePropagationStopped() - флаг для stopImmediatePropagation


### api.one(type, fn(event)) : api

Устнавливает функцию fn, как одноразовый обработчик для события type

```
lava("a").one("click", function() {
    alert("click"); // сработает один раз
});
```


### api.trigger(type) : api

Генерирует событие type

```
lava("a").trigger("click");
// или
lava("a").click();
```


### api.unbind([type [, fn]]) : api

Удаляет обработчик fn для события type

```
lava("a").unbind("click", fn);  // удалить обработчик fn с типом click
lava("a").unbind("click");      // удалить все обработчики с типом click
lava("a").unbind();             // удалить все обработчики
```


## Утилиты


### lava.copy(obj, src, keys) : obj

Копирует ключи keys из src в obj

```
lava.copy({abc: 123}, {qwe: 234, asd: 345}, ["qwe", "bad"]);
// {abc: 123, qwe: 234};
```


### lava.each(data, fn(index, el, data)) : [fnResult]

Выполняет функцию fn для каждого отдельного элемента data  
В fn передаются 3 параметра: номер элемента или ключ, элемент и исходные данные  
Цикл прервется, если функция вернет значение отличное от undefined или null

```
lava.each([1, "abc", 3], function(i) {
    alert([i, this]);
});

// 0,1
// 1,"abc"
// 2,3
```


### lava.escapeHTML(data) : string

Возвращает экранированную HTML строку

```
lava.escapeHTML("1 <b>2</b> 3"); // 1 &lt;b&gt;2&lt;/b&gt; 3
```


### lava.exists(data, val) : index

Проверяет наличие значения val в data  
В случае успеха, возвращает индекс или ключ, в противном случае -1  
Индекс начинается с нуля

```
lava.exists(["a", "b", "c"], "b"); // 1
```


### lava.extend(obj, data) : obj

Расширяет obj свойствами из data

```
lava.extend({abc: 123}, {qwe: 234}); // {abc: 123, qwe: 234};
```


### lava.grep(data, fn(index, el, data) [, invert]) : array

Выполняет функцию fn для каждого отдельного элемента data  
Возвращает элементы из data в случае, если функция возвратит истинное значение  
В fn передаются 3 параметра: номер элемента или ключ, элемент и исходные данные  
Флаг invert используется для инвертирования результата

```
lava.grep([1, 2, 3], function() {
    return this & 1; // оставляем нечетные числа
});
// [1, 3]
```


### lava.map(data, fn(index, el, data)) : array

Выполняет функцию fn для каждого отдельного элемента data  
Возвращает массив полученный из результатов функции fn  
В fn передаются 3 параметра: номер элемента или ключ, элемент и исходные данные

```
lava.map([1, 2, 3], function() {
    return this * 10; // умножаем каждый элемент на 10
});
// [10, 20, 30]
```


### lava.merge(obj, data) : obj

Объединяет массивы

```
lava.merge([1, 2], "abc", [3, 4]); // [1, 2, "abc", 3, 4];
```


### lava.trim(data) : string

Возвращает строку, удаляя из нее начальные и конечные пробелы

```
lava.trim(" 1, 2, 3 "); // "1, 2, 3"
```


### lava.type(obj) : string

Возвращает класс obj

```
lava.type("text");  // String
lava.type(123);     // Number
```


## Расширение


### lava.filter : filterPrototype

Расширение фильтров селектора  
Функция вызывается с параметрами: fn(index, val, data)  
Где index - позиция элемента в наборе, val - аргумент фильтра и data - набор, в this текущий элемент  
Элемент остается в наборе, если функция вернет истинное значение

```
lava.filter.odd = function(i) {
    return i & 1;
}

lava("div:odd"); // выбрать нечетные div
```


### lava.fn : fnPrototype

Расширение методов

```
lava.fn.hide = function() {
    return this.addClass("hide");
}

lava("div").hide(); // добавить всем элементам класс hide
```
