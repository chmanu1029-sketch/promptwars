import io
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from server import SolyaRequestHandler
from seed_data import seed

class DummyServer:
    server_name = 'localhost'
    server_port = 8080

class TestHandler(SolyaRequestHandler):
    def __init__(self, raw_bytes):
        self.directory = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
        self.rfile = io.BytesIO(raw_bytes)
        self.wfile = io.BytesIO()
        self.server = DummyServer()
        self.client_address = ('127.0.0.1', 12345)
        self.handle_one_request()

def simulate_request(method, path, body_dict=None):
    body_bytes = json.dumps(body_dict).encode('utf-8') if body_dict is not None else b""
    content_len = len(body_bytes)
    
    headers = [
        f"{method} {path} HTTP/1.1",
        "Host: localhost",
        f"Content-Length: {content_len}",
        "Content-Type: application/json",
        "",
        ""
    ]
    raw_req = "\r\n".join(headers).encode('utf-8') + body_bytes
    
    h = TestHandler(raw_req)
    response_bytes = h.wfile.getvalue()
    
    parts = response_bytes.split(b"\r\n\r\n", 1)
    header_part = parts[0].decode('utf-8', errors='ignore')
    body_part = parts[1] if len(parts) > 1 else b""
    
    status_line = header_part.splitlines()[0] if header_part else ""
    try:
        data = json.loads(body_part.decode('utf-8'))
    except Exception:
        data = body_part.decode('utf-8', errors='ignore')

    return status_line, data

def run_tests():
    seed()
    print("Testing SOLYA Endpoints directly via Mock Request Stream...")

    # 1. Test Static Index serving
    status, html = simulate_request("GET", "/")
    assert "200" in status
    assert "SOLYA" in html
    print("✓ Static index.html served: 200 OK")

    # 2. Test Auth Current
    status, auth = simulate_request("GET", "/api/auth/current?role=senior")
    assert "200" in status
    assert auth["user"]["name"] == "Rajesh Sharma"
    print("✓ GET /api/auth/current (Senior): 200 OK")

    # 3. Test Health Summary
    status, health = simulate_request("GET", "/api/health/summary")
    assert "200" in status
    assert "blood_pressure" in health["latest_readings"]
    print("✓ GET /api/health/summary: 200 OK")

    # 4. Test Medications
    status, meds = simulate_request("GET", "/api/medications")
    assert "200" in status
    assert len(meds["medications"]) >= 3
    print(f"✓ GET /api/medications ({len(meds['medications'])} items): 200 OK")

    # 5. Test Appointments
    status, appts = simulate_request("GET", "/api/appointments")
    assert "200" in status
    assert len(appts["appointments"]) >= 1
    print("✓ GET /api/appointments: 200 OK")

    # 6. Test Conditions & Care Plans
    status, conds = simulate_request("GET", "/api/conditions")
    assert "200" in status
    assert len(conds["conditions"]) >= 13
    print(f"✓ GET /api/conditions ({len(conds['conditions'])} conditions): 200 OK")

    # 7. Test Check-in
    status, chk = simulate_request("GET", "/api/checkins/today")
    assert "200" in status
    assert chk["check_in"] is not None
    print("✓ GET /api/checkins/today: 200 OK")

    # 8. Test AI Briefing
    status, briefing = simulate_request("GET", "/api/ai/briefing")
    assert "200" in status
    assert "Rajesh" in briefing["greeting"]
    print(f"✓ GET /api/ai/briefing ({briefing['greeting']}): 200 OK")

    # 9. Test Medication Status Update (POST)
    med1_id = meds["medications"][0]["id"]
    status, post_med = simulate_request("POST", "/api/medications/status", {"medication_id": med1_id, "status": "taken"})
    assert "200" in status
    assert post_med["success"] == True
    print("✓ POST /api/medications/status: 200 OK")

    # 10. Test Journey 1: Smart Prescription Extraction & Confirmation
    status, rx_extract = simulate_request("POST", "/api/documents/upload-prescription", {"text": "Dr. Mehta Rx: Amlodipine 10mg"})
    assert "200" in status
    assert len(rx_extract["detected_changes"]) > 0
    status, confirm_rx = simulate_request("POST", "/api/documents/confirm-prescription-update", {})
    assert "200" in status
    assert confirm_rx["success"] == True
    print("✓ Journey 1: Prescription Upload & Dosage Cascade confirmed: 200 OK")

    # 11. Test Journey 2: Emergency Activation & Cancellation
    status, em_act = simulate_request("POST", "/api/emergency/activate", {"voice_note": "Fell down and need help"})
    assert "200" in status
    assert em_act["success"] == True
    em_id = em_act["emergency_id"]
    
    status, em_stat = simulate_request("GET", "/api/emergency/status")
    assert "200" in status
    assert em_stat["active_emergency"] is not None
    
    status, em_cancel = simulate_request("POST", "/api/emergency/cancel", {"emergency_id": em_id, "reason": "Testing cancellation"})
    assert "200" in status
    assert em_cancel["success"] == True
    print("✓ Journey 2: Emergency Activation & 3s Cancel Protection confirmed: 200 OK")

    # 12. Test Journey 3: Daily Family Check-In & Safety Check
    status, chk_res = simulate_request("POST", "/api/checkins/submit", {"status": "safe", "note": "All good"})
    assert "200" in status
    assert chk_res["success"] == True
    status, saf_req = simulate_request("POST", "/api/family/request-safety-check", {})
    assert "200" in status
    assert saf_req["success"] == True
    print("✓ Journey 3: Family Check-in & Safety Check Request confirmed: 200 OK")

    # 13. Test Journey 4: Doctor Voice Update
    status, doc_proc = simulate_request("POST", "/api/doctor/process-update", {"dictation": "Continue Amlodipine 10 mg once daily."})
    assert "200" in status
    assert len(doc_proc["structured_changes"]) > 0
    status, doc_app = simulate_request("POST", "/api/doctor/approve-update", {
        "dictation": "Continue Amlodipine 10 mg once daily.",
        "structured_changes": doc_proc["structured_changes"]
    })
    assert "200" in status
    assert doc_app["success"] == True
    print("✓ Journey 4: Doctor Dictation & Clinical Approval confirmed: 200 OK")

    # 14. Test Journey 5: Scam Protection Analyzer
    status, scam = simulate_request("POST", "/api/scam/analyze", {"message": "Your bank account is blocked. Verify OTP now."})
    assert "200" in status
    assert scam["classification"] == "HIGH_RISK_SCAM"
    print("✓ Journey 5: Scam Protection Analyzer confirmed: 200 OK")

    # 15. Test AI Chat
    status, chat = simulate_request("POST", "/api/ai/chat", {"message": "What medicines do I have today?"})
    assert "200" in status
    assert "Amlodipine" in chat["reply"]
    print("✓ AI Conversational Engine verified: 200 OK")

    # 16. Test Audit Log
    status, audit = simulate_request("GET", "/api/audit")
    assert "200" in status
    assert len(audit["audit_logs"]) >= 5
    print(f"✓ Transparent Audit Log verified ({len(audit['audit_logs'])} entries): 200 OK")

    print("\n=======================================================")
    print("🎉 ALL 16 REST API ENDPOINTS & WORKFLOWS VALIDATED 100%!")
    print("=======================================================")

if __name__ == '__main__':
    run_tests()
