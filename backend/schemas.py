from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# user schemas

class UserCreate(BaseModel):
    name:str
    email:str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

# category schemas

class CategoryCreate(BaseModel):
    name: str


# product schemas

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    cost_price: float
    reorder_level: int
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    reorder_level: Optional[int] = None
    category_id: Optional[int] = None

# vendor schemas

class VendorCreate(BaseModel):
    name: str
    contact_info: str
    address: str

# product-vendor

class ProductVendorCreate(BaseModel):
    product_id: int
    vendor_id: int
    supply_price: int

class ProductVendorOut(BaseModel):
    id: int

    class Config:
        from_attributes = True

# purchase order schemas

class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class PurchaseOrderItemOut(BaseModel):
    id: int

    class Config:
        from_attributes = True


class PurchaseOrderBase(BaseModel):
    vendor_id: int

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderOut(BaseModel):
    id: int
    vendor_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[PurchaseOrderItemOut]

    class Config:
        from_attributes = True

# sales schemas

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int

class SaleItemOut(BaseModel):
    id: int
    price: float

    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    items: List[SaleItemCreate]

class SaleOut(BaseModel):
    id: int
    total_amount: float
    created_at: datetime
    items: List[SaleItemOut]

    class Config:
        from_attributes = True

# stock movement schemas

class StockMovementCreate(BaseModel):
    product_id: int
    quantity_change: int
    movement_type: str

class StockMovementOut(BaseModel):
    id: int
    reference_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# analytics response schemas

class DashboardSummary(BaseModel):
    total_products: int
    total_vendors: int
    total_sales: float
    low_stock_count: int