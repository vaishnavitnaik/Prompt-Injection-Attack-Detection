from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import os
import mysql.connector
import google.generativeai as genai
from spelling_check import spell_check
from detect_injection import detect_prompt_injection
from googletrans import Translator
import re
import csv
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch


load_dotenv()


genai.configure(api_key="") 
app = Flask(__name__)
CORS(app)

# Translator
translator = Translator()

PROMPT = """
    You are given a prompt where some words are encoded.
    Your task is to substitute those encoded words to another words and then convert the entire prompt into an SQL query.
    Replace "towex" with "update".
    Replace "pthrand" with "transfer".
    Replace "ewwbu" with "delete".
    You are an expert in converting English questions to SQL queries!
    The SQL database "banking" has a table named "bankaccounts" with the following columns - AccountID, CustomerName, and AccountBalance.
    and another table named "transactions" with the following columns - TransactionID (auto increment and primary key), AccountID, TransactionType, Amount, TransactionDate, TransferToAccountID.
    TransactionType has values like 'Transfer', 'Withdrawal', and 'Deposit'.
    and another table named "loan" with the following columns - AccountID, LoanType, LoanAmount, InterestRate, LoanTerm, LoanStartDate, LoanEndDate, MonthlyPayment, LoanStatus.
    The types of loans are: 'Home Loan', 'Car Loan', 'Personal Loan'.
    For Example:
    Example 1 - "How many accounts are present?", 
    the SQL command will be something like this: SELECT COUNT(*) FROM bankaccounts;
    Example 2 - "Give transaction made by accountId 1", 
    the SQL command will be something like this: SELECT AccountID, TransactionType, Amount, TransactionDate FROM transactions WHERE AccountID=1001;
    Example 3 - "Transfer 500 from account 1 to 2", 
    the SQL commands will be something like this: 
    INSERT INTO transactions (AccountID, TransactionType, Amount, TransactionDate, TransferToAccountID) 
    VALUES (1001, 'Transfer', 500, Date(NOW()), 1002);
    UPDATE bankaccounts SET AccountBalance = AccountBalance - 500 WHERE AccountID = 1001;
    UPDATE bankaccounts SET AccountBalance = AccountBalance + 500 WHERE AccountID = 1002;
    Example 4 - "Retrieve details of all loans of type 'Home Loan'", 
    the SQL command will be something like this: 
    SELECT AccountID, LoanAmount, InterestRate, LoanTerm, LoanStatus 
    FROM loan WHERE LoanType = 'Home Loan';
    Example 5 - "Retrieve the LoanAmount and MonthlyPayment for a loan with AccountID 3", 
    the SQL command will be something like this: 
    SELECT LoanAmount, MonthlyPayment FROM loan WHERE AccountID = 3;
    Example 6 - "Update the LoanStatus of AccountID 2 to 'Paid Off'", 
    the SQL command will be something like this: 
    UPDATE loan SET LoanStatus = 'Paid Off' WHERE AccountID = 2;
    Example 7 - "Insert a new loan record for a Car Loan with loan amount 15000, interest rate 4.5%, term 5 years, and monthly payment 300", 
    the SQL command will be something like this: 
    INSERT INTO loan (LoanType, LoanAmount, InterestRate, LoanTerm, LoanStartDate, LoanEndDate, MonthlyPayment, LoanStatus) 
    VALUES ('Car Loan', 15000, 4.5, 5, Date(NOW()), DATE_ADD(Date(NOW()), INTERVAL 5 YEAR), 300, 'Approved');
    Example 8 - "Deposit 200 in account id 4 balance"
    the sql command will be something like this:
    UPDATE bankaccounts SET AccountBalance = AccountBalance + 200 WHERE AccountID = 4;
    also the SQL code should not have ``` in beginning or end and sql word in the output and for multiple queries, queries should be separated by one semicolon only.
    Always retrieve only the most relevant columns based on the user's query and avoid listing all columns even if they are explicitly requested.
"""

from googletrans import Translator

def translate_hindi_to_english(text,src_lang):
    """Translates Hindi text to English.

    Args:
        text: The Hindi text to be translated.

    Returns:
        The translated text in English.
        Returns None if an error occurs during translation.
    """
    try:
        translator = Translator()
        translation = translator.translate(text, src=src_lang, dest='en')
        return translation.text
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def get_gemini_response(question):
    """Generate SQL query from a question using Gemini AI."""
    print(f"Generating response for the question: {question}")
    model = genai.GenerativeModel("gemini-1.5-flash", safety_settings=[
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "block_none"},
    ])
    response = model.generate_content([PROMPT, question])
    print(f"Generated SQL query: {response.text}")
    return response.text


