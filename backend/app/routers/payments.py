import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.user import User, Transaction
from app.routers.users import get_current_user
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
router = APIRouter()
logger = logging.getLogger(__name__)

class CheckoutSessionRequest(BaseModel):
    package_id: str

@router.post("/create-checkout-session")
def create_checkout_session(
        req: CheckoutSessionRequest,
        current_user: User = Depends(get_current_user)
):
    package = settings.STRIPE_PACKAGES.get(req.package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package ID")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'thb',
                        'unit_amount': package["price_satang"],  # ต้องเป็นหน่วยสตางค์
                        'product_data': {
                            'name': package["name"],
                            'description': f"Get {package['tokens']} Tokens",
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            client_reference_id=str(current_user.user_id),

            metadata={
                "package_id": req.package_id,
                "credits": package["tokens"]
            },

            success_url=f'{settings.FRONTEND_URL}/dashboard/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/dashboard/price',
        )

        return {"url": checkout_session.url}

    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
        request: Request,
        stripe_signature: str = Header(None),
        db: Session = Depends(get_db)
):
    payload = await request.body()
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        user_id = session.get('client_reference_id')
        payment_id = session.get('payment_intent')
        amount_paid = session.get('amount_total')

        metadata = session.get('metadata', {})
        credits_to_add = int(metadata.get('credits', 0))

        print(f"Payment Success! User: {user_id}, Credits: {credits_to_add}, PaymentID: {payment_id}")

        if not user_id or not credits_to_add:
            print("Missing user_id or credits info")
            return {"status": "ignored", "reason": "missing info"}

        try:
            existing_tx = db.query(Transaction).filter(Transaction.payment_id == payment_id).first()
            if existing_tx:
                print(f"Transaction {payment_id} already processed.")
                return {"status": "ignored", "reason": "already processed"}

            user = db.query(User).filter(User.user_id == user_id).first()
            if not user:
                print(f"User {user_id} not found.")
                return {"status": "error", "reason": "user not found"}

            user.credit_balance += credits_to_add

            new_tx = Transaction(
                user_id=user.user_id,
                amount=amount_paid / 100.0,
                type='purchase',
                payment_id=payment_id
            )
            db.add(new_tx)

            db.commit()
            print(f"Automatically added {credits_to_add} tokens to user {user.username}")

        except Exception as e:
            db.rollback()
            print(f"Database Error during webhook: {e}")
            raise HTTPException(status_code=500, detail="Database error")

    return {"status": "success"}