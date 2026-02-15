from sqlalchemy import Column, String, Numeric, DateTime, CheckConstraint, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
import enum

class TransactionType(str, enum.Enum):
    purchase = "purchase"
    spend = "spend"

class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    profile_picture_url = Column(Text, nullable=True)

    credit_balance = Column(Numeric(10, 2), default=100.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # transaction (One-to-Many)
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete")
    # project (One-to-Many)
    projects = relationship("Project", back_populates="user",cascade="all, delete")

    __table_args__ = (
        CheckConstraint('credit_balance >= 0', name='check_credit_positive'),
    )

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    payment_id = Column(String(255), unique=True, nullable=True)

    # User (Many-to-One)
    user = relationship("User", back_populates="transactions")

    __table_args__ = (
        CheckConstraint("type IN ('purchase', 'spend')", name='check_transaction_type'),
    )