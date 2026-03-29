

  class Transaction {
  constructor(id, amount, date, category, subCategory, description) {
    this.id = id;
    this.amount = amount;
    this.date = date;
    this.category = category;
    this.subCategory = subCategory;
    this.description = description;
  }
}

class MoneyManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.editId = null;
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    this.list = document.getElementById("transactionList");
    this.form = document.getElementById("transactionForm");
    this.modal = document.getElementById("transactionModal");
    this.amount = document.getElementById("amount");
    this.date = document.getElementById("date");
    this.subCategory = document.getElementById("subCategory");
    this.description = document.getElementById("description");
    this.totalIncome = document.getElementById("totalIncome");
    this.totalExpense = document.getElementById("totalExpense");
    this.netBalance = document.getElementById("netBalance");
    this.filterCategory = document.getElementById("filterCategory");
    this.sortBy = document.getElementById("sortBy");
  }

  bindEvents() {
    document.getElementById("openFormBtn").onclick = () => this.openForm();
    document.getElementById("closeFormBtn").onclick = () => this.closeForm();
    this.form.onsubmit = (e) => this.handleSubmit(e);
    this.filterCategory.onchange = () => this.render();
    this.sortBy.onchange = () => this.render();

    document.querySelectorAll("input[name='category']").forEach(radio => {
      radio.onchange = () => this.loadSubCategories(radio.value);
    });
  }

  loadSubCategories(type) {
    const data = {
      Income: ["Salary", "Bonus", "Allowance"],
      Expense: ["Rent", "Food", "Shopping", "Entertainment"]
    };

    this.subCategory.innerHTML = `<option value="">Select Sub-Category</option>`;
    data[type].forEach(item => {
      this.subCategory.innerHTML += `<option value="${item}">${item}</option>`;
    });
  }

  openForm() {
    this.form.reset();
    this.date.value = new Date().toISOString().split("T")[0];
    this.modal.style.display = "block";
  }

  closeForm() {
    this.modal.style.display = "none";
    this.editId = null;
  }

  handleSubmit(e) {
    e.preventDefault();

    const category = document.querySelector("input[name='category']:checked");
    if (!this.amount.value || this.amount.value <= 0 || !category || !this.subCategory.value) return;

    const transaction = new Transaction(
      this.editId || Date.now(),
      Number(this.amount.value),
      this.date.value,
      category.value,
      this.subCategory.value,
      this.description.value
    );

    if (this.editId) {
      this.transactions = this.transactions.map(t => t.id === this.editId ? transaction : t);
    } else {
      this.transactions.push(transaction);
    }

    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    this.closeForm();
    this.render();
  }

  deleteTransaction(id) {
    if (!confirm("Delete transaction?")) return;
    this.transactions = this.transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    this.render();
  }

  render() {
    let data = [...this.transactions];
    this.list.innerHTML = "";

    let income = 0, expense = 0;

    data.forEach(t => {
      t.category === "Income" ? income += t.amount : expense += t.amount;

      this.list.innerHTML += `
        <div class="transaction-card ${t.category.toLowerCase()}">
          <div><span>Date:</span> ${t.date}</div>
          <div><span>Category:</span> ${t.category}</div>
          <div><span>Sub-Category:</span> ${t.subCategory}</div>
          <div><span>Description:</span> ${t.description || "-"}</div>
          <div><span>Amount:</span> ₹${t.amount}</div>
          <div class="transaction-actions">
            <button onclick="app.deleteTransaction(${t.id})">Delete</button>
          </div>
        </div>
      `;
    });

    this.totalIncome.textContent = income;
    this.totalExpense.textContent = expense;
    this.netBalance.textContent = income - expense;
  }
}

const app = new MoneyManager();