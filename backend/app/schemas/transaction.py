from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class TransactionResponse(BaseModel):
    transaction_id: UUID
    amount: float
    type: str
    payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True