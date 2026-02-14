from db import Base
from sqlalchemy import Column,Integer,String,Time,ForeignKey,DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class Users(Base):
    __tablename__="users"

    id=Column(Integer,primary_key=True)
    name=Column(String)
    email=Column(String,unique=True)
    password=Column(String)
    role=Column(String)
    created_at=Column(DateTime, default=datetime.utcnow)

class Products(Base):
    __tablename__="products"

    id=Column(Integer,primary_key=True)
    name=Column(String)
    sku=Column(String,unique=True)
    category_id=Column(Integer,ForeignKey("categories.id"))
    price=Column(Integer)
    cost_price=Column(Integer)
    current_stock = Column(Integer, default=0)
    reorder_level=Column(Integer)
    created_at=Column(DateTime, default=datetime.utcnow)

class Categories(Base):
    __tablename__="categories"

    id=Column(Integer,primary_key=True)
    name=Column(String,unique=True)

class Vendors(Base):
    __tablename__="vendors"

    id=Column(Integer,primary_key=True)
    name=Column(String)
    contact_info=Column(String,unique=True)
    address=Column(String)
    
class PurchaseOrders(Base):
    __tablename__="purchaseOrders"

    id=Column(Integer,primary_key=True)
    vendor_id=Column(Integer,ForeignKey("vendors.id"))
    total_amount=Column(Integer)
    status=Column(String,default="Pending")
    created_at=Column(DateTime, default=datetime.utcnow)

    items = relationship("PurchaseOrderItems", back_populates="order")

class PurchaseOrderItems(Base):
    __tablename__="purchaseOrderItems"

    id=Column(Integer,primary_key=True)
    purchase_order_id=Column(Integer,ForeignKey("purchaseOrders.id"))
    product_id=Column(Integer,ForeignKey("products.id"))
    quantity=Column(Integer)
    unit_price=Column(Integer)

    order = relationship("PurchaseOrders", back_populates="items")

class StockMovements(Base):
    __tablename__="stockMovements"

    id=Column(Integer,primary_key=True)
    product_id=Column(Integer,ForeignKey("products.id"))
    quantity_change=Column(Integer)
    movement_type=Column(String)
    reference_id=Column(Integer)
    created_at=Column(DateTime,default=datetime.utcnow)

class Sales(Base):
    __tablename__="sales"

    id=Column(Integer,primary_key=True)
    total_amount=Column(Integer)
    created_at=Column(DateTime, default=datetime.utcnow)

class SaleItems(Base):
    __tablename__="saleItems"

    id=Column(Integer, primary_key=True)
    sale_id=Column(Integer,ForeignKey("sales.id"))
    product_id=Column(Integer,ForeignKey("products.id"))
    quantity=Column(Integer)
    price=Column(Integer)