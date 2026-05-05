import requests

def send_verification_sms(mobile, verification_code):
    url = "https://edge.ippanel.com/v1/api/send"
    payload = {
        "sending_type": "pattern",
        "code": "xnk61fslrowskf4",
        "from_number": "+983000505",
        "recipients": [mobile],
        "params": {
            "otp": verification_code,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "YTA3NThhZjctYThmZC00NmY3LTk5MWQtY2I1NGQwNGY0ZjMwZjQ0ZmJiOWRlYzU2YmM2YWQwYjYwZWIwZmExZjNkZDM="
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        result = response.json()
        print("✅ SMS Sent:", result)
        return result
    except Exception as e:
        print("❌ SMS NOT SENT:", e)
        return None
