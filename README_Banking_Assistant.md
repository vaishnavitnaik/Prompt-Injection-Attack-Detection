# 🏦 Banking Assistant API – Quick Setup Guide

## ✅ Features
- Converts natural language banking queries to SQL using Gemini AI  
- Detects and blocks prompt injection (rules + ML-based)  
- Supports multilingual input (e.g., Hindi → English translation)  
- Role-based access control using passwords  
- Logs all queries and actions to a CSV  
- General-purpose banking assistant chatbot

---

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
