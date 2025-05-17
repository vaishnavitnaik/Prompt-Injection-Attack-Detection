
# 📊 Frontend

This is a secure web-based LLM-powered financial query assistant built using **React** and **Express** (backend assumed). It allows users to input natural language queries that get transformed into SQL, while protecting against prompt injection and unauthorized data manipulation (e.g., DELETE, UPDATE).

---

## 🚀 Features

- Prompt injection detection and keyword obfuscation
- PIN-based access control (READ, UPDATE, DELETE, TRANSFER)
- Dual PIN verification for destructive operations
- Multi-language support (English, Marathi, Hinglish, German)
- Downloadable query history (CSV)
- Admin dashboard and user authentication system

---

## 📦 Installation

### 1. Clone the repository
### 2. Install dependencies

```bash
npm install
```

### 3. Set up backend (assumed Express server running on port 3000)

Ensure you have a backend server running at `http://127.0.0.1:3000/query`. This backend should accept a POST request with the following format:

```json
{
  "question": "string",
  "password": "string",
  "second_pin": "string",
  "source_lang": "string",
  "username": "string"
}
```

And return:

```json
{
  "sql": "string",
  "result": [ ... ]
}
```

---

## ▶️ Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Access Control

| Action Type | Keyword(s) Tracked | Required PIN     | Notes                                   |
|-------------|--------------------|------------------|-----------------------------------------|
| READ        | (default)          | `abc`, `xyz`, `xyzabc` | Basic access |
| UPDATE      | `update`, `modify`, `change`, etc. | `xyz`, `xyzabc` | Elevated access |
| TRANSFER    | `transfer`, `send`, `move` | `xyz`, `xyzabc` | Elevated access |
| DELETE      | `delete`, `erase`, `truncate` | `xyzabc` + `second PIN: 123321` | Admin-level operation |


## 💾 Query History

You can download your session's query history as a CSV file. This file includes:

- Username
- Password (PIN used)
- Access right level
- SQL query
- Query result
- Timestamp

---

## 📁 Project Structure

```
src/
│
├── assets/            # Hero images, logos, etc.
├── components/        # Optional component breakdown
├── App.jsx            # Main App routing
├── QueryInput.jsx     # Main query page
├── Login.jsx          # Login page
├── AdminLogin.jsx     # Admin login
├── AdminDashboard.jsx # Admin dashboard
├── BankAssistant.jsx  # Additional assistant component
```

---

## 🌐 Routes

| Route              | Component         | Description                        |
|-------------------|------------------|------------------------------------|
| `/`               | `Login`          | User login                         |
| `/queryinput`     | `QueryInput`     | Financial query input              |
| `/admin-login`    | `AdminLogin`     | Admin login                        |
| `/admindashboard` | `AdminDashboard` | Admin dashboard                    |
| `/bankbot`        | `BankAssistant`  | Bank-related query assistant       |
| `/admin`          | Protected route  | Redirects to `AdminDashboard` if logged in |


# 📊 Backend

## ⚙️ Setup Instructions

1. **Clone the repository** to your local machine  
2. **Install all Python dependencies** listed in `requirements.txt`  
3. **Create a `.env` file** and set environment variables like the log file path  
4. **Ensure MySQL is running** and has a database named `bankaccounts` with required tables (`bankaccounts`, `transactions`, `loan`)  
5. **Run the Flask app** (`app.py`) in development mode  
6. (Optional) Test the APIs using Postman or any HTTP client

---

## 📡 Available API Endpoints

- `/query`: Process SQL-related user queries with security filters  
- `/ask`: Gemini-powered general banking assistant  
- `/logs`: View all logged interactions (CSV-based)

