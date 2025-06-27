from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum, UniqueConstraint, Index, Boolean
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import declarative_base
from datetime import datetime
import enum
import uuid

Base = declarative_base()

class ActionType(str, enum.Enum):
    load = "load"
    redirect = "redirect"
    iframe = "iframe"

class ActionResult(str, enum.Enum):
    white = "white"
    black = "black"
    block = "block"

class Company(Base):
    __tablename__ = "companies"

    id = Column(String(12), primary_key=True, index=True)
    name = Column(String, nullable=True)
    referrer_cf = Column(Text, nullable=True)
    url_cf = Column(Text, nullable=True)
    http_referer = Column(Text, nullable=True)
    query_string = Column(Text, nullable=True)
    check_adresses = Column(Boolean, nullable=True)
    white_page = Column(Text, nullable=False)
    black_page = Column(Text, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

class Token(Base):
    __tablename__ = "tokens"

    id = Column(String(9), primary_key=True, index=True)
    company_id = Column(String(12), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    check_adresses = Column(Boolean, nullable=True)
    url = Column(Text, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_token_company", "company_id"),
    )

class Address(Base):
    __tablename__ = "addresses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(String(12), ForeignKey("companies.id", ondelete="CASCADE"))
    address = Column(INET, nullable=False)
    type = Column(Enum(ActionResult), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('company_id', 'address', name='uix_company_address'),
        Index("ix_address_company", "company_id"),
        Index("ix_address_ip", "address"),
    )

class Request(Base):
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    company_id = Column(String(12), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    token = Column(String(9), ForeignKey("tokens.id", ondelete="SET NULL"), nullable=True)

    referrer_cf = Column(Text)
    url_cf = Column(Text)
    query_string = Column(Text)
    http_referer = Column(Text)
    http_user_agent = Column(Text)
    remote_addr = Column(String)
    http_cf_connecting_ip = Column(String)
    cf_connecting_ip = Column(String)
    x_forwarded_for = Column(String)
    true_client_ip = Column(String)

    action = Column(Enum(ActionResult), nullable=False)
    action_page = Column(Text, nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_request_company", "company_id"),
        Index("ix_request_token", "token"),
        Index("ix_request_date", "date"),
        Index("ix_request_action", "action"),
    )
