/* Transaction Model */
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

/* Main App Class */
class MoneyManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.editId = null;
    this.init();
  }

  /* Initialize App */
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  /* Cache DOM Elements */
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

  /* Bind Events */
  bindEvents() {
    document.getElementById("openFormBtn").addEventListener("click", () => this.openForm());
    document.getElementById("closeFormBtn").addEventListener("click", () => this.closeForm());
    this.form.addEventListener("submit", e => this.handleSubmit(e));
    this.filterCategory.addEventListener("change", () => this.render());
    this.sortBy.addEventListener("change", () => this.render());

    document.querySelectorAll("input[name='category']").forEach(radio => {
      radio.addEventListener("change", () => this.loadSubCategories(radio.value));
    });
  }

  /* Load Sub-Categories */
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

  /* Open Modal */
  openForm() {
    this.form.reset();
    this.clearErrors();
    this.date.value = new Date().toISOString().split("T")[0];
    document.getElementById("formTitle").textContent = this.editId ? "Edit Transaction" : "Add Transaction";
    this.modal.style.display = "block";
  }

  /* Close Modal */
  closeForm() {
    this.modal.style.display = "none";
    this.editId = null;
  }

  /* Validation Helpers */
  clearErrors() {
    this.form.querySelectorAll(".error").forEach(e => e.textContent = "");
    this.form.querySelectorAll(".invalid").forEach(i => i.classList.remove("invalid"));
  }

  setError(input, message) {
    input.classList.add("invalid");
    input.nextElementSibling.textContent = message;
  }

  /* Handle Form Submit */
  handleSubmit(e) {
    e.preventDefault();
    this.clearErrors();

    let valid = true;
    const category = document.querySelector("input[name='category']:checked");

    if (!this.amount.value || this.amount.value <= 0) {
      this.setError(this.amount, "Enter a valid amount");
      valid = false;
    }

    if (!this.date.value) {
      this.setError(this.date, "Date is required");
      valid = false;
    }

    if (!category) {
      this.form.querySelector(".radio-group .error").textContent = "Select a category";
      valid = false;
    }

    if (!this.subCategory.value) {
      this.setError(this.subCategory, "Select a sub-category");
      valid = false;
    }

    if (!valid) return;

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

  /* Edit Transaction */
  editTransaction(id) {
    const t = this.transactions.find(t => t.id === id);
    if (!t) return;

    this.editId = id;
    this.openForm();

    this.amount.value = t.amount;
    this.date.value = t.date;
    this.description.value = t.description;
    document.querySelector(`input[value="${t.category}"]`).checked = true;
    this.loadSubCategories(t.category);
    this.subCategory.value = t.subCategory;
  }

  /* Delete Transaction */
  deleteTransaction(id) {
    if (!confirm("Delete transaction?")) return;
    this.transactions = this.transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    this.render();
  }

  /* Render UI */
  render() {
    let data = [...this.transactions];

    if (this.filterCategory.value) {
      data = data.filter(t => t.category === this.filterCategory.value);
    }

    switch (this.sortBy.value) {
      case "dateAsc": data.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case "dateDesc": data.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case "amountAsc": data.sort((a, b) => a.amount - b.amount); break;
      case "amountDesc": data.sort((a, b) => b.amount - a.amount); break;
    }

    this.list.innerHTML = "";
    let income = 0, expense = 0;

    data.forEach(t => {
      t.category === "Income" ? income += t.amount : expense += t.amount;

      const card = document.createElement("div");
      card.className = `transaction-card ${t.category.toLowerCase()}`;
      card.innerHTML = `
        <div><strong>Date:</strong> ${t.date}</div>
        <div><strong>Category:</strong> ${t.category}</div>
        <div><strong>Sub:</strong> ${t.subCategory}</div>
        <div><strong>Description:</strong> ${t.description || "-"}</div>
        <div><strong>₹${t.amount}</strong></div>
        <div class="transaction-actions">
          <button data-edit>Edit</button>
          <button data-delete>Delete</button>
        </div>
      `;

      card.querySelector("[data-edit]").addEventListener("click", () => this.editTransaction(t.id));
      card.querySelector("[data-delete]").addEventListener("click", () => this.deleteTransaction(t.id));

      this.list.appendChild(card);
    });

    this.totalIncome.textContent = income;
    this.totalExpense.textContent = expense;
    this.netBalance.textContent = income - expense;
  }
}

/* Initialize App */
const app = new MoneyManager();