import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), 'solya.db')
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), 'schema.sql')

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        schema = f.read()
    conn.executescript(schema)
    conn.commit()
    conn.close()

def query_all(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def query_one(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def execute(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

def execute_many(statements):
    conn = get_db()
    try:
        cur = conn.cursor()
        for sql, params in statements:
            cur.execute(sql, params)
        conn.commit()
    finally:
        conn.close()

def log_audit(senior_id, actor_id, actor_name, action_type, details, source="Web App"):
    import uuid
    import datetime
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sql = """
        INSERT INTO audit_logs (id, senior_id, actor_id, actor_name, action_type, details, source, logged_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    execute(sql, (f"aud_{uuid.uuid4().hex[:8]}", senior_id, actor_id, actor_name, action_type, details, source, now_str))
