"""
CRM API — единая точка входа для всех сущностей CRM.
CRUD для deals, companies, contacts, courses, managers.
Также: импорт/экспорт CSV.
"""
import json
import os
import io
import csv
import time
import psycopg2
import psycopg2.extras

SCHEMA = "t_p92580427_crm_sales_system"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def get_conn():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn


def ok(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg})}


def qry(cur, sql, params=None):
    cur.execute(f"SET search_path TO {SCHEMA}")
    cur.execute(sql, params)
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def exe(cur, sql, params=None):
    cur.execute(f"SET search_path TO {SCHEMA}")
    cur.execute(sql, params)


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/") or "/"
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    parts = [p for p in path.split("/") if p]
    entity = parts[0] if parts else ""
    row_id = parts[1] if len(parts) > 1 else None

    conn = get_conn()
    cur = conn.cursor()
    try:
        # ── EXPORT CSV ───────────────────────────────────────────────────────
        if entity == "export" and method == "GET":
            rows = qry(cur, """
                SELECT d.id, d.title, d.stage_id, d.amount, d.source,
                       d.course_ids, d.student_count, d.start_date, d.end_date,
                       COALESCE(d.account_manager_id,'') as account_manager_id,
                       d.invoice_number, d.invoice_date, d.payment_date,
                       COALESCE(d.company_id,'') as company_id,
                       d.contact_ids, d.tags, d.created_at,
                       COALESCE(c.name,'') as company_name,
                       COALESCE(m.name,'') as manager_name
                FROM deals d
                LEFT JOIN companies c ON c.id = d.company_id
                LEFT JOIN managers m ON m.id = d.account_manager_id
                ORDER BY d.created_at
            """)
            buf = io.StringIO()
            w = csv.writer(buf)
            w.writerow(["ID", "Название", "Этап", "Сумма", "Источник",
                        "Курсы (ID)", "Студентов", "Дата старта", "Дата окончания",
                        "Менеджер (ID)", "Номер счёта", "Дата счёта", "Дата оплаты",
                        "Компания (ID)", "Контакты (ID)", "Теги", "Создана",
                        "Компания", "Менеджер"])
            for r in rows:
                w.writerow([
                    r["id"], r["title"], r["stage_id"], r["amount"], r["source"],
                    ",".join(r["course_ids"] or []),
                    r["student_count"], r["start_date"], r["end_date"],
                    r["account_manager_id"], r["invoice_number"],
                    r["invoice_date"], r["payment_date"], r["company_id"],
                    ",".join(r["contact_ids"] or []),
                    ",".join(r["tags"] or []),
                    r["created_at"], r["company_name"], r["manager_name"],
                ])
            return {
                "statusCode": 200,
                "headers": {**CORS, "Content-Type": "text/csv; charset=utf-8",
                            "Content-Disposition": "attachment; filename=deals.csv"},
                "body": buf.getvalue(),
            }

        # ── IMPORT CSV ───────────────────────────────────────────────────────
        if entity == "import" and method == "POST":
            csv_text = body.get("csv", "")
            reader = csv.DictReader(io.StringIO(csv_text))
            imported = 0
            for row in reader:
                did = row.get("ID") or f"imp_{int(time.time()*1000)}_{imported}"
                title = row.get("Название", "").strip()
                if not title:
                    continue
                exe(cur, """
                    INSERT INTO deals (id,title,stage_id,amount,source,course_ids,
                        student_count,start_date,end_date,account_manager_id,
                        invoice_number,invoice_date,payment_date,company_id,
                        contact_ids,tags,created_at,history)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'[]')
                    ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,
                        stage_id=EXCLUDED.stage_id,amount=EXCLUDED.amount
                """, (
                    did, title, row.get("Этап","base"),
                    float(row.get("Сумма",0) or 0), row.get("Источник",""),
                    json.dumps([x for x in row.get("Курсы (ID)","").split(",") if x]),
                    int(row.get("Студентов",0) or 0),
                    row.get("Дата старта",""), row.get("Дата окончания",""),
                    row.get("Менеджер (ID)","") or None,
                    row.get("Номер счёта",""), row.get("Дата счёта",""),
                    row.get("Дата оплаты",""), row.get("Компания (ID)","") or None,
                    json.dumps([x for x in row.get("Контакты (ID)","").split(",") if x]),
                    json.dumps([x for x in row.get("Теги","").split(",") if x]),
                    row.get("Создана",""),
                ))
                imported += 1
            return ok({"imported": imported})

        # ── SEED ─────────────────────────────────────────────────────────────
        if entity == "seed" and method == "POST":
            rows = qry(cur, "SELECT COUNT(*) as cnt FROM managers")
            if rows[0]["cnt"] == 0:
                for mid, name in [("m1","Алексей Громов"),("m2","Мария Лебедева"),("m3","Дмитрий Орлов")]:
                    exe(cur, "INSERT INTO managers (id,name) VALUES (%s,%s) ON CONFLICT DO NOTHING", (mid, name))
                for cid, name in [("c1","Python для начинающих"),("c2","Data Science"),("c3","UX/UI Дизайн"),("c4","Project Management")]:
                    exe(cur, "INSERT INTO courses (id,name) VALUES (%s,%s) ON CONFLICT DO NOTHING", (cid, name))
            return ok({"ok": True})

        # ── COMPANIES ────────────────────────────────────────────────────────
        if entity == "companies":
            if method == "GET":
                rows = qry(cur, "SELECT id,name,legal_entities,segment,region,city FROM companies ORDER BY name")
                return ok([{"id":r["id"],"name":r["name"],"legalEntities":r["legal_entities"],
                            "segment":r["segment"],"region":r["region"],"city":r["city"]} for r in rows])
            if method == "POST":
                d = body
                exe(cur, "INSERT INTO companies (id,name,legal_entities,segment,region,city) VALUES (%s,%s,%s,%s,%s,%s)",
                    (d["id"], d["name"], json.dumps(d.get("legalEntities",[])), d.get("segment",""), d.get("region",""), d.get("city","")))
                return ok({"id": d["id"]}, 201)
            if method == "PUT" and row_id:
                d = body
                exe(cur, "UPDATE companies SET name=%s,legal_entities=%s,segment=%s,region=%s,city=%s WHERE id=%s",
                    (d["name"], json.dumps(d.get("legalEntities",[])), d.get("segment",""), d.get("region",""), d.get("city",""), row_id))
                return ok({"ok": True})

        # ── CONTACTS ─────────────────────────────────────────────────────────
        if entity == "contacts":
            if method == "GET":
                rows = qry(cur, "SELECT id,full_name,phones,emails,position,is_decision_maker,company_id FROM contacts ORDER BY full_name")
                return ok([{"id":r["id"],"fullName":r["full_name"],"phones":r["phones"],
                            "emails":r["emails"],"position":r["position"],
                            "isDecisionMaker":r["is_decision_maker"],"companyId":r["company_id"] or ""} for r in rows])
            if method == "POST":
                d = body
                exe(cur, "INSERT INTO contacts (id,full_name,phones,emails,position,is_decision_maker,company_id) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (d["id"], d["fullName"], json.dumps(d.get("phones",[])), json.dumps(d.get("emails",[])),
                     d.get("position",""), d.get("isDecisionMaker",False), d.get("companyId") or None))
                return ok({"id": d["id"]}, 201)
            if method == "PUT" and row_id:
                d = body
                exe(cur, "UPDATE contacts SET full_name=%s,phones=%s,emails=%s,position=%s,is_decision_maker=%s,company_id=%s WHERE id=%s",
                    (d["fullName"], json.dumps(d.get("phones",[])), json.dumps(d.get("emails",[])),
                     d.get("position",""), d.get("isDecisionMaker",False), d.get("companyId") or None, row_id))
                return ok({"ok": True})

        # ── COURSES ──────────────────────────────────────────────────────────
        if entity == "courses":
            if method == "GET":
                rows = qry(cur, "SELECT id,name FROM courses ORDER BY name")
                return ok([{"id":r["id"],"name":r["name"]} for r in rows])
            if method == "POST":
                d = body
                exe(cur, "INSERT INTO courses (id,name) VALUES (%s,%s) ON CONFLICT DO NOTHING", (d["id"], d["name"]))
                return ok({"id": d["id"]}, 201)
            if method == "PUT" and row_id:
                exe(cur, "UPDATE courses SET name=%s WHERE id=%s", (body["name"], row_id))
                return ok({"ok": True})

        # ── MANAGERS ─────────────────────────────────────────────────────────
        if entity == "managers":
            if method == "GET":
                rows = qry(cur, "SELECT id,name FROM managers ORDER BY name")
                return ok([{"id":r["id"],"name":r["name"]} for r in rows])
            if method == "POST":
                d = body
                exe(cur, "INSERT INTO managers (id,name) VALUES (%s,%s) ON CONFLICT DO NOTHING", (d["id"], d["name"]))
                return ok({"id": d["id"]}, 201)

        # ── DEALS ────────────────────────────────────────────────────────────
        if entity == "deals":
            if method == "GET":
                rows = qry(cur, """
                    SELECT id,title,stage_id,amount,source,course_ids,student_count,
                           start_date,end_date,account_manager_id,invoice_number,
                           invoice_date,payment_date,company_id,contact_ids,history,tags,created_at
                    FROM deals ORDER BY created_at DESC
                """)
                return ok([_deal_dict(r) for r in rows])
            if method == "POST":
                d = body
                exe(cur, """
                    INSERT INTO deals (id,title,stage_id,amount,source,course_ids,student_count,
                        start_date,end_date,account_manager_id,invoice_number,invoice_date,
                        payment_date,company_id,contact_ids,history,tags,created_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, _deal_params(d))
                return ok({"id": d["id"]}, 201)
            if method == "PUT" and row_id:
                d = body
                exe(cur, """
                    UPDATE deals SET title=%s,stage_id=%s,amount=%s,source=%s,
                        course_ids=%s,student_count=%s,start_date=%s,end_date=%s,
                        account_manager_id=%s,invoice_number=%s,invoice_date=%s,
                        payment_date=%s,company_id=%s,contact_ids=%s,history=%s,tags=%s
                    WHERE id=%s
                """, _deal_update_params(d, row_id))
                return ok({"ok": True})

        return err("Not found", 404)
    finally:
        cur.close()
        conn.close()


def _deal_dict(r):
    return {
        "id": r["id"], "title": r["title"], "stageId": r["stage_id"],
        "amount": float(r["amount"]), "source": r["source"],
        "courseIds": r["course_ids"] or [], "studentCount": r["student_count"],
        "startDate": r["start_date"], "endDate": r["end_date"],
        "accountManagerId": r["account_manager_id"] or "",
        "invoiceNumber": r["invoice_number"], "invoiceDate": r["invoice_date"],
        "paymentDate": r["payment_date"], "companyId": r["company_id"] or "",
        "contactIds": r["contact_ids"] or [], "history": r["history"] or [],
        "tags": r["tags"] or [], "createdAt": r["created_at"],
    }


def _deal_params(d):
    return (
        d["id"], d["title"], d.get("stageId","base"), float(d.get("amount",0)),
        d.get("source",""), json.dumps(d.get("courseIds",[])),
        int(d.get("studentCount",0)), d.get("startDate",""), d.get("endDate",""),
        d.get("accountManagerId") or None, d.get("invoiceNumber",""),
        d.get("invoiceDate",""), d.get("paymentDate",""),
        d.get("companyId") or None, json.dumps(d.get("contactIds",[])),
        json.dumps(d.get("history",[])), json.dumps(d.get("tags",[])),
        d.get("createdAt",""),
    )


def _deal_update_params(d, row_id):
    return (
        d["title"], d.get("stageId","base"), float(d.get("amount",0)),
        d.get("source",""), json.dumps(d.get("courseIds",[])),
        int(d.get("studentCount",0)), d.get("startDate",""), d.get("endDate",""),
        d.get("accountManagerId") or None, d.get("invoiceNumber",""),
        d.get("invoiceDate",""), d.get("paymentDate",""),
        d.get("companyId") or None, json.dumps(d.get("contactIds",[])),
        json.dumps(d.get("history",[])), json.dumps(d.get("tags",[])),
        row_id,
    )
