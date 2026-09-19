import urllib.request
import json
import time
import subprocess
import os
import sys

def test_api():
    print("Testing SOLYA Backend & AI Engine directly...")

    # Test database queries and AI engine directly first
    sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
    from database import query_all, query_one, execute
    from ai_engine import SolyaAIEngine
    from seed_data import seed

    seed()

    # 1. Test user & profile query
    senior = query_one("SELECT * FROM users WHERE id = 'usr_rajesh'")
    assert senior is not None, "Senior user not found"
    assert senior["name"] == "Rajesh Sharma"
    print("✓ Senior user verified:", senior["name"])

    # 2. Test medications query
    meds = query_all("SELECT * FROM medications WHERE senior_id = 'usr_rajesh'")
    assert len(meds) >= 3, f"Expected at least 3 medications, found {len(meds)}"
    print(f"✓ Medications verified: {len(meds)} active prescriptions")

    # 3. Test care plans
    plans = query_all("SELECT * FROM care_plans")
    assert len(plans) >= 13, f"Expected 13 care plans, found {len(plans)}"
    print(f"✓ All {len(plans)} Condition-Specific Care Plans verified")

    # 4. Test AI Engine
    ai = SolyaAIEngine(senior_id="usr_rajesh")
    briefing = ai.generate_daily_briefing()
    assert "Rajesh" in briefing["greeting"]
    print("✓ AI Daily Briefing generated:", briefing["greeting"])

    chat_resp = ai.process_chat("What medicines do I have today?")
    assert "Amlodipine" in chat_resp["reply"]
    print("✓ AI Medication Chat Response verified")

    # 5. Test Prescription extraction and dosage change detection
    rx_result = ai.extract_prescription()
    assert rx_result["requires_user_confirmation"] == True
    assert len(rx_result["detected_changes"]) > 0
    change = rx_result["detected_changes"][0]
    assert change["medication_name"] == "Amlodipine"
    assert "10 mg" in change["new_value"]
    print(f"✓ Smart Prescription Dosage Change detected: {change['previous_value']} -> {change['new_value']}")

    # 6. Test Scam Protection Analyzer
    scam_test = ai.analyze_scam("URGENT: Your SBI bank account will be blocked within 24 hours. Click bit.ly/bank-kyc and verify OTP now.")
    assert scam_test["classification"] == "HIGH_RISK_SCAM"
    assert len(scam_test["reasons"]) >= 2
    print("✓ Scam Detection verified on phishing SMS:", scam_test["title"])

    print("\nALL BACKEND CORE LOGIC AND DATA TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_api()
