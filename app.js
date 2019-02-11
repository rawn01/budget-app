//  *********************************
//  ******* BUDGET CONTROLLER *******
//  *********************************
var budgetController = (function() {
  // Expense constructor function
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalInc) {
    if(totalInc > 0) {
      this.percentage = Math.floor((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Income constructor function
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  // Data "object" used to store data
  var data = {
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
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(item) {
      sum += item.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItems: function(type, desc, val) {
      var newItem, id;
      // Create new ID with finding last element of the array's ID and adding 1
      if(data.allItems[type].length === 0) {
        id = 1;
      } else {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      // Create new item based on 'inc' or 'exp'
      if(type === 'exp') {
        newItem = new Expense(id, desc, val);
      } else if(type === 'inc') {
        var newItem = new Income(id, desc, val);
      }
      // Push new item into our data structure(data "object")
      data.allItems[type].push(newItem);
      // Return the new item (object)
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(item) {
        return item.id;
      });
      index = ids.indexOf(id);
      console.log(index);
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate the budget: income - expenses
      data.budget = parseFloat(data.totals.inc - data.totals.exp).toFixed(2);
      // Calculate the percentage of income that we spent
      if(data.totals.inc > 0) {
        data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(item) {
        item.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(item) {
        return item.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();


// *****************************
// ******* UI CONTROLLER *******
// *****************************
var uiController = (function() {

  var formatNumber = function(num, type) {
    var numSplit, int, decimal;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    decimal = numSplit[1];
    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // 2310 => 2,310
    }

    return (type === 'exp' ? "-" : "+") + " " + int + "." + decimal;
  };

  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

  return {
    // To get the value from the UI
    getInput: function() {
      return {
        type : document.querySelector(".add__type").value,
        description : document.querySelector(".add__description").value,
        value : parseFloat(document.querySelector(".add__value").value)
      };
    },
    // Add item to the DOM
    addListItem: function(obj, type) {  //obj is the "item" in ctrlAddItem function
      var html, newHtml, element;
      // Create HTML string with placeholder
      if(type === "inc") {
        element = ".income__list";
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === "exp") {
        element = ".expenses__list";
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replace the placeholder text with some actual text
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId) {
      document.getElementById(selectorId).parentNode.removeChild(document.getElementById(selectorId))
    },
    // Clear the fields after the click event
    clearFields: function() {
      // Select description and field object and put it in array-like object called node-list
      var fields = document.querySelectorAll('.add__description, .add__value');
      // Convert 'array-like' object to 'array' and use forEach method to clear the values
      var fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(item, index, arr) {
        item.value = "";
      });
      // After click event on '.add_btn' focus back on description rather than value
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
      document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExpense, 'exp');

      if(obj.percentage > 0) {
          document.querySelector('.budget__expenses--percentage').textContent = Math.floor(obj.percentage) + "%";
      } else {
          document.querySelector('.budget__expenses--percentage').textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll('.item__percentage');

      nodeListForEach(fields, function(item, index) {
        if(percentages[index] > 0) {
          item.textContent = percentages[index] + "%";
        } else {
          item.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now = new Date();
      var year = now.getFullYear();
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
      var month = now.getMonth();
      document.querySelector('.budget__title--month').textContent = months[month] + " " + year;
    },

    changeType: function() {
      var fields = document.querySelectorAll('.add__type, .add__description, .add__value');
      console.log(fields);
      nodeListForEach(fields, function(item) {
        item.classList.toggle('red-focus');
      });
      document.querySelector('.add__btn').classList.toggle('red');
    }
  };

})();


// *********************************
// ******* GLOBAL CONTROLLER *******
// *********************************
var controller = (function(budgetCtrl, uiCtrl) {
  // Set up the Event Listeners
  var setupEventListeners = function() {
    document.querySelector(".add__btn").addEventListener('click', ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

    document.querySelector('.add__type').addEventListener('change', uiCtrl.changeType);
  }

  var updateBudget = function() {
    // 1.(5) Caclculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    console.log(budget);
    // 3.(6) Display the budget on the UI
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // 1. Calculate percentage
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with new percentages
    uiCtrl.displayPercentages(percentages);
  };

  function ctrlAddItem() {
    // 1. Get the field input data
    var ctrlInput = uiCtrl.getInput();
    if( (ctrlInput.description !== "") && (!isNaN(ctrlInput.value)) && (ctrlInput.value > 0) ) {
      // 2. Add item to budget controller
      var item = budgetCtrl.addItems(ctrlInput.type, ctrlInput.description, ctrlInput.value);
      console.log(item);
      // 3. Add new item to the UI
      uiCtrl.addListItem(item, ctrlInput.type);
      // 4. Clear the fields(of the description and the value 'DOM' element)
      uiCtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
      // 6. Calculate and update the percentages
      updatePercentages();
    }
  }

  function ctrlDeleteItem(event) {
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      // 2.Delete the item from the UI
      uiCtrl.deleteListItem(itemID);
      // 3.Update and show the new budget
      updateBudget();
      // 4. Calculate and update the percentages
      updatePercentages();
    }
  }

  return {
    init: function() {
      console.log("App has started!");
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: 0
      })
      setupEventListeners();
    }
  }

})(budgetController, uiController);


controller.init();
