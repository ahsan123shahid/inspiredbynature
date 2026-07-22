import hashlib
import hmac
import json
from decimal import Decimal

from app.config import settings


def generate_hash(data: dict, hash_key: str = None) -> str:
    key = hash_key or settings.easypaisa_hash_key
    sorted_values = [str(data[k]) for k in sorted(data.keys()) if data.get(k) is not None]
    concatenated = "&".join(sorted_values)
    return hmac.new(key.encode(), concatenated.encode(), hashlib.sha256).hexdigest()


def create_payment_request(order_id: int, amount: Decimal, return_url: str) -> dict:
    merchant_id = settings.easypaisa_merchant_id
    store_id = settings.easypaisa_store_id
    is_sandbox = settings.easypaisa_sandbox

    request_data = {
        "amount": str(amount),
        "orderRefNum": str(order_id),
        "merchantId": merchant_id,
        "storeId": store_id,
        "returnUrl": return_url,
        "paymentMethod": "easypay",
    }

    hash_value = generate_hash({k: v for k, v in request_data.items() if k != "hash"})

    if is_sandbox:
        base_url = "https://sandbox.easypaisa.com.pk/easypay/Index.aspx"
    else:
        base_url = "https://easypay.easypaisa.com.pk/easypay/Index.aspx"

    request_data["hash"] = hash_value
    request_data["base_url"] = base_url

    return request_data


def verify_webhook_signature(payload: dict) -> bool:
    received_hash = payload.get("hash", "")
    calculated_hash = generate_hash(
        {k: v for k, v in payload.items() if k != "hash"},
    )
    return received_hash == calculated_hash
