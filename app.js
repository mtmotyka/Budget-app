//BUDGET CONTROLLER
const budgetController = (function() {

    const Expense = function(id, description, value) { //konstruktor    
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const Income = function(id, description, value) { //konstruktor    
        this.id = id;
        this.description = description;
        this.value = value;
    };
    //obliczanie wydatkówych/przychodów całkowitych - total
    const calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    let data = { //obiekt data, który ma obiety allitems i totals, które przechowują informacje o wydatkach i przychodach 
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, desc, val) { //metoda, która pozwala innym kontrolerom dodawać wpisane rzeczy do obiektu data wyżej
            let newItem, ID;
            //Tworzenie nowego ID
            if (data.allItems[type].lenght > 0) {
                ID = data.allItems[type][data.allItems[type].lenght - 1].id + 1;
            } else {
                ID = 0; 
            }
            // Tworzenie nowego itemu
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            //Pushowanie do data structure
            data.allItems[type].push(newItem); //pushujemy nowy obiekt do tablicy exp albo inc, a ponieważ mają takie same nazwy co tablice to mozna je wybrać jako type
            //Zwracanie nowego elementu
            return newItem;
        },

        calculateBudget: function() {
            //obliczenie wydatków i przychodów
            calculateTotal('exp');
            calculateTotal('inc');
            //przeliczenie budżetu: przychody - wydatki
            data.budget = data.totals.inc - data.totals.exp;
            //obliczenie procentów
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI CONTROLLER
const UIController = (function() {

    const DOMstrings = { //obiekt do przechowywania klas i IDków z htmla np. add__btn, żeby nie powtarzać ciągle
        inputType: '.add__type',
        inputDescription : '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'

    };

    // Funkcja która pobiera wartość inputu i musi być public, bo bedą jej używać inne kontrolery
    return {
        getInput : function() { //getinput to obiekt, a to jest metoda do zwracania inputów
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Będzie inc (przychód) albo exp (wydatek)
                description: document.querySelector(DOMstrings.inputDescription).value, //wcześniej tu było np '.add__description', ale teraz mamy to w obiekcie DOMstring
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;
            
            //Stworzenie HTMLA z placeholderem
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expensesContainer;
                html = ' <div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Podmiana placeholdera z wprowadzonym inputem  (obiektem)
            newHtml = html.replace('%id%', obj.id); //podmiana %id% z htmla na id z obiektu
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //DOdawanie wygenerowanego kodu htmla do pliku html
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        //czyszczenie inputa po wprowadzeniu danych i zatwierdzeniu
        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //to wygeneruje listę elementów

            fieldsArr = Array.prototype.slice.call(fields); //konwersja listy na tablice

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        
        getDOMstrings: function() {
            return DOMstrings; //przekazuje prywatny DOMstring do "publicznej przestrzeni", dzięki temu inne kontrolery mają do tego dostęp i dalej można w nich używać tych stałych zamiast klas z htmla
        }
    };

})();



// GLOBAL APP CONTROLLER - tutaj mówimy co inne moduły mają robić
const controller = (function(budgetCtrl, UICtrl) {

    const setupEventListeners = function() { //tutaj przechowywane będą wszystko eventlistenery
        const DOM = UICtrl.getDOMstrings(); //metoda z UIcontrollera

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem); // DOM.inputButton a nie DOMstring.inputButton jak wyżej, bo tutaj ten obiekt jest w stałej DOM
        
        document.addEventListener('keypress', function(event) { // event = e
        if (event.keyCode === 13) { //13 to kod enteru. Jeśli wcisniesz enter to wykonuj to co nizej
            ctrlAddItem();
        }
        });     
    };

    const updateBudget = function () {
         // 5. Przeliczyć budget
         budgetController.calculateBudget();
         // 6. Zwrócić budget
        const budget = budgetCtrl.getBudget();
        // 7. Wyświetlić budget
        UICtrl.displayBudget(budget);
    };

    const ctrlAddItem = function() { //funkcja dodająca budżet itd. której później używamy niżej w przyciskach, żeby nie powielac kodu
        let input, newItem
        // TODO
        // 1. Pobrać zawartośc inputu
        input = UICtrl.getInput(); //wywołujemy metodę getInput z kontrolera UIController, który tu się nazywa UICtrl
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { //zapobieganie wprowadzeniu pustych inputów
            // 2. Dodać wprowadzony wydatek/przychód do budget controllera
            newItem = budgetController.addItem(input.type, input.description, input.value);
            // 3. Dodać wprowadzony wydatek/przychód do UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Wyczyścić pola inputów
            UICtrl.clearFields();
            // 5. Przeliczyć budget i wyswietlic
            updateBudget();   
        }
    };

    return {
        init: function() {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init(); //inicjujemy eventlistenery z trzeciego kontrolera