def read_sql_query(sql, db):
    """Executes SQL query and returns the result."""
    print(f"Executing SQL query: {sql}")
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Vaish@123",
        database=db
    )
    cursor = conn.cursor()
    rows = []
    try:
        cursor.execute(sql)
        if cursor.with_rows:
            rows = cursor.fetchall()
        print(f"Query result: {rows}")
    except mysql.connector.Error as err:
        print(f"Error executing SQL: {err}")
        return {"error": str(err)}
    finally:
        conn.commit()
        cursor.close()
        conn.close()
    return rows

def write_to_csv(username, password, action, second_pin, timestamp, sql_query, result):
    """Append query details to the CSV file."""
    csv_path = os.getenv("", "query_logs.csv")
    try:
        with open(csv_path, mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            result_str = str(result) if result else "No data returned"
            writer.writerow([username, password, action, second_pin, timestamp, sql_query, result_str])
        print("Query history appended to CSV.")
    except Exception as e:
        print(f"Failed to write to CSV: {e}")


@app.route('/logs', methods=['GET'])
def get_logs():
    """Reads and returns the contents of the CSV log file."""
    csv_path = os.getenv("QUERY_LOG_PATH", "")
    logs = []
    try:
        with open(csv_path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(file)
            headers = ["Username", "Password", "Action", "Second PIN", "Timestamp", "SQL Query", "Result"]
            for row in reader:
                logs.append(dict(zip(headers, row)))
        return jsonify({"logs": logs}), 200
    except FileNotFoundError:
        return jsonify({"error": "Log file not found."}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred while reading logs: {str(e)}"}), 500


@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    question = data.get("question", "")
    password = data.get("password", "")
    second_pin = data.get("second_pin", "")
    source_lang = data.get("source_lang", "en")
    username = data.get("username", "unknown_user")

    timestamp = datetime.now().isoformat()
    action = "UNKNOWN"
    sql_query = ""
    result_data = ""

    # Handle translation if needed
    if source_lang.lower() != "en":
        translated = translate_hindi_to_english(question, source_lang)
        if translated:
            question = translated
        else:
            result_data = "Translation failed"
            write_to_csv(username, password, action, second_pin, timestamp, sql_query, result_data)
            return jsonify({"error": result_data}), 500

    corrected_prompt = spell_check(question).lower()
    is_attack, msg = detect_prompt_injection(corrected_prompt)
    if is_attack:
        result_data = f"Attack detected: {msg} | Prompt: {corrected_prompt}"
        write_to_csv(username, password, "PROMPT_INJECTION", second_pin, timestamp, corrected_prompt, result_data)
        return jsonify({"error": result_data}), 400

    try:
        ml_result = classifier(corrected_prompt)
        ml_attack = ml_result[0]['label'] == 'INJECTION' and ml_result[0]['score'] > 0.5
    except Exception as e:
        return jsonify({"error": f"ML error: {str(e)}"}), 500

    # Generate SQL query
    sql_query = get_gemini_response(corrected_prompt)
    sql_lower = sql_query.lower()

    # Determine action
    if "update" in sql_lower:
        action = "UPDATE"
    elif "insert" in sql_lower or "transfer" in corrected_prompt:
        action = "TRANSFER"
    elif "delete" in sql_lower:
        action = "DELETE"
    else:
        action = "READ"

    # Permission check
    if password == "abc" and action != "READ":
        result_data = f"❌ Unauthorized action: {action} for password '{password}'"
        write_to_csv(username, password, "UNAUTHORIZED_QUERY", second_pin, timestamp, sql_query, result_data)
        return jsonify({"error": result_data}), 403

    elif password == "xyz" and action not in ["READ", "UPDATE"]:
        result_data = f"❌ Unauthorized action: {action} for password '{password}'"
        write_to_csv(username, password, "UNAUTHORIZED_QUERY", second_pin, timestamp, sql_query, result_data)
        return jsonify({"error": result_data}), 403

    # Additional block for select * with weak password
    if "select *" in sql_lower and password != "xyzabc":
        result_data = "❌ Unauthorized SELECT * query attempt"
        write_to_csv(username, password, "UNAUTHORIZED_QUERY", second_pin, timestamp, sql_query, result_data)
        return jsonify({"error": result_data}), 403
    if "drop" in sql_lower:
        result_data = "❌ Unauthorized Drop attempt"
        write_to_csv(username, password, "UNAUTHORIZED_QUERY", second_pin, timestamp, sql_query, result_data)
        return jsonify({"error": result_data}), 403
    # Execute SQL
    result_data = read_sql_query(sql_query, "bankaccounts")

    # Log
    write_to_csv(username, password, action, second_pin, timestamp, sql_query, result_data)

    if result_data:
        return jsonify({"result": result_data, "sql": sql_query}), 200
    else:
        return jsonify({"message": "Query executed successfully, but no data returned.", "sql": sql_query}), 200


def determine_access_type(prompt):
    """Returns action type: READ, UPDATE, DELETE, TRANSFER"""
    prompt = prompt.lower()
    if "update" in prompt:
        return "UPDATE"
    elif "transfer" in prompt:
        return "TRANSFER"
    elif "delete" in prompt:
        return "DELETE"
    return "READ"
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
import csv
import os
from datetime import datetime



# Setup ML-based prompt injection detector
tokenizer = AutoTokenizer.from_pretrained("ProtectAI/deberta-v3-base-prompt-injection")
model = AutoModelForSequenceClassification.from_pretrained("ProtectAI/deberta-v3-base-prompt-injection")
classifier = pipeline(
    "text-classification",
    model=model,
    tokenizer=tokenizer,
    device=-1,  # CPU
    truncation=True,
    max_length=512
)

BSYSTEM_PROMPT = """
You are a virtual assistant for a bank. Your job is to assist customers with everyday banking needs in a friendly, professional, and helpful manner.

✅ You may answer questions only from these categories:
- Account types (e.g., savings, checking, fixed deposits)
- Credit and debit cards (features, benefits, eligibility)
- Loan types (personal, home, car) and how to apply
- Online banking help (e.g., forgot password, how to transfer funds)
- Bank timings, branch locations, and contact information
- Interest rates and general product details
- General policy information (e.g., KYC requirements, minimum balance, fees)

❌ You must **politely refuse** to answer questions about:
- Bank’s internal data or financial assets
- Account-specific or user-specific data (like balances or transactions)
- Any topic outside the approved categories above
- Business strategies, security systems, or regulatory details

Guidelines for replies:
- Always keep responses clear, friendly, and jargon-free unless the user is technical.
- Never reveal or assume sensitive data (e.g., account info, system internals).
- If users ask for real-time info (e.g., balance, transactions), guide them to log in or contact support.
- Never offer personal financial advice; only share general guidance.
- Do not disclose that you are an AI assistant.
- Where possible, use dummy data to help users understand features (e.g., “For example, a savings account may offer 3.5% interest.”)

If a question falls outside your allowed categories, respond politely like this:
"I'm here to help with everyday banking queries. For this request, please contact your branch or customer care directly."

Stay helpful, positive, and professional at all times.
"""


# Function to generate Gemini response

def get_bresponse(question):
    """Generate SQL query from a question using Gemini AI."""
    print(f"Generating response for the question: {question}")
    model = genai.GenerativeModel("gemini-1.5-flash", safety_settings=[
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "block_none"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "block_none"},
    ])
    response = model.generate_content([BSYSTEM_PROMPT, question])
    print(f"Generated SQL query: {response.text}")
    return response.text

# Logging utility
def blog_to_csv(username, question, is_injection, ml_flag, rule_flag, timestamp, result):
    log_file = os.getenv("/Users/vaishnavinaik/Documents/FYP/Prompt_Injection_Prevention/chat_logs.csv")
    try:
        with open(log_file, mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow([username, question, is_injection, ml_flag, rule_flag, timestamp, result])
    except Exception as e:
        print(f"Logging error: {e}")

# API endpoint
@app.route('/ask', methods=['POST'])
def chat():
    data = request.json
    username = data.get("username", "anonymous")
    question = data.get("question", "")
    timestamp = datetime.now().isoformat()

    if not question.strip():
        return jsonify({"error": "Question is required"}), 400

    cleaned_input = spell_check(question).lower()

    # Rule-based detection
    rule_attack, rule_msg = detect_prompt_injection(cleaned_input)

    # ML-based detection
    try:
        ml_output = classifier(cleaned_input)
        ml_attack = ml_output[0]['label'] == 'INJECTION' and ml_output[0]['score'] > 0.5
    except Exception as e:
        return jsonify({"error": f"ML classifier error: {str(e)}"}), 500
    # ml_attack = 0
    # rule_attack = 0
    if rule_attack or ml_attack:
        blog_to_csv(username, cleaned_input, True, ml_attack, rule_msg, timestamp, "Prompt injection blocked")
        return jsonify({
            "error": "⚠️ Your message was flagged as suspicious.",
            "rule_reason": rule_msg if rule_attack else None,
            "ml_reason": "ML model detected injection" if ml_attack else None
        }), 403

    # Get Gemini response
    response = get_bresponse(cleaned_input)

    # blog_to_csv(username, cleaned_input, False, ml_attack, rule_msg, timestamp, response)

    return jsonify({"response": response}), 200



if __name__ == '__main__':
    app.run(debug=True)

