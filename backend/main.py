from fastapi import FastAPI,HTTPException,Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from db import create_tables,get_db
from auth import create_access_token,hash_password,role_required,get_current_user
from models import Users,Categories,Products,Vendors,Sales,SaleItems,PurchaseOrders,PurchaseOrderItems,StockMovements
from schemas import UserCreate,CategoryCreate,ProductCreate,VendorCreate,SaleCreate,PurchaseOrderCreate
from fastapi.security import OAuth2PasswordRequestForm

from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

@app.on_event("startup")
def create_initial_admin():
    db=next(get_db())

    existing_admin=db.query(Users).filter(
        Users.role=="admin"
    ).first()

    if not existing_admin:
        admin=Users(
            name="arushi",
            email="aru123",
            password=hash_password("123"),
            role="admin"
        )
        db.add(admin)
        db.commit()

@app.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(),db:Session=Depends(get_db)):
    db_user=db.query(Users).filter(Users.email==form_data.username).first() 
    if not db_user or db_user.password!=hash_password(form_data.password):
        raise HTTPException(status_code=401,detail='Invalid credentials')
    
    access_token = create_access_token({
        "user_id": db_user.id,
        "role": db_user.role
    }) 

    return {"access_token": access_token,"token_type": "bearer"} 

@app.post('/users')
def create_user(user:UserCreate,db:Session=Depends(get_db),current_user=Depends(role_required(['admin']))):
    
    existing_user=db.query(Users).filter(
        Users.email==user.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400,detail="User already exists")

    new_user=Users(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get('/users')
def get_users(db:Session=Depends(get_db),current_user=Depends(role_required(['admin']))):
    return db.query(Users).all()

@app.post('/categories')
def create_categories(category:CategoryCreate,db:Session=Depends(get_db),current_user=Depends(role_required(['admin']))):

    existing_category=db.query(Categories).filter(Categories.name==category.name).first()
    
    if existing_category:
        raise HTTPException(status_code=400,detail="Category already existed.")

    new_category=Categories(**category.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@app.get('/categories')
def get_categories(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    return db.query(Categories).all()

@app.post('/products')
def create_product(product:ProductCreate,db:Session=Depends(get_db),current_user=Depends(role_required(['admin','manager']))):
    existing_product=db.query(Products).filter(Products.name==product.name, Products.category_id == product.category_id).first()

    if existing_product:
        raise HTTPException(status_code=400,detail="Product already exists.")
    
    new_product=Products(**product.dict(),current_stock=0)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get('/products')
def get_products(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    return db.query(Products).all()

@app.post('/vendors')
def create_vendors(vendor:VendorCreate,db:Session=Depends(get_db),current_user=Depends(role_required(['admin','manager']))):

    existing_vendor=db.query(Vendors).filter(Vendors.name==vendor.name).first()

    if existing_vendor:
        raise HTTPException(status_code=400,detail="Vendor already exists.")
    
    new_vendor=Vendors(**vendor.dict())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

@app.get('/vendors')
def get_vendors(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    return db.query(Vendors).all()

@app.post('/sales')
def create_sale(sale:SaleCreate,db:Session=Depends(get_db),current_user=Depends(role_required(['admin','manager','staff']))):
    new_sale=Sales(total_amount=0)
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    total=0

    for item in sale.items:
        product=db.query(Products).filter(
            Products.id==item.product_id
        ).first()

        if not product or product.current_stock<item.quantity:
            raise HTTPException(status_code=400,detail="Not enough stock.")
        
        product.current_stock-=item.quantity
        total+=item.quantity*product.price

        movement = StockMovements(
            product_id=product.id,
            quantity_change=-item.quantity,
            movement_type="sale",
            reference_id=new_sale.id
        )
        db.add(movement)

        sale_item=SaleItems(
            sale_id=new_sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(sale_item)

    new_sale.total_amount=total
    db.commit()
    db.refresh(new_sale)
    return new_sale

@app.get('/sales')
def get_sales(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    return db.query(Sales).all()

@app.post('/purchase_orders')
def create_purchase_orders(order:PurchaseOrderCreate,db:Session=Depends(get_db)):

    new_order=PurchaseOrders(
        vendor_id=order.vendor_id,
        status="Pending",
        total_amount=0
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    total=0

    for item in order.items:
        total+=item.quantity*item.unit_price

        order_item=PurchaseOrderItems(
            purchase_order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)
    new_order.total_amount=total
    db.commit()
    db.refresh(new_order)
    return new_order

@app.put('/purchase_orders/{order_id}/approve')
def approve_purchase_orders(order_id:int,db:Session=Depends(get_db),current_user=Depends(role_required(['admin']))):

    order=db.query(PurchaseOrders).filter(
        PurchaseOrders.id==order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404,detail="Order not found.")
    
    if order.status!="Pending":
        raise HTTPException(status_code=400,detail="Order cannot be approved")
    
    order.status="Approved"
    db.commit()
    return{"message":"Purchase order approved."}

@app.get('/purchase_orders')
def get_purchase_orders(db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    return db.query(PurchaseOrders).all()

@app.put('/purchase_orders/{order_id}/receive')
def receive_purchase_order(order_id:int,db:Session=Depends(get_db),current_user=Depends(role_required(['staff','admin','manager']))):

    order=db.query(PurchaseOrders).filter(
        PurchaseOrders.id==order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    
    if order.status!="Approved":
        raise HTTPException(status_code=400,detail="Order must be approved first")
    
    items=db.query(PurchaseOrderItems).filter(PurchaseOrderItems.purchase_order_id==order_id).all()

    for item in items:
        product = db.query(Products).filter(
            Products.id == item.product_id
        ).first()

        product.current_stock += item.quantity

        movement = StockMovements(
            product_id=product.id,
            quantity_change=item.quantity,
            movement_type="purchase",
            reference_id=order.id
        )
        db.add(movement)

    order.status = "Completed"
    db.commit()

    return {"message": "Stock updated successfully"}

@app.get('/dashboard')
def dashboard_summary(db:Session=Depends(get_db),current_user=Depends(role_required(['admin']))):

    total_products=db.query(Products).count()
    total_vendors=db.query(Vendors).count()
    total_sales = db.query(func.sum(Sales.total_amount)).scalar() or 0
    low_stock=db.query(Products).filter(
        Products.current_stock<=Products.reorder_level
    ).count()
    recent_movements = db.query(StockMovements)\
    .order_by(StockMovements.created_at.desc())\
    .limit(5)\
    .all()

    movement_data = []

    for movement in recent_movements:
        movement_data.append({
            "product_id": movement.product_id,
            "quantity_change": movement.quantity_change,
            "movement_type": movement.movement_type,
            "reference_id": movement.reference_id,
            "created_at": movement.created_at
        })

    return{
        "total_products": total_products,
        "total_vendors": total_vendors,
        "total_sales": total_sales,
        "low_stock_count": low_stock,
        "recent_stock_movement":movement_data
    }
